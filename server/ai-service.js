/**
 * 飞达智能HR系统 - AI服务模块 v3.0
 * 
 * 核心变更:
 * - 数据库驱动的模型配置（支持无限自定义模型）
 * - 递归文本分割器 (RecursiveCharacterTextSplitter)
 * - 混合搜索 (Hybrid Search) + 重排序
 * - 流式输出 (SSE Streaming)
 * - 智能体工具系统
 * - 对话历史管理
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');

// ============================================================
// 数据库引用
// ============================================================

let _db = null;
function setDb(db) { _db = db; }
function getDb() {
  if (!_db) throw new Error('AI服务未初始化数据库');
  return _db;
}

// ============================================================
// 运行时配置
// ============================================================

const runtimeConfig = {
  temperature: 0.7,
  maxTokens: 2048,
  streamTimeout: 120000,
  retrieval: {
    topK: 5, scoreThreshold: 0.1, rerankEnabled: true,
    searchMode: 'hybrid', hybridWeight: { semantic: 0.6, keyword: 0.4 },
    chunkSize: 800, chunkOverlap: 150,
  },
  systemPrompt: `你是飞达智能HR系统的AI助手。请用中文简洁准确回答。`,
};

function getRuntimeConfig() { return JSON.parse(JSON.stringify(runtimeConfig)); }
function updateRuntimeConfig(updates) {
  if (updates.retrieval) { Object.assign(runtimeConfig.retrieval, updates.retrieval); delete updates.retrieval; }
  Object.assign(runtimeConfig, updates);
}

// ============================================================
// 模型配置管理 (数据库驱动)
// ============================================================

function listModelConfigs() {
  try { return getDb().query("SELECT * FROM ai_model_configs ORDER BY is_active DESC, created_at ASC"); }
  catch { return []; }
}

function getActiveModelConfig() {
  try {
    // 优先使用默认模型，否则第一个活跃模型
    let models = getDb().query("SELECT * FROM ai_model_configs WHERE is_active=1 AND is_default=1 LIMIT 1");
    if (models.length === 0) {
      models = getDb().query("SELECT * FROM ai_model_configs WHERE is_active=1 ORDER BY created_at ASC LIMIT 1");
    }
    if (models.length > 0) {
      const m = models[0];
      return { baseURL: m.base_url, apiKey: m.api_key || '', model: m.model, providerType: m.provider_type || 'openai' };
    }
  } catch {}
  return { baseURL: 'https://api.deepseek.com', apiKey: '', model: 'deepseek-chat', providerType: 'openai' };
}

function getModelConfigById(id) {
  try {
    const models = getDb().query("SELECT * FROM ai_model_configs WHERE id=?", [id]);
    if (models.length > 0) {
      const m = models[0];
      return { baseURL: m.base_url, apiKey: m.api_key || '', model: m.model, providerType: m.provider_type || 'openai' };
    }
  } catch {}
  return null;
}

/** 获取用于LLM调用的模型配置 - 支持按ID切换 */
function resolveModelConfig(options = {}) {
  if (options.modelId) {
    const cfg = getModelConfigById(options.modelId);
    if (cfg) return cfg;
  }
  return getActiveModelConfig();
}

function getAiConfig() {
  const model = getActiveModelConfig();
  return {
    provider: model.providerType === 'ollama' ? 'ollama' : 'openai',
    baseURL: model.baseURL, apiKey: model.apiKey, model: model.model,
    ollamaURL: model.providerType === 'ollama' ? model.baseURL : 'http://localhost:11434',
    ollamaModel: model.providerType === 'ollama' ? model.model : 'deepseek-r1:8b',
    ...getRuntimeConfig(),
  };
}

function updateAiConfig(updates) { updateRuntimeConfig(updates); return getAiConfig(); }

// ============================================================
// LLM 调用
// ============================================================

async function chatCompletion(messages, options = {}) {
  const model = resolveModelConfig(options);
  const config = { ...model, ...getRuntimeConfig(), ...options };

  if (config.providerType === 'ollama') {
    const body = JSON.stringify({
      model: config.model, messages,
      options: { temperature: config.temperature, num_predict: config.maxTokens },
      stream: false,
    });
    const resp = await httpPost(config.baseURL + '/api/chat', body, {}, 600000);
    const data = JSON.parse(resp);
    if (data.error) throw new Error(data.error);
    return { content: data.message?.content || '', model: data.model };
  }

  // OpenAI 兼容 API
  const body = JSON.stringify({
    model: config.model, messages,
    temperature: config.temperature, max_tokens: config.maxTokens,
    stream: false,
  });

  const resp = await httpPost(config.baseURL + '/v1/chat/completions', body, {
    'Authorization': `Bearer ${config.apiKey}`,
  });
  const data = JSON.parse(resp);
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return {
    content: data.choices?.[0]?.message?.content || '',
    model: data.model,
    usage: data.usage,
  };
}

async function chatCompletionStreamFull(messages, options = {}) {
  const model = resolveModelConfig(options);
  const config = { ...model, ...getRuntimeConfig(), ...options };
  const isOllama = config.providerType === 'ollama';
  const onToken = options.onToken || (() => {});

  const body = JSON.stringify({
    model: config.model, messages,
    temperature: config.temperature, max_tokens: config.maxTokens,
    stream: true,
    ...(options.tools ? { tools: options.tools, tool_choice: options.tool_choice || 'auto' } : {}),
    ...(isOllama ? { options: { temperature: config.temperature, num_predict: config.maxTokens } } : {}),
  });

  const endpoint = isOllama ? config.baseURL + '/api/chat' : config.baseURL + '/v1/chat/completions';
  const authHeaders = isOllama ? {} : { 'Authorization': `Bearer ${config.apiKey}` };

  return new Promise((resolve, reject) => {
    const urlObj = new URL(endpoint);
    const client = urlObj.protocol === 'https:' ? https : http;
    const timeout = isOllama ? 600000 : 120000;
    const req = client.request({
      hostname: urlObj.hostname, port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...authHeaders },
      timeout,
    }, (res) => {
      if (res.statusCode >= 400) { let d = ''; res.on('data', c => d += c); res.on('end', () => reject(new Error(d.substring(0, 300)))); return; }
      let fullContent = '', buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n'); buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
            if (line.startsWith('data: ')) {
              // OpenAI SSE 格式
              const j = line.slice(6).trim(); if (j === '[DONE]') continue;
              try { const p = JSON.parse(j); const c = p.choices?.[0]?.delta?.content || ''; if (c) { fullContent += c; onToken(c); } } catch {}
            } else {
              // Ollama JSON 行格式 ({"message":{"content":"..."},"done":false})
              try { const p = JSON.parse(line); const c = p.message?.content || ''; if (c) { fullContent += c; onToken(c); } } catch {}
            }
        }
      });
      res.on('end', () => { resolve({ content: fullContent, model: config.model }); });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('stream timeout')); });
    req.write(body); req.end();
  });
}

// ============================================================
// HTTP 工具
// ============================================================

function httpPost(url, body, headers = {}, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    const opts = {
      hostname: urlObj.hostname, port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers },
      timeout: timeoutMs,
    };
    const req = client.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${d.substring(0, 300)}`)); else resolve(d); });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body); req.end();
  });
}

// ============================================================
// 递归文本分割器
// ============================================================

function recursiveSplitText(text, chunkSize = 800, chunkOverlap = 150) {
  const separators = ['\n\n', '\n', '。', '！', '？', '；', '. ', '! ', '? ', '; ', '，', ', ', ' ', ''];
  function split(t, seps) {
    if (t.length <= chunkSize) return [t];
    const [sep, ...rest] = seps;
    const splits = t.split(sep).filter(s => s.trim());
    if (splits.length <= 1) return rest.length > 0 ? split(t, rest) : forceChunk(t, chunkSize);
    const chunks = []; let cur = '';
    for (const s of splits) {
      if (cur.length + s.length + 1 <= chunkSize) cur += (cur ? sep : '') + s;
      else {
        if (cur) chunks.push(cur);
        cur = s.length > chunkSize && rest.length > 0 ? (chunks.push(...split(s, rest)), '') : s;
      }
    }
    if (cur) chunks.push(cur);
    return chunkOverlap > 0 && chunks.length > 1 ? addOverlap(chunks, chunkOverlap, chunkSize) : chunks;
  }
  function forceChunk(t, size) { const r = []; for (let i = 0; i < t.length; i += size) r.push(t.slice(i, i + size)); return r; }
  function addOverlap(chunks, overlap, maxSize) {
    const r = [chunks[0]];
    for (let i = 1; i < chunks.length; i++) {
      const prev = r[r.length - 1], ov = prev.slice(-overlap);
      (ov + '\n...\n' + chunks[i]).length <= maxSize ? r[r.length - 1] = ov + chunks[i] : r.push(chunks[i]);
    }
    return r;
  }
  return split(text, separators).filter(c => c.trim().length > 10);
}

function chunkText(text, size) { return recursiveSplitText(text, size); }

// ============================================================
// 关键词 + 语义混合搜索
// ============================================================

const STOP = new Set('的了是在我有人都不一个上也很到说要你会有自己这他那所为所以因为但'.split(''));
function tokenizeChinese(text) {
  const words = text.replace(/[^\u4e00-\u9fff\w]/g, ' ').split(/\s+/).filter(w => w.length >= 1);
  const tokens = [];
  for (const w of words) {
    if (w.length === 1) { if (/[\u4e00-\u9fff]/.test(w) && !STOP.has(w)) tokens.push(w); }
    else tokens.push(w);
  }
  return [...new Set(tokens)];
}

function cosineSimilarity(a, b) {
  const tf = (t) => {
    const words = t.toLowerCase().split(/[\s,，。！？、；：""''（）\(\)\n]+/).filter(w => w.length > 1);
    const m = {}; words.forEach(w => { m[w] = (m[w] || 0) + 1; });
    const n = words.length || 1; Object.keys(m).forEach(k => m[k] /= n);
    return m;
  };
  const tA = tf(a), tB = tf(b), all = new Set([...Object.keys(tA), ...Object.keys(tB)]);
  let dot = 0, nA = 0, nB = 0;
  all.forEach(w => { const va = tA[w] || 0, vb = tB[w] || 0; dot += va * vb; nA += va * va; nB += vb * vb; });
  return (nA === 0 || nB === 0) ? 0 : dot / (Math.sqrt(nA) * Math.sqrt(nB));
}

function keywordScore(qTokens, docTokens) {
  if (!qTokens.length || !docTokens.length) return 0;
  let m = 0; for (const t of qTokens) { if (docTokens.includes(t)) m++; }
  return (m / qTokens.length) * 0.7 + (m / docTokens.length) * 0.3;
}

function hybridSearch(query, items, config = runtimeConfig.retrieval) {
  const qTokens = tokenizeChinese(query);
  const results = items.map(item => {
    const sem = cosineSimilarity(query, item.title || '') * 0.6 + cosineSimilarity(query, item.content || '') * 0.4;
    const kw = keywordScore(qTokens, tokenizeChinese((item.title || '') + ' ' + (item.content || '')));
    const w = config.hybridWeight || { semantic: 0.6, keyword: 0.4 };
    const score = config.searchMode === 'keyword' ? kw : config.searchMode === 'semantic' ? sem : sem * w.semantic + kw * w.keyword;
    return { ...item, score, semanticScore: sem, keywordScore: kw };
  });
  return results.filter(r => r.score > (config.scoreThreshold || 0.05)).sort((a, b) => b.score - a.score).slice(0, config.topK || 5);
}

function searchKnowledge(query, items, topK) {
  return hybridSearch(query, items, { ...runtimeConfig.retrieval, topK: topK || 5 });
}

function rerankResults(query, results, threshold = 0.1, topN = 5) {
  return results.map(r => ({
    ...r, score: Math.min(1, r.score + (r.title || '').includes(query) ? 0.2 : 0 + (r.content || '').includes(query) ? 0.1 : 0)
  })).filter(r => r.score >= threshold).sort((a, b) => b.score - a.score).slice(0, topN);
}

function hitTesting(query, items, topK = 10) {
  const results = hybridSearch(query, items, { ...runtimeConfig.retrieval, topK });
  return (runtimeConfig.retrieval.rerankEnabled ? rerankResults(query, results, runtimeConfig.retrieval.scoreThreshold, topK) : results)
    .map(r => ({ ...r, scorePercent: Math.round(r.score * 100) }));
}

function buildRagContext(query, items, topK) {
  const rel = searchKnowledge(query, items, topK || 3);
  if (!rel.length) return '';
  return '\n\n【相关知识库】：\n' + rel.map((r, i) => `[${i + 1}] ${r.title} (${Math.round(r.score * 100)}%)\n${(r.content || '').substring(0, 500)}`).join('\n\n') + '\n';
}

function searchByCategory(items, cat) { return items.filter(i => i.category === cat); }

// ============================================================
// 嵌入缓存
// ============================================================

const embCache = new Map();
function hashText(t) { return crypto.createHash('md5').update(t).digest('hex'); }
function getCachedEmbedding(t) { return embCache.get(hashText(t)) || null; }
function setCachedEmbedding(t, e) {
  embCache.set(hashText(t), { embedding: e, ts: Date.now() });
  if (embCache.size > 10000) [...embCache.entries()].sort((a, b) => a[1].ts - b[1].ts).slice(0, 1000).forEach(([k]) => embCache.delete(k));
}

// ============================================================
// 对话历史
// ============================================================

const convs = new Map();
function createConversation(title = '新对话') {
  const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const c = { id, title, messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  convs.set(id, c); return c;
}
function getConversation(id) { return convs.get(id) || null; }
function listConversations() {
  return [...convs.values()].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(c => ({ id: c.id, title: c.title, messageCount: c.messages.length, createdAt: c.createdAt, updatedAt: c.updatedAt }));
}
function addMessage(cid, role, content) {
  const c = convs.get(cid); if (!c) return null;
  const m = { id: 'msg_' + Date.now(), role, content, timestamp: new Date().toISOString() };
  c.messages.push(m); c.updatedAt = new Date().toISOString();
  if (c.title === '新对话' && role === 'user') c.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
  return m;
}
function deleteConversation(id) { return convs.delete(id); }

// ============================================================
// 智能体工具
// ============================================================

const tools = {
  search_knowledge: { name: '搜索知识库', desc: '检索HR知识库', exec: async (p) => ({ result: `已搜索知识库: ${p.query}` }) },
  analyze_data: { name: '数据分析', desc: '分析HR数据', exec: async (p) => ({ result: `分析${p.dataType || 'HR'}数据` }) },
  translate: { name: '翻译', desc: '多语言翻译', exec: async (p) => ({ result: (await translateText(p.text, p.targetLang)).translation || '' }) },
  extract_doc: { name: '文档提取', desc: '提取文档信息', exec: async (p) => ({ result: (await extractDocumentInfo(p.text, p.docType || 'general')).extractedInfo || '' }) },
};
function listAgentTools() { return Object.entries(tools).map(([k, v]) => ({ key: k, name: v.name, description: v.desc })); }
async function executeAgentTool(key, params) {
  const t = tools[key]; if (!t) return { success: false, error: `tool ${key} not found` };
  try { const r = await t.exec(params); return { success: true, toolKey: key, result: r.result, toolName: t.name }; }
  catch (e) { return { success: false, error: e.message }; }
}

async function runAgent(query, history) {
  const toolList = listAgentTools().map(t => `- ${t.key}: ${t.name}`).join('\n');
  try {
    const sel = await chatCompletion([
      { role: 'system', content: '选择最合适的工具，只返回工具key。可用工具：\n' + toolList + '\ngeneric_chat: 普通对话' },
      { role: 'user', content: query },
    ], { temperature: 0.1, maxTokens: 20 });
    const key = (sel.content || '').trim();
    if (key === 'generic_chat' || !tools[key]) {
      const r = await chatCompletion([{ role: 'system', content: getRuntimeConfig().systemPrompt }, ...(history || []), { role: 'user', content: query }]);
      return { success: true, mode: 'chat', content: r.content };
    }
    const tr = await executeAgentTool(key, { query });
    if (tr.success) {
      const er = await chatCompletion([{ role: 'system', content: `工具[${tools[key].name}]结果: ${JSON.stringify(tr.result)}\n用自然语言回复。` }, { role: 'user', content: query }]);
      return { success: true, mode: 'agent', toolUsed: key, content: er.content };
    }
    return { success: false, error: tr.error };
  } catch (e) { return { success: false, error: e.message }; }
}

// ============================================================
// HR 分析 + 翻译 + 文档
// ============================================================

async function analyzeHRData(dataType, data, opts = {}) {
  const prompts = {
    attendance: '分析考勤数据，给出3-5条关键发现和改进建议。',
    salary: '分析薪酬数据，从结构、成本、变化角度给出3-5条发现。',
    recruitment: '分析招聘数据，从效率、渠道、质量角度给出优化建议。',
    performance: '分析绩效数据，从分布、特征、改进方向给出建议。',
    general: '分析HR数据，给出3-5条有价值的发现。',
  };
  try {
    const r = await chatCompletion([
      { role: 'system', content: `${getRuntimeConfig().systemPrompt}\n你是HR数据分析专家。${data.instructions || ''}` },
      { role: 'user', content: `${prompts[dataType] || prompts.general}\n数据: ${JSON.stringify(data)}` },
    ], opts);
    return { success: true, analysis: r.content, dataType };
  } catch (e) { return { success: false, error: e.message }; }
}

async function analyzeResume(text) {
  try {
    const r = await chatCompletion([
      { role: 'system', content: '你是招聘专家。提取姓名/工作年限/核心技能/教育背景/工作经历/适合岗位。' },
      { role: 'user', content: `分析简历:\n${text.substring(0, 4000)}` },
    ]);
    return { success: true, analysis: r.content };
  } catch (e) { return { success: false, error: e.message }; }
}

async function translateText(text, targetLang, sourceLang = 'auto') {
  const names = { en: '英语', zh: '中文', ja: '日语', vi: '越南语', km: '柬埔寨语', ko: '韩语', fr: '法语', es: '西班牙语' };
  try {
    const r = await chatCompletion([
      { role: 'system', content: `翻译为${names[targetLang] || targetLang}，只输出翻译结果。` },
      { role: 'user', content: text },
    ], { temperature: 0.1 });
    return { success: true, translation: r.content, sourceLang, targetLang };
  } catch (e) { return { success: false, error: e.message }; }
}

async function extractDocumentInfo(text, docType = 'general') {
  const prompts = {
    contract: '从劳动合同提取：合同编号/甲方/乙方/类型/起止日期/试用期/薪资/岗位/工时制度。',
    policy: '从制度文件提取：名称/适用范围/核心规则(5-10条)/执行要求。',
    general: '提取关键信息(5-10条核心要点)。',
  };
  try {
    const r = await chatCompletion([
      { role: 'system', content: prompts[docType] || prompts.general },
      { role: 'user', content: text.substring(0, 5000) },
    ]);
    return { success: true, extractedInfo: r.content, docType };
  } catch (e) { return { success: false, error: e.message }; }
}

// ============================================================
// 导出
// ============================================================
// 代码助手 Agent（可读写文件、执行命令、操作数据库）
// ============================================================
let codeAgentTools = null;
function getCodeAgentTools() {
  if (!codeAgentTools) {
    try { codeAgentTools = require('./code-agent-tools.js'); } catch { /* not found */ }
  }
  return codeAgentTools;
}

async function runCodeAgent(messages, options = {}) {
  const tools = getCodeAgentTools();
  if (!tools) return { error: '代码助手工具集未加载' };
  
  const maxIterations = options.maxIterations || 15;
  const allMessages = [...messages];
  let finalContent = '';
  const steps = [];
  const cfg = resolveModelConfig(options.model);
  const isOllama = cfg.providerType === 'ollama';
  
  // Ollama 用标签格式嵌入工具调用（用户看到的是自然语言）
  const ollamaToolGuide = isOllama ? `\n\n你可以调用以下工具。在自然语言回复中嵌入工具标签（标签对用户不可见）：
[TOOL:sql_query]{"sql":"SELECT name FROM sqlite_master WHERE type='table'","confirm":true}[/TOOL]
[TOOL:grep]{"pattern":"关键词"}[/TOOL]
[TOOL:read_file]{"file_path":"路径"}[/TOOL]
[TOOL:glob]{"pattern":"模式"}[/TOOL]
[TOOL:bash]{"command":"命令"}[/TOOL]
SQLite 提示：查表名用 SELECT name FROM sqlite_master，不要用 SHOW TABLES 或 PRAGMA table_info(*)。` : '';
  
  for (let i = 0; i < maxIterations; i++) {
    const toolHint = `你是一个飞达HR系统的技术助手，数据库是 SQLite (data/ehr.db)。
请用自然语言回答用户问题。需要查询数据、搜索代码、执行命令时，在自然语言中嵌入工具标签。
SQLite: 查表名=SELECT name FROM sqlite_master WHERE type='table', 查结构=PRAGMA table_info('表名')
如果工具返回错误，分析原因后用正确方法重试。` + ollamaToolGuide;
    
    const reqBody = {
      model: cfg ? cfg.model : 'deepseek-chat',
      messages: [
        { role: 'system', content: (allMessages[0]?.content || '') + '\n\n' + toolHint },
        ...allMessages.slice(1)
      ],
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature !== undefined ? options.temperature : 0.3,
    };
    // 仅 OpenAI 兼容模型传 tools 参数
    if (!isOllama) {
      reqBody.tools = tools.TOOL_DEFINITIONS;
      reqBody.tool_choice = 'auto';
    }
    
    const response = await chatCompletionDirect(reqBody, cfg);
    
    // 统一响应格式：OpenAI 是 choices[0].message，Ollama 是 message
    let msg = null;
    if (response.choices && response.choices.length > 0) {
      msg = response.choices[0].message; // OpenAI 格式
    } else if (response.message) {
      msg = response.message; // Ollama 格式
    }
    
    if (!msg) { finalContent = 'AI 无响应'; break; }
    
    // OpenAI 标准 tool_calls
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      allMessages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });
      for (const tc of msg.tool_calls) {
        const fnName = tc.function.name;
        let fnParams = {};
        try { fnParams = JSON.parse(tc.function.arguments); } catch { /* ignore */ }
        const toolResult = tools.execute(fnName, fnParams);
        steps.push({ tool: fnName, params: fnParams, result: toolResult });
        allMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(toolResult, null, 2).slice(0, 4000) });
      }
      continue;
    }
    
    // Ollama 标签格式工具调用解析: [TOOL:name]{"params"}[/TOOL]
    if (isOllama && msg.content) {
      const content = msg.content;
      const toolRegex = /\[TOOL:(\w+)\]([\s\S]*?)\[\/TOOL\]/g;
      let match;
      const toolCalls = [];
      while ((match = toolRegex.exec(content)) !== null) {
        const fnName = match[1];
        let fnParams = {};
        try { fnParams = JSON.parse(match[2].trim()); } catch { /* ignore */ }
        toolCalls.push({ name: fnName, params: fnParams });
      }
      if (toolCalls.length > 0) {
        // 移除标签，保留自然语言部分
        const cleanContent = content.replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
        allMessages.push({ role: 'assistant', content: cleanContent || `执行 ${toolCalls.map(t=>t.name).join(', ')}` });
        for (const tc of toolCalls) {
          const toolResult = tools.execute(tc.name, tc.params);
          steps.push({ tool: tc.name, params: tc.params, result: toolResult });
          allMessages.push({ role: 'user', content: `工具 ${tc.name} 执行结果：\n${JSON.stringify(toolResult, null, 2).slice(0, 4000)}` });
        }
        continue;
      }
    }
    
    // 移除标签后的纯文本作为最终回复
    finalContent = (msg.content || '').replace(/\[TOOL:\w+\][\s\S]*?\[\/TOOL\]/g, '').trim();
    break;
  }
  
  return { content: finalContent || '达到最大执行次数，请简化你的请求。', steps, iterations: steps.length };
}

// 直接调用 LLM（支持 tools/function calling，兼容 OpenAI 和 Ollama）
async function chatCompletionDirect(reqBody, cfg) {
  if (!cfg) cfg = resolveModelConfig({});
  const isOllama = cfg.providerType === 'ollama';
  
  return new Promise((resolve, reject) => {
    const http = require('http');
    const https = require('https');
    
    let endpoint, postBody, authHeaders;
    const timeout = isOllama ? 600000 : 120000;
    
    if (isOllama) {
      endpoint = (cfg.baseURL || cfg.base_url || 'http://localhost:11434') + '/api/chat';
      postBody = JSON.stringify({
        model: cfg.model, messages: reqBody.messages,
        tools: reqBody.tools || [],
        options: { temperature: reqBody.temperature || 0.3, num_predict: reqBody.max_tokens || 4096 },
        stream: false,
      });
      authHeaders = {};
    } else {
      let base = (cfg.baseURL || cfg.base_url || 'https://api.deepseek.com').replace(/\/+$/, '');
      // 如果 baseURL 已包含 /v1，不再重复添加
      if (base.endsWith('/v1')) {
        endpoint = base + '/chat/completions';
      } else {
        endpoint = base + '/v1/chat/completions';
      }
      postBody = JSON.stringify({
        model: cfg.model, messages: reqBody.messages,
        tools: reqBody.tools, tool_choice: reqBody.tool_choice || 'auto',
        temperature: reqBody.temperature || 0.3, max_tokens: reqBody.max_tokens || 4096,
        stream: false,
      });
      authHeaders = { 'Authorization': `Bearer ${cfg.apiKey || cfg.api_key || ''}` };
    }
    
    const url = new URL(endpoint);
    const transport = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postBody), ...authHeaders },
      timeout,
    };
    
    const req = transport.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error('JSON解析失败: ' + body.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(isOllama ? 'Ollama模型加载超时（10分钟），请确认模型已下载并可用' : '请求超时')); });
    req.write(postBody);
    req.end();
  });
}

async function getCodeAgentToolsDefs() {
  const tools = getCodeAgentTools();
  return tools ? tools.TOOL_DEFINITIONS.slice(0, 7).map(t => ({
    name: t.function.name,
    description: t.function.description
  })) : [];
}

// ============================================================

module.exports = {
  setDb, getDb, listModelConfigs, getActiveModelConfig, getModelConfigById, resolveModelConfig,
  getAiConfig, updateAiConfig, getRuntimeConfig, updateRuntimeConfig,
  chatCompletion, chatCompletionStreamFull,
  recursiveSplitText, chunkText,
  hybridSearch, searchKnowledge, rerankResults, hitTesting, buildRagContext, searchByCategory,
  tokenizeChinese, cosineSimilarity, keywordScore,
  getCachedEmbedding, setCachedEmbedding,
  createConversation, getConversation, listConversations, addMessage, deleteConversation,
  listAgentTools, executeAgentTool, runAgent,
  analyzeHRData, analyzeResume, translateText, extractDocumentInfo,
  runCodeAgent, getCodeAgentToolsDefs, chatCompletionDirect,
};
