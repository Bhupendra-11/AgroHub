// Language handled globally by main.js

function togglePass() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function fillDemo(email, pass) {
  document.getElementById('email').value = email;
  document.getElementById('password').value = pass;
  document.getElementById('email').focus();
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  document.getElementById('btn-text').textContent = t('login') + '...';
  
  try {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      })
    });
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    showToast(t('welcome'), 'success');
    
    setTimeout(() => { 
        if (res.user.role === 'farmer') {
            window.location.href = 'farmer.html';
        } else if (res.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'customer.html';
        }
    }, 1000);
  } catch (err) {
    btn.disabled = false;
    document.getElementById('btn-text').textContent = t('login_btn'); // Reset text
  }
});

document.addEventListener('DOMContentLoaded', () => {
    // Page specific init
});
