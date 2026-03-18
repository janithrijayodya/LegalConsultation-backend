import Availability from '../Model/Availability.js';
import User from '../Model/User.js';

// Get all availability slots for the current logged-in lawyer
export const getLawyerAvailability = async (req, res) => {
  try {
    const lawyerId = req.user.userId; // From auth middleware

    // Verify lawyer role
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(403).json({ message: 'Only lawyers can view their availability' });
    }

    const availabilities = await Availability.find({ lawyerId }).sort({ dayOfWeek: 1 });
    res.status(200).json(availabilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
};

// Add availability slot
export const addAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    const lawyerId = req.user.userId; // From auth middleware

    // Validate lawyer role
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(403).json({ message: 'Only lawyers can add availability' });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: 'Time must be in HH:MM format' });
    }

    // Validate start time is before end time
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // Check if availability slot already exists
    const existingSlot = await Availability.findOne({ lawyerId, dayOfWeek });
    if (existingSlot) {
      return res.status(400).json({ message: `Availability for ${dayOfWeek} already exists. Update or delete first.` });
    }

    const availability = new Availability({
      lawyerId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: true,
    });

    await availability.save();
    res.status(201).json({ message: 'Availability added successfully', availability });
  } catch (error) {
    res.status(500).json({ message: 'Error adding availability', error: error.message });
  }
};

// Update availability slot
export const updateAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;
    const lawyerId = req.user.userId;

    // Find the availability slot
    const availability = await Availability.findById(availabilityId);
    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    // Verify ownership
    if (availability.lawyerId.toString() !== lawyerId) {
      return res.status(403).json({ message: 'Not authorized to update this availability' });
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      return res.status(400).json({ message: 'Start time must be in HH:MM format' });
    }
    if (endTime && !timeRegex.test(endTime)) {
      return res.status(400).json({ message: 'End time must be in HH:MM format' });
    }

    const newStartTime = startTime || availability.startTime;
    const newEndTime = endTime || availability.endTime;

    // Validate start time is before end time
    if (newStartTime >= newEndTime) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // Update fields
    availability.dayOfWeek = dayOfWeek || availability.dayOfWeek;
    availability.startTime = newStartTime;
    availability.endTime = newEndTime;
    if (isAvailable !== undefined) {
      availability.isAvailable = isAvailable;
    }

    await availability.save();
    res.status(200).json({ message: 'Availability updated successfully', availability });
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
};

// Delete availability slot
export const deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const lawyerId = req.user.userId;

    // Find the availability slot
    const availability = await Availability.findById(availabilityId);
    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    // Verify ownership
    if (availability.lawyerId.toString() !== lawyerId) {
      return res.status(403).json({ message: 'Not authorized to delete this availability' });
    }

    await Availability.findByIdAndDelete(availabilityId);
    res.status(200).json({ message: 'Availability slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting availability', error: error.message });
  }
};

// Get availability for a specific lawyer (public view)
export const getPublicLawyerAvailability = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const availabilities = await Availability.find({ lawyerId, isAvailable: true }).select('-_id dayOfWeek startTime endTime');
    res.status(200).json(availabilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
};
