import { Server } from "socket.io";

let users = {}; // store online users => { userId: socketId }

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // your frontend URL
      methods: ["GET", "POST"],
    },
  });


const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;

    console.log("Registered:", userId);
    console.log("onlineUsers map after register:", onlineUsers);
  });

  socket.on("call-user", ({ to, from }) => {
    console.log("📞 call-user received:");
    console.log("To:", to);
    console.log("From:", from);

    const targetSocketId = onlineUsers[to];

    console.log("Target socket:", targetSocketId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", {
        from,
      });

      console.log("✅ incoming-call emitted");
    } else {
      console.log("❌ User not online");
    }
  });
});
};

module.exports = initSocket;