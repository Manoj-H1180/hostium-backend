const User = require("../model/user.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const communicationController = async (req, res) => {
  try {
    const input = req.body.input;
    const userDetail = await User.findById(req.userInfo.id).select(
      "-password -otp -email"
    );

    const prompt = `
You are an AI English language tutor designed to teach English and guide users effectively.
The user's details are as follows:

- Name: ${userDetail.name}
- English Level: ${userDetail.englishLevel}
- Learning Goals: ${userDetail.learningGoals}
- Preferred Learning Style: ${userDetail.learningStyle}

Query: ${input}

If the user's query is a casual greeting or conversation starter (e.g., "How are you doing?"):
1. Respond naturally and conversationally.
2. Provide 2-3 alternative ways to ask or respond to the same question.
3. Briefly explain any idiomatic expressions used.

For other queries, respond in an educational, tailored way, focusing on:
1. Improving their English speaking skills
2. Enhancing pronunciation
3. Expanding vocabulary

Provide a concise response (around 50 words) that includes:
- A direct answer to their query
- A relevant example or explanation
- A brief practice exercise or question to reinforce learning

Adjust your language complexity to match the user's English level.
`;

    const result = await model.generateContent(prompt);

    const output = result.response.text();

    const aiResponse =
      "Sure, I can help you with speaking in English. Let's start with some basic phrases.";

    res.status(200).json({ success: true, message: output });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = communicationController;
