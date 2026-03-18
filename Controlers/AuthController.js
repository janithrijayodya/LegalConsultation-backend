import User from "../Model/User.js";
import LawyerRequest from "../Model/LawyerRequest.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const userRegister = async(req, res, next) =>{
    const {name, email, NIC, phoneNumber, gender, password, role, specialization, licenseNumber, experience, bio, hourlyRate} = req.body;

    // Check required fields
    if(!name || !email || !password || !NIC || !phoneNumber || !gender){
        return res.status(400).json({message:"All basic fields are required"});
    }

    // Check lawyer-specific required fields if role is lawyer
    if(role === "lawyer"){
        if(!specialization || !licenseNumber || experience === undefined){
            return res.status(400).json({message:"Specialization, license number, and experience are required for lawyers"});
        }
    }

    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        // Check if lawyer request already exists
        if(role === "lawyer"){
            const existingRequest = await LawyerRequest.findOne({email});
            if(existingRequest){
                return res.status(400).json({message:"Lawyer registration request already exists"});
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // If registering as a lawyer, create a pending request
        if(role === "lawyer"){
            const lawyerRequest = new LawyerRequest({
                name,
                email,
                NIC,
                phoneNumber,
                gender,
                password: hashedPassword,
                specialization,
                licenseNumber,
                experience,
                bio: bio || "",
                hourlyRate: hourlyRate || 0,
                status: "pending"
            });
            await lawyerRequest.save();
            return res.status(201).json({
                message: "Lawyer registration request submitted successfully. Please wait for admin approval."
            });
        }

        // If registering as a client, create user directly
        const newUserData = {
            name,
            email,
            NIC,
            phoneNumber,
            gender,
            password: hashedPassword,
            role: "client"
        };

        const newUser = new User(newUserData);
        await newUser.save();
        return res.status(201).json({message:"User created successfully"});

    } catch (error) {
        return res.status(500).json({message:"Internal server error"});
    }
};


export const userLogin = async(req, res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({message:"Email and password are required"});
    }

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email "});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid password"});
        }

        const accessToken = jwt.sign(
            {userId: user._id, role: user.role}, 
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn:"15m"}
        );

        const refreshToken = jwt.sign(
            {userId: user._id, role: user.role}, 
            process.env.REFRESH_TOKEN_SECRET, 
            {expiresIn:"7d"}
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7*24*60*60*1000,
        });

        res.status(200).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                NIC: user.NIC,
                phoneNumber: user.phoneNumber,
                gender: user.gender,
                role: user.role,
                // Include lawyer-specific fields if user is a lawyer
                ...(user.role === 'lawyer' && {
                    specialization: user.specialization,
                    licenseNumber: user.licenseNumber,
                    experience: user.experience,
                    bio: user.bio,
                    hourlyRate: user.hourlyRate
                })
            }

        });

    } catch (error) {
        return res.status(500).json({message:"Internal server error"});

    }
}

export const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;

    if(!token){
        return res.status(401).json({message:"No token provided"});
    }

    try{
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);

        if(!user){
            return res.status(401).json({message:"User not found"});
        }

        const newAccessToken = jwt.sign(
            {userId: user._id, role: user.role},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"15m"}
        );

        res.status(200).json({
            accessToken: newAccessToken,
            user: {
                id: user._id,
                name: user.name,
                email:user.email,
                NIC: user.NIC,
                phoneNumber: user.phoneNumber,
                gender: user.gender,
                role:user.role
            }
        });
    } catch (error) {
        return res.status(401).json({message:"Invalid token"});

    }
}

export const logout = (req, res) => {
    try{
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        return res.status(500).json({message:"Internal server error"});

    }
}

export default {
    userRegister,
    userLogin,
    refreshToken,
    logout
};