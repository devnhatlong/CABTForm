const router = require("express").Router();
const ctrls = require("../controllers/formController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, ctrls.createForm);
router.put("/:id", verifyAccessToken, ctrls.updateForm);
router.get("/", ctrls.getForms);
router.get("/:id", ctrls.getFormById);
router.delete("/:id", verifyAccessToken, isAdmin, ctrls.deleteForm);

module.exports = router;
