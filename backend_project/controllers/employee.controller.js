const Employee = require("../models/employee.model.js");
const { Op } = require("sequelize");

exports.createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const { page = 1, limit = 5, search = "" } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Employee.findAndCountAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const totalEmployees = await Employee.count();

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            employees: rows,
            stats: {
                totalEmployees
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.destroy({ where: { id: req.params.id } });
        res.json({ message: "Employee deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        await Employee.update(req.body, { where: { id: req.params.id } });
        res.json({ message: "Employee updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};