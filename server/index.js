import express from "express";
import sequelize from "./model/index.js";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { SpeechClient } from "@google-cloud/speech";
import { extractBibleReference } from "./utils/extractVerse.js";
import BibleVerse from "./model/BibleVerse.js";

const app = express();
const server = http.createServer(app); // ✅ Attach WebSocket to the same server
const wss = new WebSocketServer({ server });

const speechClient = new SpeechClient();
const PORT = process.env.PORT || 5500;

wss.on("connection", (ws) => {
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
        })
        .on("error", (error) => {
            console.error("Error:", error);
            ws.close();
        })
        .on("end", () => {
            console.log("Stream ended");
        });

    ws.on("message", (message) => {
        recognizeStream.write(message);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        recognizeStream.end();
    });
});

sequelize.sync({ alter: true }).then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
