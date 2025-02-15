import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { handleWebSocketConnection } from "./utils/handleConnection.js";
import sequelize from "./model/index.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", handleWebSocketConnection);

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
    const PORT = process.env.PORT || 5500;
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});

// Graceful shutdown
const shutdown = () => {
    console.log("Shutting down server...");
    wss.clients.forEach((client) => client.close());
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
