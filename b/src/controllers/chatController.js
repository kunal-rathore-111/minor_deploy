// db functions
const conversationsModel = require("../services/conversationService");
const papersModel = require("../services/paperService");

// agentCoordinator
const agentCoordinator = require("../agents/coordinatorAgent");

const query = async (req, res, next) => {
    try {
        const userId = req.userId;
        const queryText = req.body.query;

        const agentAnswer = await agentCoordinator.runPipeline(queryText);
        const { answer, papers, summary, validation } = agentAnswer;

        const respondFromStoringinConversationModel = await conversationsModel.storeQueryAndAnswer(userId, queryText, answer);
        const queryId = respondFromStoringinConversationModel._id;

        await papersModel.storeInPaperModel(queryId, papers, summary, validation);

        return res.json({
            message: answer,
            urlToExport: `${process.env.BACKEND_BASE_Url}/export/${queryId}`
        });
    } catch (err) {
        next(err);
    }
}

const fetch = async (req, res, next) => {
    try {
        const result = await conversationsModel.getQueries(req.userId);
        if (result.length == 0) {
            throw {
                type: 'Not found',
                status: 404,
                message: "No previous queries found"
            }
        }
        res.json({ result });
    } catch (err) {
        next(err);
    }
}

module.exports = { query, fetch }