import express from "express";
import http from "http";
import { Server } from "socket.io";
import { handleWebSocketConnection } from "./utils/handleConnection.js";
import sequelize from "./model/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Handle WebSocket connections
io.on("connection", handleWebSocketConnection);

// Sync database and start server
sequelize
    .sync({ alter: true })
    .then(() => {
        const PORT = process.env.PORT || 5500;
        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to sync database:", error);
    });
