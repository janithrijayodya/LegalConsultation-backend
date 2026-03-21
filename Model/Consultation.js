import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ConsultationSchema = new Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['call', 'chat'],
    default: 'call'
  },
  callPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallPackage',
    required: false
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Consultation', ConsultationSchema);
