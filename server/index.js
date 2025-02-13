import express from "express";
import http from "http";
import { Server as WebSocketServer } from "socket.io";

import transcribeAudio from "./services/transcriber.js";
import extractBibleReference from "./services/extractor.js";
import sequelize from "./model/index.js";

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("audio-stream", async (audioBuffer) => {
        try {
            const transcription = await transcribeAudio(audioBuffer);
            const bibleReference = await extractBibleReference(transcription);

            if (bibleReference) {
                const fullQuote = await fetchBibleQuote(bibleReference);
                socket.emit("bible-quotation", { reference: bibleReference, text: fullQuote });
            }
        } catch (error) {
            console.error("Error processing audio:", error);
            socket.emit("error", "Failed to process audio");
        }
    });

    socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(4000, async () => {
    await sequelize.authenticate();
    console.log("Server running on port 4000 & connected to DB");
});
