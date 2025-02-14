import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true, maxRetries: 1 });

export const extractBibleReference = async (text) => {
    const prompt = `Extract the Bible verse reference from this text: "${text} and return it in the form 'book chapter verse ' with no : ". If no reference, return "None".`;

    const response = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o",
        max_tokens: 512,
        temperature: 0,
    });
    return response.choices.at(0)?.message?.content.trim();
};
