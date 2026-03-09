const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const empController = require("../controllers/employee.controller");
const validate = require("../middleware/validate");
const { employeeSchema, employeeQuerySchema } = require("../validations/employee.validation");
const upload = require("../middleware/upload.middleware");

router.post("/", auth, roleMiddleware(["SuperAdmin", "Admin"]), upload.single("photo"), validate(employeeSchema), empController.createEmployee);
router.get("/", auth, validate(employeeQuerySchema, "query"), empController.getEmployees);
router.delete("/:id", auth, roleMiddleware("SuperAdmin"), empController.deleteEmployee);
router.put("/:id", auth, roleMiddleware(["SuperAdmin", "Admin", "Editor"]), upload.single("photo"), validate(employeeSchema), empController.updateEmployee);

module.exports = router;