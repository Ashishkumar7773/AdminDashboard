const Joi = require("joi");

const employeeSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    salary: Joi.number().integer().min(1).required(),
    department: Joi.string().required(),
    status: Joi.string().valid("Active", "Inactive", "On Leave").default("Active"),
});

const employeeQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(5),
    search: Joi.string().allow("").default(""),
    sortBy: Joi.string().default("createdAt"),
    order: Joi.string().valid("ASC", "DESC").default("DESC"),
    department: Joi.string().allow("").default(""),
    status: Joi.string().valid("Active", "Inactive", "On Leave", "").allow("").default(""),
});

module.exports = {
    employeeSchema,
    employeeQuerySchema,
};
