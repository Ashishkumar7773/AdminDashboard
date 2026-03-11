import React from "react";

const DashboardStats = ({ stats }) => {
    const statCards = [
        {
            title: "Total Employees",
            value: stats.totalEmployees,
            gradient: "from-indigo-500 to-purple-600",
        },
        {
            title: "System Admins",
            value: stats.totalAdmins,
            gradient: "from-indigo-500 to-purple-600",
        },
        {
            title: "System Users",
            value: stats.totalUsers,
            gradient: "from-indigo-500 to-purple-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((card, index) => (
                <div
                    key={index}
                    className={`card bg-gradient-to-br ${card.gradient} text-white border-none shadow-lg p-6 rounded-2xl`}
                >
                    <h4 className="opacity-80 text-sm font-medium">{card.title}</h4>
                    <p className="text-4xl font-bold mt-2">{card.value}</p>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
