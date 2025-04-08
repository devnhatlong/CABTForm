const serverDateService = require("../services/serverDateService");

const getServerDate = async (req, res) => {
    try {
        // Gọi service để lấy ngày giờ server
        const serverDate = serverDateService.getServerDate();
        res.status(200).json({ success: true, serverDate });
    } catch (error) {
        console.error("Lỗi khi lấy ngày giờ server:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

module.exports = {
    getServerDate,
};