const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/attendance/checkin — เช็คอิน
router.post('/checkin', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // หา employee_id จาก user_id
        const empResult = await req.conn.query(
            'SELECT id FROM employees WHERE user_id = ?', [userId]
        );
        if (empResult[0].length === 0) {
            throw { statusCode: 404, message: 'ไม่พบข้อมูลพนักงาน' };
        }
        const employeeId = empResult[0][0].id;

        // เช็คว่าวันนี้เช็คอินแล้วหรือยัง
        const today = new Date().toISOString().split('T')[0];
        const existing = await req.conn.query(
            'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );
        if (existing[0].length > 0) {
            throw { statusCode: 400, message: 'เช็คอินแล้ววันนี้' };
        }

        // บันทึกเช็คอิน
        const checkIn = new Date();
        await req.conn.query(
            'INSERT INTO attendance SET ?',
            { employee_id: employeeId, check_in: checkIn, date: today }
        );

        res.json({ message: 'เช็คอินสำเร็จ', check_in: checkIn });

    } catch (error) {
        console.error('Checkin error:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

// POST /api/attendance/checkout — เช็คเอาท์
router.post('/checkout', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // หา employee_id
        const empResult = await req.conn.query(
            'SELECT id FROM employees WHERE user_id = ?', [userId]
        );
        if (empResult[0].length === 0) {
            throw { statusCode: 404, message: 'ไม่พบข้อมูลพนักงาน' };
        }
        const employeeId = empResult[0][0].id;

        // หา record เช็คอินวันนี้
        const today = new Date().toISOString().split('T')[0];
        const existing = await req.conn.query(
            'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );
        if (existing[0].length === 0) {
            throw { statusCode: 400, message: 'ยังไม่ได้เช็คอินวันนี้' };
        }
        if (existing[0][0].check_out) {
            throw { statusCode: 400, message: 'เช็คเอาท์แล้ววันนี้' };
        }

        // คำนวณชั่วโมงทำงาน
        const checkIn = new Date(existing[0][0].check_in);
        const checkOut = new Date();
        const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);

        // ทำงานปกติ 8 ชั่วโมง ที่เกินคือโอที
        const workHours = Math.min(totalHours, 8);
        const overtimeHours = Math.max(totalHours - 8, 0);

        // บันทึกเช็คเอาท์
        await req.conn.query(
            'UPDATE attendance SET check_out = ?, work_hours = ?, overtime_hours = ? WHERE id = ?',
            [checkOut, workHours.toFixed(2), overtimeHours.toFixed(2), existing[0][0].id]
        );

        res.json({
            message: 'เช็คเอาท์สำเร็จ',
            work_hours: workHours.toFixed(2),
            overtime_hours: overtimeHours.toFixed(2)
        });

    } catch (error) {
        console.error('Checkout error:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

// GET /api/attendance/today — ดูสถานะวันนี้ของตัวเอง
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const empResult = await req.conn.query(
            'SELECT id FROM employees WHERE user_id = ?', [userId]
        );
        if (empResult[0].length === 0) {
            throw { statusCode: 404, message: 'ไม่พบข้อมูลพนักงาน' };
        }
        const employeeId = empResult[0][0].id;

        const today = new Date().toISOString().split('T')[0];
        const results = await req.conn.query(
            'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );

        res.json(results[0][0] || null);

    } catch (error) {
        console.error('Error fetching today attendance:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

module.exports = router;
