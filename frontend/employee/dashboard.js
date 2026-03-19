const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'employee') {
    window.location.href = '../login/index.html';
}

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '../login/index.html';
}

const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

const loadToday = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/attendance/today', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;

        if (data) {
            // แสดงเวลาเช็คอิน
            document.getElementById('checkInTime').innerText = formatTime(data.check_in);

            // แสดงเวลาเช็คเอาท์
            document.getElementById('checkOutTime').innerText = formatTime(data.check_out);

            // แสดงชั่วโมงทำงาน
            document.getElementById('workHours').innerText =
                data.work_hours ? `${data.work_hours} ชม.` : '-';

            // แสดงชั่วโมงโอที
            document.getElementById('overtimeHours').innerText =
                data.overtime_hours ? `${data.overtime_hours} ชม.` : '-';

            // จัดการปุ่ม
            if (data.check_in && !data.check_out) {
                // เช็คอินแล้ว ยังไม่เช็คเอาท์
                document.getElementById('checkinBtn').disabled = true;
                document.getElementById('checkinBtn').style.opacity = '0.5';
            } else if (data.check_in && data.check_out) {
                // เช็คเอาท์แล้ว ปิดทั้งสองปุ่ม
                document.getElementById('checkinBtn').disabled = true;
                document.getElementById('checkoutBtn').disabled = true;
                document.getElementById('checkinBtn').style.opacity = '0.5';
                document.getElementById('checkoutBtn').style.opacity = '0.5';
            }
        } else {
            // ยังไม่เช็คอินวันนี้ ปิดปุ่มเช็คเอาท์ก่อน
            document.getElementById('checkoutBtn').disabled = true;
            document.getElementById('checkoutBtn').style.opacity = '0.5';
        }

    } catch (error) {
        console.error('Error loading today:', error.message);
    }
}

const checkIn = async () => {
    let messageDOM = document.getElementById('message');
    try {
        await axios.post('http://localhost:5000/api/attendance/checkin', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        messageDOM.innerHTML = '<div>เช็คอินสำเร็จ</div>';
        messageDOM.className = 'message success';
        loadToday();

    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message;
        }
        messageDOM.innerHTML = `<div>${error.message}</div>`;
        messageDOM.className = 'message danger';
    }
}

const checkOut = async () => {
    let messageDOM = document.getElementById('message');
    try {
        const response = await axios.post('http://localhost:5000/api/attendance/checkout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        messageDOM.innerHTML = `
            <div>เช็คเอาท์สำเร็จ</div>
            <div>ทำงาน ${response.data.work_hours} ชั่วโมง | โอที ${response.data.overtime_hours} ชั่วโมง</div>
        `;
        messageDOM.className = 'message success';
        loadToday();

    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message;
        }
        messageDOM.innerHTML = `<div>${error.message}</div>`;
        messageDOM.className = 'message danger';
    }
}

loadToday();
