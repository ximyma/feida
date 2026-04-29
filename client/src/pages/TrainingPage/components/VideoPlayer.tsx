import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PlayCircleOutlined, PauseCircleOutlined, SoundOutlined, MutedOutlined,
  FullscreenOutlined, FullscreenExitOutlined, LoadingOutlined,
  ForwardOutlined, BackwardOutlined, VideoCameraOutlined
} from '@ant-design/icons';

// ============ 类型定义 ============
export interface VideoQuality {
  label: string;
  url: string;
  height?: number;
}

export interface VideoPlayerProps {
  src?: string;                    // 主视频源
  hlsUrl?: string;                 // HLS 流地址
  poster?: string;                 // 封面图
  title?: string;                  // 视频标题
  initialPosition?: number;         // 初始播放位置（秒）- 用于断点续看
  autoSavePosition?: boolean;      // 是否自动保存播放位置
  onPositionChange?: (position: number, duration: number) => void; // 位置变化回调
  onEnded?: () => void;            // 播放结束回调
  onProgress?: (percent: number) => void;  // 进度回调
  qualities?: VideoQuality[];       // 多清晰度
  initialQuality?: number;         // 默认清晰度索引
  playbackRates?: number[];         // 倍速选项
  showControls?: boolean;           // 是否显示控制栏
  className?: string;
}

// ============ 常量 ============
const DEFAULT_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

// ============ 工具函数 ============
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ============ 主组件 ============
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  hlsUrl,
  poster,
  title,
  initialPosition = 0,
  autoSavePosition = true,
  onPositionChange,
  onEnded,
  onProgress,
  qualities,
  initialQuality = 0,
  playbackRates = DEFAULT_PLAYBACK_RATES,
  showControls = true,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const progressTimerRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  // 状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(initialQuality);
  const [showControlsBar, setShowControlsBar] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 控制栏自动隐藏定时器
  const hideTimerRef = useRef<number | null>(null);

  // ============ 初始化 HLS ============
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 如果有 HLS URL，初始化 HLS.js
    if (hlsUrl && !src) {
      const loadHls = async () => {
        try {
          // 动态导入 hls.js
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
            });
            hlsRef.current = hls;
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              if (initialPosition > 0) {
                video.currentTime = initialPosition;
              }
            });
            
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                setError('视频加载失败');
                setIsLoading(false);
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari 原生支持 HLS
            video.src = hlsUrl;
          }
        } catch (e) {
          setError('HLS 加载失败');
          setIsLoading(false);
        }
      };
      
      loadHls();
    } else if (src) {
      setIsLoading(false);
      if (initialPosition > 0) {
        video.currentTime = initialPosition;
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, src, initialPosition]);

  // ============ 视频事件监听 ============
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    };
    const handleDurationChange = () => setDuration(video.duration || 0);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => setError('视频播放出错');
    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onEnded, onProgress]);

  // ============ 自动保存播放位置 ============
  useEffect(() => {
    if (autoSavePosition && currentTime > 0) {
      // 每5秒保存一次
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      saveTimerRef.current = window.setInterval(() => {
        if (isPlaying) {
          onPositionChange?.(videoRef.current?.currentTime || 0, duration);
        }
      }, 5000);
    }
    
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [autoSavePosition, isPlaying, currentTime, duration, onPositionChange]);

  // ============ 控制栏自动隐藏 ============
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setShowControlsBar(true);
    if (isPlaying) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowControlsBar(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isPlaying, resetHideTimer]);

  // ============ 播放控制函数 ============
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.volume = percent;
    video.muted = percent === 0;
    setVolume(percent);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowRateMenu(false);
  };

  const handleQualityChange = (quality: VideoQuality, index: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;
    
    if (quality.url.startsWith('blob:') || quality.url.startsWith('data:')) {
      video.src = quality.url;
    } else {
      video.src = quality.url;
    }
    
    video.currentTime = currentTime;
    if (wasPlaying) {
      video.play();
    }
    
    setCurrentQuality(index);
    setShowQualityMenu(false);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  // ============ 进度条点击 ============
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`video-player-container relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControlsBar(false)}
      style={{ aspectRatio: '16/9', maxHeight: '100%' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        onClick={togglePlay}
      >
        {src && <source src={src} type="video/mp4" />}
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <LoadingOutlined className="text-white text-4xl animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <VideoCameraOutlined className="text-red-500 text-4xl mb-2" />
          <p className="text-white">{error}</p>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && !isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
          onClick={togglePlay}
        >
          <PlayCircleOutlined className="text-white text-8xl opacity-90 hover:opacity-100 hover:scale-110 transition-all" />
        </div>
      )}

      {/* Controls Bar */}
      {showControls && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300 z-20 ${
            showControlsBar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Title */}
          {title && (
            <div className="text-white text-sm mb-2 truncate">{title}</div>
          )}

          {/* Progress Bar */}
          <div 
            className="h-1 bg-white/30 rounded cursor-pointer mb-3 group relative"
            onClick={handleSeek}
          >
            {/* Buffered */}
            <div 
              className="absolute h-full bg-white/40 rounded"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Progress */}
            <div 
              className="absolute h-full bg-blue-500 rounded"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Thumb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button 
                className="text-white hover:text-blue-400 transition-colors"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <PauseCircleOutlined className="text-xl" />
                ) : (
                  <PlayCircleOutlined className="text-xl" />
                )}
              </button>

              {/* Skip Back/Forward */}
              <button 
                className="text-white hover:text-blue-400 transition-colors"
                onClick={() => skip(-10)}
              >
                <BackwardOutlined className="text-lg" />
              </button>
              <button 
                className="text-white hover:text-blue-400 transition-colors"
                onClick={() => skip(10)}
              >
                <ForwardOutlined className="text-lg" />
              </button>

              {/* Time Display */}
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <button 
                  className="text-white hover:text-blue-400 transition-colors"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <MutedOutlined className="text-lg" />
                  ) : (
                    <SoundOutlined className="text-lg" />
                  )}
                </button>
                <div 
                  className="w-0 group-hover:w-20 h-1 bg-white/30 rounded cursor-pointer overflow-hidden transition-all"
                  onClick={handleVolumeChange}
                >
                  <div 
                    className="h-full bg-white rounded"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>

              {/* Playback Rate */}
              <div className="relative">
                <button 
                  className="text-white hover:text-blue-400 transition-colors text-sm px-2 py-1 bg-white/20 rounded"
                  onClick={() => {
                    setShowRateMenu(!showRateMenu);
                    setShowQualityMenu(false);
                  }}
                >
                  {playbackRate}x
                </button>
                {showRateMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded py-1 min-w-20 z-30">
                    {playbackRates.map(rate => (
                      <button
                        key={rate}
                        className={`block w-full text-left px-3 py-1 text-sm hover:bg-white/20 ${
                          rate === playbackRate ? 'text-blue-400' : 'text-white'
                        }`}
                        onClick={() => handlePlaybackRateChange(rate)}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality Selector */}
              {qualities && qualities.length > 1 && (
                <div className="relative">
                  <button 
                    className="text-white hover:text-blue-400 transition-colors text-sm px-2 py-1 bg-white/20 rounded"
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowRateMenu(false);
                    }}
                  >
                    {qualities[currentQuality]?.label || '自动'}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded py-1 min-w-24 z-30">
                      {qualities.map((q, i) => (
                        <button
                          key={i}
                          className={`block w-full text-left px-3 py-1 text-sm hover:bg-white/20 ${
                            i === currentQuality ? 'text-blue-400' : 'text-white'
                          }`}
                          onClick={() => handleQualityChange(q, i)}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button 
                className="text-white hover:text-blue-400 transition-colors"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <FullscreenExitOutlined className="text-lg" />
                ) : (
                  <FullscreenOutlined className="text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click to play overlay on video */}
      <div 
        className="absolute inset-0 z-5 cursor-pointer"
        onClick={togglePlay}
      />
    </div>
  );
};

export default VideoPlayer;
