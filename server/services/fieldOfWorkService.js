require('dotenv').config(); 
const FieldOfWork = require("../models/fieldOfWorkModel");

const createFieldOfWork = async (data) => {
    const { fieldName, fieldCode } = data;

    // Kiểm tra xem fieldName đã tồn tại hay chưa
    const existingFieldName = await FieldOfWork.findOne({ fieldName });
    if (existingFieldName) {
        throw new Error("Tên lĩnh vực công việc đã tồn tại");
    }

    // Kiểm tra xem fieldCode đã tồn tại hay chưa
    const existingFieldCode = await FieldOfWork.findOne({ fieldCode });
    if (existingFieldCode) {
        throw new Error("Mã lĩnh vực công việc đã tồn tại");
    }

    // Nếu không tồn tại, tạo mới
    return await FieldOfWork.create(data);
};

const getFieldOfWorks = async (page = 1, limit, fieldName, sort, fields) => {
    try {
        const queries = {};
        
        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Filtering
        if (fieldName) {
            queries.fieldName = { $regex: fieldName, $options: 'i' }; // Tìm kiếm theo tiêu đề (không phân biệt hoa thường)
        }

        // Tạo câu lệnh query
        let queryCommand = FieldOfWork.find(queries);

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort('-createdAt'); // Mặc định sắp xếp theo ngày tạo giảm dần
        }

        // Fields limiting
        if (fields) {
            const selectedFields = fields.split(',').join(' ');
            queryCommand = queryCommand.select(selectedFields);
        } else {
            queryCommand = queryCommand.select('-__v'); // Mặc định loại bỏ trường `__v`
        }

        // Pagination
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);

        // Execute query
        const data = await queryCommand;
        const total = await FieldOfWork.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getFieldOfWorks:", error);
        throw new Error("Failed to retrieve field of works");
    }
};

const getFieldOfWorkById = async (id) => {
    return await FieldOfWork.findById(id);
};

const updateFieldOfWork = async (id, data) => {
    const { fieldName, fieldCode } = data;

    // Kiểm tra xem fieldName đã tồn tại hay chưa (ngoại trừ bản ghi hiện tại)
    if (fieldName) {
        const existingFieldName = await FieldOfWork.findOne({ fieldName, _id: { $ne: id } });
        if (existingFieldName) {
            throw new Error("Tên lĩnh vực công việc đã tồn tại");
        }
    }

    // Kiểm tra xem fieldCode đã tồn tại hay chưa (ngoại trừ bản ghi hiện tại)
    if (fieldCode) {
        const existingFieldCode = await FieldOfWork.findOne({ fieldCode, _id: { $ne: id } });
        if (existingFieldCode) {
            throw new Error("Mã lĩnh vực công việc đã tồn tại");
        }
    }

    // Nếu không có lỗi, tiến hành cập nhật
    return await FieldOfWork.findByIdAndUpdate(id, data, { new: true });
};

const deleteFieldOfWork = async (id) => {
    return await FieldOfWork.findByIdAndDelete(id);
};

const deleteMultipleFieldOfWorks = async (ids) => {
    const response = await FieldOfWork.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createFieldOfWork,
    updateFieldOfWork,
    getFieldOfWorks,
    getFieldOfWorkById,
    deleteFieldOfWork,
    deleteMultipleFieldOfWorks
};