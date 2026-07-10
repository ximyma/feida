import React from 'react';
import { Result, Button, Space, Typography } from 'antd';

const { Text, Paragraph } = Typography;

interface Props { children: React.ReactNode; fallbackName?: string; }
interface State { hasError: boolean; error: Error | null; errorInfo: string; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', this.props.fallbackName || 'page', error, errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack || '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Result
            status="error"
            title={`页面渲染出错${this.props.fallbackName ? ' - ' + this.props.fallbackName : ''}`}
            subTitle="请刷新页面重试；如果问题持续，请联系管理员"
            extra={
              <Space direction="vertical" size={16} style={{ textAlign: 'left', maxWidth: 700, width: '100%' }}>
                <Button type="primary" onClick={() => window.location.reload()}>
                  刷新页面
                </Button>
                {this.state.error && (
                  <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: 16, maxHeight: 300, overflow: 'auto' }}>
                    <Text type="danger" strong>{this.state.error.name}: {this.state.error.message}</Text>
                    {this.state.errorInfo && (
                      <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                        <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#666' }}>
                          {this.state.errorInfo}
                        </pre>
                      </Paragraph>
                    )}
                  </div>
                )}
              </Space>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
