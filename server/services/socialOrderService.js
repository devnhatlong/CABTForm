const SocialOrder = require('../models/socialOrderModel');

const createSocialOrder = async (data, userId) => {
    // Tạo mới vụ việc
    const payload = { ...data, user: userId };
    return await SocialOrder.create(payload);
};

const getSocialOrders = async (page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key] && fields[key] !== 'all') {
                    // Nếu trường là ID (ví dụ: district, fieldOfWork, crime), áp dụng so sánh trực tiếp
                    if (['district', 'fieldOfWork', 'crime'].includes(key)) {
                        queries[key] = fields[key];
                    }

                    // Xử lý các trường văn bản
                    if (!['district', 'fieldOfWork', 'crime', 'fromDate', 'toDate', 'dateType'].includes(key)) {
                        queries[key] = { $regex: fields[key], $options: "i" };
                    }
                }
            }
        }

        // Lấy tất cả dữ liệu từ cơ sở dữ liệu
        let data = await SocialOrder.find(queries)
            .populate('user', 'userName')
            .populate('fieldOfWork', 'fieldName')
            .populate('district', 'districtName')
            .populate('commune', 'communeName')
            .populate('crime', 'crimeName')
            .sort(sort || "-createdAt");

        // Lọc dữ liệu theo fromDate, toDate, và dateType
        if (fields.fromDate || fields.toDate) {
            const dateField = fields.dateType || 'createdAt'; // Mặc định là createdAt
            data = data.filter((item) => {
                const dateValue = new Date(item[dateField]);
                if (fields.fromDate && new Date(fields.fromDate) > dateValue) {
                    return false; // Loại bỏ nếu nhỏ hơn fromDate
                }
                if (fields.toDate && new Date(fields.toDate) < dateValue) {
                    return false; // Loại bỏ nếu lớn hơn toDate
                }
                return true;
            });
        }

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

const getSocialOrderById = async (id) => {
    // Lấy thông tin vụ việc theo ID
    return await SocialOrder.findById(id);
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