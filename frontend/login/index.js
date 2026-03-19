const login = async () => {
    let usernameDOM = document.querySelector('input[name=username]');
    let passwordDOM = document.querySelector('input[name=password]');
    let messageDOM = document.getElementById('message');

    try {
        // เช็คว่ากรอกครบไหม
        if (!usernameDOM.value || !passwordDOM.value) {
            throw {
                message: 'กรุณากรอก username และ password'
            }
        }

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            username: usernameDOM.value,
            password: passwordDOM.value
        });

        // เก็บ token และ role ไว้ใน localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);

        // redirect ตาม role
        if (response.data.role === 'admin') {
            window.location.href = '../admin/dashboard.html';
        } else {
            window.location.href = '../employee/dashboard.html';
        }

    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message;
        }
        messageDOM.innerHTML = `<div>${error.message}</div>`;
        messageDOM.className = 'message danger';
    }
}