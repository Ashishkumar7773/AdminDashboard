const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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
        const { page = 1, limit = 5, search = "" } = req.query;
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
            order: [['createdAt', 'DESC']]
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

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `http://localhost:5173/reset-password/${token}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset Request",
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `${resetUrl}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("-----------------------");
            console.log("EMAIL NOT CONFIGURED!");
            console.log("Reset Link for", email, ":", resetUrl);
            console.log("-----------------------");
            return res.json({ message: "Link simulation successful! Check terminal for the link." });
        }

        await transporter.sendMail(mailOptions);
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