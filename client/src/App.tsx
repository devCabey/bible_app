import { useState, useEffect, useRef } from "react";
import { Mic, Pause } from "lucide-react";

export default function App() {
    const [quote, setQuote] = useState<string>("");
    const [isListening, setIsListening] = useState(false);
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
            } else {
                setQuote(data.message || "No reference detected.");
            }
        };
        socket.onclose = () => console.log("WebSocket disconnected");
        setWs(socket);

        return () => socket.close(); // Cleanup on unmount
    }, []);

    const startRecording = async () => {
        setIsListening(true);
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
    };

    const stopRecording = () => {
        setIsListening(false);
        mediaRecorderRef.current?.stop();
        audioStreamRef.current?.getTracks().forEach((track) => track.stop()); // Close the microphone
    };

    return (
        <div className="flex flex-col items-center justify-between md:justify-center min-h-screen bg-gray-100 px-6 pt-6 pb-0 md:pb-6">
            <h1 className="text-lg font-semibold text-gray-600">VerseCatch</h1>

            <div className="mt-6 text-center">
                <h2 className="text-xl font-bold">Detected Verse:</h2>
                <p className="mt-2 text-gray-700 max-w-lg">{quote}</p>
            </div>

            <div className="mt-8 bg-white shadow-md rounded-2xl p-7 flex flex-col items-center min-w-2xl">
                <button className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full" onClick={isListening ? stopRecording : startRecording}>
                    {isListening ? <Pause size={15} /> : <Mic size={15} />}
                </button>
                <p className="mt-4 text-gray-600 text-sm text-center w-48">{isListening ? "Listening for Bible references..." : "Press to start listening."}</p>
            </div>
        </div>
    );
}
