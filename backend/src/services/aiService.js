
const HF_TOKEN = process.env.HF_TOKEN;

const HF_MODEL =
  process.env.HF_MODEL ||
  "openai/gpt-oss-120b:fastest";

const HF_URL =
  "https://router.huggingface.co/v1/chat/completions";


/*
|--------------------------------------------------------------------------
| Chat Completion
|--------------------------------------------------------------------------
*/

const chatCompletion = async ({
  system = "",
  user = "",
  temperature = 0.3,
  maxTokens = 2000,
}) => {
  if (!HF_TOKEN) {
    throw new Error(
      "HF_TOKEN is missing in environment variables."
    );
  }

  const response = await fetch(HF_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HF_TOKEN}`,
    },

    body: JSON.stringify({
      model: HF_MODEL,

      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],

      temperature,

      /*
       * Give the model enough room to finish
       * its reasoning AND JSON response.
       */
      max_tokens: maxTokens,
    }),
  });

  const rawText = await response.text();

  console.log(
    "Hugging Face status:",
    response.status
  );

  if (!response.ok) {
    console.error(
      "Hugging Face error:",
      rawText
    );

    let errorData;

    try {
      errorData = JSON.parse(rawText);
    } catch {
      errorData = null;
    }

    throw new Error(
      errorData?.error?.message ||
        errorData?.error ||
        rawText ||
        `Hugging Face request failed with status ${response.status}`
    );
  }

  if (!rawText.trim()) {
    throw new Error(
      "Hugging Face returned an empty HTTP response."
    );
  }

  let data;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(
      "Hugging Face returned invalid JSON."
    );
  }

  console.log(
    "Hugging Face finish reason:",
    data?.choices?.[0]?.finish_reason
  );

  console.log(
    "Hugging Face usage:",
    data?.usage
  );

  /*
  |--------------------------------------------------------------------------
  | Extract content
  |--------------------------------------------------------------------------
  */

  let content =
    data?.choices?.[0]?.message?.content;

  /*
   * Some models may return content as an array.
   */
  if (Array.isArray(content)) {
    content = content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.text ||
          item?.content ||
          ""
        );
      })
      .join("");
  }

  /*
   * Other possible response formats.
   */
  if (
    !content &&
    typeof data?.choices?.[0]?.text ===
      "string"
  ) {
    content =
      data.choices[0].text;
  }

  if (
    !content &&
    typeof data?.output_text ===
      "string"
  ) {
    content = data.output_text;
  }

  if (
    !content &&
    typeof data?.response ===
      "string"
  ) {
    content = data.response;
  }

  if (
    !content &&
    typeof data?.content ===
      "string"
  ) {
    content = data.content;
  }

  /*
  |--------------------------------------------------------------------------
  | Important: model stopped because of token limit
  |--------------------------------------------------------------------------
  */

  if (
    !content &&
    data?.choices?.[0]?.finish_reason ===
      "length"
  ) {
    throw new Error(
      "Hugging Face model reached the token limit before generating its final answer. Increase max_tokens or reduce the reasoning/data sent to the model."
    );
  }

  if (!content || !content.trim()) {
    console.error(
      "Unexpected Hugging Face response:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    throw new Error(
      "Hugging Face returned an empty response."
    );
  }

  return content.trim();
};


/*
|--------------------------------------------------------------------------
| JSON Completion
|--------------------------------------------------------------------------
*/

const chatJSON = async ({
  system = "",
  user = "",
  temperature = 0.2,
  maxTokens = 2000,
}) => {
  const response =
    await chatCompletion({
      system,
      user,
      temperature,
      maxTokens,
    });

  let cleaned =
    response
      .trim()
      .replace(
        /^```json\s*/i,
        ""
      )
      .replace(
        /^```\s*/i,
        ""
      )
      .replace(
        /\s*```$/i,
        ""
      )
      .trim();

  /*
   * Direct JSON
   */
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue below.
  }

  /*
   * Extract JSON object if model
   * added some extra text.
   */
  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  if (
    start !== -1 &&
    end !== -1 &&
    end > start
  ) {
    const jsonText =
      cleaned.slice(
        start,
        end + 1
      );

    try {
      return JSON.parse(
        jsonText
      );
    } catch {
      console.error(
        "Invalid JSON returned by Hugging Face:"
      );

      console.error(
        cleaned
      );

      throw new Error(
        "Hugging Face returned invalid JSON."
      );
    }
  }

  console.error(
    "No JSON object found in AI response:"
  );

  console.error(
    cleaned
  );

  throw new Error(
    "Hugging Face returned invalid JSON."
  );
};


module.exports = {
  chatCompletion,
  chatJSON,
};

