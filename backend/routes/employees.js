const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/employees — ดูพนักงานทั้งหมด
router.get('/', authMiddleware, async (req, res) => {
    try {
        const results = await req.conn.query(`
            SELECT e.id, e.first_name, e.last_name, e.salary,
                   d.name AS department, u.username, u.role
            FROM employees e
            JOIN departments d ON e.department_id = d.id
            JOIN users u ON e.user_id = u.id
        `);
        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching employees:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// GET /api/employees/:id — ดูพนักงานคนเดียว
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const results = await req.conn.query(`
            SELECT e.id, e.first_name, e.last_name, e.salary,
                   d.name AS department, u.username, u.role
            FROM employees e
            JOIN departments d ON e.department_id = d.id
            JOIN users u ON e.user_id = u.id
            WHERE e.id = ?
        `, [id]);

        if (results[0].length === 0) {
            throw { statusCode: 404, message: 'ไม่พบพนักงาน' };
        }
        res.json(results[0][0]);
    } catch (error) {
        console.error('Error fetching employee:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

// POST /api/employees — เพิ่มพนักงานใหม่ (admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            throw { statusCode: 403, message: 'ไม่มีสิทธิ์เข้าถึง' };
        }

        const { first_name, last_name, department_id, salary, username, password } = req.body;

        if (!first_name || !last_name || !department_id || !salary || !username || !password) {
            throw { statusCode: 400, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
        }

        // สร้าง user สำหรับ login ก่อน
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await req.conn.query(
            'INSERT INTO users SET ?',
            { username, password: hashedPassword, role: 'employee' }
        );
        const userId = userResult[0].insertId;

        // สร้าง employee
        await req.conn.query(
            'INSERT INTO employees SET ?',
            { first_name, last_name, department_id, salary, user_id: userId }
        );

        res.json({ message: 'เพิ่มพนักงานสำเร็จ' });

    } catch (error) {
        console.error('Error creating employee:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

// PUT /api/employees/:id — แก้ไขข้อมูลพนักงาน (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            throw { statusCode: 403, message: 'ไม่มีสิทธิ์เข้าถึง' };
        }

        const id = req.params.id;
        const { first_name, last_name, department_id, salary } = req.body;

        const results = await req.conn.query(
            'UPDATE employees SET ? WHERE id = ?',
            [{ first_name, last_name, department_id, salary }, id]
        );

        if (results[0].affectedRows === 0) {
            throw { statusCode: 404, message: 'ไม่พบพนักงาน' };
        }

        res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });

    } catch (error) {
        console.error('Error updating employee:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

// DELETE /api/employees/:id — ลบพนักงาน (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            throw { statusCode: 403, message: 'ไม่มีสิทธิ์เข้าถึง' };
        }

        const id = req.params.id;
        const results = await req.conn.query(
            'DELETE FROM employees WHERE id = ?', [id]
        );

        if (results[0].affectedRows === 0) {
            throw { statusCode: 404, message: 'ไม่พบพนักงาน' };
        }

        res.json({ message: 'ลบพนักงานสำเร็จ' });

    } catch (error) {
        console.error('Error deleting employee:', error.message);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message });
    }
});

module.exports = router;