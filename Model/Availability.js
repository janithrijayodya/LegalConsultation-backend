import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema(
  {
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String, // Format: "HH:MM" (24-hour format)
      required: true,
    },
    endTime: {
      type: String, // Format: "HH:MM" (24-hour format)
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate day slots
AvailabilitySchema.index({ lawyerId: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model('Availability', AvailabilitySchema);
