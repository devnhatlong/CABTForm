const Criminal = require('../models/criminalModel');

const createCriminal = async (data) => {
    // Tạo mới đối tượng tội phạm
    return await Criminal.create(data);
};

const getCriminals = async (page = 1, limit, fields, sort, socialOrderId) => {
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
            const data = await Criminal.find(queries).sort(sort || "-createdAt");

            return {
                success: true,
                forms: data,
                total: data.length,
            };
        }

        // Sử dụng giá trị limit từ biến môi trường nếu không được truyền
        limit = limit || parseInt(process.env.DEFAULT_LIMIT, 10);

        // Tạo câu lệnh query
        let queryCommand = Criminal.find(queries);

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
        const total = await Criminal.countDocuments(queries);

        return {
            success: true,
            forms: data,
            total,
        };
    } catch (error) {
        console.error("Error in getCriminals:", error);
        throw new Error("Failed to retrieve criminals");
    }
};

const getCriminalById = async (id) => {
    // Lấy thông tin đối tượng tội phạm theo ID
    return await Criminal.findById(id);
};

const getCriminalBySocialOrderId = async (socialOrderId) => {
    return await Criminal.find({ socialOrderId })
        .populate('socialOrderId')
        .populate('crime')
        .populate('province')
        .populate('district')
        .populate('commune');
};

const updateCriminal = async (id, data) => {
    // Cập nhật đối tượng tội phạm
    const updatedCriminal = await Criminal.findByIdAndUpdate(id, data, { new: true });
    if (!updatedCriminal) {
        throw new Error("Đối tượng không tồn tại");
    }
    return updatedCriminal;
};

const deleteCriminal = async (id) => {
    // Xóa đối tượng tội phạm
    const deletedCriminal = await Criminal.findByIdAndDelete(id);
    if (!deletedCriminal) {
        throw new Error("Đối tượng không tồn tại");
    }
    return deletedCriminal;
};

module.exports = {
    createCriminal,
    getCriminals,
    getCriminalById,
    getCriminalBySocialOrderId,
    updateCriminal,
    deleteCriminal,
};