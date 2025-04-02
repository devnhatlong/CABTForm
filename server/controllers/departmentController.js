const asyncHandler = require("express-async-handler");
const DepartmentService = require("../services/departmentService");
const Department = require("../models/departmentModel");
const xlsx = require('xlsx');

const importFromExcel = async (req, res) => {
    try {
        // Kiểm tra xem file có được tải lên không
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Đọc file Excel từ buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const errors = []; // Danh sách lỗi
        let successCount = 0; // Đếm số bản ghi thành công

        // Lặp qua từng dòng dữ liệu
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { departmentCode, departmentName } = row;

            // Kiểm tra nếu thiếu thông tin bắt buộc
            if (!departmentCode || !departmentName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu mã hoặc tên phòng ban",
                });
                continue;
            }

            // Kiểm tra xem phòng ban đã tồn tại chưa
            const existingDepartment = await Department.findOne({ departmentCode });
            if (existingDepartment) {
                errors.push({
                    row: i + 1,
                    message: `Phòng ban đã tồn tại (departmentCode: ${departmentCode})`,
                });
                continue;
            }

            // Tạo mới phòng ban
            const newDepartment = new Department({
                departmentCode,
                departmentName,
            });

            await newDepartment.save();
            successCount++; // Tăng số bản ghi thành công
        }

        // Trả về kết quả
        res.status(200).json({
            success: true,
            message: "Import hoàn tất",
            successCount,
            errorCount: errors.length,
            errors, // Danh sách lỗi
        });
    } catch (error) {
        console.error('Error importing department:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createDepartment = asyncHandler(async(req, res) => { 
    const { departmentCode, departmentName } = req.body;

    if (!departmentCode || !departmentName) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required information"
        });
    }

    const response = await DepartmentService.createDepartment(req.body);
    return res.status(200).json({
        success: response ? true : false,
        message: response ? "Create is successfully" : "Something went wrong"
    });
});

const getAllDepartment = asyncHandler(async (req, res) => {
    let { departmentCode, departmentName } = req.query.filters || {};
    const { currentPage, pageSize } = req.query;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};
    if (departmentCode) searchConditions.departmentCode = { $regex: departmentCode.trim(), $options: 'i' };
    if (departmentName) searchConditions.departmentName = { $regex: departmentName.trim(), $options: 'i' };

    const response = await DepartmentService.getAllDepartment(currentPage, pageSize, searchConditions);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        departments: response ? response.departments : "Không có user nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

const getDetailDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await DepartmentService.getDetailDepartment(id);
    return res.status(200).json({
        success: response ? true : false,
        department: response ? response : "Không tìm thấy người dùng"
    });
});

const deleteDepartment = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    if (!id) throw new Error("Missing id");

    const response = await DepartmentService.deleteDepartment(id);

    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response ? response : `No user delete`
    });
});

const updateDepartment = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    if (!id || Object.keys(req.body).length === 0) throw new Error("Missing id");

    const response = await DepartmentService.updateDepartment(id, req.body);

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : `Some thing went wrong`
    });
});

const deleteMultipleDepartments = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await DepartmentService.deleteMultipleDepartments(ids);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có người dùng nào được xóa"
    });
});

module.exports = {
    importFromExcel,
    createDepartment,
    getAllDepartment,
    updateDepartment,
    getDetailDepartment,
    deleteDepartment,
    deleteMultipleDepartments
}