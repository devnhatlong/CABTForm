const SocialOrderAnnex = require('../models/SocialOrderAnnexModel');

const createAnnex = async (data) => {
    // Tạo mới phụ lục
    return await SocialOrderAnnex.create(data);
};

const getAnnexes = async (page = 1, limit, fields, sort, socialOrderId) => {
    try {
        const queries = {};

        // Lọc theo vụ việc (socialOrderId)
        if (socialOrderId) {
            queries.socialOrderId = socialOrderId;
        }

        // Xử lý các trường trong fields để tạo bộ lọc
        if (fields) {
            for (const key in fields) {
                if (fields[key]) {
                    queries[key] = { $regex: fields[key], $options: "i" };
                }
            }
        }

        // Nếu limit là "ALL", lấy toàn bộ dữ liệu
        if (limit === process.env.ALL_RECORDS) {
            const data = await SocialOrderAnnex.find(queries).sort(sort || "-createdAt");

            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = SocialOrderAnnex.find(queries);

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
        const total = await SocialOrderAnnex.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getAnnexes:", error);
        throw new Error("Failed to retrieve annexes");
    }
};

const getAnnexById = async (id) => {
    // Lấy thông tin phụ lục theo ID
    return await SocialOrderAnnex.findById(id);
};

const getAnnexBySocialOrderId = async (socialOrderId) => {
    return await SocialOrderAnnex.findOne({ socialOrderId });
};

const updateAnnex = async (id, data) => {
    // Cập nhật phụ lục
    const updatedAnnex = await SocialOrderAnnex.findByIdAndUpdate(id, data, { new: true });
    if (!updatedAnnex) {
        throw new Error("Phụ lục không tồn tại");
    }
    return updatedAnnex;
};

const deleteAnnex = async (id) => {
    // Xóa phụ lục
    const deletedAnnex = await SocialOrderAnnex.findByIdAndDelete(id);
    if (!deletedAnnex) {
        throw new Error("Phụ lục không tồn tại");
    }
    return deletedAnnex;
};

module.exports = {
    createAnnex,
    getAnnexes,
    getAnnexById,
    getAnnexBySocialOrderId,
    updateAnnex,
    deleteAnnex,
};