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

const monthNames = [
    '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const loadReport = async () => {
    try {
        const month = document.querySelector('select[name=month]').value;
        const year = document.querySelector('input[name=year]').value;

        if (!month || !year) {
            throw { message: 'กรุณาเลือกเดือนและปี' };
        }

        const response = await axios.get('http://localhost:5000/api/report/monthly', {
            headers: { Authorization: `Bearer ${token}` },
            params: { month, year }
        });

        const data = response.data.data;

        // แสดง title
        document.getElementById('reportTitle').innerText =
            `รายงานเดือน${monthNames[month]} ${year}`;

        // แสดงตาราง
        let html = '';
        for (let i = 0; i < data.length; i++) {
            html += `
                <tr>
                    <td>${data[i].first_name} ${data[i].last_name}</td>
                    <td>${data[i].department}</td>
                    <td>${data[i].work_days || 0} วัน</td>
                    <td>${Number(data[i].total_work_hours || 0).toFixed(2)} ชั่วโมง</td>
                    <td>${Number(data[i].total_overtime_hours || 0).toFixed(2)} ชั่วโมง</td>
                    <td>${Number(data[i].salary).toLocaleString()} บาท</td>
                </tr>
            `;
        }
        document.getElementById('reportTable').innerHTML = html;

        // แสดง card รายงาน
        document.getElementById('reportCard').style.display = 'block';

    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message;
        }
        console.error('Report error:', error.message);
    }
}