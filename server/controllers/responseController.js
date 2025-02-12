const ResponseService = require("../services/responseService");
const asyncHandler = require("express-async-handler");

const createResponse = asyncHandler(async (req, res) => {
    const { formId, userId, answers } = req.body;

    if (!formId || !userId || !answers || !Array.isArray(answers)) {
        throw new Error("Missing or invalid inputs");
    }

    const response = await ResponseService.createResponse(req.body);

    res.status(response ? 201 : 400).json({
        success: !!response,
        data: response || "Cannot submit response",
    });
});

const getResponsesByForm = asyncHandler(async (req, res) => {
    const { formId } = req.params;
    const response = await ResponseService.getResponsesByForm(formId);

    res.status(200).json({
        success: true,
        data: response,
    });
});

const getResponseById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await ResponseService.getResponseById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || "Response not found",
    });
});

module.exports = {
    createResponse,
    getResponsesByForm,
    getResponseById,
};
