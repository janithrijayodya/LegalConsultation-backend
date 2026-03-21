import mongoose from 'mongoose';
import CallPackage from './Model/CallPackage.js';

const packages = [
  {
    name: "Quick Consultation",
    duration: "10 minutes",
    price: "LKR 500",
    description: "Perfect for quick legal questions",
    features: [
      "Voice consultation",
      "Immediate booking",
      "Chat history access",
      "Basic legal guidance",
    ],
    popular: false,
  },
  {
    name: "Standard Consultation",
    duration: "20 minutes",
    price: "LKR 850",
    description: "Ideal for detailed discussions",
    features: [
      "Voice consultation",
      "Priority booking",
      "Chat history access",
      "Follow-up questions",
    ],
    popular: true,
  },
  {
    name: "Extended Consultation",
    duration: "30 minutes",
    price: "LKR 1500",
    description: "Comprehensive legal advice",
    features: [
      "Voice consultation",
      "Booking priority",
      "Follow-up questions",
      "Chat history access",
    ],
    popular: false,
  },
];

async function seedPackages() {
  await mongoose.connect('mongodb://localhost:27017/LegalConsultation');
  await CallPackage.deleteMany({}); // Optional: clear existing
  await CallPackage.insertMany(packages);
  console.log('Default call packages inserted!');
  await mongoose.disconnect();
}

seedPackages();
