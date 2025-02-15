import { useState, useEffect, useRef } from "react";
import { AudioLines, CircleDot, Mic, MicOff } from "lucide-react";

export default function App() {
    const [quote, setQuote] = useState<
        | {
              book: string;
              chapter: number;
              verse: number;
              text: string;
              version: string;
          }
        | undefined
    >();

    const [error, setError] = useState<string>("");
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Connect WebSocket
        const socket = new WebSocket("ws://localhost:5500"); // Change for production

        socket.onopen = () => console.log("WebSocket connected");
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.verse) {
                setQuote(data.verse);
                setError("");
            } else {
                setError(data.message || "No reference detected.");
            }
            setIsLoading(false);
        };
        socket.onclose = () => {
            console.log("WebSocket disconnected");
            // Attempt to reconnect after 3 seconds
            setTimeout(() => setWs(new WebSocket("ws://localhost:5500")), 3000);
        };
        setWs(socket);

        return () => {
            socket.close();
            mediaRecorderRef.current?.stop();
            audioStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const startRecording = async () => {
        setIsListening(true);
        setIsLoading(true);
        setError("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(event.data);
                }
            };

            mediaRecorder.start(250); // Send audio every 250ms
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied or not supported.");
            setIsListening(false);
            setIsLoading(false);
        }
    };

    const stopRecording = () => {
        setIsListening(false);
        mediaRecorderRef.current?.stop();
        audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    };

    return (
        <div className="flex flex-col items-center justify-between md:justify-center min-h-screen bg-gray-100 px-6 pt-6 pb-0 md:pb-6">
            <h1 className="text-lg font-semibold text-gray-600">VerseCatch</h1>

            <div className="mt-6 text-center">
                <h2 className="text-xl font-bold">Detected Verse:</h2>
                {error ? (
                    <span className="text-red-500"> {error}</span>
                ) : quote ? (
                    <div className="mt-6 text-center">
                        <h2 className="text-xl font-bold">
                            {quote?.book} {quote?.chapter}:{quote?.verse} ({quote?.version?.toLocaleUpperCase()})
                        </h2>
                        <p className="mt-2 text-gray-700 max-w-lg">{quote?.text}</p>
                    </div>
                ) : isLoading ? (
                    <span className="text-gray-500">Loading...</span>
                ) : (
                    <span className="text-gray-500">No verse detected</span>
                )}
            </div>

            <div className="mt-8 bg-white shadow-md rounded-2xl p-7 flex flex-col items-center min-w-2xl">
                <span className="p-5 rounded-full bg-gray-100">{isListening ? <AudioLines size={20} /> : <CircleDot size={20} />}</span>
                <p className="mt-4 text-gray-600 text-sm text-center w-48">{isListening ? "Listening for Bible references..." : "Transcribing and detecting Bible quotations in real time"}</p>
                {isListening ? (
                    <button className="mt-4 flex justify-center items-center bg-red-100 text-red-500 rounded-full text-xs py-3 px-10" onClick={stopRecording} disabled={!isListening}>
                        <MicOff size={16} className="mr-2" /> Stop Listening
                    </button>
                ) : (
                    <button className="mt-4 flex justify-center items-center bg-black text-white rounded-full text-xs py-3 px-10" onClick={startRecording} disabled={isListening}>
                        <Mic size={16} className="mr-2" /> Start Listening
                    </button>
                )}
            </div>
        </div>
    );
}
