# 🚀 Admin Dashboard Project Documentation

Yeh project ek **Employee Management System** hai jisme Admin users ko handle kar sakta hai aur employees ka data manage kar sakta hai.

---

## 🧐 Yeh Project Kya Kaam Karega? (Project Functionality)

Main features:
1.  **Authentication**: Users register kar sakte hain, login kar sakte hain, aur apna password reset kar sakte hain (via Email).
2.  **Employee Management**: Admin employees ko add, view, update aur delete (CRUD) kar sakta hai.
3.  **Secure Access**: JWT (JSON Web Token) ka use kiya gaya hai security ke liye, taaki sirf authorized users hi dashboard access kar sakein.
4.  **Email Service**: Brevo (Sendinblue) API ka use kiya gaya hai password reset emails bhejne ke liye.

---

## 🛠️ Backend Documentation (Server Setup)

Backend ko **Node.js** aur **Express.js** ka use karke banaya gaya hai. Database ke liye **MySQL** aur **Sequelize ORM** ka use ho raha hai.

### Setup Steps:
1.  **Dependencies Install Karein**: 
    `backend_project` folder mein terminal open karein aur run karein:
    ```bash
    npm install
    ```
2.  **Environment Variables (.env)**:
    `.env` file check karein aur apna MySQL database details (DB_NAME, DB_USER, DB_PASS) fill karein.
3.  **Server Start Karein**:
    - Development ke liye: `npm run dev` (nodemon use hoga)
    - Production ke liye: `npm start`
4.  **Key Folders**:
    - `models/`: Database tables define kiye gaye hain (`User`, `Employee`).
    - `routes/`: API endpoints define kiye gaye hain (`auth`, `employee`).
    - `controllers/`: Logic likha gaya hai (Login, Register, Add Employee).

---

## 💻 Frontend Documentation (Client Setup)

Frontend ko **React.js** aur **Vite** ka use karke banaya gaya hai. Styling ke liye **Tailwind CSS** ka use ho raha hai.

### Setup Steps:
1.  **Dependencies Install Karein**:
    `frontend_project` folder mein terminal open karein aur run karein:
    ```bash
    npm install
    ```
2.  **Development Server Run Karein**:
    ```bash
    npm run dev
    ```
    Isse project local environment mein start ho jayega (usually `http://localhost:5173`).

3.  **Key Technologies**:
    - **React Router**: Pages ke beech mein navigation ke liye.
    - **Axios**: Backend APIs se connect karne ke liye.
    - **Tailwind CSS**: Modern UI components design karne ke liye.

---

## 📂 Project Structure Overview

```text
Project_01/
├── backend_project/      # Node.js + Express + MySQL
│   ├── models/           # DB Tables
│   ├── routes/           # API routes
│   └── server.js         # Entry point
└── frontend_project/     # React + Vite + Tailwind
    ├── src/              # Frontend code
    │   ├── components/   # Reusable UI parts
    │   └── pages/        # Main Dashboard, Login Pages
    └── index.html        # Entry HTML
```

---
