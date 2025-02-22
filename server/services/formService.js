const Form = require("../models/formModel");

const createForm = async (data) => {
    return await Form.create(data);
};

const updateForm = async (id, data) => {
    return await Form.findByIdAndUpdate(id, data, { new: true });
};

const getForms = async (page, limit, title) => {
    const skip = (page - 1) * limit;
    const query = title ? { title: { $regex: title, $options: "i" } } : {};
    const forms = await Form.find(query).skip(skip).limit(limit);
    const total = await Form.countDocuments(query);
    return { forms, total };
};

const getFormById = async (id) => {
    return await Form.findById(id);
};

const deleteForm = async (id) => {
    return await Form.findByIdAndDelete(id);
};

module.exports = {
    createForm,
    updateForm,
    getForms,
    getFormById,
    deleteForm,
};