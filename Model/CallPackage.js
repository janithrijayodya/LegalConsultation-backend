
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CallPackageSchema = new Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String, required: true }],
  popular: { type: Boolean, default: false }
}, { collection: 'call packages' });

export default mongoose.model('CallPackage', CallPackageSchema);

