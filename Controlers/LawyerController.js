import User from '../Model/User.js';

export const findAllLawyers = async (req, res) => {
    try {
        // Find all users with role "lawyer"
        const lawyers = await User.find({ role: 'lawyer' })
            .select('-password'); // Exclude password field for security

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Lawyers retrieved successfully',
            count: lawyers.length,
            data: lawyers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching lawyers',
            error: error.message
        });
    }
};


export const getLawyerById = async (req, res) => {
    try {
        const { id } = req.params;

        const lawyer = await User.findById(id)
            .select('-password');

        if (!lawyer || lawyer.role !== 'lawyer') {
            return res.status(404).json({
                success: false,
                message: 'Lawyer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lawyer retrieved successfully',
            data: lawyer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching lawyer',
            error: error.message
        });
    }
};


export const getLawyersBySpecialization = async (req, res) => {
    try {
        const { specialization } = req.params;

        const lawyers = await User.find({
            role: 'lawyer',
            specialization: { $regex: specialization, $options: 'i' } // Case-insensitive search
        }).select('-password');

        res.status(200).json({
            success: true,
            message: `Lawyers with ${specialization} specialization retrieved successfully`,
            count: lawyers.length,
            data: lawyers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching lawyers by specialization',
            error: error.message
        });
    }
};

export default{ findAllLawyers, getLawyerById, getLawyersBySpecialization }
