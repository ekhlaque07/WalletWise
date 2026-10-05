const {
  chatCompletion,
} = require("../services/aiService");

const testHuggingFace = async (req, res) => {
  try {
    const response = await chatCompletion({
      system:
        "You are a helpful financial assistant for a personal finance application.",

      user:
        "Explain in one short sentence why tracking expenses is useful.",

      temperature: 0.2,
      maxTokens: 100,
    });

    res.status(200).json({
      success: true,
      provider: "Hugging Face",
      model: process.env.HF_MODEL,
      response,
    });
  } catch (error) {
    console.error(
      "Hugging Face Test Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  testHuggingFace,
};