const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { BrevoClient } = require("@getbrevo/brevo");
const { Op } = require("sequelize");
const Employee = require("../models/employee.model.js");

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

        // Remove password from user object before sending
        const userResponse = { ...user.toJSON() };
        delete userResponse.password;

        res.json({ token, user: userResponse });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 5, search = "", sortBy = "createdAt", order = "DESC", role = "" } = req.query;
        console.log("Backend getAllUsers Query Params:", { page, limit, search, sortBy, order, role });
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

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
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
        // Use req.headers.origin to automatically detect if it's localhost or Vercel
        const clientUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password/${token}`;

        const emailData = {
            subject: "Reset Your AdminPro Password",
            htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
                        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
                        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; }
                        .content { padding: 40px; color: #334155; line-height: 1.6; }
                        .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
                        .text { font-size: 16px; margin-bottom: 24px; color: #475569; }
                        .button-container { text-align: center; margin: 36px 0; }
                        .button { background-color: #4f46e5; color: #ffffff !important; padding: 14px 32px; text-decoration: none; font-weight: 700; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }
                        .expiry-note { font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px; }
                        .security-notice { background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 32px; border-left: 4px solid #4f46e5; }
                        .security-notice p { margin: 0; font-size: 13px; color: #64748b; }
                        .footer { padding: 30px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
                        .footer p { margin: 4px 0; font-size: 12px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>AdminPro</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Hello, ${user.name}</p>
                            <p class="text">We received a request to reset the password for your account. Click the button below to choose a new password. This link is unique to your account and should not be shared.</p>
                            
                            <div class="button-container">
                                <a href="${resetUrl}" class="button">Reset My Password</a>
                            </div>

                            <p class="text">If you didn't request this, you can safely ignore this email. Your password won't change unless you click the link above and create a new one.</p>

                            <p class="expiry-note">This link will expire in <strong>60 minutes</strong> for security reasons.</p>

                            <div class="security-notice">
                                <p><strong>Security Tip:</strong> Always ensure you are on the official <strong>AdminPro</strong> domain before entering your credentials. We will never ask for your password via email.</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} AdminPro Dashboard. All rights reserved.</p>
                            <p>Industrial Area, Corporate Park, City Central</p>
                            <p>Support: support@adminpro.com</p>
                        </div>
                    </div>
                </body>
            </html>
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

        try {
            await client.transactionalEmails.sendTransacEmail(emailData);
            res.json({ message: "Reset link sent to your email" });
        } catch (mailErr) {
            console.error("Brevo Email Error:", mailErr.response?.body || mailErr.message);

            // Log link to terminal as fallback
            console.log("-----------------------");
            console.log("SECURITY FALLBACK LOGGED:");
            console.log("User Email:", email);
            console.log("Reset Link:", resetUrl);
            console.log("Cause:", mailErr.response?.body?.message || "Brevo IP or API error");
            console.log("-----------------------");

            if (mailErr.response?.statusCode === 401 && mailErr.response?.body?.code === "unauthorized") {
                return res.status(200).json({
                    message: "ALERT: Your IP address is not authorized in Brevo. To send real emails, authorize your IP in Brevo settings. FOR NOW, YOUR RESET LINK HAS BEEN LOGGED TO THE BACKEND TERMINAL.",
                    ipAddress: "103.240.170.248",
                    instruction: "Check your backend terminal for the reset link!"
                });
            }

            res.status(200).json({ message: "Note: Email service encountered an error, but the reset link has been logged to the terminal for development purposes.", linkInTerminal: true });
        }
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
exports.getDashboardStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.count();
        const totalAdmins = await User.count({
            where: {
                role: { [Op.in]: ['Admin', 'SuperAdmin'] }
            }
        });
        const totalUsers = await User.count({
            where: {
                role: 'user'
            }
        });

        res.json({
            totalEmployees,
            totalAdmins,
            totalUsers
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
