// files
const generateHtml = require('../agents/htmlAgent');
const generatePdf = require("../utils/pdfGenerator");

const exp = async (req, res) => {
  try {
    console.log("Export controller started");
    
    const conversation = req.result; // have the full conversation

    if (!conversation) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found',
        type: 'NotFound'
      });
    }

    // Validate conversation has required fields
    if (!conversation.query || !conversation.answer) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid conversation data: missing query or answer',
        type: 'ValidationError'
      });
    }

    console.log("Generating HTML...");
    const html = await generateHtml(conversation);
    
    if (!html) {
      throw new Error("Failed to generate HTML");
    }

    console.log("Generating PDF...");
    const pdfBuffer = await generatePdf(html);
    
    if (!pdfBuffer) {
      throw new Error("Failed to generate PDF");
    }

    console.log("Sending PDF response");
    res.header("Content-Type", 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename=conversation.pdf');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Error in export controller:", error);
    
    // Send appropriate error response
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to export conversation',
      type: error.type || 'ExportError',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = { exp };
