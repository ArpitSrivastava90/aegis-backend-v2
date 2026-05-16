import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initializeSocketServer = (
  server: http.Serverhttp
) => {
  io = new WebServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (weBsocket) => {
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

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
};