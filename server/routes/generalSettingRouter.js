const router = require("express").Router();
const ctrls = require("../controllers/generalSettingController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], ctrls.createGeneralSetting);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getGeneralSettings);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getGeneralSettingById);
router.put("/", [verifyAccessToken, isAdmin], ctrls.updateGeneralSetting); // Sử dụng key thay vì id

module.exports = router;