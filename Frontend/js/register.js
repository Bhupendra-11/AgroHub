// Language handled globally by main.js
let role = 'farmer'; 

function setRole(r) {
  role = r;
  document.getElementById('role-val').value = r;
  ['farmer','customer'].forEach(x => {
    document.getElementById('opt-'+x).classList.toggle('active', x === r);
    document.getElementById('sec-'+x).classList.toggle('visible', x === r);
  });
}

function togglePass() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

document.getElementById('reg-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pass = document.getElementById('password').value;
  if (pass.length < 6) { 
    showToast('पासवर्ड कम से कम 6 अक्षर का होना चाहिए', 'error'); 
    return; 
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  document.getElementById('btn-text').textContent = t('register_btn') + '...';

  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: pass,
    role: role,
    phone: document.getElementById('phone').value.trim() || null,
  };

  // Address fields
  const country = role === 'farmer' ? document.getElementById('country_f').value : document.getElementById('country_c').value;
  const state = role === 'farmer' ? document.getElementById('state_f').value : document.getElementById('state_c').value;
  const district = role === 'farmer' ? document.getElementById('district_f').value : document.getElementById('district_c').value;
  const area = role === 'farmer' ? document.getElementById('area_f').value : document.getElementById('area_c').value;
  const pin = role === 'farmer' ? document.getElementById('pin_f').value : document.getElementById('pin_c').value;

  payload.address = [country, state, district, area, pin].filter(Boolean).join(', ');
  
  if (role === 'customer') {
    payload.delivery_addresses = JSON.stringify([payload.address]);
  }

  try {
    await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    showToast('🎉 रजिस्ट्रेशन सफल! कृपया लॉगिन करें।', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
  } catch (err) {
    btn.disabled = false;
    document.getElementById('btn-text').textContent = t('register_btn');
  }
});

// Pre-select role from URL param
document.addEventListener('DOMContentLoaded', () => {
  const p = new URLSearchParams(window.location.search);
  const r = p.get('role');
  if (r && ['farmer','customer'].includes(r)) setRole(r);
  else setRole('farmer'); // Default
});
