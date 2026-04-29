import React, { useEffect, useRef, useState, useCallback } from 'react';

interface DanmakuItem {
  id: string;
  content: string;
  color?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

interface LiveDanmuProps {
  /** 弹幕列表 */
  danmus: DanmakuItem[];
  /** 是否启用弹幕 */
  enabled?: boolean;
  /** 弹幕密度 (1-10) */
  density?: number;
  /** 弹幕速度 (1-10，越大越快) */
  speed?: number;
  /** 弹幕区域 (0-1, 0.3表示上半部分, 1表示全屏) */
  area?: number;
  /** 自定义颜色列表 */
  colors?: string[];
  /** 新增弹幕回调 */
  onNewDanmaku?: (danmaku: DanmakuItem) => void;
}

const LiveDanmu: React.FC<LiveDanmuProps> = ({
  danmus,
  enabled = true,
  density = 5,
  speed = 5,
  area = 0.75,
  colors = ['#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'],
  onNewDanmaku,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDanmus, setActiveDanmus] = useState<Map<string, HTMLElement>>(new Map());
  const trackCountRef = useRef(0);
  const danmakuIdCounter = useRef(0);

  // 创建弹幕元素
  const createDanmakuElement = useCallback((danmaku: DanmakuItem): HTMLElement => {
    const span = document.createElement('span');
    span.textContent = danmaku.content;
    span.className = 'absolute whitespace-nowrap text-white font-bold select-none';
    span.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    
    // 随机颜色或自定义颜色
    span.style.color = danmaku.color || colors[Math.floor(Math.random() * colors.length)];
    
    // 字号
    const fontSize = danmaku.fontSize || 'medium';
    switch (fontSize) {
      case 'small':
        span.style.fontSize = '14px';
        break;
      case 'large':
        span.style.fontSize = '24px';
        break;
      default:
        span.style.fontSize = '18px';
    }

    return span;
  }, [colors]);

  // 显示单条弹幕
  const showDanmaku = useCallback((danmaku: DanmakuItem) => {
    if (!containerRef.current || !enabled) return;

    const element = createDanmakuElement(danmaku);
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    // 计算轨道位置
    const trackHeight = 30; // 每条轨道高度
    const maxTracks = Math.floor((containerHeight * area) / trackHeight);
    const track = trackCountRef.current % maxTracks;
    trackCountRef.current++;

    // 随机垂直偏移
    const topOffset = Math.random() * (trackHeight - 10);
    const top = track * trackHeight + topOffset;

    element.style.top = `${top}px`;
    element.style.left = `${containerWidth}px`;

    containerRef.current.appendChild(element);

    // 计算动画持续时间 (根据速度)
    const duration = 8000 / speed; // ms
    const distance = containerWidth + element.offsetWidth;

    // 启动动画
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentX = containerWidth - (progress * distance);
      
      element.style.left = `${currentX}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画结束，移除元素
        element.remove();
      }
    };

    requestAnimationFrame(animate);
  }, [enabled, speed, area, createDanmakuElement]);

  // 发送弹幕
  const sendDanmaku = useCallback((content: string, options?: { color?: string; fontSize?: 'small' | 'medium' | 'large' }) => {
    const danmaku: DanmakuItem = {
      id: `dm-${++danmakuIdCounter.current}`,
      content,
      color: options?.color,
      fontSize: options?.fontSize,
    };
    
    onNewDanmaku?.(danmaku);
    showDanmaku(danmaku);
  }, [showDanmaku, onNewDanmaku]);

  // 监听新弹幕
  useEffect(() => {
    if (!enabled || danmus.length === 0) return;

    // 根据密度控制弹幕发送间隔
    const interval = setInterval(() => {
      // 随机选择一条弹幕显示
      const randomIndex = Math.floor(Math.random() * danmus.length);
      const danmaku = danmus[randomIndex];
      if (danmaku) {
        showDanmaku(danmaku);
      }
    }, Math.max(100, 1000 / density));

    return () => clearInterval(interval);
  }, [danmus, enabled, density, showDanmaku]);

  // 清理
  useEffect(() => {
    return () => {
      // 组件卸载时清理所有弹幕
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    />
  );
};

export default LiveDanmu;
export type { DanmakuItem, LiveDanmuProps };
