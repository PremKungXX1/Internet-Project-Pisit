const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('../frontend'));

let conn = null;

const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    console.log('Connected to MySQL');
}

// ส่ง conn ก่อน routes เสมอ
app.use((req, res, next) => {
    req.conn = conn;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const reportRoutes = require('./routes/report');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/report', reportRoutes);

app.listen(port, async () => {
    await initMySQL();
    console.log(`Server is running on port ${port}`);
});