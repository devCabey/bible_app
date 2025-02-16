import { SpeechClient } from "@google-cloud/speech";
import { extractBibleReference } from "./extractVerse.js";
import BibleVerse from "../model/BibleVerse.js";
import dotenv from "dotenv";
dotenv.config();

const speechClient = new SpeechClient();

/**
 * Handles WebSocket connections for real-time audio transcription and Bible verse detection.
 * @param {Socket} socket - The WebSocket connection instance.
 */
export const handleWebSocketConnection = (socket) => {
    let recognizeStream = null;

    /**
     * Starts a new speech recognition stream.
     */
    const startRecognitionStream = () => {
        console.log("Starting speech recognition stream");

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
                            console.log("No Bible reference found in transcript");
                            socket.send(JSON.stringify({ text: transcript, message: "No Bible reference found." }));
                            return;
                        }

                        // Query the Bible Verse
                        const [book, chapter, verse] = reference.split(" ");
                        const result = await BibleVerse.findOne({ where: { book, chapter, verse } });

                        if (result) {
                            socket.send(
                                JSON.stringify({
                                    book: result.book,
                                    chapter: result.chapter,
                                    verse: result.verse,
                                    text: result.text,
                                    version: result.version,
                                })
                            );
                        } else {
                            socket.send(JSON.stringify({ text: transcript, message: "Verse not found." }));
                        }
                    }
                } catch (error) {
                    console.error("Error processing transcription:", error);
                    socket.send(JSON.stringify({ error: "Failed to process transcription." }));
                }
            })
            .on("error", (error) => {
                console.error("Speech-to-Text error:", error);
                socket.send(JSON.stringify({ error: "Speech-to-Text service error." }));
                socket.close();
            })
            .on("end", () => {
                console.log("Speech recognition stream ended");
                recognizeStream = null;
            });
    };

    // Handle incoming audio data
    socket.on("audioData", (data) => {
        if (!recognizeStream) {
            startRecognitionStream();
        }
        recognizeStream.write(data);
    });

    // Handle end of audio stream
    socket.on("endStream", () => {
        console.log("Ending audio stream");
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream = null;
        }
    });

    // Handle client disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream = null;
        }
    });

    // Handle socket errors
    socket.on("error", (error) => {
        console.error("Socket error:", error);
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream = null;
        }
    });
};
