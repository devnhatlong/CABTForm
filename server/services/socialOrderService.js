const SocialOrder = require('../models/SocialOrderModel');

const createSocialOrder = async (data) => {
    // Tạo mới vụ việc
    return await SocialOrder.create(data);
};

const getSocialOrders = async (page = 1, limit, fields, sort) => {
    try {
        const queries = {};

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key]) {
                    // Sử dụng regex để tìm kiếm không phân biệt hoa thường
                    queries[key] = { $regex: fields[key], $options: "i" };
                }
            }
        }

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.ALL_RECORDS) {
            const data = await SocialOrder.find(queries).sort(sort || "-createdAt");

            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = SocialOrder.find(queries);

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort('-createdAt'); // Mặc định sắp xếp theo ngày tạo giảm dần
        }

        // Pagination
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);

        // Execute query
        const data = await queryCommand;
        const total = await SocialOrder.countDocuments(queries);

        return {
            success: true,
            forms: data,
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