require('dotenv').config();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Report = require("../models/reportModel");

let bucket;
mongoose.connection.once("open", () => {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
});

const createReport = async (reportData) => {
    const report = new Report(reportData);
    return await report.save();
};

const getReports = async (page = 1, limit, fields, sort) => {
    try {
        // Chuẩn bị bộ lọc truy vấn
        const queries = {};

        if (fields) {
            for (const key in fields) {
                if (fields[key]) {
                    queries[key] = { $regex: fields[key], $options: "i" }; // Tìm kiếm không phân biệt chữ hoa/thường
                }
            }
        }

        // Xử lý phân trang
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10); // Số lượng mục trên mỗi trang
        const skip = (page - 1) * limit;

        // Tạo truy vấn
        let queryCommand = Report.find(queries)
            .populate("userId", "userName") // Populate thông tin người dùng
            .populate("topicId", "topicName") // Populate thông tin chuyên đề
            .populate("reportTypeId", "reportTypeName") // Populate thông tin loại báo cáo
            .select("-__v"); // Loại bỏ trường không cần thiết

        // Xử lý sắp xếp
        if (sort) {
            const sortBy = sort.split(",").join(" ");
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort("-createdAt"); // Mặc định sắp xếp theo ngày tạo giảm dần
        }

        // Thực hiện truy vấn với phân trang
        const data = await queryCommand.skip(skip).limit(limit);
        const total = await Report.countDocuments(queries); // Tổng số báo cáo phù hợp

        // Lấy thông tin filename từ GridFS
        const reportsWithFilename = await Promise.all(
            data.map(async (report) => {
                if (report.fileId) {
                    const files = await bucket.find({ _id: report.fileId }).toArray();
                    if (files.length > 0) {
                        report = report.toObject(); // Chuyển sang object để thêm trường mới
                        report.filename = files[0].filename; // Thêm filename từ GridFS
                    }
                }
                return report;
            })
        );

        return {
            success: true,
            forms: reportsWithFilename,
            total,
        };
    } catch (error) {
        console.error("Lỗi trong getReports:", error);
        throw new Error("Không thể lấy danh sách báo cáo");
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