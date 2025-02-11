const File = require('../models/fileModel'); // Import mô hình tập tin
const FileSoftware = require('../models/fileSoftwareModel'); 
const Department = require('../models/departmentModel');
const fs = require('fs');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');

const uri = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost:27017/quanlysohoa?authSource=admin`;
const client = new MongoClient(uri);

const create = async (departmentCode, fileDataList, userId) => {
    try {
        const department = await Department.findOne({ departmentCode: departmentCode });
        if (!department) {
            throw new Error("Không tìm thấy bộ phận");
        }

        await client.connect();

        const db = client.db('quanlysohoa');
        const bucket = new GridFSBucket(db, { bucketName: 'files' });

        const savedFiles = [];

        for (const fileData of fileDataList) {
            const writeStream = bucket.openUploadStream(fileData.filename);
            const readStream = fs.createReadStream(fileData.path);

            await new Promise((resolve, reject) => {
                readStream.pipe(writeStream)
                    .on('error', reject)
                    .on('finish', () => {
                        savedFiles.push({
                            _id: new ObjectId(),
                            userId: userId,
                            departmentName: department.departmentName,
                            departmentCode: departmentCode,
                            fileName: fileData.filename,
                            size: fileData.size,
                            type: fileData.mimetype,
                            path: `fs/${fileData.filename}`
                        });
                        fs.unlinkSync(fileData.path);
                        resolve();
                    });
            });
        }

        const insertedFiles = await File.insertMany(savedFiles);

        await client.close();

        return { success: true, message: "Lưu file thành công" };
    } catch (error) {
        console.error("Lỗi trong quá trình lưu file:", error);
        await client.close();
        throw new Error("Lỗi trong quá trình lưu file: " + error.message);
    }
};

const createSoftware = async (fileDataList) => {
    try {
        await client.connect();

        const db = client.db('quanlysohoa');
        const bucket = new GridFSBucket(db, { bucketName: 'filesoftware' });

        const savedFiles = [];

        for (const fileData of fileDataList) {
            const writeStream = bucket.openUploadStream(fileData.filename);
            const readStream = fs.createReadStream(fileData.path);

            await new Promise((resolve, reject) => {
                readStream.pipe(writeStream)
                    .on('error', reject)
                    .on('finish', () => {
                        savedFiles.push({
                            _id: new ObjectId(),
                            fileName: fileData.filename,
                            size: fileData.size,
                            type: fileData.mimetype,
                            path: `fs/${fileData.filename}`
                        });
                        fs.unlinkSync(fileData.path);
                        resolve();
                    });
            });
        }

        await FileSoftware.insertMany(savedFiles);

        await client.close();

        return { success: true, message: "Lưu file thành công" };
    } catch (error) {
        console.error("Lỗi trong quá trình lưu file:", error);
        await client.close();
        throw new Error("Lỗi trong quá trình lưu file: " + error.message);
    }
};

const getFile = async (id) => {
    try {
        const file = await File.findById(id);
        return file;
    } catch (error) {
        console.error("Error retrieving file:", error);
        return null;
    }
};

const getFileSoftware = async (id) => {
    try {
        const file = await FileSoftware.findById(id);
        return file;
    } catch (error) {
        console.error("Error retrieving file:", error);
        return null;
    }
};

const getDetail = async (id, userId) => {
    try {
        const file = await File.find({ _id: id, userId: userId });
        return file;
    } catch (error) {
        console.error("Lỗi khi lấy đơn thư:", error);
        return null;
    }
};

const getDetailByAdmin = async (id) => {
    try {
        const file = await File.find({ _id: id });
        return file;
    } catch (error) {
        console.error("Lỗi khi lấy đơn thư:", error);
        return null;
    }
};

const getDetailFileSoftwareByAdmin = async (id) => {
    try {
        const file = await FileSoftware.find({ _id: id });
        return file;
    } catch (error) {
        console.error("Lỗi khi lấy đơn thư:", error);
        return null;
    }
};

const getAll = async (currentPage, pageSize, searchConditions, userId) => {
    try {
        let totalRecords = 0;
        let files;
        
        if (currentPage === 0 && pageSize === 0) {
            // Trường hợp lấy tất cả dữ liệu
            if (searchConditions) {
                totalRecords = await File.countDocuments({ ...searchConditions, userId: userId });
                files = await File.find({ ...searchConditions, userId: userId }).exec();
            } else {
                totalRecords = await File.countDocuments({ userId: userId });
                files = await File.find({ userId: userId }).exec();
            }
        } else {
            // Trường hợp áp dụng phân trang
            if (searchConditions) {
                totalRecords = await File.countDocuments({ ...searchConditions, userId: userId });
                files = await File.find({ ...searchConditions, userId: userId })
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            } else {
                totalRecords = await File.countDocuments({ userId: userId });
                files = await File.find({ userId: userId })
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            }
        }
        
        return { files, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm kiếm đơn thư:", error);
        return null;
    }
};

const getAllByAdmin = async (currentPage, pageSize, searchConditions) => {
    try {
        let totalRecords = 0;
        let files;
        
        if (currentPage === 0 && pageSize === 0) {
            // Trường hợp lấy tất cả dữ liệu
            if (searchConditions) {
                totalRecords = await File.countDocuments({ ...searchConditions });
                files = await File.find({ ...searchConditions }).exec();
            } else {
                totalRecords = await File.countDocuments();
                files = await File.find().exec();
            }
        } else {
            // Trường hợp áp dụng phân trang
            if (searchConditions) {
                totalRecords = await File.countDocuments({ ...searchConditions });
                files = await File.find({ ...searchConditions })
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            } else {
                totalRecords = await File.countDocuments();
                files = await File.find()
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            }
        }
        
        return { files, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm kiếm đơn thư:", error);
        return null;
    }
};

const getAllFileSoftwareByAdmin = async (currentPage, pageSize, searchConditions) => {
    try {
        let totalRecords = 0;
        let files;
        
        if (currentPage === 0 && pageSize === 0) {
            // Trường hợp lấy tất cả dữ liệu
            if (searchConditions) {
                totalRecords = await FileSoftware.countDocuments({ ...searchConditions });
                files = await FileSoftware.find({ ...searchConditions }).exec();
            } else {
                totalRecords = await FileSoftware.countDocuments();
                files = await FileSoftware.find().exec();
            }
        } else {
            // Trường hợp áp dụng phân trang
            if (searchConditions) {
                totalRecords = await FileSoftware.countDocuments({ ...searchConditions });
                files = await FileSoftware.find({ ...searchConditions })
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            } else {
                totalRecords = await FileSoftware.countDocuments();
                files = await FileSoftware.find()
                    .skip((currentPage - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
            }
        }
        
        return { files, totalRecords };
    } catch (error) {
        console.error("Lỗi khi tìm kiếm đơn thư:", error);
        return null;
    }
};

const update = async (id, updateData, fileDataList, userId) => {
    try {
        // Chuyển đổi dữ liệu tệp từ fileDataList
        const files = fileDataList.map(fileData => ({
            name: fileData.filename,
            size: fileData.size,
            type: fileData.mimetype,
            path: fileData.path
        }));
        
        // Cập nhật thông tin tệp vào dữ liệu cần cập nhật
        updateData.files = files;

        // Kiểm tra và cập nhật trường soVanBan
        if (updateData.soVanBan === 'null') {
            updateData.soVanBan = null;
        }

        // Thực hiện cập nhật đơn thư
        const updatedLetter = await File.findByIdAndUpdate(id, { ...updateData, userId: userId }, { new: true });
        return updatedLetter;
    } catch (error) {
        console.error("Lỗi khi cập nhật đơn thư:", error);
        return null;
    }
};

const deleteItem = async (id, userId) => {
    try {
        const deletedLetter = await File.findByIdAndDelete({ _id: id, userId: userId });
        return deletedLetter;
    } catch (error) {
        console.error("Lỗi khi xóa đơn thư:", error);
        return null;
    }
};


const deleteMultipleItem = async (ids, userId) => {
    try {
        const deletedLetter = await File.deleteMany({ _id: { $in: ids }, userId: userId });
        return deletedLetter;
    } catch (error) {
        console.error("Lỗi khi xóa đơn thư:", error);
        return null;
    }
};

module.exports = {
    create,
    createSoftware,
    getFile,
    getFileSoftware,
    getDetail,
    getDetailByAdmin,
    getDetailFileSoftwareByAdmin,
    getAll,
    getAllByAdmin,
    getAllFileSoftwareByAdmin,
    update,
    deleteItem,
    deleteMultipleItem
};