import { useState } from "react";
import { recordAudio } from "./utils/recordAudio";
import axios from "axios";

export default function App() {
    const [quote, setQuote] = useState<string>("");
    const [isRecording, setIsRecording] = useState<boolean>(false);

    const handleRecord = async () => {
        try {
            setIsRecording(true);
            const recorder = await recordAudio();
            recorder.start();

            setTimeout(async () => {
                try {
                    const transcription = await recorder.stop();
                    const response = await axios.post<{ text?: string; message?: string }>("http://localhost:5000/api/transcribe", { transcription: (transcription as { text: string }).text });
                    setQuote(response.data.text || response.data.message || "No quote found.");
                } catch (error) {
                    console.error("Transcription error:", error);
                    setQuote("Failed to transcribe. Please try again.");
                } finally {
                    setIsRecording(false);
                }
            }, 5000);
        } catch (error) {
            console.error("Recording error:", error);
            setQuote("Failed to start recording.");
            setIsRecording(false);
        }
    };

    return (
        <div>
            <button onClick={handleRecord} disabled={isRecording}>
                {isRecording ? "🎤 Recording..." : "🎙️ Start Recording"}
            </button>
            <p>{quote}</p>
        </div>
    );
}
