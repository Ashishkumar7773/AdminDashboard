const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", authMiddleware, roleMiddleware("admin"), authController.getAllUsers);
router.put("/users/:id", authMiddleware, roleMiddleware("admin"), authController.updateUser);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), authController.deleteUser);

// Password Reset Routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;