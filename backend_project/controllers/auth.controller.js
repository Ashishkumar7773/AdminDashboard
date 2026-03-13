const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { BrevoClient } = require("@getbrevo/brevo");
const { Op } = require("sequelize");
const Employee = require("../models/employee.model.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

exports.register = catchAsyncErrors(async (req, res, next) => {
    let { name, email, password, role } = req.body;

    const userCount = await User.count();

    if (userCount === 0) {
        // First user is automatically SuperAdmin
        role = "SuperAdmin";
    } else if (!role) {
        role = "user";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
    });

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({ token, user });
});

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return next(new ErrorHandler("User not found", 404));

    const match = await bcrypt.compare(password, user.password);
    if (!match) return next(new ErrorHandler("Invalid password", 401));

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.json({ token, user: userResponse });
});

exports.getMe = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] }
    });
    if (!user) return next(new ErrorHandler("User not found", 404));
    res.json({ success: true, user });
});

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const { page = 1, limit = 5, search = "", sortBy = "createdAt", order = "DESC", role = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
        [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ]
    };

    if (role) {
        whereClause.role = role;
    }

    const [{ count, rows }, totalAdmins, totalUsers] = await Promise.all([
        User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ["password"] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order]]
        }),
        User.count({ where: { role: 'admin' } }),
        User.count({ where: { role: 'user' } })
    ]);

    res.json({
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        users: rows,
        stats: {
            totalAdmins,
            totalUsers
        }
    });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return next(new ErrorHandler("User not found", 404));

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const clientUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${token}`;

    const emailData = {
        subject: "Reset Your AdminPro Password",
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: sans-serif; background-color: #f8fafc; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
                    .button { background: #4f46e5; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Reset Password</h2>
                    <p>Hello ${user.name}, you requested a password reset. Click the button below:</p>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                    <p>This link expires in 1 hour.</p>
                </div>
            </body>
            </html>
        `,
        sender: { "name": "Admin Dashboard", "email": process.env.EMAIL_FROM || "no-reply@admin.com" },
        to: [{ "email": user.email, "name": user.name }]
    };

    if (!process.env.BREVO_API_KEY) {
        console.log("Reset Link:", resetUrl);
        return res.json({ message: "Link simulation successful! Check terminal for the link." });
    }

    try {
        const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
        await client.transactionalEmails.sendTransacEmail(emailData);
        res.json({ message: "Reset link sent to your email" });
    } catch (mailErr) {
        console.error("Email Error:", mailErr.message);
        res.status(200).json({ message: "Note: Email service error, but link is in terminal.", linkInTerminal: true });
        console.log("Fallback Reset Link:", resetUrl);
    }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { [Op.gt]: Date.now() }
        },
    });

    if (!user) return next(new ErrorHandler("Password reset link is invalid or has expired.", 400));

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, role, password } = req.body;
    const updateData = { name, email, role };
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }
    await User.update(updateData, { where: { id: req.params.id } });
    res.json({ message: "User updated" });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    if (req.user.id == req.params.id) {
        return next(new ErrorHandler("You cannot delete your own account", 400));
    }
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
});

exports.getDashboardStats = catchAsyncErrors(async (req, res, next) => {
    const [totalEmployees, totalAdmins, totalUsers] = await Promise.all([
        Employee.count(),
        User.count({
            where: {
                role: { [Op.in]: ['Admin', 'SuperAdmin'] }
            }
        }),
        User.count({
            where: {
                role: 'user'
            }
        })
    ]);

    res.json({
        totalEmployees,
        totalAdmins,
        totalUsers
    });
});
