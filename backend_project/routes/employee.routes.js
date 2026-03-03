const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const empController = require("../controllers/employee.controller");

router.post("/", auth, role("admin"), empController.createEmployee);
router.get("/", auth, empController.getEmployees);
router.delete("/:id", auth, role("admin"), empController.deleteEmployee);
router.put("/:id", auth, role("admin"), empController.updateEmployee);

module.exports = router;