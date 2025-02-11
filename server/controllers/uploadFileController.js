const asyncHandler = require("express-async-handler");
const UploadFileService = require("../services/uploadFileService");
const moment = require('moment');
require('moment-timezone');
const { MongoClient, GridFSBucket } = require('mongodb');

const uri = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost:27017/quanlysohoa?authSource=admin`;
const client = new MongoClient(uri);

const create = asyncHandler(async (req, res) => {
    const { departmentCode } = req.body;
    const { _id } = req.user;

    if (!departmentCode) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp đầy đủ thông tin"
        });
    }

    const response = await UploadFileService.create(departmentCode, req.files, _id);

    return res.status(200).json({
        success: response.success,
        message: response.success ? "Lưu file thành công" : "Lỗi trong quá trình lưu file"
    });
});

const createSoftware = asyncHandler(async (req, res) => {
    const response = await UploadFileService.createSoftware(req.files);

    return res.status(200).json({
        success: response.success,
        message: response.success ? "Lưu file thành công" : "Lỗi trong quá trình lưu file"
    });
});

const getFile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await UploadFileService.getFile(id);
    if (!file) {
        return res.status(404).json({ success: false, message: "File not found" });
    }

    const db = client.db('quanlysohoa');
    const bucket = new GridFSBucket(db, { bucketName: 'files' });
    const downloadStream = bucket.openDownloadStreamByName(file.fileName);

    // Set headers
    res.set('Content-Type', file.type);
    res.set('Content-Disposition', `inline; filename="${file.fileName}"`);

    // Pipe the download stream to response
    downloadStream.pipe(res);
});

const getFileSoftware = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await UploadFileService.getFileSoftware(id);
    if (!file) {
        return res.status(404).json({ success: false, message: "File not found" });
    }

    const db = client.db('quanlysohoa');
    const bucket = new GridFSBucket(db, { bucketName: 'filesoftware' });
    const downloadStream = bucket.openDownloadStreamByName(file.fileName);

    // Set headers
    res.set('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.set('Content-Type', file.contentType); // Đảm bảo rằng loại nội dung cũng được thiết lập chính xác

    // Pipe the download stream to response
    downloadStream.pipe(res);
});

const getFileSoftwareByFileName = asyncHandler(async (req, res) => {
    const { fileName } = req.params;

    const db = client.db('quanlysohoa');
    const bucket = new GridFSBucket(db, { bucketName: 'filesoftware' });
    const downloadStream = bucket.openDownloadStreamByName(fileName);

    // Set headers
    res.set('Content-Disposition', `attachment; filename="${fileName}"`);
    res.set('Content-Type', "application/x-msdownload"); // Đảm bảo rằng loại nội dung cũng được thiết lập chính xác

    // Pipe the download stream to response
    downloadStream.pipe(res);
});

const downloadChrome64bit = asyncHandler(async (req, res) => {
    const { fileName } = req.params;

    const db = client.db('quanlysohoa');
    const bucket = new GridFSBucket(db, { bucketName: 'filesoftware' });
    const downloadStream = bucket.openDownloadStreamByName(fileName);

    // Set headers
    res.set('Content-Disposition', `attachment; filename="${fileName}"`);
    res.set('Content-Type', "application/x-msdownload"); // Đảm bảo rằng loại nội dung cũng được thiết lập chính xác

    // Pipe the download stream to response
    downloadStream.pipe(res);
});

const downloadChrome32bit = asyncHandler(async (req, res) => {
    const { fileName } = req.params;

    const db = client.db('quanlysohoa');
    const bucket = new GridFSBucket(db, { bucketName: 'filesoftware' });
    const downloadStream = bucket.openDownloadStreamByName(fileName);

    // Set headers
    res.set('Content-Disposition', `attachment; filename="${fileName}"`);
    res.set('Content-Type', "application/x-msdownload"); // Đảm bảo rằng loại nội dung cũng được thiết lập chính xác

    // Pipe the download stream to response
    downloadStream.pipe(res);
});

const getDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    const response = await UploadFileService.getDetail(id, _id);
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "Không tìm thấy đơn thư"
    });
});

const getDetailByAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await UploadFileService.getDetailByAdmin(id);
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "Không tìm thấy đơn thư"
    });
});

const getDetailFileSoftwareByAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await UploadFileService.getDetailFileSoftwareByAdmin(id);
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "Không tìm thấy đơn thư"
    });
});

const getAll = asyncHandler(async (req, res) => {
    let { fileName, departmentName } = req.query.filters || {};
    const { currentPage, pageSize } = req.query;
    const { _id } = req.user;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};

    if (fileName) searchConditions.fileName = { $regex: fileName.trim(), $options: 'i' };
    if (departmentName) searchConditions.departmentName = { $regex: departmentName.trim(), $options: 'i' };

    const response = await UploadFileService.getAll(currentPage, pageSize, searchConditions, _id);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response.files : "Không có đơn thư nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

const getAllByAdmin = asyncHandler(async (req, res) => {
    let { fileName, departmentName } = req.query.filters || {};
    const { currentPage, pageSize } = req.query;
    const { _id } = req.user;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};

    if (fileName) searchConditions.fileName = { $regex: fileName.trim(), $options: 'i' };
    if (departmentName) searchConditions.departmentName = { $regex: departmentName.trim(), $options: 'i' };

    const response = await UploadFileService.getAllByAdmin(currentPage, pageSize, searchConditions);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response.files : "Không có đơn thư nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

const getAllFileSoftwareByAdmin = asyncHandler(async (req, res) => {
    let { fileName, departmentName } = req.query.filters || {};
    const { currentPage, pageSize } = req.query;
    const { _id } = req.user;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};

    if (fileName) searchConditions.fileName = { $regex: fileName.trim(), $options: 'i' };
    if (departmentName) searchConditions.departmentName = { $regex: departmentName.trim(), $options: 'i' };

    const response = await UploadFileService.getAllFileSoftwareByAdmin(currentPage, pageSize, searchConditions);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        data: response ? response.files : "Không có đơn thư nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    if (!id) throw new Error("Thiếu id");

    const response = await UploadFileService.update(id, req.body, req.files, _id);

    return res.status(200).json({
        success: response ? true : false,
        updatedLetter: response ? response : "Đã xảy ra lỗi"
    });
});

const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    if (!id) throw new Error("Thiếu id");

    const response = await UploadFileService.deleteItem(id, _id);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có đơn thư nào được xóa"
    });
});

const deleteMultipleItem = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    const { _id } = req.user;

    if (!ids) throw new Error("Thiếu id");

    const response = await UploadFileService.deleteMultipleItem(ids, _id);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có đơn thư nào được xóa"
    });
});

module.exports = {
    create,
    createSoftware,
    getFile,
    getFileSoftware,
    getDetail,
    getDetailByAdmin,
    getDetailFileSoftwareByAdmin,
    getFileSoftwareByFileName,
    getAll,
    getAllByAdmin,
    getAllFileSoftwareByAdmin,
    update,
    deleteItem,
    deleteMultipleItem,
    downloadChrome64bit,
    downloadChrome32bit
}