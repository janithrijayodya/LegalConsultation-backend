import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{type:String, required:true},
    email:{type:String, required:true },
    password:{type:String, required:true},
    NIC:{type:String},
    phoneNumber:{type:String},
    gender:{type:String, enum:["Male", "Female"]},
    role: {type:String, default:"client" , enum:["client","admin","lawyer"]},
    // Lawyer specific fields
    specialization:{type:String},
    licenseNumber:{type:String},
    experience:{type:Number}, // years of experience
    bio:{type:String},
    hourlyRate:{type:Number},
},
{timestamps:true}
);

export default mongoose.model(
    'User', //file name
     UserSchema //funtion name
    );

