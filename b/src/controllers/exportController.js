// files
const generateHtml = require('../agents/htmlAgent');
const generatePdf = require("../utils/pdfGenerator");

const exp = async (req, res, next) => {
  try {
    const conversation = req.result; // full conversation
    const html = await generateHtml(conversation);
    const pdfBuffer = await generatePdf(html);
    res.header("Content-type", 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename=conversation.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { exp };
