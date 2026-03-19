const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // ดึง token จาก header
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw { statusCode: 401, message: 'No token provided' };
        }

        // header จะมาในรูป "Bearer <token>" ต้องตัดคำว่า Bearer ออก
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw { statusCode: 401, message: 'Invalid token format' };
        }

        // ตรวจสอบ token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // เก็บข้อมูล user ไว้ใน req เพื่อให้ route ใช้ต่อได้
        req.user = decoded;
        next();

    } catch (error) {
        let statusCode = error.statusCode || 401;
        res.status(statusCode).json({
            message: error.message || 'Unauthorized'
        });
    }
}

module.exports = authMiddleware;
