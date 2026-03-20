import Consultation from '../Model/Consultation.js';

// ✅ Save consultation details when call ends
export const saveConsultation = async (req, res) => {
  try {
    console.log("📩 saveConsultation called");
    console.log("Request body:", req.body);

    const { clientId, lawyerId, type, startTime, endTime, duration } = req.body;

    console.log("📝 Extracted fields:");
    console.log("  clientId:", clientId, "type:", typeof clientId);
    console.log("  lawyerId:", lawyerId, "type:", typeof lawyerId);
    console.log("  type:", type);
    console.log("  startTime:", startTime);
    console.log("  endTime:", endTime);
    console.log("  duration:", duration);

    if (!clientId || !lawyerId || !startTime) {
      console.log("❌ Validation failed!");
      console.log("  clientId missing?", !clientId);
      console.log("  lawyerId missing?", !lawyerId);
      console.log("  startTime missing?", !startTime);
      return res.status(400).json({ 
        error: "Missing required fields",
        received: { clientId, lawyerId, startTime }
      });
    }

    const consultation = new Consultation({
      clientId,
      lawyerId,
      type: type || 'call',
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration: duration || 0,
      status: 'completed'
    });

    await consultation.save();
    console.log("✅ Consultation saved:", consultation._id);
    
    res.status(201).json({
      success: true,
      message: "Consultation saved successfully",
      data: consultation
    });

  } catch (error) {
    console.error("❌ Error saving consultation:", error);
    res.status(500).json({ error: "Failed to save consultation", details: error.message });
  }
};

// ✅ Get all consultations for a lawyer
export const getLawyerConsultations = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const consultations = await Consultation.find({ lawyerId })
      .populate('clientId', 'name email phoneNumber')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      data: consultations
    });

  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
};

// ✅ Get all consultations for a client
export const getClientConsultations = async (req, res) => {
  try {
    const { clientId } = req.params;

    const consultations = await Consultation.find({ clientId })
      .populate('lawyerId', 'name email specialization hourlyRate')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      data: consultations
    });

  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
};

// ✅ Get consultation by ID
export const getConsultationById = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await Consultation.findById(consultationId)
      .populate('clientId')
      .populate('lawyerId');

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    res.status(200).json({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error("Error fetching consultation:", error);
    res.status(500).json({ error: "Failed to fetch consultation" });
  }
};
