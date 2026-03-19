// ดึง token จาก localStorage
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

// ถ้าไม่มี token หรือไม่ใช่ admin ให้กลับหน้า login
if (!token || role !== 'admin') {
    window.location.href = '../login/index.html';
}

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '../login/index.html';
}

const loadDashboard = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/employees', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const employees = response.data;

        // แสดงจำนวนพนักงาน
        document.getElementById('totalEmployees').innerText = employees.length;

        // นับจำนวนแผนกที่ไม่ซ้ำกัน
        const departments = new Set(employees.map(e => e.department));
        document.getElementById('totalDepartments').innerText = departments.size;

        // แสดงตารางพนักงาน
        let html = '';
        for (let i = 0; i < employees.length; i++) {
            html += `
                <tr>
                    <td>${employees[i].first_name}</td>
                    <td>${employees[i].last_name}</td>
                    <td>${employees[i].department}</td>
                    <td>${Number(employees[i].salary).toLocaleString()} บาท</td>
                </tr>
            `;
        }
        document.getElementById('employeeTable').innerHTML = html;

    } catch (error) {
        console.error('Error loading dashboard:', error.message);
    }
}

loadDashboard();