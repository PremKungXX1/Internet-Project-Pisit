const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // เช็คว่ากรอกครบไหม
        if (!username || !password) {
            throw { statusCode: 400, message: 'กรุณากรอก username และ password' };
        }

        // หา user จาก DB
        const results = await req.conn.query(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );
        const user = results[0][0];

        if (!user) {
            throw { statusCode: 401, message: 'ไม่พบผู้ใช้งานนี้' };
        }

        // เช็ค password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw { statusCode: 401, message: 'รหัสผ่านไม่ถูกต้อง' };
        }

        // สร้าง JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token: token,
            role: user.role
        });

    } catch (error) {
        console.error('Login error:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || 'เกิดข้อผิดพลาด'
        });
    }
});

module.exports = router;