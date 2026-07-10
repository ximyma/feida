# 飞达智能HR系统 - AI功能配置指南

## 一、AI功能概述

系统集成了以下 AI 智能功能：

| 功能 | 说明 | 是否需要配置 |
|------|------|:---:|
| **AI智能助手** | 流式对话、知识库增强、多模型切换 | ✅ 需要 |
| **AI知识库** | 混合检索、命中测试、RAG增强 | ✅ 需要 |
| **智能BI看板** | AI驱动的数据可视化与洞察 | ✅ 需要 |
| **智能预警** | 考勤/加班/合同/绩效/培训预警 | ❌ 内置规则 |
| **多语言翻译** | 中英日越柬等10+语言 | ✅ 需要 |
| **简历分析** | 智能提取候选人关键信息 | ✅ 需要 |

---

## 二、AI 提供商配置

### 方式1：系统设置页面（推荐）

1. 登录系统 → 系统管理 → **AI配置**
2. 选择服务提供商：
   - **DeepSeek**（推荐）：性价比高，中文效果好
   - **OpenAI**：国际通用，生态丰富
   - **Ollama**：完全离线，数据安全
3. 填入 API Key 或模型名称
4. 点击「测试连接」验证
5. 点击「保存配置」

### 方式2：环境变量

```bash
# DeepSeek（默认）
set DEEPSEEK_API_KEY=sk-your-api-key-here

# 启动系统
npm run dev
```

### 方式3：Ollama 本地大模型

```bash
# 1. 安装 Ollama
# 下载: https://ollama.com/download

# 2. 拉取模型
ollama pull deepseek-r1:8b

# 3. 启动 Ollama 服务
ollama serve

# 4. 在系统设置中选择 Ollama，地址默认 http://localhost:11434
```

---

## 三、知识库初始化

系统首次启动时自动创建5条HR默认知识：

| 知识条目 | 分类 | 内容 |
|----------|------|------|
| 年假制度 | 考勤管理 | 年假天数标准、使用规则 |
| 加班管理规定 | 考勤管理 | 加班费率、申请流程 |
| 招聘面试流程 | 招聘入职 | 6步标准面试流程 |
| 绩效考核制度 | 绩效考核 | 季度/年度考核评级标准 |
| 五险一金说明 | 薪酬福利 | 缴纳比例详解 |

进入「AI智能 → 知识库」管理页面可添加、编辑、删除知识条目。

---

## 四、功能使用指南

### 4.1 AI智能助手

**入口**: 侧边栏「AI智能 → AI助手」或右下角浮动按钮

**功能**:
- 📝 **自由对话**: 输入HR相关问题，AI即时回答
- 🔍 **知识库增强**: 开启后AI会搜索知识库作为回答依据
- 🎭 **模型切换**: 工具栏切换 DeepSeek V3 / R1 / GPT-4o Mini
- 🔧 **工具模式**: 选择搜索/分析/翻译/文档模式
- 📁 **对话管理**: 左侧面板查看/切换/删除历史对话

**快捷键**: Enter 发送，Shift+Enter 换行

### 4.2 知识库管理

**入口**: 「AI智能 → 知识库」

**功能**:
- 📚 **知识管理**: 添加/编辑/删除HR知识条目
- 🔍 **混合搜索**: 语义 + 关键词双重检索
- 🎯 **命中测试**: 测试查询能检索到哪些知识

**分类体系**:
| 分类 | 说明 |
|------|------|
| hr_policy | 人事制度 |
| salary | 薪酬福利 |
| attendance | 考勤管理 |
| recruitment | 招聘入职 |
| training | 培训发展 |
| performance | 绩效考核 |
| welfare | 员工关怀 |
| general | 通用知识 |

### 4.3 智能BI看板

**入口**: 「AI智能 → BI分析」

- 📊 **4个核心指标**：员工总数、出勤率、平均薪资、绩效达标率
- 📈 **3张图表**：考勤趋势（柱状图）、部门结构（饼图）、人员流动（折线图）
- 🤖 **AI洞察**：点击「AI分析」按钮获取智能解读

### 4.4 智能预警系统

**入口**: 「AI智能 → 智能预警」

**5类预警规则**:

| 规则 | 触发条件 |
|------|----------|
| 连续迟到预警 | 连续迟到≥3次 |
| 加班超时预警 | 月加班>36小时 |
| 合同到期提醒 | 到期<30天 |
| 绩效下滑预警 | 连续2月下降 |
| 培训完成率预警 | 完成率<70% |

---

## 五、API 参考

### AI 对话
```bash
# 普通对话
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"年假有几天？"}]}'

# 流式对话
curl -X POST http://localhost:3000/api/ai/stream-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"介绍薪酬体系"}]}'

# RAG增强对话
curl -X POST http://localhost:3000/api/ai/rag-chat \
  -H "Content-Type: application/json" \
  -d '{"query":"年假政策","messages":[]}'
```

### 知识库
```bash
# 搜索知识库
curl -X POST http://localhost:3000/api/ai/search-knowledge \
  -H "Content-Type: application/json" \
  -d '{"query":"加班规定"}'

# 命中测试
curl -X POST http://localhost:3000/api/ai/hit-testing \
  -H "Content-Type: application/json" \
  -d '{"query":"绩效考核","topK":5}'
```

---

## 六、常见问题

**Q: AI助手回复空白？**
A: 检查AI配置中API Key是否正确，点击「测试连接」验证。

**Q: 知识库搜索不准确？**
A: 进入知识库→命中测试页面，输入查询查看匹配度。适当增加知识条目或调整内容详细度。

**Q: Ollama连接失败？**
A: 确保 `ollama serve` 服务正在运行，地址为 `http://localhost:11434`。

**Q: 如何添加更多知识条目？**
A: 知识库管理页面点击「添加知识」，输入标题、分类和详细内容。
