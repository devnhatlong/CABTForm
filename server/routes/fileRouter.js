const router = require("express").Router();
const { verifyAccessToken } = require("../middlewares/verifyToken");
const ctrls = require("../controllers/fileController");

router.get("/:id", verifyAccessToken, ctrls.getFileById);

module.exports = router;