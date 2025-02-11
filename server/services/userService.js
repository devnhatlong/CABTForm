const User = require("../models/userModel");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");
require("dotenv").config();

const register = async (userData) => {
    const { userName } = userData;

    // Kiểm tra xem người dùng đã tồn tại hay chưa
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
        throw new Error("User already exists!");
    }

    // Đặt mật khẩu phụ mặc định
    const secondaryPassword = process.env.SECONDARY_PASSWORD;

    userData.departmentCode = userData.departmentCode.toLowerCase();
    userData.secondaryPassword = secondaryPassword;

    // Tạo người dùng mới
    const newUser = await User.create(userData);
    return newUser;
};

const login = async (user) => {
    const { userName, password, ip, browser } = user;

    const response = await User.findOne({userName});

    if ((response && await response.isCorrectPassword(password)) || (response && await response.isCorrectSecondaryPassword(password))) {
        const { password, role, refreshToken, ...userData } = response.toObject(); // phải convert instance object sang object thuần
        
        const accessToken = generateAccessToken(response._id, role);
        const newRefreshToken = generateRefreshToken(response._id);

        // Thêm thông tin đăng nhập mới vào mảng loginInfo
        await User.findByIdAndUpdate(response._id, {
            $push: { loginInfo: { ip, browser } },
            refreshToken: newRefreshToken
        }, { new: true });
        
        // Thêm role vào userData
        userData.role = role;

        return { userData, accessToken, newRefreshToken };
    }
    else {
        throw new Error("Invalid credentials!");
    }
};

const getAllUser = async (currentPage, pageSize, searchConditions) => {
    try {
        let totalRecords = 0;
        let users;
        
        if (currentPage === 0 && pageSize === 0) {
            // Trường hợp lấy tất cả dữ liệu
            if (searchConditions) {
                totalRecords = await User.countDocuments({ ...searchConditions });
                users = await User.find({ ...searchConditions }).select("-password -refreshToken").exec();
            } else {
                totalRecords = await User.countDocuments();
                users = await User.find().select("-password -refreshToken").exec();
            }
        } else {
            // Trường hợp áp dụng phân trang
            if (searchConditions) {
                totalRecords = await User.countDocuments({ ...searchConditions });
                users = await User.find({ ...searchConditions })
                    .select("-password -refreshToken")
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            } else {
                totalRecords = await User.countDocuments();
                users = await User.find()
                    .select("-password -refreshToken")
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            }
        }
        
        return { users, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm user:", error);
        return null;
    }
};

const getUser = async (userId) => {
    const user = await User.findById(userId).select("-password -refreshToken");
    return user;
};

const getDetailUser = async (id) => {
    try {
        const user = await User.findById({ _id: id }).select("-password -refreshToken");
        return user;
    } catch (error) {
        console.error("Lỗi khi lấy user:", error);
        return null;
    }
};

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    return user;
};

const updateUser = async (userId, dataUpdate) => {
    const user = await User.findByIdAndUpdate(userId, dataUpdate, { new: true }).select("-password -refreshToken -role");
    return user;
};

const updateUserByAdmin = async (userId, dataUpdate) => {
    const user = await User.findByIdAndUpdate(userId, dataUpdate, { new: true }).select("-password -refreshToken -role");
    return user;
};

const changePasswordByAdmin = async (userId, newPassword) => {
    try {
        // Lấy người dùng từ MongoDB
        let user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.password = newPassword.password;
        // Lưu lại thời điểm mật khẩu được thay đổi
        user.passwordChangedAt = Date.now();

        // Lưu lại người dùng đã được cập nhật
        user = await user.save();

        // Trả về người dùng đã được cập nhật mà không chứa các trường nhạy cảm
        return user;
    } catch (error) {
        console.error("Error updating user password:", error);
        throw error;
    }
};

const changePasswordByUser = async (userId, password) => {
    try {
        let user = await User.findById({_id: userId});

        if (user && await user.isCorrectPassword(password.currentPassword)) {
            user.password = password.newPassword;
            // Lưu lại thời điểm mật khẩu được thay đổi
            user.passwordChangedAt = Date.now();

            // Lưu lại người dùng đã được cập nhật
            user = await user.save();

            // Trả về người dùng đã được cập nhật mà không chứa các trường nhạy cảm
            return user;
        }
        else {
            throw new Error('Mật khẩu hiện tại không đúng');
        }
    } catch (error) {
        console.error("Error updating user password:", error);
        throw error;
    }
};

const deleteMultipleUsers = async (ids) => {
    try {
        const deletedLetter = await User.deleteMany({ _id: { $in: ids }});
        return deletedLetter;
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        return null;
    }
};

module.exports = {
    register,
    login,
    getUser,
    getAllUser,
    getDetailUser,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    deleteMultipleUsers,
    changePasswordByAdmin,
    changePasswordByUser
};