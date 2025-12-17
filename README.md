
# Synthetic User Lab (合成用户实验室)

**基于真实数据驱动的多模态 AI 用户体验测试平台**

> **Project Vision:** 将传统的定性用户调研转化为可量化、即时反馈的 AI 仿真流程。利用 Google Gemini 的多模态能力与向量检索技术，构建拥有“真实记忆”的合成用户。

---

## 🚀 项目背景与价值 (The Frontier & Value)

在传统 UX 设计流程中，招募用户、安排访谈、整理反馈是一个昂贵且漫长的过程。**Synthetic User Lab** 旨在通过前沿的生成式 AI 技术解决这一痛点：

### 核心价值
1.  **基于事实的仿真 (Grounding in Reality):** 不同于凭空捏造的角色，本系统利用 **RAG (检索增强生成)** 技术，将成百上千条真实的用户评论（Review Data）转化为合成用户的“长期记忆”。他们不是在扮演用户，他们**拥有**用户的经历。
2.  **大五人格驱动 (Psychological Depth):** 集成 Big Five (OCEAN) 人格模型，不仅模拟用户的**说什么**，更模拟**怎么说**。从挑剔的细节控到宽容的乐天派，还原真实世界的用户多样性。
3.  **多模态交互 (Multimodal Feedback):** 支持上传 UI 设计图（Screenshot/Mockup）。合成用户能“看懂”界面，并结合自己的过往痛点提出具体的修改建议。
4.  **量化影响力模型 (Quantitative Impact):** 独创 `Impact Score` 算法，从情绪强度、角色契合度、群体共识和记忆共鸣四个维度，科学量化每一条反馈的价值。

---

## ✨ 核心功能

*   **⚡️ 动态画像生成:** 输入 App 名称与描述，系统自动通过向量匹配（Vector Matching）从海量评论中提取典型行为模式，构建 3 个典型的 User Persona。
*   **🧠 记忆植入 (Memory Injection):** 彻底清洗原始数据中的个人信息，将核心痛点转化为合成用户的第一人称记忆（"我朋友曾遇到..." / "我之前..."），拒绝 AI 腔调。
*   **💬 焦点小组仿真:** 模拟多用户群聊环境。用户之间会相互影响、附和或争论，还原真实的社群讨论氛围。
*   **📊 实时反思与评估:**
    *   **The Clerk (记录员):** 一个独立的 AI 代理，负责客观评分，不参与对话。
    *   **Reflection (反思机制):** 合成用户会定期进行自我反思，更新对产品的整体认知模型。

---

## 🛠️ 技术栈

*   **Frontend:** React 19, Tailwind CSS (极致响应式设计)
*   **AI Core:** Google Gemini 2.5 Flash (推理与生成), Text-Embedding-004 (向量嵌入)
*   **Architecture:** 纯前端架构，无需后端数据库，数据隐私更安全。

---

## 🚦 快速开始

### 1. 环境准备
你需要一个 Google Gemini API Key。
*   访问 [Google AI Studio](https://aistudiocdn.com) 获取 Key。
*   确保该 Key 有权限访问 `gemini-2.5-flash` 和 `text-embedding-004` 模型。

### 2. 安装与运行
本项目使用 ES Modules 和 CDN 导入，无需复杂的 `npm install` 构建过程（依赖已在 `index.html` 通过 importmap 定义）。

由于涉及 API Key 安全和本地文件读取，建议使用简单的 HTTP Server 运行：

```bash
# 如果你安装了 Python
python3 -m http.server 8000

# 或者使用 serve
npx serve .
```

然后在浏览器打开 `http://localhost:8000`。

> **注意:** 在实际代码运行前，你需要确保环境变量 `process.env.API_KEY` 可用，或者在代码初始化 `GoogleGenAI` 时填入你的 Key。

### 3. 数据准备 (可选)
系统默认内置了“航旅纵横”的测试数据。如果你想测试自己的 App，请准备一个 JSON 文件，格式如下：

```json
{
  "app_info": {
    "name": "你的App名称",
    "version": "1.0.0"
  },
  "reviews": [
    {
      "author": "用户A",
      "rating": 1,
      "content": "这里是用户的真实评论内容，越详细越好...",
      "date": "2024-01-01"
    },
    {
      "author": "用户B",
      "rating": 5,
      "content": "非常喜欢这个新功能！",
      "date": "2024-01-02"
    }
    // 建议至少提供 50+ 条评论以获得最佳效果
  ]
}
```

在设置页面点击 **"上传 JSON 评论数据"** 即可导入。

---

## 🧪 使用流程

1.  **Setup (设定):** 输入目标 App 信息，配置三个合成用户的大五人格（或使用默认预设）。调节“记忆深度”以决定每个用户承载多少历史数据。
2.  **Simulation (生成):** 点击生成，AI 将分析评论数据，进行向量聚类，并“唤醒”三个具有独立背景的合成用户。
3.  **Interaction (交互):**
    *   **上传设计图:** 发送你的 UI 截图。
    *   **提问:** "你们觉得这个新首页怎么样？"
    *   **观察:** 观看用户基于各自的“记忆”进行吐槽或点赞。
4.  **Analysis (分析):** 查看每条回复右下角的 `Impact Metrics`，识别高价值反馈。

---

## ⚠️ 免责声明

*   合成用户的行为基于概率模型和历史数据，不能完全替代真实的人类测试。
*   请勿上传包含真实用户隐私敏感信息（如手机号、身份证）的数据集。

---

**Built for the future of UX Research.**
