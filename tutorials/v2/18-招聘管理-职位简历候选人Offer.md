# 18-招聘管理：职位 / 简历 / 候选人 / Offer / 人才库

> 本文基于 **Sowork AI 企业智能ERP系统** v1.2.0 的真实源码撰写。环境约定：依赖安装 `npm install --legacy-peer-deps`，前端端口 `3000`，演示账号 `admin/admin123`。路由事实：系统**没有**按域前缀的 `/api/hr` 接口，招聘数据全部走 catch-all 路由 `/api/:table`。

## 学习目标

- 你能独立配置一个招聘职位，并跟踪它从发布到关闭的完整生命周期。
- 你理解简历、候选人、面试、Offer 之间的数据血缘，知道「一份简历如何挂到一名候选人身上」。
- 你掌握候选人状态机（`new → screening → interviewed → offered → hired / rejected`），能在代码里定位每个状态的落库位置。
- 你清楚人才库如何把「未被录用的优秀简历」沉淀复用，从而降低猎头费用。
- 你知道 Offer 通过后如何与第 13 篇的「员工主档」衔接，完成入职。

## 核心概念

招聘模块由 5 个互相咬合的子页组成，数据通过 7 张表承载：

| 子页 | 前端表名 | 后端 ALLOWED 注册 | 作用 |
|------|----------|-------------------|------|
| 职位管理 | `recruitment_positions` | `standalone.ts:1077` | 招聘需求与岗位发布 |
| 简历管理 | `resumes` | `standalone.ts:1077` | 简历收集与去重 |
| 候选人管理 | `candidates` | `standalone.ts:1077` | 候选人跟踪与状态机 |
| Offer 管理 | `offers` | `standalone.ts:1077` | Offer 发放与接受 |
| 人才库（招聘首页页签） | `talent_pools` + `talent_tags` | `standalone.ts:1077` / `:1107` | 人才沉淀与标签复用 |

此外面试排期落在 `interviews` 表（`standalone.ts:1077`），邮件触达落在 `email_templates` / `email_logs`（`standalone.ts:1107`）。

核心实体关系是一棵树：

```
recruitment_positions (1)
   └─ candidates (N)        ← 投递/推荐进入
        ├─ resumes (1:N)    ← candidateId 关联
        ├─ interviews (N)   ← candidateId 关联
        └─ offers (1:N)     ← candidateId + positionId
talent_pools (N)            ← candidates.talentPoolId 沉淀
   └─ talent_tags (N)       ← 标签分类(talent/blacklist)
```

## 界面布局与操作流程

左侧导航在 `Layout.tsx:91-97` 注册了 5 个入口（招聘首页 + 4 个管理页），人才库作为招聘首页内部页签存在：

```
招聘管理 /recruitment
 ├ 招聘首页    /recruitment          (含仪表盘 + 人才库页签)
 ├ 职位管理    /recruitment/position
 ├ 简历管理    /recruitment/resume
 ├ 候选人管理  /recruitment/candidate
 └ Offer管理   /recruitment/offer
```

标准操作流程（RFQ 到入职）：

1. **职位发布**：在「职位管理」新建岗位，状态 `open`（招聘中）/ `paused`（暂停）/ `closed`（已关闭），见 `PositionPage.tsx:16-20`。
2. **简历收集**：候选人在「简历管理」入库，`resumes.candidateId` 把简历挂到具体候选人（`ResumePage.tsx:24`）。
3. **候选人跟踪**：在「候选人管理」推进状态，并安排 `interviews` 面试。
4. **Offer 发放**：在「Offer 管理」指向某候选人+岗位，发送后状态变为 `sent`。
5. **人才库沉淀**：未录用但优秀的候选人写入 `talent_pools`，打 `talent_tags` 标签，下次招聘直接复用。

## 底层逻辑与数据模型

所有数据都经 catch-all 路由 `/api/:table` 读写，前端直接用表名拼接 URL。例如候选人列表请求：

```
GET /api/candidates?search=张三&status=interviewed
```

对应 `CandidatePage.tsx:84` 的 `fetch('/api/candidates?...')`。注意这里**没有** `/api/hr/candidates` 这种域前缀，表名本身就是路由段。

候选人 `candidates` 表的关键字段（`CandidatePage.tsx:37-64`）：

| 字段 | 含义 |
|------|------|
| `status` | 状态机当前值（字符串） |
| `source` | 来源渠道（智联/BOSS/内推/校招…） |
| `positionId` / `positionTitle` | 应聘岗位 |
| `resumeUrl` | 简历附件地址 |
| `talentPoolId` | 归属人才库（复用关键） |
| `blacklisted` | 黑名单标记（0/1） |
| `tags` | 标签，逗号分隔 JSON 串 |

职位 `recruitment_positions` 表（`PositionPage.tsx:35-50`）关注 `headcount`（编制）、`filledCount`（已补）、`priority`、`salaryRange`、`employmentType`。Offer `offers` 表（`OfferPage.tsx:27-33`）核心是 `candidateId` + `positionId` + `salary` + `status`。

## 源码剖析

候选人状态机不是靠某个状态机引擎驱动，而是把可选值定义在 `STATUS_OPTIONS` 常量里，落库时直接写 `candidates.status` 字符串（`CandidatePage.tsx:17-25`）：

```ts
// CandidatePage.tsx:17-25 状态枚举即界面+落库事实
const STATUS_OPTIONS = [
  { value: "new",        label: "新入库" },
  { value: "screening",  label: "筛选中" },
  { value: "interviewed",label: "面试中" },
  { value: "offered",    label: "已发Offer" },
  { value: "hired",      label: "已入职" },
  { value: "rejected",   label: "已淘汰" },
  { value: "blacklisted",label: "黑名单" },
];
```

面试安排与回写逻辑集中在 `RecruitmentPage.tsx`。面试官提交评价时，系统用 `apiSave` 把分数、反馈和状态分别写回 `interviews` 表（区间 `RecruitmentPage.tsx:2749-2755`）：

```ts
// RecruitmentPage.tsx:2751,2755 面试评价与状态回写
await apiSave('interviews', { score, feedback: evaluation }, id);
// ...
await apiSave('interviews', { status }, id);
```

招聘漏斗的转化率由状态值实时计算（`RecruitmentPage.tsx:2328-2329`），这也是管理者视图的数据来源：

```ts
// RecruitmentPage.tsx:2328-2329 漏斗转化率
{ stage: '面试→Offer', rate: round(interviewedOrHired / interviewCount * 100) },
{ stage: 'Offer→入职', rate: round(hired / offeredOrHired * 100) },
```

人才库复用则是把一条 `talent_pools` 记录「转回」候选人，状态初始化为 `new`（`RecruitmentPage.tsx:1500`）：

```ts
// RecruitmentPage.tsx:1500 人才→候选人的复用入口
source: viewTalent.source || '', status: 'new' as CandidateStatus,
```

## 原理剖析

候选人状态机的本质是「单一字段 + 约定枚举值」，没有工作流引擎强制流转，因此你在界面上可以手动把某人从 `new` 直接置为 `hired`。这带来灵活性，也带来风险——错改状态会污染漏斗统计。

简历与候选人是「一对多」关系：`resumes.candidateId` 把多份简历（如不同渠道投递）归并到同一人；而 `candidates.talentPoolId` 又反向把人沉淀进人才库，形成「简历→候选人→人才库」的单向沉淀链。Offer 则必须同时引用 `candidateId` 和 `positionId`，保证「发给谁、什么岗位、多少薪资」三者闭环。

发送 Offer 时（`OfferPage.tsx:143-146`）只是把 `offers.status` 改为 `sent` 并填 `sentAt`，并不自动改候选人状态；真正「入职」需要人工把候选人置为 `hired`，这一步正是衔接第 13 篇员工主档的关口——你应在入职环节把候选人数据同步建为 `employees` 记录。

## 管理者视角

🚀 招聘首页仪表盘（`RecruitmentPage.tsx:2264-2335`）直接给出招聘漏斗：已发布职位数、面试中人数、已发 Offer、已入职、各阶段转化率。你应每周看「Offer→入职」转化率——偏低往往说明薪资或面试体验有问题。

✅ 人才库复用是降本关键。把 `rejected` 但评分高的人打 `talent` 标签入库（`talent_tags.type='talent'`），下次同类岗位优先从库里捞，可显著减少猎聘渠道（`source='liepin'`）支出。

🔑 与第 13 篇员工主档的衔接：候选人 `hired` 后，应在员工模块建立主档，使合同、薪资、考勤（第 6/8/5 篇）自然衔接，避免「Offer 发了但系统里没有员工」的断点。

## 注意事项

⚠️ **隐私与权限**：候选人含手机号、邮箱、期望薪资等敏感字段，必须做权限控制，不能对任何角色放开 `candidates` 全表读。前端虽用 catch-all `/api/:table`，后端 `ALLOWED` 仅控制「哪些表可访问」，业务权限需另行校验。

🔑 **简历去重**：同一人可能从 BOSS、智联多通道投递，靠 `resumes.candidateId` + 手机号/邮箱做去重，避免漏斗被重复简历虚高。新建简历时先查重再入库。

✅ **Offer 审批流**：当前 `offers` 仅有 `pending/sent/accepted` 等状态，未内置多级审批。若需 HRBP、部门负责人、总经理逐级审批，可接入第 21 篇「审批 / workflow」模块，把 Offer 发放前置为审批节点，审批通过后再执行 `status='sent'`。

⚠️ **状态一致性**：`CandidatePage` 渲染用 `interviewed/offered`，而 `RecruitmentPage` 内部类型联合用 `interview/offer`，统计与漏斗均依赖实际落库字符串。自定义开发时请以数据库真实值为准，不要混用两套命名。

## 小结与练习

你已掌握：5 个子页的职责、7 张表的关系、候选人状态机落库位置、面试回写与漏斗计算源码、人才库复用与入职衔接。

练习：
1. 新建一个 `open` 状态职位，再建一名 `source='referral'` 的候选人并关联到该职位。
2. 为该候选人添加一份简历（`resumes.candidateId` 关联），安排一次 `interviews` 并记录 `score`。
3. 在 Offer 管理发放 Offer（`offers.status` 置 `sent`），然后把候选人改为 `hired`，观察首页漏斗「Offer→入职」转化率变化。
4. 将一名 `rejected` 候选人写入 `talent_pools` 并打 `talent` 标签，体验「人才→候选人」复用入口。

> **系列导航**：[上一篇：17-绩效管理](./17-绩效管理-KPI周期记录等级.md) ｜ [下一篇：19-后勤管理](./19-后勤管理-宿舍食堂车辆访客.md) ｜ [大纲](../教程系列写作大纲V2.md)
