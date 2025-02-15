import { SpeechClient } from "@google-cloud/speech";
import { extractBibleReference } from "./extractVerse.js";
import BibleVerse from "../model/BibleVerse.js";
import dotenv from "dotenv";
dotenv.config();

const speechClient = new SpeechClient();

export const handleWebSocketConnection = (ws) => {
    console.log("Client connected");

    const recognizeStream = speechClient
        .streamingRecognize({
            config: {
                encoding: "LINEAR16",
                sampleRateHertz: 16000,
                languageCode: "en-US",
            },
            interimResults: true,
        })
        .on("data", async (data) => {
            try {
                const transcript = data.results[0]?.alternatives[0]?.transcript;
                if (transcript) {
                    console.log("Transcription:", transcript);

                    // Extract Bible Reference
                    const reference = await extractBibleReference(transcript);
                    if (reference === "None") {
                        ws.send(JSON.stringify({ text: transcript, message: "No Bible reference found." }));
                        return;
                    }

                    // Query the Bible Verse
                    const [book, chapter, verse] = reference.split(" ");
                    const result = await BibleVerse.findOne({ where: { book, chapter, verse } });

                    ws.send(JSON.stringify(result ? { text: transcript, verse: result.text } : { text: transcript, message: "Verse not found." }));
                }
            } catch (error) {
                console.error("Error processing transcription:", error);
                ws.send(JSON.stringify({ error: "Failed to process transcription." }));
            }
        })
        .on("error", (error) => {
            console.error("Speech-to-Text error:", error);
            ws.close();
        })
        .on("end", () => {
            console.log("Stream ended");
        });

    ws.on("message", (message) => {
        if (typeof message === "string" || !(message instanceof Buffer)) {
            console.error("Invalid message format");
            ws.send(JSON.stringify({ error: "Invalid message format" }));
            return;
        }
        recognizeStream.write(message);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        recognizeStream.end();
    });
};
