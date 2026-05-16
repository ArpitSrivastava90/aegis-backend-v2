"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocketServer = void 0;
const socket_io_1 = require("socket.io");
let io;
const initializeSocketServer = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
        },
    });
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        socket.on("repo:join", ({ owner, repo }) => {
            const room = `repo:${owner}:${repo}`;
            socket.join(room);
            console.log(`Socket joined room: ${room}`);
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
    return io;
};
exports.initializeSocketServer = initializeSocketServer;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
exports.getIO = getIO;
