document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';

                const response = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                showToast('Login successful!', 'success');
                localStorage.setItem('access_token', response.access_token);
                localStorage.setItem('refresh_token', response.refresh_token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                setTimeout(() => {
                    const dest = response.user.role === 'farmer' ? 'farmer.html' : 'customer.html';
                    window.location.href = dest;
                }, 1000);
            } catch (error) {
                // Error is handled by apiFetch and shown as toast
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating account...';

                const response = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, role })
                });

                showToast('Registration successful!', 'success');
                localStorage.setItem('access_token', response.access_token);
                localStorage.setItem('refresh_token', response.refresh_token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                setTimeout(() => {
                    const dest = response.user.role === 'farmer' ? 'farmer.html' : 'customer.html';
                    window.location.href = dest;
                }, 1000);
            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }
});
