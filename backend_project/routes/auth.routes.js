const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateUserSchema, userQuerySchema } = require("../validations/auth.validation");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/users", authMiddleware, roleMiddleware(["SuperAdmin", "Admin"]), validate(userQuerySchema, "query"), authController.getAllUsers);
router.put("/users/:id", authMiddleware, roleMiddleware(["SuperAdmin", "Admin"]), validate(updateUserSchema), authController.updateUser);
router.delete("/users/:id", authMiddleware, roleMiddleware("SuperAdmin"), authController.deleteUser);
router.get("/stats", authMiddleware, authController.getDashboardStats);

// Password Reset Routes
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;