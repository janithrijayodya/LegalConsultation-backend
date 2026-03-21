import { Server } from "socket.io";

let onlineUsers = {}; // store online users => { userId: socketId }

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register user
    socket.on("register", (userId) => {
      onlineUsers[userId] = socket.id;
      console.log("Registered:", userId);
      console.log("onlineUsers map after register:", onlineUsers);
    });

    // Initiate call
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

    // WebRTC Signaling: Send offer to recipient
    socket.on("webrtc-offer", ({ to, from, offer }) => {
      console.log("📡 WebRTC offer received from:", from, "to:", to);
      const targetSocketId = onlineUsers[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc-offer", {
          from,
          offer,
        });
        console.log("✅ WebRTC offer forwarded");
      }
    });

    // WebRTC Signaling: Send answer back to caller
    socket.on("webrtc-answer", ({ to, from, answer }) => {
      console.log("📡 WebRTC answer received from:", from, "to:", to);
      const targetSocketId = onlineUsers[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc-answer", {
          from,
          answer,
        });
        console.log("✅ WebRTC answer forwarded");
      }
    });

    // WebRTC Signaling: Send ICE candidate
    socket.on("webrtc-ice-candidate", ({ to, from, candidate }) => {
      console.log("📡 ICE candidate from:", from, "to:", to);
      const targetSocketId = onlineUsers[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc-ice-candidate", {
          from,
          candidate,
        });
      }
    });

    // Answer call (legacy - still used for initial acceptance)
    socket.on("answer-call", ({ to, from }) => {
      console.log("✅ Call answered by:", from);
      const targetSocketId = onlineUsers[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-accepted", {
          from,
        });
        console.log("✅ call-accepted emitted");
      }
    });

    // Reject call
    socket.on("reject-call", ({ to, from }) => {
      console.log("❌ Call rejected by:", from);
      const targetSocketId = onlineUsers[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-rejected", {
          from,
        });
      }
    });

    // End call
    socket.on("end-call", ({ to, from }) => {
      console.log("📞 Call ended by:", from);
      const targetSocketId = onlineUsers[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-ended", {
          from,
        });
      }
      console.log("✅ call-ended emitted");
    });

    // Cancel call (before answer)
    socket.on("cancel-call", ({ to, from }) => {
      console.log("❌ Call cancelled by:", from);
      const targetSocketId = onlineUsers[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-cancelled", {
          from,
        });
      }
    });

    // User disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          console.log("Removed user from onlineUsers:", userId);
        }
      }
    });
  });
};

module.exports = initSocket;