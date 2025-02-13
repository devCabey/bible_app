import OpenAI from "openai/index.mjs";

async function transcribeAudio(audioBuffer) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: audioBuffer,
        language: "en",
    });
    return response.text;
}

export default transcribeAudio;
