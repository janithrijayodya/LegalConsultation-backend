import express from 'express';
import mongoose from 'mongoose';
import router from './Route/UserRouters.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './Route/auth.js';
import userRouter from './Route/UserRouters.js';
import adminRouter from './Route/admin.js';
import lawyerRouter from './Route/lawyer.js';
import availabilityRouter from './Route/availability.js';
import consultationRouter from './Route/consultation.js';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import callPackageRouter from './Route/callpackage.js';

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

let onlineUsers = {}; // Maps userId -> socketId
let socketToUserId = {}; // Maps socketId -> userId (for reverse lookup)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Register user (VERY IMPORTANT)
  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    socketToUserId[socket.id] = userId; // Map socket to user for reverse lookup
    console.log("✅ Registered:", userId, "with socket:", socket.id);
    console.log("onlineUsers map:", Object.keys(onlineUsers));
  });

  //  CALL USER
  socket.on("call-user", ({ to, from, callPackage, callPackageDurationSeconds }) => {
    console.log("📞 call-user received:");
    console.log("To:", to);
    console.log("From:", from);
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("incoming-call", {
        from,
        callPackage: callPackage || null,
        callPackageDurationSeconds: callPackageDurationSeconds || null,
      });
      console.log("✅ incoming-call emitted");
    } else {
      console.log("❌ User not found or not online");
    }
  });

  // ✅ ANSWER CALL
  socket.on("answer-call", ({ to, from }) => {
    console.log("✅ answer-call received - to:", to, "from:", from, "socket.id:", socket.id);
    const targetSocket = onlineUsers[to];
    const lawyerId = socketToUserId[socket.id];
    if (targetSocket) {
      io.to(targetSocket).emit("call-accepted", { from: lawyerId });
      console.log("✅ call-accepted emitted to client with lawyer ID:", lawyerId);
    } else {
      console.log("❌ Target client not found:", to);
    }
  });

  // 🌐 ICE CANDIDATES
  // ICE signaling is handled by webrtc-ice-candidate events elsewhere

  // ✅ ANSWER CALL  
  socket.on("answer-call", ({ to, from }) => {
    console.log("📞 answer-call received - to:", to, "from:", from, "socket.id:", socket.id);
    
    const targetSocket = onlineUsers[to];
    const lawyerId = socketToUserId[socket.id]; // Get the actual lawyer's ID from socket mapping
    
    console.log("📍 Sent by lawyer (socketId):", socket.id, "which maps to userId:", lawyerId);

    if (targetSocket) {
      io.to(targetSocket).emit("call-accepted", {
        from: lawyerId  // Send the lawyer's ID (not the value sent by client)
      });
      console.log("✅ call-accepted emitted to client with lawyer ID:", lawyerId);
    } else {
      console.log("❌ Target client not found:", to);
    }
  });

  // ❌ REJECT CALL
  socket.on("reject-call", ({ to, from, callPackage }) => {
    console.log("❌ reject-call received - to:", to);
    const targetSocket = onlineUsers[to];
    const lawyerId = socketToUserId[socket.id];
    if (targetSocket) {
      io.to(targetSocket).emit("call-rejected", { from: lawyerId, callPackage: callPackage || null });
      console.log("✅ call-rejected emitted to client with lawyer ID:", lawyerId);
    } else {
      console.log("❌ Target client not found:", to);
    }
  });

  // ⏹️ END CALL
  socket.on("end-call", ({ to, from }) => {
    console.log("⏹️ END-CALL received from:", from, "to:", to);
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("call-ended", { from });
      console.log("✅ call-ended emitted to socketId:", targetSocket);
    } else {
      console.log("❌ Target user not found. onlineUsers:", Object.keys(onlineUsers));
    }
  });

  // 📞 CANCEL CALL (before lawyer answers)
  socket.on("cancel-call", ({ to, from }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("call-cancelled", { from });
      console.log("📞 Call cancelled by client - notifying lawyer");
    }
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    // Remove user from both maps
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        console.log("Removed userId:", userId);
      }
    }
    delete socketToUserId[socket.id];
    console.log("Cleaned up socket mapping for:", socket.id);
  });
});


//connecting with database
mongoose.connect("mongodb://localhost:27017/LegalConsultation")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/lawyers', lawyerRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/consultation', consultationRouter);
app.use('/api/callpackages', callPackageRouter);


server.listen(3001 , () => {
  console.log(`Server is running on port ${PORT}`);
});
