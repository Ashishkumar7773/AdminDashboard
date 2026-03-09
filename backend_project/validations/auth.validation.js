const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("SuperAdmin", "Admin", "Editor", "user").default("user"),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().min(6).required(),
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid("SuperAdmin", "Admin", "Editor", "user"),
});

const userQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(5),
    search: Joi.string().allow("").default(""),
    sortBy: Joi.string().default("createdAt"),
    order: Joi.string().valid("ASC", "DESC").default("DESC"),
    role: Joi.string().valid("SuperAdmin", "Admin", "Editor", "user", "").allow("").default(""),
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateUserSchema,
    userQuerySchema,
};
