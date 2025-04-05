require('dotenv').config();
const District = require("../models/districtModel");

const createDistrict = async (data) => {
    const { districtName, districtCode, provinceId } = data;

    // Kiểm tra nếu districtName đã tồn tại
    const existingDistrict = await District.findOne({ districtName });
    if (existingDistrict) {
        throw new Error("Tên quận/huyện đã tồn tại");
    }

    // Tạo mới quận/huyện
    const newDistrict = new District({
        districtName,
        districtCode: districtCode || "",
        provinceId,
    });

    return await newDistrict.save();
};

const getDistricts = async (page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key]) {
                    queries[key] = { $regex: fields[key], $options: "i" };
                }
            }
        }

        // Pagination và sorting
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);
        const skip = (page - 1) * limit;

        let queryCommand = District.find(queries).populate('provinceId', 'provinceName');

        if (sort) {
            const sortBy = sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort('-createdAt');
        }

        const data = await queryCommand.skip(skip).limit(limit);
        const total = await District.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getDistricts:", error);
        throw new Error("Failed to retrieve districts");
    }
};

const getDistrictById = async (id) => {
    return await District.findById(id);
};

const updateDistrict = async (id, data) => {
    const { districtName, districtCode, provinceId } = data;

    // Kiểm tra nếu districtName đã tồn tại (ngoại trừ bản ghi hiện tại)
    const existingDistrict = await District.findOne({
        districtName,
        _id: { $ne: id },
    });

    if (existingDistrict) {
        throw new Error("Tên quận/huyện đã tồn tại");
    }

    const updatedDistrict = await District.findByIdAndUpdate(
        id,
        { districtName, districtCode, provinceId },
        { new: true }
    );

    return updatedDistrict;
};

const deleteDistrict = async (id) => {
    return await District.findByIdAndDelete(id);
};

const deleteMultipleDistricts = async (ids) => {
    const response = await District.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createDistrict,
    getDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict,
    deleteMultipleDistricts
};