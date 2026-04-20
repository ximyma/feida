import React, { useState, useEffect } from 'react';

interface ApprovalRequest {
  id: string;
  title: string;
  module: string;
  applicantId: string;
  applicantName: string;
  status: string;
  currentStep: number;
  submittedAt: string;
  formData: string;
}

interface ApprovalRecord {
  id: string;
  requestId: string;
  stepIndex: number;
  approverId: string;
  approverName: string;
  action: string;
  comment: string;
  handledAt: string;
}

export default function ApprovalCenter({
  approverId,
  approverName
}: {
  approverId: string;
  approverName: string;
}) {
  const [activeTab, setActiveTab] = useState<'pending' | 'my-requests' | 'processed'>('pending');
  const [pendingList, setPendingList] = useState<ApprovalRequest[]>([]);
  const [myRequests, setMyRequests] = useState<ApprovalRequest[]>([]);
  const [processedList, setProcessedList] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [approverId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取待审批列表
      const pendingRes = await fetch(`/api/approval/pending?approverId=${approverId}`);
      const pendingData = await pendingRes.json();
      setPendingList(pendingData.data || []);

      // 获取我发起的审批
      const myRes = await fetch(`/api/approval_requests?applicantId=${approverId}`);
      const myData = await myRes.json();
      setMyRequests(Array.isArray(myData) ? myData : []);

      // 获取已处理的审批（通过审批记录）
      const processedRes = await fetch(`/api/approval_records?approverId=${approverId}`);
      const processedData = await processedRes.json();
      // 去重获取请求列表
      const requestIds = new Set(processedData.map((r: ApprovalRecord) => r.requestId));
      const requests = await Promise.all(
        Array.from(requestIds).map(id => 
          fetch(`/api/approval_requests/${id}`).then(r => r.json())
        )
      );
      setProcessedList(requests.filter(Boolean));

    } catch (e) {
      console.error('获取审批数据失败', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async (requestId: string) => {
    try {
      const res = await fetch(`/api/approval/history/${requestId}`);
      const data = await res.json();
      setApprovalHistory(data.data || []);
    } catch (e) {
      console.error('获取审批历史失败', e);
    }
  };

  const handleProcess = async (requestId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !comment.trim()) {
      alert('请填写拒绝原因');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/approval/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          approverId,
          approverName,
          action,
          comment
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(data.message || '审批成功');
        setSelectedRequest(null);
        setComment('');
        fetchData();
      } else {
        alert(data.message || '审批失败');
      }
    } catch (e) {
      alert('网络错误，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
      processing: 'bg-blue-100 text-blue-700'
    };
    const labels: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝',
      processing: '审批中'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || 'bg-muted'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getModuleLabel = (module: string) => {
    const labels: Record<string, string> = {
      leave: '请假',
      overtime: '加班',
      expense: '报销',
      purchase: '采购',
      contract: '合同',
      resignation: '离职'
    };
    return labels[module] || module;
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 标签页 */}
      <div className="flex gap-2 border-b">
        {[
          { key: 'pending', label: '待审批', count: pendingList.length },
          { key: 'my-requests', label: '我的申请', count: myRequests.length },
          { key: 'processed', label: '已处理', count: processedList.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 审批详情弹窗 */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* 申请信息 */}
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">申请人：</span>{selectedRequest.applicantName}</div>
                <div><span className="text-muted-foreground">类型：</span>{getModuleLabel(selectedRequest.module)}</div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">提交时间：</span>
                  {new Date(selectedRequest.submittedAt).toLocaleString('zh-CN')}
                </div>
              </div>
              
              {/* 表单数据解析显示 */}
              {selectedRequest.formData && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm">
                    {Object.entries(JSON.parse(selectedRequest.formData)).map(([k, v]) => (
                      <div key={k} className="mb-1">
                        <span className="text-muted-foreground">{k}：</span>
                        {String(v)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 审批历史 */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">审批流程</h4>
              <div className="space-y-2">
                {approvalHistory.map((record, i) => (
                  <div key={record.id} className="flex items-center gap-3 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      record.action === 'approve' ? 'bg-success/10 text-success' :
                      record.action === 'reject' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted'
                    }`}>
                      {record.action === 'approve' ? '✓' : record.action === 'reject' ? '✕' : i + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{record.approverName}</span>
                      <span className="text-muted-foreground ml-2">
                        {record.action === 'approve' ? '同意' :
                         record.action === 'reject' ? '拒绝' :
                         '待审批'}
                      </span>
                      {record.comment && (
                        <span className="text-muted-foreground ml-2">- {record.comment}</span>
                      )}
                    </div>
                    {record.handledAt && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(record.handledAt).toLocaleString('zh-CN')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 审批操作 */}
            {activeTab === 'pending' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">审批意见</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={2}
                    placeholder="请填写审批意见（拒绝时必填）"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProcess(selectedRequest.id, 'approve')}
                    disabled={processing}
                    className="flex-1 py-3 bg-success text-white rounded-lg font-semibold hover:bg-success/90 disabled:opacity-50"
                  >
                    {processing ? '处理中...' : '同意'}
                  </button>
                  <button
                    onClick={() => handleProcess(selectedRequest.id, 'reject')}
                    disabled={processing}
                    className="flex-1 py-3 bg-destructive text-white rounded-lg font-semibold hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {processing ? '处理中...' : '拒绝'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 列表内容 */}
      <div className="space-y-3">
        {(activeTab === 'pending' ? pendingList :
          activeTab === 'my-requests' ? myRequests : processedList
        ).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无{activeTab === 'pending' ? '待审批' : 
               activeTab === 'my-requests' ? '申请' : '已处理'}记录
          </div>
        ) : (
          (activeTab === 'pending' ? pendingList :
           activeTab === 'my-requests' ? myRequests : processedList
          ).map(request => (
            <div
              key={request.id}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedRequest(request);
                fetchApprovalHistory(request.id);
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{request.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.applicantName} · {getModuleLabel(request.module)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(request.submittedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
