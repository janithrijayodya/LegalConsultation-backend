import LawyerRequest from '../Model/LawyerRequest.js';
import User from '../Model/User.js';
import Availability from '../Model/Availability.js';

// Get all pending lawyer requests
export const getPendingLawyerRequests = async (req, res) => {
    try {
        const requests = await LawyerRequest.find({ status: "pending" });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all lawyer requests (pending, approved, rejected)
export const getAllLawyerRequests = async (req, res) => {
    try {
        const requests = await LawyerRequest.find()
            .populate('reviewedBy', 'name email');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get single lawyer request
export const getLawyerRequest = async (req, res) => {
    try {
        const request = await LawyerRequest.findById(req.params.id)
            .populate('reviewedBy', 'name email');
        
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Approve lawyer request
export const approveLawyerRequest = async (req, res) => {
    try {
        const lawyerRequest = await LawyerRequest.findById(req.params.id);
        
        if (!lawyerRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (lawyerRequest.status !== "pending") {
            return res.status(400).json({ message: "Only pending requests can be approved" });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email: lawyerRequest.email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Create user from lawyer request
        const newUser = new User({
            name: lawyerRequest.name,
            email: lawyerRequest.email,
            NIC: lawyerRequest.NIC,
            phoneNumber: lawyerRequest.phoneNumber,
            gender: lawyerRequest.gender,
            password: lawyerRequest.password,
            role: "lawyer",
            specialization: lawyerRequest.specialization,
            licenseNumber: lawyerRequest.licenseNumber,
            experience: lawyerRequest.experience,
            bio: lawyerRequest.bio,
            hourlyRate: lawyerRequest.hourlyRate
        });

        await newUser.save();

        // Migrate availability records from LawyerRequest ID to User ID
        await Availability.updateMany(
            { lawyerId: lawyerRequest._id },
            { lawyerId: newUser._id }
        );

        // Delete the lawyer request from LawyerRequest table after successful approval
        await LawyerRequest.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Lawyer request approved successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                specialization: newUser.specialization
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Reject lawyer request
export const rejectLawyerRequest = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        
        const lawyerRequest = await LawyerRequest.findById(req.params.id);
        
        if (!lawyerRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (lawyerRequest.status !== "pending") {
            return res.status(400).json({ message: "Only pending requests can be rejected" });
        }

        lawyerRequest.status = "rejected";
        lawyerRequest.rejectionReason = rejectionReason || "";
        lawyerRequest.reviewedBy = req.user.userId;
        lawyerRequest.reviewedAt = new Date();
        await lawyerRequest.save();

        // Delete availability records for this rejected lawyer request
        await Availability.deleteMany({ lawyerId: lawyerRequest._id });

        res.status(200).json({
            message: "Lawyer request rejected successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export default {
    getPendingLawyerRequests,
    getAllLawyerRequests,
    getLawyerRequest,
    approveLawyerRequest,
    rejectLawyerRequest
};
