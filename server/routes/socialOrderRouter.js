const router = require("express").Router();
const ctrls = require("../controllers/socialOrderController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken , ctrls.createSocialOrder);
router.get("/", verifyAccessToken, ctrls.getSocialOrders);
router.get("/:id", verifyAccessToken, ctrls.getSocialOrderById);
router.put("/:id", verifyAccessToken, ctrls.updateSocialOrder);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleSocialOrders);
router.delete("/:id", verifyAccessToken, ctrls.deleteSocialOrder);

// history
router.get("/:id/history", verifyAccessToken, ctrls.getHistoryBySocialOrderId);
router.get("/:id/history-detail", verifyAccessToken, ctrls.getHistoryDetailByHistoryId);

module.exports = router;
