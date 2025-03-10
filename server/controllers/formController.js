const FormService = require("../services/formService");
const asyncHandler = require("express-async-handler");

const createForm = asyncHandler(async (req, res) => {
    const { createdBy } = req.body;

    if (!createdBy) {
        throw new Error("Missing or invalid inputs");
    }

    const response = await FormService.createForm(req.body);

    res.status(response ? 201 : 400).json({
        success: !!response,
        data: response || "Cannot create new form",
    });
});

const getForms = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, title } = req.query;
    const response = await FormService.getForms(Number(page), Number(limit), title);
    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
    });
});

const getFormById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await FormService.getFormById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || "Form not found",
    });
});

const updateForm = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, fields } = req.body;

    if (!title || !fields || !Array.isArray(fields)) {
        throw new Error("Missing or invalid inputs");
    }

    const response = await FormService.updateForm(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || "Cannot update form",
    });
});

const deleteForm = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await FormService.deleteForm(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response ? "Form deleted successfully" : "Cannot delete form",
    });
});

module.exports = {
    createForm,
    getForms,
    getFormById,
    updateForm,
    deleteForm,
};