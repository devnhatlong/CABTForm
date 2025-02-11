const router = require("express").Router();
const ctrls = require("../controllers/uploadFileController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/create", verifyAccessToken, upload.array("uploadedFiles"), ctrls.create);
router.post("/create-software", verifyAccessToken, upload.array("uploadedFiles"), ctrls.createSoftware);
router.get("/get-file/:id", ctrls.getFile);
router.get("/get-file-software/:id", ctrls.getFileSoftware);
router.get("/get-file-software-by-name/:fileName", ctrls.getFileSoftwareByFileName);
router.get("/download-chrome-64bit", ctrls.downloadChrome64bit);
router.get("/download-chrome-32bit", ctrls.downloadChrome32bit);
router.get("/get-detail/:id", verifyAccessToken, ctrls.getDetail);
router.get("/get-detail-by-admin/:id", [verifyAccessToken, isAdmin], ctrls.getDetailByAdmin);
router.get("/get-detail-file-software-by-admin/:id", verifyAccessToken, ctrls.getDetailFileSoftwareByAdmin);
router.get("/get-all", verifyAccessToken, ctrls.getAll);
router.get("/get-all-by-admin", [verifyAccessToken, isAdmin], ctrls.getAllByAdmin);
router.get("/get-all-file-software-by-admin", verifyAccessToken, ctrls.getAllFileSoftwareByAdmin);
// router.put("/update-letter/:id", verifyAccessToken, upload.array("files"), ctrls.updateLetter);
router.delete("/delete/:id", verifyAccessToken, ctrls.deleteItem);
// router.delete("/delete-multiple-letters", verifyAccessToken, ctrls.deleteMultipleLetters);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
