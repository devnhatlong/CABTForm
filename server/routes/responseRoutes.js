const router = require("express").Router();
const ctrls = require("../controllers/responseController");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, ctrls.createResponse);
router.get("/:formId", ctrls.getResponsesByForm);
router.get("/detail/:id", ctrls.getResponseById);

module.exports = router;
