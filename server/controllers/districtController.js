require('dotenv').config();
const DistrictService = require("../services/districtService");
const District = require("../models/districtModel");
const Province = require("../models/provinceModel");
const asyncHandler = require("express-async-handler");
const xlsx = require('xlsx');

const importFromExcel = async (req, res) => {
    try {
        // Check if a file is provided
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the Excel file from buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const errors = []; // Lưu danh sách lỗi
        let successCount = 0; // Đếm số bản ghi thành công

        // Iterate over the data and create districts
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { districtName, districtCode, provinceName } = row;

            // Kiểm tra nếu thiếu districtName hoặc provinceName
            if (!districtName || !provinceName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu tên quận/huyện hoặc tên tỉnh/thành phố",
                });
                continue;
            }

            // Kiểm tra xem provinceName có tồn tại trong Province hay không
            const existingProvince = await Province.findOne({ provinceName });
            if (!existingProvince) {
                errors.push({
                    row: i + 1,
                    message: `Tên tỉnh/thành phố không tồn tại (provinceName: ${provinceName})`,
                });
                continue;
            }

            // Kiểm tra xem districtName đã tồn tại hay chưa
            const existingDistrict = await District.findOne({ districtName });
            if (existingDistrict) {
                errors.push({
                    row: i + 1,
                    message: `Tên quận/huyện đã tồn tại (districtName: ${districtName})`,
                });
                continue;
            }

            // Tạo mới quận/huyện
            const newDistrict = new District({
                districtName,
                districtCode: districtCode || "", // districtCode là tùy chọn
                provinceId: existingProvince._id, // Liên kết với tỉnh/thành phố
            });

            await newDistrict.save();
            successCount++; // Tăng số bản ghi thành công
        }

        res.status(200).json({
            success: true,
            message: "Import hoàn tất",
            successCount,
            errorCount: errors.length,
            errors, // Trả về danh sách lỗi
        });
    } catch (error) {
        console.error('Error importing districts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createDistrict = asyncHandler(async (req, res) => {
    const { districtName, provinceId } = req.body;

    if (!districtName || !provinceId) {
        throw new Error("Thiếu tên quận/huyện hoặc mã tỉnh/thành phố");
    }

    const response = await DistrictService.createDistrict(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo quận/huyện thành công",
    });
});

const getDistricts = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    const response = await DistrictService.getDistricts(page, limit, fields, sort);

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách quận/huyện thành công",
    });
});

const getDistrictById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DistrictService.getDistrictById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin quận/huyện thành công"
            : "Không tìm thấy quận/huyện",
    });
});

const updateDistrict = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { districtName, provinceId } = req.body;

    if (!districtName || !provinceId) {
        throw new Error("Thiếu tên quận/huyện hoặc mã tỉnh/thành phố");
    }

    const response = await DistrictService.updateDistrict(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật quận/huyện thành công"
            : "Không thể cập nhật quận/huyện",
    });
});

const deleteDistrict = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await DistrictService.deleteDistrict(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa quận/huyện thành công"
            : "Không thể xóa quận/huyện",
    });
});

const deleteMultipleDistricts = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await DistrictService.deleteMultipleDistricts(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa quận/huyện thành công"
            : "Không thể xóa quận/huyện",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    importFromExcel,
    createDistrict,
    getDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict,
    deleteMultipleDistricts
};