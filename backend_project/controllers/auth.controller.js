const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { BrevoClient } = require("@getbrevo/brevo");
const { Op } = require("sequelize");

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 5, search = "", sortBy = "createdAt", order = "DESC" } = req.query;
        console.log("Backend getAllUsers Query Params:", { page, limit, search, sortBy, order });
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            },
            attributes: { exclude: ["password"] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order]]
        });

        const totalAdmins = await User.count({ where: { role: 'admin' } });
        const totalUsers = await User.count({ where: { role: 'user' } });

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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate secure 20-char random token
        const token = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email via Brevo API
        const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
        const resetUrl = `http://localhost:5173/reset-password/${token}`;

        const emailData = {
            subject: "Password Reset Request",
            htmlContent: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                    <h2 style="color: #1e293b; text-align: center;">Password Reset Request</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${user.name}</strong>,
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        You are receiving this because you (or someone else) have requested the reset of the password for your account.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                        If you did not request this, please ignore this email and your password will remain unchanged.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        If the button above doesn't work, copy and paste this link into your browser: <br>
                        <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
                    </p>
                </div>
            `,
            sender: { "name": "Admin Dashboard", "email": process.env.EMAIL_FROM || "no-reply@admin.com" },
            to: [{ "email": user.email, "name": user.name }]
        };

        if (!process.env.BREVO_API_KEY) {
            console.log("-----------------------");
            console.log("BREVO API KEY NOT CONFIGURED!");
            console.log("Reset Link for", email, ":", resetUrl);
            console.log("-----------------------");
            return res.json({ message: "Link simulation successful! Check terminal for the link." });
        }

        await client.transactionalEmails.sendTransacEmail(emailData);
        res.json({ message: "Reset link sent to your email" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            },
        });

        if (!user) return res.status(400).json({ message: "Password reset link is invalid or has expired." });

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const updateData = { name, email, role };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        await User.update(updateData, { where: { id: req.params.id } });
        res.json({ message: "User updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Prevent deleting yourself (optional but recommended)
        if (req.user.id == req.params.id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }
        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};