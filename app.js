import express from 'express';
import mongoose from 'mongoose';
import router from './Route/UserRouters.js';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './Route/auth.js';
import userRouter from './Route/UserRouters.js';
import adminRouter from './Route/admin.js';
import lawyerRouter from './Route/lawyer.js';

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();

//connecting with database
mongoose.connect("mongodb://localhost:27017/LegalConsultation")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/lawyers', lawyerRouter);
//get the data from the request body
// app.use("/users", router);

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
});

