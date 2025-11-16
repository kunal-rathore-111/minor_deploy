//db function
const { findConversation } = require("../services/conversationService");

async function checkConverstationExists(req, res, next) {
    try {
        const userId = req.userId;
        const queryId = req.params.queryId;

        req.result = await findConversation(userId, queryId);
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = { checkConverstationExists }