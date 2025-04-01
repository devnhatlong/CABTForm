const FieldOfWorkService = require("../services/fieldOfWorkService");
const asyncHandler = require("express-async-handler");

const createFieldOfWork = asyncHandler(async (req, res) => {
    const { fieldName, fieldCode } = req.body;

    if (!fieldName || !fieldCode) {
        throw new Error("Thiếu tên hoặc mã lĩnh vực vụ việc");
    }

    const response = await FieldOfWorkService.createFieldOfWork(req.body);

    res.status(201).json({
        success: true,
        data: response,
        message: "Tạo lĩnh vực vụ việc thành công",
    });
});

const getFieldOfWorks = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort, fields } = req.query;

    const response = await FieldOfWorkService.getFieldOfWorks(
        Number(page),
        limit ? Number(limit) : undefined,
        req.query.fieldName,
        sort,
        fields
    );

    res.status(200).json({
        success: true,
        data: response.forms,
        total: response.total,
        message: "Lấy danh sách lĩnh vực vụ việc thành công",
    });
});

const getFieldOfWorkById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await FieldOfWorkService.getFieldOfWorkById(id);

    res.status(response ? 200 : 404).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Lấy thông tin lĩnh vực vụ việc thành công"
            : "Không tìm thấy lĩnh vực vụ việc",
    });
});

const updateFieldOfWork = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fieldName, fieldCode } = req.body;

    if (!fieldName || !fieldCode) {
        throw new Error("Thiếu tên hoặc mã lĩnh vực vụ việc");
    }

    const response = await FieldOfWorkService.updateFieldOfWork(id, req.body);

    res.status(response ? 200 : 400).json({
        success: !!response,
        data: response || null,
        message: response
            ? "Cập nhật lĩnh vực vụ việc thành công"
            : "Không thể cập nhật lĩnh vực vụ việc",
    });
});

const deleteFieldOfWork = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await FieldOfWorkService.deleteFieldOfWork(id);

    res.status(response ? 200 : 400).json({
        success: !!response,
        message: response
            ? "Xóa lĩnh vực vụ việc thành công"
            : "Không thể xóa lĩnh vực vụ việc",
    });
});

const deleteMultipleFieldOfWorks = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await FieldOfWorkService.deleteMultipleFieldOfWorks(ids);

    res.status(response.success ? 200 : 400).json({
        success: response.success,
        message: response.success
            ? "Xóa lĩnh vực vụ việc thành công"
            : "Không thể xóa lĩnh vực vụ việc",
        deletedCount: response.deletedCount,
    });
});

module.exports = {
    createFieldOfWork,
    getFieldOfWorks,
    getFieldOfWorkById,
    updateFieldOfWork,
    deleteFieldOfWork,
    deleteMultipleFieldOfWorks
};