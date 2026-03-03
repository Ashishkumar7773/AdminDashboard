import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard"
import Employees from "../pages/Employees"
import NotFound from "../pages/NotFound";


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;