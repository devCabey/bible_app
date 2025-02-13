import OpenAI from "openai";

const openai = new OpenAI({ apiKey: "your-openai-api-key" });

export const extractBibleReference = async (text) => {
    const prompt = `Extract the Bible verse reference from this text: "${text}". If no reference, return "None".`;

    const response = await openai.completions.create({
        model: "gpt-4",
        prompt,
        max_tokens: 50,
    });

    return response.choices[0].text.trim();
};
