import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VideoCameraOutlined, SoundOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { message } from 'antd';
import Hls from 'hls.js';
import flvjs from 'flv.js';

interface LivePlayerProps {
  /** 直播流地址 - 支持 HLS(m3u8) 或 FLV */
  src?: string;
  /** 回放地址 */
  playbackUrl?: string;
  /** 是否正在直播 */
  isLive?: boolean;
  /** 直播标题 */
  title?: string;
  /** 观看人数回调 */
  onViewerCountChange?: (count: number) => void;
  /** 直播状态变化回调 */
  onStatusChange?: (status: 'idle' | 'loading' | 'playing' | 'error') => void;
  /** 播放错误回调 */
  onError?: (error: Error) => void;
  /** 流类型 - auto自动检测, hls, flv */
  streamType?: 'auto' | 'hls' | 'flv';
}

const LivePlayer: React.FC<LivePlayerProps> = ({
  src,
  playbackUrl,
  isLive = true,
  title = '直播间',
  onViewerCountChange,
  onStatusChange,
  onError,
  streamType = 'auto',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const flvPlayerRef = useRef<flvjs.Player | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 状态变化通知
  const updateStatus = useCallback((newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // 自动隐藏控制栏
  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    setShowControls(true);
    if (status === 'playing') {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [status]);

  // 初始化播放器
  useEffect(() => {
    if (!src && !playbackUrl) {
      updateStatus('idle');
      return;
    }

    const streamUrl = isLive ? src : playbackUrl;
    if (!streamUrl) return;

    const video = videoRef.current;
    if (!video) return;

    updateStatus('loading');

    const detectedType = streamType !== 'auto' 
      ? streamType 
      : (streamUrl.includes('.m3u8') ? 'hls' : streamUrl.includes('.flv') ? 'flv' : 'hls');

    if (detectedType === 'hls' || streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: isLive,
          backBufferLength: isLive ? 0 : 90,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          updateStatus('playing');
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('HLS Error:', data);
            updateStatus('error');
            onError?.(new Error(data.type));
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = streamUrl;
        video.play().catch(() => {});
        updateStatus('playing');
      }
    } else if ((detectedType === 'flv' || streamUrl.includes('.flv')) && flvjs.isSupported()) {
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: streamUrl,
        isLive: isLive,
        hasAudio: true,
        hasVideo: true,
      });
      flvPlayerRef.current = flvPlayer;
      flvPlayer.attachMediaElement(video);
      flvPlayer.load();
      flvPlayer.on(flvjs.Events.ERROR, (_, data) => {
        console.error('FLV Error:', data);
        updateStatus('error');
        onError?.(new Error(data.type));
      });
      flvPlayer.on(flvjs.Events.STATISTICS_INFO, (data) => {
        // 可以在这里更新码率等信息
      });
      flvPlayer.play().catch(() => {});
      updateStatus('playing');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
        flvPlayerRef.current = null;
      }
    };
  }, [src, playbackUrl, isLive, streamType, updateStatus, onError]);

  // 模拟观看人数
  useEffect(() => {
    if (!isLive) return;
    
    // 模拟观看人数变化
    const baseCount = Math.floor(Math.random() * 50) + 50;
    onViewerCountChange?.(baseCount);
    
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 10) - 3;
      onViewerCountChange?.(prev => Math.max(0, prev + change));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, onViewerCountChange]);

  // 全屏切换
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // 音量控制
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
    setIsMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // 鼠标移动显示控制栏
  const handleMouseMove = useCallback(() => {
    if (!isHovering) setIsHovering(true);
    resetControlsTimer();
  }, [isHovering, resetControlsTimer]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    if (status === 'playing') {
      setShowControls(false);
    }
  }, [status]);

  // 渲染状态
  const renderStatus = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
            <VideoCameraOutlined style={{ fontSize: 64 }} />
            <p className="mt-4 text-lg">暂无直播内容</p>
            <p className="text-sm text-gray-400">等待主播开始直播...</p>
          </div>
        );
      case 'loading':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-lg">正在加载直播...</p>
          </div>
        );
      case 'error':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
            <div className="text-red-500" style={{ fontSize: 64 }}>!</div>
            <p className="mt-4 text-lg">直播加载失败</p>
            <button 
              className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              刷新重试
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={resetControlsTimer}
      />

      {/* 状态覆盖层 */}
      {renderStatus()}

      {/* 顶部信息栏 */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
          showControls || isHovering || status !== 'playing' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs rounded ${isLive ? 'bg-red-500' : 'bg-gray-500'}`}>
              {isLive ? '直播中' : '回放'}
            </span>
            <span className="text-white font-medium">{title}</span>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                直播
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
          showControls || isHovering || status !== 'playing' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* 音量控制 */}
          <div className="flex items-center gap-2">
            <SoundOutlined 
              className="text-white cursor-pointer hover:text-blue-400"
              onClick={toggleMute}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-blue-500"
            />
          </div>

          {/* 全屏按钮 */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400 transition-colors"
          >
            {isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LivePlayer;
