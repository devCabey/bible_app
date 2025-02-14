import { useState } from "react";
import { recordAudio } from "./utils/recordAudio";
import axios from "axios";
import { Mic, Pause } from "lucide-react";

export default function App() {
    const [quote, setQuote] = useState<string>("");
    const [isListening, setIsListening] = useState(true);

    const handleRecord = async () => {
        try {
            setIsListening(true);
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
                    setIsListening(false);
                }
            }, 5000);
        } catch (error) {
            console.error("Recording error:", error);
            setQuote("Failed to start recording.");
            setIsListening(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-lg font-semibold text-gray-600">VerseCatch</h1>

            <div className="mt-6 text-center">
                <h2 className="text-xl font-bold">James 1:2-3 (AMPC)</h2>
                <p className="mt-2 text-gray-700 max-w-lg">
                    {quote} Consider it wholly joyful, my brethren, whenever you are enveloped in or encounter trials of any sort or fall into various temptations. Be assured and understand that the trial and proving of your faith bring out endurance and steadfastness and patience.
                </p>
            </div>

            <div className="mt-8 bg-white shadow-md rounded-2xl p-6 flex flex-col items-center min-w-2xl">
                <button className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full" onClick={() => setIsListening(!isListening)}>
                    {isListening ? <Pause size={15} /> : <Mic size={15} />}
                </button>
                <p className="mt-4 text-gray-600 text-sm text-center w-48 ">Transcribing and detecting Bible quotations in real time.</p>
                <button className="mt-4 flex justify-center items-center bg-black text-white rounded-full text-sm py-2 px-7" onClick={() => handleRecord()} disabled={isListening}>
                    <Mic size={16} className="mr-2" /> Continue Listening
                </button>
            </div>
        </div>
    );
}
