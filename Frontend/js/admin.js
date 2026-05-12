document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    loadDashboardStats();
    loadAllUsers();
    loadAllOrders();

    // Section Switching
    document.querySelectorAll('.admin-nav li').forEach(li => {
        li.addEventListener('click', () => {
            const section = li.dataset.section;
            switchSection(section, li);
        });
    });

    // Mobile Sidebar Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});

function switchSection(sectionId, clickedLi) {
    // Update Nav UI
    document.querySelectorAll('.admin-nav li').forEach(li => li.classList.remove('active'));
    clickedLi.classList.add('active');

    // Update Content UI
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`section-${sectionId}`).classList.add('active');

    // Update Header
    document.getElementById('section-title').textContent = clickedLi.textContent.trim();
    
    // Auto-close sidebar on mobile
    if (window.innerWidth <= 900) {
        document.getElementById('admin-sidebar').classList.remove('open');
    }
}

async function loadDashboardStats() {
    try {
        const data = await apiFetch('/admin/stats');
        const s = data.stats;
        document.getElementById('stat-total-users').textContent = s.total_users;
        document.getElementById('stat-total-farmers').textContent = s.total_farmers;
        document.getElementById('stat-total-orders').textContent = s.total_orders;
        document.getElementById('stat-total-revenue').textContent = `₹${s.total_revenue.toLocaleString('en-IN')}`;
        
        initGrowthChart();
    } catch (e) {
        showToast('Failed to load dashboard stats', 'error');
    }
}

async function loadAllUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    try {
        const data = await apiFetch('/admin/users');
        tableBody.innerHTML = '';
        data.users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="role-badge role-${u.role}">${u.role}</span></td>
                <td><span class="status-badge ${u.is_active ? 'status-active' : 'status-inactive'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="toggleUserStatus(${u.id})">${u.is_active ? 'Deactivate' : 'Activate'}</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (e) {}
}

async function toggleUserStatus(userId) {
    try {
        await apiFetch(`/admin/users/${userId}/toggle`, { method: 'POST' });
        showToast('User status updated');
        loadAllUsers();
        loadDashboardStats();
    } catch (e) {}
}

async function loadAllOrders() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    try {
        const data = await apiFetch('/admin/orders');
        tableBody.innerHTML = '';
        data.orders.forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${o.id}</td>
                <td>${o.customer_name || 'Customer'}</td>
                <td>₹${o.total_amount.toFixed(2)}</td>
                <td><span class="badge badge-${o.status}">${o.status}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (e) {}
}

function initGrowthChart() {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue Growth',
                data: [15000, 22000, 18000, 35000, 28000, 45000],
                borderColor: '#3182ce',
                backgroundColor: 'rgba(49, 130, 206, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
}
