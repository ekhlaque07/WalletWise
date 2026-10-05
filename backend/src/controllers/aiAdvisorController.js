const { chatCompletion } = require("../services/aiService");

const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

const getAIAdvice = async (req, res) => {
  try {
    const userId = req.userId;

    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    const [transactions, budgets, goals] = await Promise.all([
      Transaction.find({
        user: userId,
      })
        .sort({ date: -1 })
        .limit(100)
        .lean(),

      Budget.find({
        user: userId,
      })
        .sort({ startDate: -1 })
        .lean(),

      Goal.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const financialData = {
      transactions,
      budgets,
      goals,
    };

    const systemPrompt = `
You are WalletWise AI, a friendly personal finance advisor.

Your job is to answer the user's financial questions naturally,
clearly, and concisely using their WalletWise financial data.

IMPORTANT RESPONSE STYLE:

1. Do NOT use Markdown tables.
2. Do NOT create large reports.
3. Do NOT repeat all available financial data.
4. Do NOT use overly formal language.
5. Talk directly to the user.
6. Keep responses easy to scan.
7. Use short paragraphs and bullet points when useful.
8. Highlight important numbers using simple Markdown bold.
9. Use ₹ for Indian currency.
10. Give practical recommendations.
11. If the user asks about spending, identify the most important patterns.
12. If a budget is exceeded, clearly mention it.
13. If spending is healthy, mention that too.
14. Don't overwhelm the user with unnecessary information.
15. Never invent financial information.
16. If there isn't enough data, clearly say so.

RECOMMENDED RESPONSE STRUCTURE:

Start with one short natural summary.

Then, if useful:

**What I noticed**
- Important observation
- Important observation

**What you can do**
- Actionable suggestion
- Actionable suggestion

End with one short helpful sentence.

The response should feel like a smart financial assistant
talking to the user, not like a financial report.
`;

    const userPrompt = `
USER QUESTION:

${question}

WALLETWISE FINANCIAL DATA:

${JSON.stringify(financialData, null, 2)}

Answer the user's question naturally.

Focus only on information relevant to the question.
Do not create a table.
Do not provide an unnecessary monthly report.

Keep the answer concise, useful, and personalized.
`;

    const response = await chatCompletion({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.3,
      maxTokens: 1200,
    });

    return res.status(200).json({
      success: true,
      provider: "Hugging Face",
      answer: response,
    });
  } catch (error) {
    console.error("AI Advisor Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI advice.",
    });
  }
};

module.exports = {
  getAIAdvice,
};
