const Employee = require("../models/employee.model.js");
const { Op } = require("sequelize");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.createEmployee = catchAsyncErrors(async (req, res) => {
    const { name, email, salary, department, status } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const employee = await Employee.create({
        name,
        email,
        salary,
        department,
        status,
        photo,
    });
    res.json(employee);
});

exports.getEmployees = catchAsyncErrors(async (req, res) => {
    const { page = 1, limit = 5, search = "", sortBy = "createdAt", order = "DESC", department = "", status = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
        [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ]
    };

    if (department) {
        whereClause.department = department;
    }

    if (status) {
        whereClause.status = status;
    }

    const { count, rows } = await Employee.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order]]
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
});

exports.deleteEmployee = catchAsyncErrors(async (req, res) => {
    await Employee.destroy({ where: { id: req.params.id } });
    res.json({ message: "Employee deleted" });
});

exports.updateEmployee = catchAsyncErrors(async (req, res) => {
    const { name, email, salary, department, status } = req.body;
    const updateData = { name, email, salary, department, status };

    if (req.file) {
        updateData.photo = `/uploads/${req.file.filename}`;
    }

    await Employee.update(updateData, { where: { id: req.params.id } });
    res.json({ message: "Employee updated" });
});