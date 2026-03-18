import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const LawyerRequestSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    NIC: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    experience: { type: Number, required: true },
    bio: { type: String, default: "" },
    hourlyRate: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    rejectionReason: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
},
{ timestamps: true }
);

export default mongoose.model('LawyerRequest', LawyerRequestSchema);
