import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-8xl mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">页面不存在</h1>
        <p className="text-muted-foreground mb-6">您访问的页面不存在或已被移除</p>
        <Link to="/" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          返回首页
        </Link>
      </div>
    </div>
  );
}
