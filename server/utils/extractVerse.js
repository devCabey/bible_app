import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export async function extractBibleReference(text) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure you have this in your .env file
    });
    try {
        const prompt = `
        Identify and extract Bible references from the given text.
        If a reference is found, return it in this JSON format:
        {"book": "John", "chapter": 3, "verse": 16}
        If multiple references exist, return them as a list.
        If no reference is found, return null.

        Example text: "For God so loved the world, John 3:16."
        Expected output: {"book": "John", "chapter": 3, "verse": 16}

        Now process this text: "${text}"
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo", // or "gpt-3.5-turbo"
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 100,
        });

        const result = response.choices[0].message.content.trim();

        try {
            return JSON.parse(result); // Return parsed JSON
        } catch (error) {
            console.error("Error parsing AI response:", result);
            return null;
        }
    } catch (error) {
        console.error("Error extracting Bible reference:", error);
        return null;
    }
}
