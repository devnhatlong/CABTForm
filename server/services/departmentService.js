const Department = require("../models/departmentModel");

const createDepartment = async (departmentData) => {
    const { departmentCode } = departmentData;

    // Kiểm tra xem Department đã tồn tại hay chưa
    const existingDepartment = await Department.findOne({ departmentCode });
    if (existingDepartment) {
        throw new Error("Department already exists!");
    }

    // Tạo Department mới
    const newDepartment = await Department.create(departmentData);
    return newDepartment;
};

const getAllDepartment = async (currentPage, pageSize, searchConditions) => {
    try {
        let totalRecords = 0;
        let departments;
        
        if (currentPage === 0 && pageSize === 0) {
            // Trường hợp lấy tất cả dữ liệu
            if (searchConditions) {
                totalRecords = await Department.countDocuments({ ...searchConditions });
                departments = await Department.find({ ...searchConditions }).exec();
            } else {
                totalRecords = await Department.countDocuments();
                departments = await Department.find().exec();
            }
        } else {
            // Trường hợp áp dụng phân trang
            if (searchConditions) {
                totalRecords = await Department.countDocuments({ ...searchConditions });
                departments = await Department.find({ ...searchConditions })
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            } else {
                totalRecords = await Department.countDocuments();
                departments = await Department.find()
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            }
        }
        
        return { departments, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm department:", error);
        return null;
    }
};

const getDetailDepartment = async (id) => {
    try {
        const department = await Department.findById({ _id: id });
        return department;
    } catch (error) {
        console.error("Lỗi khi lấy department:", error);
        return null;
    }
};

const deleteDepartment = async (departmentId) => {
    const department = await Department.findByIdAndDelete(departmentId);
    return department;
};

const updateDepartment = async (departmentId, dataUpdate) => {
    const department = await Department.findByIdAndUpdate(departmentId, dataUpdate, { new: true });
    return department;
};

const deleteMultipleDepartments = async (ids) => {
    try {
        const deletedDepartment = await Department.deleteMany({ _id: { $in: ids }});
        return deletedDepartment;
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        return null;
    }
};

module.exports = {
    createDepartment,
    getAllDepartment,
    getDetailDepartment,
    deleteDepartment,
    updateDepartment,
    deleteMultipleDepartments
};