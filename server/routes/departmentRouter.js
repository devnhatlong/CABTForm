const router = require("express").Router();
const ctrls = require("../controllers/departmentController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/create-department", ctrls.createDepartment);
router.get("/get-all-department", [verifyAccessToken, isAdmin], ctrls.getAllDepartment);
router.get("/get-detail-department/:id", [verifyAccessToken, isAdmin], ctrls.getDetailDepartment);
router.delete("/delete-department/:id", [verifyAccessToken, isAdmin], ctrls.deleteDepartment);
router.delete("/delete-multiple-departments", [verifyAccessToken, isAdmin], ctrls.deleteMultipleDepartments);
router.put("/update-department/:id", [verifyAccessToken, isAdmin], ctrls.updateDepartment);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
