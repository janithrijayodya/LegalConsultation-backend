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
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

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

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Register user (VERY IMPORTANT)
  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("Registered:", userId);
    console.log("onlineUsers map after register:", onlineUsers);
  });

  //  CALL USER
  socket.on("callUser", ({ to, from, offer }) => {
   console.log("Calling:", to);
  console.log("Online users:", onlineUsers);

  const targetSocket = onlineUsers[to];

  if (targetSocket) {
    io.to(targetSocket).emit("incoming-call", { from, offer });
      console.log("Emitted incomingCall to", to);
  } else {
      console.log("No targetSocket found for userId:", to);
    console.log(" User not found or not online");
  }
  });

  // ✅ ANSWER CALL
  socket.on("answerCall", ({ to, answer }) => {
    const targetSocket = onlineUsers[to];

    if (targetSocket) {
      io.to(targetSocket).emit("callAccepted", {
        answer
      });
    }
  });

  // 🌐 ICE CANDIDATES
  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocket = onlineUsers[to];

    if (targetSocket) {
      io.to(targetSocket).emit("iceCandidate", {
        candidate
      });
    }
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    // remove user
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }
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
//get the data from the request body
// app.use("/users", router);

server.listen(3001 , () => {
  console.log(`Server is running on port ${PORT}`);
});