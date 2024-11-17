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
    You are an AI assistant designed to teach english and guide users effectively.
      The user's details are as follows:

    - Name: ${userDetail.name}

     - Query: ${input}

      Respond to their queries in an educational, tailored way, focusing on improving their English speaking skills, pronunciation, and vocabulary and respond in 50 words.
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
