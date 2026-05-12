document.addEventListener('DOMContentLoaded', () => {
            const user = getUser();
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            if (user.role === 'farmer') {
                window.location.href = 'farmer.html';
            } else if (user.role === 'customer') {
                window.location.href = 'customer.html';
            } else {
                window.location.href = 'index.html';
            }
        });