import User from '../Model/User.js';  //importing the model
import bcrypt from 'bcryptjs';

const getAllUsers =  async(req ,res ,next) =>{
    try{
        const users = await User.find().select('-password'); //find all the users in the database excluding password
        if(users.length === 0){
            return res.status(404).json({message:"No users found"});
        }
        res.status(200).json(users);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const findUserById = async(req, res, next) =>{
    const id = req.params.id;

    try{
        const user = await User.findById(id).select('-password');
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const updateUser = async(req, res, next) =>{
    const id = req.params.id;
    const {name,email,NIC,phoneNumber,gender,specialization,licenseNumber,experience,bio,hourlyRate} = req.body;

    try{
        // Get the existing user to check role and email
        const existingUser = await User.findById(id);
        if(!existingUser){
            return res.status(404).json({message:"User not found"});
        }

        // Check if email is being changed and if it's already taken
        if(email && email !== existingUser.email){
            const emailExists = await User.findOne({email});
            if(emailExists){
                return res.status(400).json({message:"Email already in use"});
            }
        }

        // Build update object with common fields
        const updateData = {name,email,NIC,phoneNumber,gender};

        // Add lawyer-specific fields only if user is a lawyer
        if(existingUser.role === "lawyer"){
            if(specialization) updateData.specialization = specialization;
            if(licenseNumber) updateData.licenseNumber = licenseNumber;
            if(experience !== undefined) updateData.experience = experience;
            if(bio) updateData.bio = bio;
            if(hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
        }

        const user = await User.findByIdAndUpdate(id, updateData, {new: true}).select('-password');
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const deleteUser = async(req, res, next) =>{
    const id = req.params.id;
    const userId = req.user?.userId;

    try{
        // Check if user is trying to delete their own profile or is an admin
        if(id !== userId && req.user?.role !== "admin"){
            return res.status(403).json({message:"You can only delete your own profile"});
        }

        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({message:"User deleted successfully"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const getCurrentUser = async(req, res, next) =>{
    const userId = req.user?.userId;

    try{
        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

const addUser = async(req, res, next) =>{
    const {name, email, NIC, phoneNumber, gender, password} = req.body;

    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            NIC,
            phoneNumber,
            gender,
            password: hashedPassword
        });
        await newUser.save();
        return res.status(201).json({message:"User created successfully", user: newUser});
    }catch(err){
        res.status(500).json({message:err.message});
    }
}


export default {
    getAllUsers,
    findUserById,
    updateUser,
    deleteUser,
    getCurrentUser,
    addUser,
    
};
