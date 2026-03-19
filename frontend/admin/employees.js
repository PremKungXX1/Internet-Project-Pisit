const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
    window.location.href = '../login/index.html';
}

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '../login/index.html';
}

// เก็บ id ของพนักงานที่กำลังแก้ไขอยู่
let editId = null;

const loadEmployees = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/employees', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const employees = response.data;
        let html = '';
        for (let i = 0; i < employees.length; i++) {
            html += `
                <tr>
                    <td>${employees[i].first_name}</td>
                    <td>${employees[i].last_name}</td>
                    <td>${employees[i].department}</td>
                    <td>${Number(employees[i].salary).toLocaleString()} บาท</td>
                    <td>${employees[i].username}</td>
                    <td>
                        <button onclick="editEmployee(${employees[i].id})" class="button" style="width:auto; padding: 6px 12px; margin-right: 4px">แก้ไข</button>
                        <button onclick="deleteEmployee(${employees[i].id})" class="button button-danger" style="width:auto; padding: 6px 12px">ลบ</button>
                    </td>
                </tr>
            `;
        }
        document.getElementById('employeeTable').innerHTML = html;

    } catch (error) {
        console.error('Error loading employees:', error.message);
    }
}

const submitEmployee = async () => {
    let messageDOM = document.getElementById('message');
    try {
        let first_name = document.querySelector('input[name=first_name]').value;
        let last_name = document.querySelector('input[name=last_name]').value;
        let department_id = document.querySelector('select[name=department_id]').value;
        let salary = document.querySelector('input[name=salary]').value;

        if (!first_name || !last_name || !department_id || !salary) {
            throw { message: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
        }

        if (editId) {
            // แก้ไขพนักงาน
            await axios.put(`http://localhost:5000/api/employees/${editId}`, {
                first_name, last_name, department_id, salary
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            messageDOM.innerHTML = '<div>แก้ไขข้อมูลสำเร็จ</div>';

        } else {
            // เพิ่มพนักงานใหม่
            let username = document.querySelector('input[name=username]').value;
            let password = document.querySelector('input[name=password]').value;

            if (!username || !password) {
                throw { message: 'กรุณากรอก username และ password' };
            }

            await axios.post('http://localhost:5000/api/employees', {
                first_name, last_name, department_id, salary, username, password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            messageDOM.innerHTML = '<div>เพิ่มพนักงานสำเร็จ</div>';
        }

        messageDOM.className = 'message success';
        resetForm();
        loadEmployees();

    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message;
        }
        messageDOM.innerHTML = `<div>${error.message}</div>`;
        messageDOM.className = 'message danger';
    }
}

const editEmployee = async (id) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/employees/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const emp = response.data;

        // ใส่ข้อมูลเดิมลงฟอร์ม
        document.querySelector('input[name=first_name]').value = emp.first_name;
        document.querySelector('input[name=last_name]').value = emp.last_name;
        document.querySelector('select[name=department_id]').value = emp.department_id;
        document.querySelector('input[name=salary]').value = emp.salary;

        // ซ่อนช่อง username/password ตอนแก้ไข
        document.getElementById('userFields').style.display = 'none';

        // เปลี่ยน title และปุ่ม
        document.getElementById('formTitle').innerText = 'แก้ไขข้อมูลพนักงาน';
        document.getElementById('submitBtn').innerText = 'บันทึกการแก้ไข';

        editId = id;

    } catch (error) {
        console.error('Error fetching employee:', error.message);
    }
}

const deleteEmployee = async (id) => {
    if (!confirm('ยืนยันการลบพนักงานนี้?')) return;

    try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        loadEmployees();

    } catch (error) {
        console.error('Error deleting employee:', error.message);
    }
}

const resetForm = () => {
    document.querySelector('input[name=first_name]').value = '';
    document.querySelector('input[name=last_name]').value = '';
    document.querySelector('input[name=salary]').value = '';
    document.querySelector('input[name=username]').value = '';
    document.querySelector('input[name=password]').value = '';
    document.getElementById('userFields').style.display = 'flex';
    document.getElementById('formTitle').innerText = 'เพิ่มพนักงานใหม่';
    document.getElementById('submitBtn').innerText = 'เพิ่มพนักงาน';
    document.getElementById('message').className = 'message';
    document.getElementById('message').innerHTML = '';
    editId = null;
}

loadEmployees();