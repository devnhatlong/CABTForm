require('dotenv').config();
const asyncHandler = require("express-async-handler");
const UserService = require("../services/userService");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../middlewares/jwt");
const User = require("../models/userModel");
const xlsx = require('xlsx');
const crypto = require("crypto");

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
            const { userName, departmentCode, departmentName, role } = row;

            // Kiểm tra nếu thiếu thông tin bắt buộc
            if (!userName || !departmentCode || !departmentName) {
                errors.push({
                    row: i + 1,
                    message: "Thiếu thông tin bắt buộc (userName, departmentCode, departmentName)",
                });
                continue;
            }

            // Kiểm tra xem người dùng đã tồn tại chưa
            const existingUser = await User.findOne({ userName });
            if (existingUser) {
                errors.push({
                    row: i + 1,
                    message: `Người dùng đã tồn tại (userName: ${userName})`,
                });
                continue;
            }

            // Tạo mật khẩu mặc định
            const hashedPassword = process.env.DEFAULT_PASSWORD;
            const hashedSecondaryPassword = process.env.SECONDARY_PASSWORD;

            // Tạo mới người dùng
            const newUser = new User({
                userName,
                password: hashedPassword,
                secondaryPassword: hashedSecondaryPassword,
                departmentCode,
                departmentName,
                role: role || 'user', // Mặc định role là 'user' nếu không có
            });

            await newUser.save();
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
        console.error('Error importing users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const register = asyncHandler(async(req, res) => { 
    const { userName, password, departmentCode, departmentName, role } = req.body;

    if (!userName || !password || !departmentCode || !departmentName || !role) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required information"
        });
    }

    const response = await UserService.register(req.body);
    return res.status(200).json({
        success: response ? true : false,
        message: response ? "Register is successfully" : "Something went wrong"
    });
});

const login = asyncHandler(async(req, res) => { 
    const { userName, password } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req.body.ip = clientIp;
    
    if (!userName || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required information"
        });
    }

    const response = await UserService.login(req.body);
    const { accessToken, newRefreshToken, ...userData} = response;

    // refreshToken => dùng để cấp mới accesstoken
    // accesstoken => dùng để xác thực người dùng, quyền người dùng, phân quyền người dùng
    // // Save refreshToken into cookie
    // res.cookie("refreshToken", newRefreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000, secure: false, sameSite: 'strict' });

    return res.status(200).json({
        success: response ? true : false,
        accessToken,
        newRefreshToken,
        message: userData
    });
});

const getAllUser = asyncHandler(async (req, res) => {
    let { userName, departmentCode, departmentName, role } = req.query.filters || {};
    const { currentPage, pageSize } = req.query;

    // Xây dựng các điều kiện tìm kiếm dựa trên các tham số được cung cấp
    const searchConditions = {};
    if (userName) searchConditions.userName = { $regex: userName.trim(), $options: 'i' };
    if (departmentCode) searchConditions.departmentCode = { $regex: departmentCode.trim(), $options: 'i' };
    if (departmentName) searchConditions.departmentName = { $regex: departmentName.trim(), $options: 'i' };
    if (role) searchConditions.role = { $regex: role.trim(), $options: 'i' };

    const response = await UserService.getAllUser(currentPage, pageSize, searchConditions);

    // Trả về danh sách các đơn thư phù hợp với yêu cầu tìm kiếm
    return res.status(200).json({
        success: response ? true : false,
        users: response ? response.users : "Không có user nào được tìm thấy",
        totalRecord: response ? response.totalRecords : 0
    });
});

const getUser = asyncHandler(async(req, res) => { 
    const { _id } = req.user;
    
    const response = await UserService.getUser(_id);
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : "User not found"
    });
});

const getDetailUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await UserService.getDetailUser(id);
    return res.status(200).json({
        success: response ? true : false,
        user: response ? response : "Không tìm thấy người dùng"
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get token from cookies
    const refreshTokenFromBody = req.body.refreshToken;

    // check cookie exist
    if (!req.body && !req.body.refreshToken) {
        throw new Error("No refresh token in body");
    }

    // verify token
    const result = await jwt.verify(refreshTokenFromBody, process.env.JWT_SECRET);

    const response = await User.findOne({ _id: result._id, refreshToken: refreshTokenFromBody });
        
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : "Refresh token not matched"
    });
});

const logout = asyncHandler(async(req, res) => { 
    // get token from body
    const refreshTokenFromBody = req.body.refreshToken;

    // Update refresh token in db
    await User.findOneAndUpdate({refreshToken: refreshTokenFromBody}, {refreshToken: ""}, {new: true});

    // Delete refresh token ib cookie browser
    // res.clearCookie("refreshToken", {
    //     httpOnly: true,
    //     secure: true
    // });

    return res.status(200).json({
        success: true,
        message: "Logout is done"
    });
});

/**
 * Client send email registered
 * Server check email is valid or not
 * if email valid => send mail + link (password changed token)
 * Client check mail => click the link
 * Client send api have token
 * Sever check token the same token the server sent
 * If same => change password
*/

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) throw new Error("Missing email");

    const user = await User.findOne({email: email});

    if (!user) throw new Error("User not found");

    const resetToken = user.createPasswordChangedToken();
    
    await user.save();

    const html = `
        <h1>Password Change Request</h1>
        <div>We've received a password change request for your Cuahangdientu account.</div>
        <div>This link will expire in 15 minutes. If you did not request a password change, please ignore this email, no changes will be made to your account.</div>
        <div>To change your password, click the link below:</div>
        <a href="${process.env.URL_SERVER}/api/user/reset-password/${resetToken}">Click here</a>
    `;

    const data = {
        email: email,
        html: html
    }

    const result = await sendMail(data);

    return res.status(200).json({
        success: true,
        message: result
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;

    if (!password || !token) throw new Error("Missing input");

    const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({passwordResetToken: passwordResetToken, passwordResetExpires: {$gt: Date.now()}}); // passwordResetExpires > Date.now()

    if (!user) throw new Error("Invalid reset token");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
        success: user ? true : false,
        message: user ? "Updated password" : "Something went wrong"
    });
});

const getUsers = asyncHandler(async (req, res) => { 
    const response = await User.find().select("-password -refreshToken -role -passwordChangedAt -passwordResetExpires -passwordResetToken");;

    return res.status(200).json({
        success: response ? true : false,
        users: response
    });
});

const deleteUser = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    if (!id) throw new Error("Missing id");

    const response = await UserService.deleteUser(id);

    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response ? response : `No user delete`
    });
});

const updateUser = asyncHandler(async (req, res) => { 
    const { _id } = req.user;

    if (!_id || Object.keys(req.body).length === 0) throw new Error("Missing id");

    const response = await UserService.updateUser(_id, req.body);

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : `Some thing went wrong`
    });
});

const updateUserByAdmin = asyncHandler(async (req, res) => { 
    const { uid } = req.params;
    
    if (Object.keys(req.params).length === 0) throw new Error("Missing id");

    const response = await UserService.updateUserByAdmin(uid, req.body);

    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : `Some thing went wrong`
    });
});

const changePasswordByAdmin = asyncHandler(async (req, res) => { 
    const { id } = req.params;

    if (Object.keys(req.params).length === 0) throw new Error("Missing id");

    const response = await UserService.changePasswordByAdmin(id, req.body);

    return res.status(200).json({
        success: response ? true : false
    });
});

const changePasswordByUser = asyncHandler(async (req, res) => { 
    const { _id } = req.user;

    if (!_id) throw new Error("Missing id");

    const response = await UserService.changePasswordByUser(_id, req.body);

    return res.status(200).json({
        success: response ? true : false
    });
});

const deleteMultipleUsers = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids) throw new Error("Thiếu id");

    const response = await UserService.deleteMultipleUsers(ids);

    return res.status(200).json({
        success: response ? true : false,
        deletedLetter: response ? response : "Không có người dùng nào được xóa"
    });
});

module.exports = {
    importFromExcel,
    register,
    login,
    getUser,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    getDetailUser,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    getAllUser,
    deleteMultipleUsers,
    changePasswordByAdmin,
    changePasswordByUser
}