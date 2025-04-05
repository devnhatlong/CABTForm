const router = require("express").Router();
const ctrls = require("../controllers/districtController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createDistrict);
router.get("/", verifyAccessToken, ctrls.getDistricts);
router.get("/:id", verifyAccessToken, ctrls.getDistrictById);
router.put("/:id", verifyAccessToken, ctrls.updateDistrict);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleDistricts);
router.delete("/:id", verifyAccessToken, ctrls.deleteDistrict);

module.exports = router;
