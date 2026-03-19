-- สร้างตาราง departments (แผนก)
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- สร้างตาราง users (สำหรับ login)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee'
);

-- สร้างตาราง employees (ข้อมูลพนักงาน)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department_id INT,
    salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
    user_id INT UNIQUE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- สร้างตาราง attendance (การเช็คอิน/เอาท์)
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    work_hours DECIMAL(5, 2),
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- เพิ่มข้อมูลตัวอย่าง departments
INSERT INTO departments (name) VALUES
('IT'),
('HR'),
('Finance');

-- เพิ่ม admin user (password = "admin1234" แบบ hash จะทำใน backend)
-- ตรงนี้ใส่ bcrypt hash ของ "admin1234" ไว้ก่อน
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$PpQfp.437tPvFQoAjDRtG.huh3BHAfesa.9G.R4gBRob/LIAduxJC', 'admin');

-- เพิ่มข้อมูลตัวอย่าง employee
INSERT INTO employees (first_name, last_name, department_id, salary, user_id) VALUES
('สมชาย', 'ใจดี', 1, 25000, 1);
```

---

**อธิบายทีละส่วน:**

`IF NOT EXISTS` — ป้องกัน error ถ้า Docker restart แล้วตารางมีอยู่แล้ว

**4 ตาราง ความสัมพันธ์:**
```
departments  ←── employees ←── attendance
                     ↑
                   users