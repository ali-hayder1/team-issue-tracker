const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" }, // tighten this to your frontend URL once deployed
  });

  // authenticate the socket connection using the same JWT as REST
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("missing auth token"));

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = { id: payload.id, role: payload.role };
      next();
    } catch (err) {
      next(new Error("invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`socket connected: user ${socket.user.id}`);

    // client tells us which project room they're viewing
    socket.on("join_project", (projectId) => {
      socket.join(`project_${projectId}`);
    });

    socket.on("leave_project", (projectId) => {
      socket.leave(`project_${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log(`socket disconnected: user ${socket.user.id}`);
    });
  });

  return io;
}

module.exports = { initSockets };
