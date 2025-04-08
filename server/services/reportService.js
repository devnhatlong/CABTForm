require('dotenv').config();
const Report = require("../models/reportModel");

const createReport = async (reportData) => {
    const report = new Report(reportData);
    return await report.save();
};

const getReports = async (page = 1, limit, fields, sort) => {
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

        let queryCommand = Report.find(queries).populate("districtId", "districtName");

        if (sort) {
            const sortBy = sort.split(",").join(" ");
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort("-createdAt");
        }

        const data = await queryCommand.skip(skip).limit(limit);
        const total = await Report.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getReports:", error);
        throw new Error("Failed to retrieve communes");
    }
};

const getReportById = async (id) => {
    return await Report.findById(id);
};

const updateReport = async (id, updateData) => {
    try {
        // Tìm và cập nhật báo cáo theo ID
        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { $set: updateData }, // Cập nhật các trường
            { new: true } // Trả về tài liệu đã cập nhật
        );

        return updatedReport; // Trả về báo cáo đã cập nhật
    } catch (error) {
        console.error("Lỗi khi cập nhật báo cáo:", error);
        return null; // Trả về null nếu có lỗi
    }
};

const deleteReport = async (id) => {
    return await Report.findByIdAndDelete(id);
};

const deleteMultipleReports = async (ids) => {
    const response = await Report.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    deleteMultipleReports
};