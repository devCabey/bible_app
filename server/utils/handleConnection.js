import { SpeechClient } from "@google-cloud/speech";
import { extractBibleReference } from "./extractVerse.js";
import BibleVerse from "../model/BibleVerse.js";
import dotenv from "dotenv";
dotenv.config();

const speechClient = new SpeechClient();

export const handleWebSocketConnection = (socket) => {
    let recognizeStream = null;

    const startRecognitionStream = () => {
        console.log("Client connected");

        recognizeStream = speechClient
            .streamingRecognize({
                config: {
                    encoding: "LINEAR16",
                    sampleRateHertz: 44100,
                    languageCode: "en-US",
                    interimResults: true,
                },
            })
            .on("data", async (data) => {
                try {
                    const transcript = data.results[0]?.alternatives[0]?.transcript;
                    if (transcript) {
                        console.log("Transcription:", transcript);

                        // Extract Bible Reference
                        const reference = await extractBibleReference(transcript);
                        if (reference === "None") {
                            socket.send(JSON.stringify({ text: transcript, message: "No Bible reference found." }));
                            return;
                        }

                        // Query the Bible Verse
                        const [book, chapter, verse] = reference.split(" ");
                        const result = await BibleVerse.findOne({ where: { book, chapter, verse } });
                        console.log("result", result);
                        socket.send(JSON.stringify(result ? { text: transcript, verse: result.text } : { text: transcript, message: "Verse not found." }));
                    }
                } catch (error) {
                    console.error("Error processing transcription:", error);
                    socket.send(JSON.stringify({ error: "Failed to process transcription." }));
                }
            })
            .on("error", (error) => {
                console.error("Speech-to-Text error:", error);
                socket.close();
            })
            .on("end", () => {
                console.log("Stream ended");
            });
    };

    socket.on("audioData", (data) => {
        if (!recognizeStream) {
            startRecognitionStream();
        }
        recognizeStream.write(data);
    });

    socket.on("endStream", () => {
        console.log("Ending stream");
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream = null;
        }
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        recognizeStream.end();
    });
};
