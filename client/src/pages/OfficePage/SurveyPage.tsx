import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, message, Row, Col, Statistic, Tabs, Divider, Drawer,
  Checkbox, Radio, Progress, List, Avatar, Badge, Tooltip, Alert,
  AutoComplete
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  BarChartOutlined, FileTextOutlined, CheckCircleOutlined,
  PieChartOutlined, RightOutlined, UserOutlined, StarOutlined,
  ClockCircleOutlined, TeamOutlined, FieldNumberOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';

const SURVEY_TABLE = 'surveys';
const QUESTION_TABLE = 'survey_questions';
const OPTION_TABLE = 'survey_options';
const RESPONSE_TABLE = 'survey_responses';

const STATUS_LABELS: Record<string, string> = { draft: '草稿', active: '进行中', closed: '已结束' };
const STATUS_COLORS: Record<string, string> = { draft: 'default', active: 'processing', closed: 'success' };
const TYPE_LABELS: Record<string, string> = { survey: '问卷调查', vote: '投票评选' };
const Q_TYPE_LABELS: Record<string, string> = { radio: '单选', checkbox: '多选', text: '填空' };

interface Survey { id: string; title: string; description: string; type: string; status: string; deadline: string; isAnonymous: number; responseCount: number; createdBy: string; createdAt: string; [k: string]: any }
interface Question { id: string; surveyId: string; question: string; type: string; options: string; required: number; sortOrder: number; createdAt: string; [k: string]: any }
interface SurveyOption { id: string; surveyId: string; optionText: string; optionOrder: number; optionType: string; [k: string]: any }
interface Response { id: string; surveyId: string; answers: string; submittedAt: string; employeeName: string; [k: string]: any }

export default function SurveyPage() {
  const [data, setData] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  // Survey CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [form] = Form.useForm();
  // Question/Option management
  const [surveyForQ, setSurveyForQ] = useState<Survey | null>(null);
  const [qDrawerOpen, setQDrawerOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<SurveyOption[]>([]);
  const [qForm] = Form.useForm();
  const [optForm] = Form.useForm();
  // Vote form (employee)
  const [voteDrawerOpen, setVoteDrawerOpen] = useState(false);
  const [voteSurvey, setVoteSurvey] = useState<Survey | null>(null);
  const [voteAnswers, setVoteAnswers] = useState<Record<string, string | string[]>>({});
  const [voteTextAnswers, setVoteTextAnswers] = useState<Record<string, string>>({});
  const [votedOptions, setVotedOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Stats
  const [statsSurvey, setStatsSurvey] = useState<Survey | null>(null);
  const [statsDrawerOpen, setStatsDrawerOpen] = useState(false);
  const [statsData, setStatsData] = useState<{ questions: Question[]; options: SurveyOption[]; responses: Response[] } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartInstance = useRef<echarts.ECharts | null>(null);
  const pieChartInstance = useRef<echarts.ECharts | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${SURVEY_TABLE}/list`);
      const rows: Survey[] = await res.json();
      setData(rows);
    } catch { message.error('加载问卷失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Survey CRUD
  const handleAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ type: 'survey', status: 'draft', isAnonymous: 0 }); setModalOpen(true); };
  const handleEdit = (r: Survey) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/${SURVEY_TABLE}/${id}`, { method: 'DELETE' });
      message.success('删除成功'); fetchData();
    } catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const body = editing
      ? { ...editing, ...values }
      : { id: `sv_${Date.now()}`, ...values, responseCount: 0, createdBy: JSON.parse(sessionStorage.getItem('__current_user') || '{}').realName || 'admin', createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${SURVEY_TABLE}${editing ? '/' + editing.id : ''}`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      message.success(editing ? '修改成功' : '创建成功');
      setModalOpen(false);
      fetchData();
    } catch { message.error('操作失败'); }
  };
  const handleStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/${SURVEY_TABLE}/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      message.success('状态已更新'); fetchData();
    } catch { message.error('更新失败'); }
  };

  // Question management
  const openQManager = async (survey: Survey) => {
    setSurveyForQ(survey);
    setQDrawerOpen(true);
    await loadQuestions(survey.id);
    await loadOptions(survey.id);
  };

  const loadQuestions = async (surveyId: string) => {
    try {
      const r = await fetch(`/api/${QUESTION_TABLE}?surveyId=${surveyId}`);
      const json = await r.json();
      const rows: Question[] = Array.isArray(json) ? json : (json.data || []);
      rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setQuestions(rows);
    } catch { setQuestions([]); }
  };

  const loadOptions = async (surveyId: string) => {
    try {
      const r = await fetch(`/api/${OPTION_TABLE}?surveyId=${surveyId}`);
      const json = await r.json();
      const rows: SurveyOption[] = Array.isArray(json) ? json : (json.data || []);
      rows.sort((a, b) => (a.optionOrder || 0) - (b.optionOrder || 0));
      setOptions(rows);
    } catch { setOptions([]); }
  };

  const handleAddQuestion = async () => {
    const values = await qForm.validateFields();
    const body: any = {
      id: `sq_${Date.now()}`,
      surveyId: surveyForQ!.id,
      question: values.question,
      type: values.type,
      options: JSON.stringify(values.options || []),
      required: values.required ? 1 : 0,
      sortOrder: questions.length,
      createdAt: new Date().toISOString()
    };
    try {
      await fetch(`/api/${QUESTION_TABLE}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      message.success('题目已添加');
      qForm.resetFields();
      loadQuestions(surveyForQ!.id);
    } catch { message.error('添加失败'); }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await fetch(`/api/${QUESTION_TABLE}/${id}`, { method: 'DELETE' });
      message.success('题目已删除');
      // Also delete associated options
      const related = options.filter(o => {
        try { const q = questions.find(q => q.id === id); return q && (JSON.parse(q.options || '[]') as string[]).includes(o.optionText); } catch { return false; }
      });
      for (const o of related) {
        await fetch(`/api/${OPTION_TABLE}/${o.id}`, { method: 'DELETE' }).catch(() => {});
      }
      loadQuestions(surveyForQ!.id);
      loadOptions(surveyForQ!.id);
    } catch { message.error('删除失败'); }
  };

  const handleAddOption = async () => {
    const values = await optForm.validateFields();
    const body = {
      id: `opt_${Date.now()}`,
      surveyId: surveyForQ!.id,
      optionText: values.optionText,
      optionOrder: options.filter(o => {
        try { const q = questions.find(q => q.id === values.questionId); return q && (JSON.parse(q.options || '[]') as string[]).includes(o.optionText); } catch { return false; }
      }).length,
      optionType: 'vote'
    };
    try {
      await fetch(`/api/${OPTION_TABLE}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      message.success('选项已添加');
      optForm.resetFields();
      loadOptions(surveyForQ!.id);
    } catch { message.error('添加失败'); }
  };

  const handleDeleteOption = async (id: string) => {
    try {
      await fetch(`/api/${OPTION_TABLE}/${id}`, { method: 'DELETE' });
      message.success('选项已删除');
      loadOptions(surveyForQ!.id);
    } catch { message.error('删除失败'); }
  };

  // Vote form
  const openVoteForm = async (survey: Survey) => {
    setVoteSurvey(survey);
    setVoteDrawerOpen(true);
    setVoteAnswers({});
    setVoteTextAnswers({});
    // Load questions and check if user already voted
    try {
      const [qr, or, rr] = await Promise.all([
        fetch(`/api/${QUESTION_TABLE}?surveyId=${survey.id}`),
        fetch(`/api/${OPTION_TABLE}?surveyId=${survey.id}`),
        fetch(`/api/${RESPONSE_TABLE}?surveyId=${survey.id}`)
      ]);
      const qJson = await qr.json();
      const oJson = await or.json();
      const rJson = await rr.json();
      const qs: Question[] = Array.isArray(qJson) ? qJson : [];
      const opts: SurveyOption[] = Array.isArray(oJson) ? oJson : [];
      const resp: Response[] = Array.isArray(rJson) ? rJson : [];
      setQuestions(qs);
      setOptions(opts);
      const user = JSON.parse(sessionStorage.getItem('__current_user') || '{}');
      const myVote = resp.find(r => r.employeeName === user.realName);
      if (myVote) {
        try {
          const ans = JSON.parse(myVote.answers || '{}');
          setVotedOptions(opts.filter(o => Object.values(ans).flat().includes(o.optionText)).map(o => o.id));
          setVoteAnswers(ans);
        } catch { setVotedOptions([]); }
      } else {
        setVotedOptions([]);
      }
    } catch { message.error('加载失败'); }
  };

  const submitVote = async () => {
    if (!voteSurvey) return;
    const user = JSON.parse(sessionStorage.getItem('__current_user') || '{}');
    setSubmitting(true);
    try {
      await fetch(`/api/${SURVEY_TABLE}/${voteSurvey.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: voteSurvey.id,
          answers: voteAnswers,
          userId: user.employeeId || user.id || '',
          employeeName: user.realName || ''
        })
      });
      // Update option vote counts
      for (const optId of votedOptions) {
        const opt = options.find(o => o.id === optId);
        if (opt) {
          await fetch(`/api/${OPTION_TABLE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...opt, surveyId: voteSurvey.id, optionText: opt.optionText, optionOrder: opt.optionOrder || 0 })
          }).catch(() => {});
        }
      }
      message.success('提交成功，感谢您的参与！');
      setVoteDrawerOpen(false);
      fetchData();
    } catch { message.error('提交失败'); }
    finally { setSubmitting(false); }
  };

  // Stats
  const openStats = async (survey: Survey) => {
    setStatsSurvey(survey);
    setStatsDrawerOpen(true);
    setStatsLoading(true);
    try {
      const r = await fetch(`/api/${SURVEY_TABLE}/${survey.id}/stats`);
      const data = await r.json();
      setStatsData(data);
    } catch { setStatsData(null); }
    finally { setStatsLoading(false); }
  };

  // Render charts when stats change
  useEffect(() => {
    if (!statsData || !statsDrawerOpen) return;

    const renderCharts = () => {
      const totalResponses = statsData.responses.length;

      // Bar chart - responses per option
      if (barChartRef.current) {
        const barInst = echarts.init(barChartRef.current);
        const optionNames = statsData.options.map(o => o.optionText);
        const optionCounts = statsData.options.map(o => {
          const count = statsData!.responses.filter(r => {
            try {
              const answers = JSON.parse(r.answers || '{}');
              return Object.values(answers).flat().includes(o.optionText);
            } catch { return false; }
          }).length;
          return count;
        });

        barInst.setOption({
          title: { text: '各选项投票统计', left: 'center', textStyle: { fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: optionNames, axisLabel: { rotate: 20, fontSize: 11 } },
          yAxis: { type: 'value', name: '票数' },
          series: [{
            type: 'bar',
            data: optionCounts.map((c, i) => ({
              value: c,
              itemStyle: { color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][i % 6] }
            })),
            label: { show: true, position: 'top', formatter: '{c} 票' }
          }]
        });
        barChartInstance.current = barInst;
      }

      // Pie chart - percentage
      if (pieChartRef.current) {
        const pieInst = echarts.init(pieChartRef.current);
        const pieData = statsData.options.map((o, i) => {
          const count = statsData!.responses.filter(r => {
            try { return Object.values(JSON.parse(r.answers || '{}')).flat().includes(o.optionText); } catch { return false; }
          }).length;
          return { name: o.optionText, value: count };
        }).filter(d => d.value > 0);

        pieInst.setOption({
          title: { text: '投票占比', left: 'center', textStyle: { fontSize: 14 } },
          tooltip: { formatter: '{b}: {c} 票 ({d}%)' },
          legend: { bottom: 0, type: 'scroll' },
          series: [{
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['50%', '45%'],
            data: pieData,
            label: { formatter: '{b}\n{d}%' },
            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
          }]
        });
        pieChartInstance.current = pieInst;
      }
    };

    // Wait for DOM to render
    const timer = setTimeout(renderCharts, 100);
    return () => {
      clearTimeout(timer);
      barChartInstance.current?.dispose();
      pieChartInstance.current?.dispose();
    };
  }, [statsData, statsDrawerOpen]);

  const statsColumns = [
    { title: '选项', dataIndex: 'optionText', render: (v: string, _: any, i: number) => (
      <Space>
        <Avatar size="small" style={{ background: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][i % 6], fontSize: 10 }}>
          {String.fromCharCode(65 + i)}
        </Avatar>
        <span>{v}</span>
      </Space>
    )},
    { title: '票数', render: (_: any, __: any, i: number) => {
      const count = statsData?.responses.filter(r => {
        try { return Object.values(JSON.parse(r.answers || '{}')).flat().includes(statsData!.options[i].optionText); } catch { return false; }
      }).length || 0;
      const total = statsData?.responses.length || 1;
      const pct = Math.round(count / total * 100);
      return (
        <Space>
          <Progress percent={pct} size="small" format={() => `${count} 票`}
            strokeColor={['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][i % 6]} />
        </Space>
      );
    }}
  ];

  const columns = [
    { title: '标题', dataIndex: 'title', width: 220, ellipsis: true,
      render: (v: string, r: Survey) => (
        <Space direction="vertical" size={0}>
          <Tag color={r.type === 'vote' ? 'blue' : 'green'}>{TYPE_LABELS[r.type] || r.type}</Tag>
          <span style={{ fontWeight: 500 }}>{v}</span>
        </Space>
      )
    },
    { title: '类型', dataIndex: 'type', width: 90, render: (v: string) => TYPE_LABELS[v] || v },
    { title: '回复', dataIndex: 'responseCount', width: 70, align: 'right' as const,
      render: (v: number) => <Badge count={v} style={{ backgroundColor: '#52c41a' }} showZero zeroColor="#d9d9d9" /> },
    { title: '截止日期', dataIndex: 'deadline', width: 110, render: (v: string) => v ? <Space><ClockCircleOutlined style={{ color: new Date(v) < new Date() ? '#ff4d4f' : '#52c41a' }} />{v.slice(0, 10)}</Space> : '—' },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    {
      title: '操作', width: 320,
      render: (_: any, r: Survey) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => openQManager(r)}>管理题目</Button>
          <Button type="link" size="small" icon={<BarChartOutlined />} onClick={() => openStats(r)}>查看统计</Button>
          {r.status === 'active' && <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => openVoteForm(r)}>立即投票</Button>}
          {r.status === 'draft' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'active')}>启动</Button>}
          {r.status === 'active' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'closed')}>结束</Button>}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const stats = {
    total: data.length,
    active: data.filter(r => r.status === 'active').length,
    totalResponses: data.reduce((s, r) => s + (r.responseCount || 0), 0),
    closed: data.filter(r => r.status === 'closed').length
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="问卷/投票总数" value={stats.total} prefix={<FileTextOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="进行中" value={stats.active} valueStyle={{ color: '#1890ff' }} prefix={<StarOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总回复" value={stats.totalResponses} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已结束" value={stats.closed} valueStyle={{ color: '#8c8c8c' }} prefix={<CheckCircleOutlined />} /></Card></Col>
      </Row>

      {/* 主表格 */}
      <Card extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新建问卷/投票</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
          scroll={{ x: 1000 }} size="small" />
      </Card>

      {/* 新建/编辑问卷 */}
      <Modal
        title={editing ? '编辑问卷/投票' : '新建问卷/投票'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ type: 'survey', status: 'draft', isAnonymous: 0 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="如：2026年优秀员工评选" showCount maxLength={80} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="survey">📋 问卷调查</Select.Option>
                  <Select.Option value="vote">🗳️ 投票评选</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select>
                  <Select.Option value="draft">草稿</Select.Option>
                  <Select.Option value="active">进行中</Select.Option>
                  <Select.Option value="closed">已结束</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isAnonymous" label="匿名投票" valuePropName="checked">
                <Checkbox>匿名</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="deadline" label="截止日期">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} placeholder="填写说明、注意事项等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 题目管理抽屉 */}
      <Drawer
        title={<Space><FileTextOutlined /> 管理题目 — {surveyForQ?.title}</Space>}
        open={qDrawerOpen}
        onClose={() => { setQDrawerOpen(false); setSurveyForQ(null); setQuestions([]); setOptions([]); }}
        width={700}
        extra={
          surveyForQ?.status === 'draft' && (
            <Button type="primary" onClick={() => { setQDrawerOpen(false); handleStatus(surveyForQ!.id, 'active'); }}>
              启动问卷
            </Button>
          )
        }
      >
        {/* 新增题目 */}
        {surveyForQ?.status === 'draft' && (
          <Card size="small" title="➕ 添加题目" style={{ marginBottom: 16 }}>
            <Form form={qForm} layout="vertical">
              <Row gutter={12}>
                <Col span={18}>
                  <Form.Item name="question" label="题目内容" rules={[{ required: true }]}>
                    <Input placeholder="请输入题目内容" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="type" label="题型" initialValue="radio">
                    <Select>
                      <Select.Option value="radio">单选题</Select.Option>
                      <Select.Option value="checkbox">多选题</Select.Option>
                      <Select.Option value="text">填空题</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item name="options" label="选项（多选/单选时填写，每行一个）">
                    <Input.TextArea rows={3} placeholder="选项A&#10;选项B&#10;选项C" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="required" label="必答" valuePropName="checked" initialValue={true}>
                    <Checkbox>必答</Checkbox>
                  </Form.Item>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuestion} style={{ marginTop: 24 }}>添加</Button>
                </Col>
              </Row>
            </Form>
          </Card>
        )}

        {/* 已有题目列表 */}
        <Card size="small" title={`题目列表 (${questions.length})`} style={{ marginBottom: 16 }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>暂无题目，请先添加题目</div>
          ) : (
            <List
              size="small"
              dataSource={questions}
              renderItem={(q, qi) => {
                let opts: string[] = [];
                try { opts = JSON.parse(q.options || '[]'); } catch { opts = []; }
                return (
                  <List.Item
                    key={q.id}
                    actions={surveyForQ?.status === 'draft' ? [
                      <Popconfirm key="del" title="确认删除?" onConfirm={() => handleDeleteQuestion(q.id)}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>
                    ] : []}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Badge count={qi + 1} style={{ backgroundColor: '#1890ff' }} />
                          <span style={{ fontWeight: 500 }}>{q.question}</span>
                          <Tag color={q.type === 'radio' ? 'blue' : q.type === 'checkbox' ? 'green' : 'orange'}>
                            {Q_TYPE_LABELS[q.type] || q.type}
                          </Tag>
                          {q.required ? <Tag color="red">必答</Tag> : <Tag>选答</Tag>}
                        </Space>
                      }
                      description={
                        opts.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                            {opts.map((o, oi) => {
                              const count = statsData?.responses.filter(r => {
                                try { return Object.values(JSON.parse(r.answers || '{}')).flat().includes(o); } catch { return false; }
                              }).length || 0;
                              return (
                                <Tag key={oi} style={{ cursor: 'default' }}>
                                  {String.fromCharCode(65 + oi)}. {o}
                                  <span style={{ marginLeft: 6, color: '#888', fontSize: 11 }}>
                                    ({count})
                                  </span>
                                </Tag>
                              );
                            })}
                          </div>
                        ) : null
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {/* 投票选项（用于投票评选型） */}
        {surveyForQ?.type === 'vote' && (
          <Card size="small" title={`投票选项 (${options.length})`}>
            <Form form={optForm} layout="inline" style={{ marginBottom: 12 }}>
              <Form.Item name="optionText" rules={[{ required: true }]} style={{ flex: 1 }}>
                <Input placeholder="输入选项名称，如：张明辉 - 技术部" />
              </Form.Item>
              {surveyForQ.status === 'draft' && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddOption}>添加</Button>
              )}
            </Form>
            <List
              size="small"
              dataSource={options}
              renderItem={(o, oi) => (
                <List.Item key={o.id} actions={surveyForQ.status === 'draft' ? [
                  <Popconfirm key="del" title="确认删除?" onConfirm={() => handleDeleteOption(o.id)}>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                ] : []}
                >
                  <List.Item.Meta
                    avatar={<Avatar size="small" style={{ background: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][oi % 6] }}>{String.fromCharCode(65 + oi)}</Avatar>}
                    title={o.optionText}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      </Drawer>

      {/* 投票表单抽屉 */}
      <Drawer
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>{voteSurvey?.title}</span>
            <Tag color={voteSurvey?.type === 'vote' ? 'blue' : 'green'}>
              {voteSurvey?.type === 'vote' ? '投票' : '问卷'}
            </Tag>
          </Space>
        }
        open={voteDrawerOpen}
        onClose={() => { setVoteDrawerOpen(false); }}
        width={600}
        footer={
          votedOptions.length > 0 || Object.keys(voteAnswers).length > 0 ? (
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#888', marginRight: 12 }}>✅ 您已投过票</span>
              <Button onClick={() => setVoteDrawerOpen(false)}>关闭</Button>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setVoteDrawerOpen(false)}>取消</Button>
                <Button type="primary" icon={<CheckCircleOutlined />} loading={submitting} onClick={submitVote}>
                  提交 {voteSurvey?.type === 'vote' ? '投票' : '问卷'}
                </Button>
              </Space>
            </div>
          )
        }
      >
        {voteSurvey && (
          <>
            {voteSurvey.description && (
              <Alert message={voteSurvey.description} type="info" showIcon style={{ marginBottom: 16 }} />
            )}
            {voteSurvey.deadline && new Date(voteSurvey.deadline) < new Date() && (
              <Alert message="投票已截止" type="warning" showIcon style={{ marginBottom: 16 }} />
            )}
            {votedOptions.length > 0 && (
              <Alert message="您已完成投票，感谢参与！" type="success" showIcon icon={<CheckCircleOutlined />} style={{ marginBottom: 16 }} />
            )}

            {/* 问卷题型 */}
            {questions.length > 0 && (
              <div>
                {questions.map((q, qi) => {
                  let opts: string[] = [];
                  try { opts = JSON.parse(q.options || '[]'); } catch { opts = []; }
                  return (
                    <Card key={q.id} size="small" title={<Space><Badge count={qi + 1} style={{ backgroundColor: '#1890ff' }} />{q.question}{q.required ? <Tag color="red" style={{ marginLeft: 4 }}>必答</Tag> : null}</Space>} style={{ marginBottom: 12 }}>
                      {q.type === 'radio' && (
                        <Radio.Group
                          value={voteAnswers[q.id]}
                          onChange={e => setVoteAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                          disabled={votedOptions.length > 0}
                        >
                          <Space direction="vertical">
                            {opts.map((o, oi) => (
                              <Radio key={oi} value={o}>
                                {o}
                              </Radio>
                            ))}
                          </Space>
                        </Radio.Group>
                      )}
                      {q.type === 'checkbox' && (
                        <Checkbox.Group
                          value={Array.isArray(voteAnswers[q.id]) ? voteAnswers[q.id] as string[] : []}
                          onChange={vals => setVoteAnswers(a => ({ ...a, [q.id]: vals }))}
                          disabled={votedOptions.length > 0}
                        >
                          <Space direction="vertical">
                            {opts.map((o, oi) => (
                              <Checkbox key={oi} value={o}>{o}</Checkbox>
                            ))}
                          </Space>
                        </Checkbox.Group>
                      )}
                      {q.type === 'text' && (
                        <Input.TextArea
                          rows={2}
                          placeholder="请输入您的回答"
                          value={voteTextAnswers[q.id] || ''}
                          onChange={e => { setVoteTextAnswers(a => ({ ...a, [q.id]: e.target.value })); setVoteAnswers(a => ({ ...a, [q.id]: e.target.value })); }}
                          disabled={votedOptions.length > 0}
                        />
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* 投票评选型 */}
            {voteSurvey.type === 'vote' && options.length > 0 && (
              <div>
                {votedOptions.length > 0 ? (
                  <div>
                    <p style={{ color: '#888', marginBottom: 12 }}>您已投票：{votedOptions.length} 项</p>
                    <List
                      size="small"
                      dataSource={options.filter(o => votedOptions.includes(o.id))}
                      renderItem={(o, oi) => (
                        <List.Item key={o.id}>
                          <List.Item.Meta avatar={<Avatar style={{ background: '#52c41a' }} icon={<CheckCircleOutlined />} />} title={o.optionText} />
                        </List.Item>
                      )}
                    />
                  </div>
                ) : (
                  <Radio.Group onChange={e => setVoteAnswers({ vote: e.target.value })} value={voteAnswers['vote']}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {options.map((o, oi) => {
                        const count = statsData?.responses.filter(r => {
                          try { return Object.values(JSON.parse(r.answers || '{}')).flat().includes(o.optionText); } catch { return false; }
                        }).length || 0;
                        return (
                          <Card key={o.id} size="small" hoverable style={{ borderColor: voteAnswers['vote'] === o.optionText ? '#1890ff' : undefined }}>
                            <Radio value={o.optionText} style={{ width: '100%' }}>
                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Space>
                                  <Avatar size="small" style={{ background: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'][oi % 6] }}>
                                    {String.fromCharCode(65 + oi)}
                                  </Avatar>
                                  <span>{o.optionText}</span>
                                </Space>
                                <Tag>{count} 票</Tag>
                              </Space>
                            </Radio>
                          </Card>
                        );
                      })}
                    </Space>
                  </Radio.Group>
                )}
              </div>
            )}

            {questions.length === 0 && voteSurvey.type === 'vote' && options.length === 0 && (
              <Alert message="暂无投票选项，请等待管理员添加" type="warning" />
            )}
          </>
        )}
      </Drawer>

      {/* 统计图表抽屉 */}
      <Drawer
        title={<Space><BarChartOutlined /> 统计分析 — {statsSurvey?.title}</Space>}
        open={statsDrawerOpen}
        onClose={() => { setStatsDrawerOpen(false); setStatsSurvey(null); setStatsData(null); barChartInstance.current?.dispose(); pieChartInstance.current?.dispose(); }}
        width={800}
        extra={
          <Tag color={STATUS_COLORS[statsSurvey?.status || '']}>
            {STATUS_LABELS[statsSurvey?.status || '']}
          </Tag>
        }
      >
        {statsLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>加载中...</div>
        ) : statsData ? (
          <>
            {/* 概览 */}
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={8}><Card size="small"><Statistic title="总回复" value={statsData.responses.length} prefix={<UserOutlined />} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="题目数" value={statsData.questions.length} prefix={<FieldNumberOutlined />} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="选项数" value={statsData.options.length} prefix={<TeamOutlined />} /></Card></Col>
            </Row>

            {/* 图表区域 */}
            {statsData.options.length > 0 && statsData.responses.length > 0 && (
              <Row gutter={12}>
                <Col span={12}>
                  <Card size="small" title="📊 柱状图">
                    <div ref={barChartRef} style={{ height: 300 }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="🥧 饼图">
                    <div ref={pieChartRef} style={{ height: 300 }} />
                  </Card>
                </Col>
              </Row>
            )}

            {/* 选项详细统计表 */}
            <Card size="small" title="选项详细统计" style={{ marginTop: 16 }}>
              <Table columns={statsColumns} dataSource={statsData.options} rowKey="id" pagination={false} size="small" />
            </Card>

            {/* 最近回复者列表 */}
            {statsData.responses.length > 0 && (
              <Card size="small" title={`最近回复 (${statsData.responses.length})`} style={{ marginTop: 16 }}>
                <List
                  size="small"
                  dataSource={statsData.responses.slice(-10).reverse()}
                  renderItem={(r, i) => (
                    <List.Item key={r.id}>
                      <List.Item.Meta
                        avatar={<Avatar size="small" style={{ background: '#1890ff' }}>{String(i + 1)}</Avatar>}
                        title={statsSurvey?.isAnonymous ? '匿名用户' : (r.employeeName || r.userId || '未知')}
                        description={r.submittedAt ? r.submittedAt.slice(0, 16) : '—'}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {statsData.options.length === 0 && (
              <Alert message="暂无选项数据，请先添加题目和选项" type="info" />
            )}
          </>
        ) : (
          <Alert message="加载统计数据失败" type="error" />
        )}
      </Drawer>
    </div>
  );
}
