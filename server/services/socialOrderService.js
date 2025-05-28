const User = require('../models/userModel');
const Department = require('../models/departmentModel');
const Criminal = require('../models/criminalModel');
const FieldOfWork = require('../models/fieldOfWorkModel');
const SocialOrder = require('../models/socialOrderModel'); 

const createSocialOrder = async (data, userId) => {
    // Tạo mới vụ việc
    const payload = { ...data, user: userId };
    return await SocialOrder.create(payload);
};

const getSocialOrders = async (user, page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Nếu không phải admin, xử lý theo departmentId và departmentType
        if (user.role !== "admin") {
            const userData = await User.findById(user._id).select('departmentId');
            if (!userData || !userData.departmentId) {
                throw new Error("Không tìm thấy departmentId của người dùng");
            }

            const departmentData = await Department.findById(userData.departmentId).select('departmentType');
            if (!departmentData) {
                throw new Error("Không tìm thấy thông tin phòng ban");
            }
            
            if (departmentData.departmentType === "Phòng ban") {
                // Lấy danh sách fieldOfWorkId nếu departmentType là "Phòng ban"
                const fieldOfWorks = await FieldOfWork.find({ departmentId: userData.departmentId }).select('_id');
                const fieldOfWorkIds = fieldOfWorks.map((field) => field._id);
                queries.fieldOfWork = { $in: fieldOfWorkIds };
            } else if (departmentData.departmentType === "Xã, phường, thị trấn") {
                // Lọc theo user nếu departmentType là "Xã, phường, thị trấn"
                queries.user = user._id;
            }
        }

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key] && fields[key] !== 'all') {
                    if (['district', 'fieldOfWork', 'crime', 'commune'].includes(key)) {
                        queries[key] = fields[key];
                    }
                    if (!['district', 'fieldOfWork', 'crime', 'commune', 'fromDate', 'toDate', 'dateType'].includes(key)) {
                        queries[key] = { $regex: fields[key], $options: "i" };
                    }
                }
            }
        }

        // Lấy tất cả dữ liệu từ cơ sở dữ liệu
        let data = await SocialOrder.find(queries)
            .populate({
                path: 'user',
                select: 'userName departmentId',
                populate: {
                    path: 'departmentId',
                    select: 'departmentName',
                }
            })
            .populate('fieldOfWork', 'fieldName')
            .populate('district', 'districtName')
            .populate('commune', 'communeName')
            .populate('crime', 'crimeName')
            .sort(sort || "-createdAt");

        // Lọc dữ liệu theo fromDate, toDate, và dateType
        if (fields.fromDate || fields.toDate) {
            const dateField = fields.dateType || 'createdAt';
            data = data.filter((item) => {
                const dateValue = new Date(item[dateField]);
                if (fields.fromDate && new Date(fields.fromDate) > dateValue) {
                    return false;
                }
                if (fields.toDate && new Date(fields.toDate) < dateValue) {
                    return false;
                }
                return true;
            });
        }

        // Đếm số đối tượng (criminal) cho từng SocialOrder
        const socialOrderIds = data.map((item) => item._id);
        const criminalCounts = await Criminal.aggregate([
            { $match: { socialOrderId: { $in: socialOrderIds } } },
            { $group: { _id: "$socialOrderId", count: { $sum: 1 } } },
        ]);

        // Tạo một map để tra cứu nhanh số lượng đối tượng
        const criminalCountMap = criminalCounts.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.count;
            return acc;
        }, {});

        // Gắn số đối tượng vào từng bản ghi SocialOrder
        data = data.map((item) => {
            const obj = item.toObject();
            const departmentName = obj.user?.departmentId?.departmentName || null;
            return {
                ...obj,
                departmentName,
                numberOfSubjects: criminalCountMap[item._id.toString()] || 0,
            };
        });

        // Pagination
        const total = data.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);

        return {
            success: true,
            forms: paginatedData,
            total,
        };
    } catch (error) {
        console.error("Error in getSocialOrders:", error);
        throw new Error("Failed to retrieve social orders");
    }
};

// const getSocialOrderById = async (id) => {
//     // Lấy thông tin vụ việc theo ID
//     return await SocialOrder.findById(id);
// };

const getSocialOrderById = async (id) => {
    try {
        const data = await SocialOrder.findById(id)
            .populate({
                path: 'user',
                select: 'userName departmentId',
                populate: {
                    path: 'departmentId',
                    select: 'departmentName',
                }
            })
            .populate('fieldOfWork', 'fieldName')
            .populate('district', 'districtName')
            .populate('commune', 'communeName')
            .populate('crime', 'crimeName');

        if (!data) {
            throw new Error("Không tìm thấy bản ghi vụ việc");
        }

        // Đếm số đối tượng (criminal) liên quan đến SocialOrder này
        const criminalCount = await Criminal.countDocuments({ socialOrderId: id });

        // Chuyển về object thường và gắn thêm thông tin
        const obj = data.toObject();
        const departmentName = obj.user?.departmentId?.departmentName || null;

        return {
            success: true,
            form: {
                ...obj,
                departmentName,
                numberOfSubjects: criminalCount,
            }
        };
    } catch (error) {
        console.error("Error in getSocialOrderById:", error);
        throw new Error("Không thể lấy thông tin vụ việc");
    }
};

const updateSocialOrder = async (id, data) => {
    // Cập nhật vụ việc
    const updatedSocialOrder = await SocialOrder.findByIdAndUpdate(id, data, { new: true });
    if (!updatedSocialOrder) {
        throw new Error("Vụ việc không tồn tại");
    }
    return updatedSocialOrder;
};

const deleteSocialOrder = async (id) => {
    // Xóa vụ việc
    const deletedSocialOrder = await SocialOrder.findByIdAndDelete(id);
    if (!deletedSocialOrder) {
        throw new Error("Vụ việc không tồn tại");
    }
    return deletedSocialOrder;
};

const deleteMultipleSocialOrders = async (ids) => {
    // Xóa nhiều vụ việc
    const response = await SocialOrder.deleteMany({ _id: { $in: ids } });
    return {
        success: response.deletedCount > 0,
        deletedCount: response.deletedCount,
    };
};

module.exports = {
    createSocialOrder,
    getSocialOrders,
    getSocialOrderById,
    updateSocialOrder,
    deleteSocialOrder,
    deleteMultipleSocialOrders,
};