const User = require('../models/userModel');
const Department = require('../models/departmentModel');
const Criminal = require('../models/criminalModel');
const FieldOfWork = require('../models/fieldOfWorkModel');
const SocialOrder = require('../models/socialOrderModel');
const SocialOrderHistory = require('../models/socialOrderHistoryModel');
const District = require('../models/districtModel');
const Commune = require('../models/communeModel');
const Crime = require('../models/crimeModel');

const recordHistory = async ({ socialOrderId, userId, action, dataSnapshot }) => {
    const history = await SocialOrderHistory.create({
        socialOrderId,
        updatedBy: userId,
        action,
        dataSnapshot,
        updatedAt: new Date(),
    });

    return history;
};

const createSocialOrder = async (data, userId) => {
    try {
        // Đảm bảo có userId
        if (!data.user) {
            data.user = userId;
        }

        // Tạo bản ghi SocialOrder
        const created = await SocialOrder.create({ ...data, createdBy: userId });

        // Gán originalId = _id chính nó
        created.originalId = created._id;
        await created.save();

        // Ghi lịch sử tạo mới
        const history = await recordHistory({
            socialOrderId: created._id,
            userId,
            action: 'Tạo mới',
            dataSnapshot: created
        });

        // Trả về cả bản ghi và history
        return {
            socialOrder: created,
            history: history,
        };
    } catch (error) {
        console.error("Error creating SocialOrder:", error);
        throw error;
    }
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

const updateSocialOrder = async (id, newData, userId) => {
    try {
        // Tìm bản ghi hiện tại (bản ghi cũ)
        const current = await SocialOrder.findById(id);
        if (!current) {
            throw new Error("Vụ việc không tồn tại");
        }
    
        // Loại bỏ các trường không cần thiết trước khi cập nhật
        const { _id, createdAt, updatedAt, ...cleanedData } = newData;
    
        // Cập nhật dữ liệu mới, trả về bản ghi cập nhật
        const updatedRecord = await SocialOrder.findByIdAndUpdate(id, cleanedData, { new: true });
    
        // Lưu bản lịch sử với snapshot của bản ghi mới (đã cập nhật)
        const history = await recordHistory({
            socialOrderId: updatedRecord.originalId || updatedRecord._id,  // fallback nếu originalId undefined
            userId,
            action: 'Cập nhật vụ việc',
            dataSnapshot: updatedRecord.toObject(),
        });
    
        return {
            socialOrder: updatedRecord,
            history: history,
        };
    } catch (error) {
        console.error("Error updating SocialOrder:", error);
        throw new Error("Không thể cập nhật vụ việc");
    }
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

const getHistoryBySocialOrderId = async (socialOrderId) => {
    try {
        // B1: Tìm bản ghi SocialOrder
        const record = await SocialOrder.findById(socialOrderId);
        if (!record) {
            throw new Error("Vụ việc không tồn tại");
        }

        // B2: Lấy originalId, nếu không có thì dùng chính _id
        const originalId = record.originalId;

        // B3: Lấy lịch sử theo originalId
        const histories = await SocialOrderHistory.find({ socialOrderId: originalId })
            .populate('updatedBy', 'userName')
            .sort({ createdAt: 1 });

        return histories;
    } catch (error) {
        console.error("Error fetching history:", error);
        throw new Error("Không thể lấy lịch sử chỉnh sửa");
    }
};

const getHistoryDetailByHistoryId = async (historyId) => {
    try {
        const historyRecord = await SocialOrderHistory.findById(historyId)
            .populate('updatedBy', 'userName')
            .lean(); // dùng lean để dễ thao tác với object JS thuần

        if (!historyRecord) {
            throw new Error("Không tìm thấy bản ghi lịch sử");
        }

        const snapshot = historyRecord.dataSnapshot;

        // Dùng Promise.all để lấy thông tin chi tiết cho các trường có _id
        const [
            user,
            fieldOfWork,
            district,
            commune,
            crime
        ] = await Promise.all([
            snapshot.user ? User.findById(snapshot.user).select('userName') : null,
            snapshot.fieldOfWork ? FieldOfWork.findById(snapshot.fieldOfWork).select('fieldName') : null,
            snapshot.district ? District.findById(snapshot.district).select('districtName') : null,
            snapshot.commune ? Commune.findById(snapshot.commune).select('communeName') : null,
            snapshot.crime ? Crime.findById(snapshot.crime).select('crimeName') : null,
        ]);

        // Gộp thông tin lại
        return {
            ...historyRecord,
            dataSnapshot: {
                ...snapshot,
                user,
                fieldOfWork,
                district,
                commune,
                crime
            }
        };
    } catch (error) {
        console.error("Error fetching history by ID:", error);
        throw new Error("Không thể lấy bản ghi lịch sử");
    }
};

module.exports = {
    createSocialOrder,
    getSocialOrders,
    getSocialOrderById,
    updateSocialOrder,
    deleteSocialOrder,
    deleteMultipleSocialOrders,
    getHistoryBySocialOrderId,
    getHistoryDetailByHistoryId
};