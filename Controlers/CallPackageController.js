import CallPackage from '../Model/CallPackage.js';

// Get all call packages
export const getAllCallPackages = async (req, res) => {
  try {
    const packages = await CallPackage.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new call package
export const addCallPackage = async (req, res) => {
  try {
    const newPackage = new CallPackage(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};