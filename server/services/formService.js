const Form = require("../models/formModel");

const createForm = async (data) => {
    return await Form.create(data);
};

const getForms = async () => {
    return await Form.find();
};

const getFormById = async (id) => {
    return await Form.findById(id);
};

const deleteForm = async (id) => {
    return await Form.findByIdAndDelete(id);
};

module.exports = {
    createForm,
    getForms,
    getFormById,
    deleteForm,
};
