const mongoose = require("mongoose");
const { MongoClient, GridFSBucket } = require("mongodb");

const mongoURI = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@127.0.0.1:27017/solieucoban?authSource=admin`;

let bucket;
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        const db = client.db("solieucoban");
        bucket = new GridFSBucket(db, { bucketName: "uploads" });
        console.log("Kết nối MongoDB thành công và GridFSBucket đã được tạo");
    })
    .catch((err) => {
        console.error("Lỗi kết nối MongoDB:", err);
    });

const getFileById = async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id); // Lấy `_id` từ params

        // Kiểm tra file trong GridFS
        bucket.find({ _id: fileId }).toArray((err, files) => {
            if (err) {
                console.error("Lỗi khi tìm file:", err);
                return res.status(500).json({ success: false, message: "Lỗi khi tìm file" });
            }

            if (!files || files.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy file" });
            }

            // Trả file về client
            res.set("Content-Type", files[0].contentType);
            bucket.openDownloadStream(fileId).pipe(res);
        });
    } catch (error) {
        console.error("Lỗi khi tải file:", error);
        res.status(500).json({ success: false, message: "Lỗi khi tải file" });
    }
};

module.exports = {
    getFileById,
};