require('dotenv').config();
const Crime = require("../models/crimeModel");

const createCrime = async (data) => {
    const { crimeName, crimeCode } = data;

    // Kiểm tra xem crimeName đã tồn tại hay chưa
    const existingCrimeName = await Crime.findOne({ crimeName });
    if (existingCrimeName) {
        throw new Error("Tên tội danh đã tồn tại");
    }

    // Kiểm tra xem crimeCode đã tồn tại hay chưa
    const existingCrimeCode = await Crime.findOne({ crimeCode });
    if (existingCrimeCode) {
        throw new Error("Mã tội danh đã tồn tại");
    }

    // Nếu không tồn tại, tạo mới
    return await Crime.create(data);
};

const getCrimes = async (page = 1, limit, crimeName, sort, fields) => {
    try {
        const queries = {};
        
        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Filtering
        if (crimeName) {
            queries.crimeName = { $regex: crimeName, $options: 'i' }; // Tìm kiếm theo tiêu đề (không phân biệt hoa thường)
        }

        // Tạo câu lệnh query
        let queryCommand = Crime.find(queries);

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
        const total = await Crime.countDocuments(queries);

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

const getCrimeById = async (id) => {
    return await Crime.findById(id);
};

const updateCrime = async (id, data) => {
    const { crimeName, crimeCode } = data;

    // Kiểm tra xem crimeName đã tồn tại hay chưa (ngoại trừ bản ghi hiện tại)
    if (crimeName) {
        const existingFieldName = await Crime.findOne({ crimeName, _id: { $ne: id } });
        if (existingFieldName) {
            throw new Error("Tên tội danh đã tồn tại");
        }
    }

    // Kiểm tra xem crimeCode đã tồn tại hay chưa (ngoại trừ bản ghi hiện tại)
    if (crimeCode) {
        const existingFieldCode = await Crime.findOne({ crimeCode, _id: { $ne: id } });
        if (existingFieldCode) {
            throw new Error("Mã tội danh đã tồn tại");
        }
    }

    // Nếu không có lỗi, tiến hành cập nhật
    return await Crime.findByIdAndUpdate(id, data, { new: true });
};

const deleteCrime = async (id) => {
    return await Crime.findByIdAndDelete(id);
};

const deleteMultipleCrimes = async (ids) => {
    const response = await Crime.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createCrime,
    getCrimes,
    getCrimeById,
    updateCrime,
    deleteCrime,
    deleteMultipleCrimes
};