# Personal Detalis
Name: Uday Kiran Reddy
College Name: Mohan Babu University
Contact: 7207477598
Email: narutoreddie@gmail.com

# Employee Attendance Management System

A full-stack web application to manage and monitor employee attendance with role-based access for Employees and Managers. This system includes real-time attendance tracking, reporting, analytics, and calendar views through an intuitive dashboard.

---

##  Features

###  Authentication & Authorization
- Secure login and registration
- Role-based access: Employee & Manager
- JWT-based authentication

---

###  Employee Panel
- Daily Check-In / Check-Out
- Automatic classification:
  - Present
  - Late
  - Half Day
  - Absent
- Monthly Attendance Calendar
- Attendance History
- Logout button

---

###  Manager Panel
- Dashboard Overview
- Present / Absent / Late counts
- Department-wise employee statistics
- Weekly Attendance Trend Chart (toggle view)
- Team Attendance Calendar
- Export Attendance CSV
- Filter Attendance Records
- View late employees
- View absent employees
- Logout button

---

###  Attendance Rules Engine
- Late if check-in after configured shift start time
- Half-day if work hours are less than required
- Absent if no check-in
- Total hours calculation
- Real-time status update

---

##  Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt.js

---

##  Folder Structure

attendance_system/
│
├── client/ # React Frontend
├── server/ # Express Backend
├── README.md # Documentation
└── .gitignore



---

##  Installation & Setup

### Step 1: Clone the repository
```bash
git clone <your-repo-url>
cd attendance_system

Step 2: Backend Setup
cd server
npm install


Create .env file inside server:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000


Run backend server:
npm run dev

Step 3: Frontend Setup
cd client
npm install
npm run dev


Open browser:

http://localhost:5173



