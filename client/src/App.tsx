import { useState, useEffect, useRef } from "react";
import { AudioLines, CircleDot, Mic, MicOff } from "lucide-react";
import { io, Socket } from "socket.io-client"; // Import Socket.IO client with types

interface Quote {
    book: string;
    chapter: number;
    verse: number;
    text: string;
    version: string;
}

export default function App() {
    const [quote, setQuote] = useState<Quote | undefined>(undefined);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [recording, setRecording] = useState<boolean>(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    const audioContext = useRef<AudioContext | null>(null);
    const mediaStreamSource = useRef<MediaStreamAudioSourceNode | null>(null);
    const scriptProcessorNode = useRef<ScriptProcessorNode | null>(null);

    useEffect(() => {
        // Connect to the Socket.IO server
        const newSocket: Socket = io("http://localhost:5500"); // Replace with your backend URL
        setSocket(newSocket);

        // Handle messages from the server
        newSocket.on("message", (data: string) => {
            const parsedData = JSON.parse(data);
            console.log("Received data:", parsedData);

            if (parsedData.error) {
                setError(parsedData.error);
            } else if (parsedData) {
                setQuote({
                    book: parsedData?.book, // Update based on backend response if available
                    chapter: parsedData?.chapter, // Update based on backend response if available
                    verse: parsedData?.me, // Update based on backend response if available
                    text: parsedData?.verse,
                    version: parsedData?.version, // Update based on backend response if available
                });
            } else {
                setQuote(undefined); // Clear the quote if no verse is found
            }
        });

        // Handle errors
        newSocket.on("connect_error", (err: Error) => {
            console.error("Socket.IO connection error:", err);
            setError("Failed to connect to the server.");
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
            if (audioContext.current) {
                audioContext.current.close();
            }
        };
    }, []);

    const startRecording = async () => {
        setError("");
        setQuote(undefined);
        setRecording(true);
        setIsLoading(true);
        try {
            // Get access to the microphone
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            // Initialize AudioContext if it's not already initialized
            if (!audioContext.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                audioContext.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
            } else {
                mediaStreamSource.current = audioContext.current.createMediaStreamSource(stream);
                scriptProcessorNode.current = audioContext.current.createScriptProcessor(4096, 1, 1);
                scriptProcessorNode.current.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
                    const inputBuffer: AudioBuffer = audioProcessingEvent.inputBuffer;
                    const inputData: Float32Array = inputBuffer.getChannelData(0);

                    // Convert the Float32Array to a Int16Array, which is expected by the backend
                    const buffer: Int16Array = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        buffer[i] = Math.min(1, inputData[i]) * 0x7fff;
                    }

                    // Send the audio data to the server
                    if (socket) {
                        socket.emit("audioData", buffer);
                    }
                };

                mediaStreamSource.current.connect(scriptProcessorNode.current);
                scriptProcessorNode.current.connect(audioContext.current.destination); // Required for processing to occur
            }
        } catch (error) {
            console.error("Error getting microphone access:", error);
            setError("Error accessing microphone.");
            setRecording(false);
        }
    };

    const stopRecording = () => {
        setRecording(false);
        setIsLoading(false);
        if (scriptProcessorNode.current) {
            scriptProcessorNode.current.disconnect();
            scriptProcessorNode.current = null;
        }
        if (mediaStreamSource.current) {
            mediaStreamSource.current.disconnect();
            mediaStreamSource.current = null;
        }

        if (socket) {
            socket.emit("endStream");
        }
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
                ) : (
                    <p className="text-gray-500">No verse detected</p>
                )}
                {isLoading && <p className="text-gray-500">Loading...</p>}
            </div>

            <div className="mt-8 bg-white shadow-md rounded-2xl p-7 flex flex-col items-center min-w-2xl">
                <span className="p-5 rounded-full bg-gray-100">{recording ? <AudioLines size={20} /> : <CircleDot size={20} />}</span>
                <p className="mt-4 text-gray-600 text-sm text-center w-48">{recording ? "Listening for Bible references..." : "Transcribing and detecting Bible quotations in real time"}</p>
                {recording ? (
                    <button className="mt-4 flex justify-center items-center bg-red-100 text-red-500 rounded-full text-xs py-3 px-10" onClick={stopRecording} disabled={!recording}>
                        <MicOff size={16} className="mr-2" /> Stop Listening
                    </button>
                ) : (
                    <button className="mt-4 flex justify-center items-center bg-black text-white rounded-full text-xs py-3 px-10" onClick={startRecording} disabled={recording}>
                        <Mic size={16} className="mr-2" /> Start Listening
                    </button>
                )}
            </div>
        </div>
    );
}
