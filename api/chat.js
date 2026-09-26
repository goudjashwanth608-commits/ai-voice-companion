export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, companionName } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions: `
You are ${companionName || "Maya"}, a friendly AI voice companion.

Be warm, natural, and conversational.
Never claim to be a real human.
Keep normal voice responses reasonably short.
If the user speaks another language, respond in that language when appropriate.
          `,
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed"
      });
    }

    const answer = data.output
      ?.flatMap(item => item.content || [])
      ?.filter(item => item.type === "output_text")
      ?.map(item => item.text)
      ?.join("") || "Sorry, I couldn't answer that.";

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
