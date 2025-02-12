const Response = require("../models/responseModel");

const createResponse = async (data) => {
    return await Response.create(data);
};

const getResponsesByForm = async (formId) => {
    return await Response.find({ formId });
};

const getResponseById = async (id) => {
    return await Response.findById(id);
};

module.exports = {
    createResponse,
    getResponsesByForm,
    getResponseById,
};
