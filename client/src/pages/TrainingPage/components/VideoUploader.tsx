import React, { useState, useRef, useCallback } from 'react';
import {
  Button, Upload, Progress, message, Space, Tag, Typography, Alert
} from 'antd';
import {
  UploadOutlined, VideoCameraOutlined, DeleteOutlined, CheckCircleOutlined,
  LoadingOutlined, CloudUploadOutlined, PauseCircleOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Text } = Typography;

interface VideoUploaderProps {
  value?: string;           // 当前视频URL
  onChange?: (url: string, duration?: number) => void;
  onUploadProgress?: (percent: number) => void;
  accept?: string;          // 接受的文件类型
  maxSize?: number;         // 最大文件大小（MB）
  uploaderId?: string;      // 上传者ID
  chapterId?: string;       // 章节ID
  courseId?: string;         // 课程ID
  showDuration?: boolean;    // 显示视频时长
  disabled?: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  value,
  onChange,
  onUploadProgress,
  accept = 'video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg,.mov,.avi',
  maxSize = 500, // 默认500MB
  uploaderId,
  chapterId,
  courseId,
  showDuration = true,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoInfo, setVideoInfo] = useState<{ name: string; size: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 获取视频时长
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(0);
      };
    });
  };

  // 上传请求
  const customRequest: UploadProps['customRequest'] = useCallback(async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    const fileObj = file as File;
    
    // 检查文件大小
    if (fileObj.size > maxSize * 1024 * 1024) {
      message.error(`文件大小不能超过 ${maxSize}MB`);
      onError?.(new Error(`文件大小不能超过 ${maxSize}MB`));
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setVideoInfo({ name: fileObj.name, size: fileObj.size });
    
    try {
      // 获取视频时长
      const duration = await getVideoDuration(fileObj);
      setVideoDuration(duration);
      
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', fileObj);
      if (chapterId) formData.append('chapterId', chapterId);
      if (courseId) formData.append('courseId', courseId);
      if (uploaderId) formData.append('uploaderId', uploaderId);
      
      // 上传
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/training/video/upload');
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
          onUploadProgress?.(percent);
          onProgress?.({ percent });
        }
      };
      
      xhr.onload = () => {
        setUploading(false);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            onSuccess?.(response);
            onChange?.(response.video.url, response.video.duration || duration);
            message.success('视频上传成功');
          } else {
            onError?.(new Error(response.error || '上传失败'));
            message.error(response.error || '上传失败');
          }
        } else {
          const error = new Error('上传失败');
          onError?.(error);
          message.error('上传失败');
        }
      };
      
      xhr.onerror = () => {
        setUploading(false);
        const error = new Error('网络错误');
        onError?.(error);
        message.error('网络错误，请重试');
      };
      
      xhr.send(formData);
    } catch (e: any) {
      setUploading(false);
      onError?.(e);
      message.error(e.message || '上传失败');
    }
  }, [chapterId, courseId, uploaderId, maxSize, onChange, onUploadProgress]);

  // 删除视频
  const handleDelete = async () => {
    if (!value) return;
    
    try {
      // 提取视频ID
      const videoId = value.replace('/api/training/video/', '');
      
      const res = await fetch(`/api/training/video/${videoId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setVideoInfo(null);
        setVideoDuration(0);
        onChange?.('', 0);
        message.success('视频已删除');
      } else {
        message.error('删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 格式化时长
  const formatDuration = (seconds: number): string => {
    if (!seconds) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-uploader">
      {/* 已有视频 */}
      {value && !uploading && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VideoCameraOutlined className="text-xl text-blue-500" />
              <div>
                <div className="font-medium">已上传视频</div>
                {videoInfo && (
                  <div className="text-sm text-gray-500">
                    {videoInfo.name} · {formatSize(videoInfo.size)}
                    {showDuration && videoDuration > 0 && ` · ${formatDuration(videoDuration)}`}
                  </div>
                )}
              </div>
            </div>
            <Space>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />} 
                onClick={handleDelete}
                disabled={disabled}
              >
                删除
              </Button>
            </Space>
          </div>
        </div>
      )}

      {/* 上传中 */}
      {uploading && (
        <div className="mb-4 p-4 border border-blue-200 rounded bg-blue-50">
          <div className="flex items-center gap-3 mb-3">
            <LoadingOutlined className="text-xl text-blue-500 animate-spin" />
            <div className="flex-1">
              <div className="font-medium">上传中...</div>
              {videoInfo && (
                <div className="text-sm text-gray-500">
                  {videoInfo.name} · {formatSize(videoInfo.size)}
                </div>
              )}
            </div>
          </div>
          <Progress percent={uploadProgress} status="active" size="small" />
        </div>
      )}

      {/* 上传按钮 */}
      {!value && !uploading && (
        <Upload
          accept={accept}
          customRequest={customRequest}
          showUploadList={false}
          disabled={disabled || uploading}
        >
          <Button 
            icon={<UploadOutlined />} 
            type="primary"
            loading={uploading}
            disabled={disabled}
          >
            选择视频文件
          </Button>
        </Upload>
      )}

      {/* 提示信息 */}
      {!value && !uploading && (
        <div className="mt-2">
          <Text type="secondary" className="text-xs">
            支持 MP4、WebM、OGG 等格式，最大 {maxSize}MB
          </Text>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
