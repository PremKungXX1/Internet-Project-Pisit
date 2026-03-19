const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/report/monthly?month=3&year=2026 — รายงานรายเดือน (admin only)
router.get('/monthly', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            throw { statusCode: 403, message: 'ไม่มีสิทธิ์เข้าถึง' };
        }

        const { month, year } = req.query;

        if (!month || !year) {
            throw { statusCode: 400, message: 'กรุณาระบุเดือนและปี' };
        }

        const results = await req.conn.query(`
            SELECT 
                e.id,
                e.first_name,
                e.last_name,
                d.name AS department,
                e.salary,
                COUNT(a.id) AS work_days,
                SUM(a.work_hours) AS total_work_hours,
                SUM(a.overtime_hours) AS total_overtime_hours
            FROM employees e
            JOIN departments d ON e.department_id = d.id
            LEFT JOIN attendance a 
                ON e.id = a.employee_id 
                AND MONTH(a.date) = ? 
                AND YEAR(a.date) = ?
            GROUP BY e.id, e.first_name, e.last_name, d.name, e.salary
            ORDER BY e.id
        `, [month, year]);

        res.json({
            month,
            year,
            data: results[0]
        });

    } catch (error) {
        console.error('Report error:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

module.exports = router;
