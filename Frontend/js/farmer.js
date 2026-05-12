/* =====================================================
   AgroHub — Farmer Dashboard JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    if (getUser() && getUser().role === 'farmer') {
        loadFarmerDashboard(); 
        loadFarmerProducts();
        loadFarmerOrders();
        loadFarmerReviews(); // New: Load customer reviews
        loadUserProfile();
    }

    // Sidebar navigation
    document.querySelectorAll('.fd-menu-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section, link);
        });
    });

    // Hamburger toggle
    const hamburger = document.getElementById('fd-hamburger');
    const sidebar   = document.getElementById('fd-sidebar');
    const overlay   = document.getElementById('fd-overlay');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    // Product form submit
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('product_id').value;
            const payload = {
                name:        document.getElementById('name').value,
                category:    document.getElementById('category').value,
                price:       parseFloat(document.getElementById('price').value),
                stock:       parseInt(document.getElementById('stock').value),
                unit:        document.getElementById('unit').value,
                description: document.getElementById('description').value,
                image_url:   document.getElementById('image_url').value
            };
            try {
                if (id) {
                    await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                    showToast('Product updated!', 'success');
                } else {
                    await apiFetch('/products/', { method: 'POST', body: JSON.stringify(payload) });
                    showToast('Product added!', 'success');
                }
                closeAddProductModal();
                loadFarmerProducts();
                loadDashboardStats();
            } catch (err) { /* handled by main.js */ }
        });
    }

    // Init charts
    initSalesChart();
    initCategoryChart();
});

/* ── SECTION SWITCHING ─────────────────────────────── */
const sectionTitles = {
    home:     '🏠 Dashboard',
    products: '🌾 Product Management',
    orders:   '📦 Order Management',
    payments: '💰 Payment Section',
    delivery: '🚚 Delivery Feature',
    smart:    '🤖 Smart Features',
    profile:  '👤 Profile Section'
};

function switchSection(sectionId, clickedLink) {
    // Hide all sections
    document.querySelectorAll('.fd-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.fd-menu-link').forEach(l => l.classList.remove('active'));

    // Show selected
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add('active');
    if (clickedLink) clickedLink.classList.add('active');

    // Update topbar title
    const titleEl = document.getElementById('fd-page-title');
    if (titleEl) titleEl.textContent = sectionTitles[sectionId] || '';

    // Close sidebar on mobile
    const sidebar = document.getElementById('fd-sidebar');
    const overlay = document.getElementById('fd-overlay');
    if (window.innerWidth <= 900) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    // Lazy-load section data
    if (sectionId === 'orders')   loadFarmerOrders();
    if (sectionId === 'products') loadFarmerProducts();
    if (sectionId === 'profile')  loadUserProfile();
    if (sectionId === 'payments') loadPaymentData();
    if (sectionId === 'delivery') loadDeliveryData();
    if (sectionId === 'smart') {
        loadWeather();
        loadDemandPrediction();
        loadCropRecommendations();
    }
}

/* ── DASHBOARD STATS ───────────────────────────────── */
async function loadFarmerDashboard() {
    try {
        // Use dedicated stats API first
        const stats = await apiFetch('/orders/stats/farmer');
        const oEl = document.getElementById('stat-total-orders');
        const eEl = document.getElementById('stat-earnings');
        const pEl = document.getElementById('stat-pending');
        const prEl = document.getElementById('stat-products');
        if (oEl)  oEl.textContent  = stats.total_orders;
        if (eEl)  eEl.textContent  = `₹${(stats.total_earnings || 0).toLocaleString('en-IN')}`;
        if (pEl)  pEl.textContent  = stats.pending_orders;
        if (prEl) prEl.textContent = stats.total_products;

        // Update Charts with real data
        if (stats.chart_data) {
            updateSalesChart(stats.chart_data);
        }

        // Stock alerts from stats
        const alertsEl = document.getElementById('stock-alerts');
        if (alertsEl) {
            alertsEl.innerHTML = '';
            const oos = stats.out_of_stock_products || [];
            const low = stats.low_stock_products    || [];

            if (!oos.length && !low.length) {
                alertsEl.innerHTML = '<div class="fd-alert-item success"><i class="fas fa-check-circle"></i> All products are well stocked!</div>';
            }
            oos.forEach(p => {
                alertsEl.innerHTML += `<div class="fd-alert-item danger"><i class="fas fa-times-circle"></i> <strong>${p.name}</strong> is out of stock!</div>`;
            });
            low.forEach(p => {
                alertsEl.innerHTML += `<div class="fd-alert-item warning"><i class="fas fa-exclamation-triangle"></i> <strong>${p.name}</strong>: only ${p.stock} ${p.unit} left</div>`;
            });
        }
    } catch (err) {
        // Fallback to individual APIs
        try {
            const [prodData, orderData] = await Promise.all([
                apiFetch(`/products/?farmer_id=${getUser().id}`),
                apiFetch('/orders/farmer')
            ]);
            const products = prodData.products || [];
            const orders   = orderData.orders  || [];
            const earnings = orders.reduce((s, o) => s + (o.farmer_total || 0), 0);
            const ids = ['stat-total-orders','stat-earnings','stat-pending','stat-products'];
            const vals = [
                orders.length,
                `₹${earnings.toLocaleString('en-IN')}`,
                orders.filter(o => o.status === 'pending').length,
                products.length
            ];
            ids.forEach((id, i) => { const el = document.getElementById(id); if (el) el.textContent = vals[i]; });
        } catch (e) {
            // Hard fallback demo
            const demo = ['125', '₹52,000', '9', '18'];
            ['stat-total-orders','stat-earnings','stat-pending','stat-products']
                .forEach((id, i) => { const el = document.getElementById(id); if (el) el.textContent = demo[i]; });
        }
    }
}

/* ── CHARTS ────────────────────────────────────────── */
let salesChartInst, categoryChartInst;

function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    salesChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun'],
            datasets: [{
                label: 'Monthly Sales (₹)',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46,125,50,0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2e7d32',
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function updateSalesChart(data) {
    if (!salesChartInst) return;
    salesChartInst.data.labels = data.labels;
    salesChartInst.data.datasets[0].data = data.values;
    salesChartInst.update();
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    categoryChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Vegetables','Fruits','Grains','Dairy','Others'],
            datasets: [{
                data: [40, 25, 15, 12, 8],
                backgroundColor: ['#2e7d32','#fb8c00','#1565c0','#6a1b9a','#e53935'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } }
        }
    });
}

/* ── PRODUCTS ──────────────────────────────────────── */
let farmerProductsMap = {};

function openAddProductModal() {
    document.getElementById('product_id').value = '';
    document.getElementById('product-form').reset();
    document.getElementById('modal-title').textContent = '🌾 Add New Product';
    document.getElementById('addProductModal').classList.add('active');
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.remove('active');
    document.getElementById('product-form').reset();
    const msg = document.getElementById('ai-price-msg');
    if (msg) { msg.style.display = 'none'; msg.textContent = ''; }
}

function editProductById(id) {
    const p = farmerProductsMap[id];
    if (!p) return;
    document.getElementById('product_id').value    = p.id;
    document.getElementById('name').value          = p.name;
    document.getElementById('category').value      = p.category;
    document.getElementById('price').value         = p.price;
    document.getElementById('stock').value         = p.stock;
    document.getElementById('unit').value          = p.unit;
    document.getElementById('description').value   = p.description || '';
    document.getElementById('image_url').value     = p.image_url || '';
    document.getElementById('modal-title').textContent = '✏️ Edit Product';
    document.getElementById('addProductModal').classList.add('active');
}

/* Override loadFarmerProducts to use fd-table and show images */
async function loadFarmerProducts() {
    const tbody = document.getElementById('farmer-products-table');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:24px;color:#999;">Loading...</td></tr>`;
    const user = getUser();
    if (!user) return;
    try {
        const data = await apiFetch(`/products/?farmer_id=${user.id}`);
        const products = data.products || [];
        farmerProductsMap = {};
        
        if (!products.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:24px;color:#999;">No products yet. Click "+ Add Product" to start! 🌾</td></tr>`;
            return;
        }
        tbody.innerHTML = '';
        products.forEach(p => {
            farmerProductsMap[p.id] = p;
            const imgPath = getProductImage(p);
            const img = `<img src="${imgPath}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" alt="${p.name}" onerror="this.src='../images/agrohub_logo.png'">`;
            const stockColor = p.stock <= 0 ? 'color:#e53935;font-weight:700;' : p.stock < 20 ? 'color:#fb8c00;font-weight:700;' : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${img}</td>
                <td><strong>${p.name}</strong></td>
                <td><span class="fd-badge info">${p.category}</span></td>
                <td><strong>₹${parseFloat(p.price).toFixed(2)}</strong>/${p.unit}</td>
                <td style="${stockColor}">${p.stock} ${p.unit}</td>
                <td>⭐ ${p.rating || 'N/A'}</td>
                <td style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="fd-btn fd-btn-warning fd-btn-sm" onclick="editProductById(${p.id})">✏️ Edit</button>
                    <button class="fd-btn fd-btn-danger fd-btn-sm" onclick="deleteProduct(${p.id})">🗑️ Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:#e53935;padding:20px;">Failed to load products.</td></tr>`;
    }
}

/* ── AI PRICE SUGGESTION ───────────────────────────── */
async function suggestAIPrice() {
    const name = document.getElementById('name').value;
    const cat  = document.getElementById('category').value;
    const msg  = document.getElementById('ai-price-msg');
    if (!name) { showToast('Enter product name first', 'info'); return; }
    msg.style.display = 'block';
    msg.textContent = '🤖 AI analyzing market trends...';
    try {
        const res = await apiFetch(`/products/ai-price?name=${encodeURIComponent(name)}&category=${encodeURIComponent(cat)}`);
        document.getElementById('price').value = res.suggested_price;
        msg.textContent = `✅ Suggested: ₹${res.suggested_price} (${res.confidence}% confidence)`;
    } catch (e) {
        msg.textContent = '❌ AI suggestion failed. Please set manually.';
    }
}

async function getAIPriceSuggestion() {
    const name = document.getElementById('ai-product-name').value;
    const cat  = document.getElementById('ai-product-cat').value;
    const res  = document.getElementById('ai-price-result');
    if (!name) { showToast('Enter product name', 'info'); return; }
    res.style.display = 'block';
    res.textContent = '🤖 Analyzing...';
    try {
        const data = await apiFetch(`/products/ai-price?name=${encodeURIComponent(name)}&category=${encodeURIComponent(cat)}`);
        res.innerHTML = `<strong>💡 AI Suggested Price: ₹${data.suggested_price} / kg</strong><br>Market Confidence: ${data.confidence}%<br><em>${data.reason || ''}</em>`;
    } catch (e) {
        res.textContent = '❌ Could not get suggestion right now.';
    }
}

/* ── ORDERS ────────────────────────────────────────── */
async function loadFarmerOrders() {
    const tbody = document.getElementById('farmer-orders-table');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:24px;color:#999;">Loading orders...</td></tr>`;
    try {
        const data = await apiFetch('/orders/farmer');
        const orders = data.orders || [];
        if (!orders.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:24px;color:#999;">No orders received yet.</td></tr>`;
            return;
        }
        tbody.innerHTML = '';
        orders.forEach(o => {
            const items = o.items.map(i => `${i.qty}x ${i.name}`).join(', ');
            const statusClass = o.status === 'delivered' ? 'success' : o.status === 'rejected' ? 'danger' : 'pending';
            const actions = o.status === 'pending'
                ? `<button class="fd-btn fd-btn-primary fd-btn-sm" onclick="acceptOrder(${o.id})">✅ Accept</button>
                   <button class="fd-btn fd-btn-danger fd-btn-sm" onclick="rejectOrder(${o.id})">❌ Reject</button>`
                : `<button class="fd-btn fd-btn-sm" onclick="trackOrder(${o.id})">📍 Track</button>`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${o.id}</strong></td>
                <td>${o.customer_name || 'Customer'}</td>
                <td>${items}</td>
                <td><strong>₹${(o.farmer_total || 0).toFixed(2)}</strong></td>
                <td><span class="fd-badge ${statusClass}">${o.status}</span></td>
                <td style="display:flex;gap:6px;flex-wrap:wrap;">${actions}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:#e53935;padding:20px;">Error loading orders.</td></tr>`;
    }
}

async function acceptOrder(id) {
    try {
        await apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'accepted' }) });
        showToast('Order accepted!', 'success');
        loadFarmerOrders();
    } catch (e) {}
}

async function rejectOrder(id) {
    if (!confirm('Reject this order?')) return;
    try {
        await apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'rejected' }) });
        showToast('Order rejected.', 'error');
        loadFarmerOrders();
    } catch (e) {}
}

function trackOrder(id) {
    window.open(`track-order.html?id=${id}`, '_blank');
}

function switchOrderTab(tab, el) {
    document.querySelectorAll('.fd-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    loadFarmerOrders(); // In a real app, filter by tab
}

/* ── PAYMENTS ──────────────────────────────────────── */
async function loadPaymentData() {
    try {
        // Use dedicated payment history API
        const data = await apiFetch('/orders/payments/history');
        const payments = data.payments || [];

        const total   = payments.reduce((s, p) => s + (p.amount || 0), 0);
        const pending = payments.filter(p => p.payment_status === 'unpaid').reduce((s, p) => s + (p.amount || 0), 0);
        const el1 = document.getElementById('pay-total');
        const el2 = document.getElementById('pay-pending');
        if (el1) el1.textContent = `₹${total.toLocaleString('en-IN')}`;
        if (el2) el2.textContent = `₹${pending.toLocaleString('en-IN')}`;

        // Render payment history table
        const histEl = document.getElementById('payment-history-table');
        if (histEl && payments.length) {
            histEl.innerHTML = '';
            payments.forEach(p => {
                const cls = p.payment_status === 'paid' ? 'success' : 'warning';
                histEl.innerHTML += `
                    <tr>
                        <td><strong>#${p.order_id}</strong></td>
                        <td>${p.date}</td>
                        <td><strong>₹${p.amount.toFixed(2)}</strong></td>
                        <td><span class="fd-badge ${cls}">${p.payment_status}</span></td>
                        <td><span class="fd-badge">${p.order_status}</span></td>
                    </tr>`;
            });
        }
    } catch (e) {
        // Fallback: get from orders
        try {
            const data = await apiFetch('/orders/farmer');
            const orders = data.orders || [];
            const total   = orders.reduce((s, o) => s + (o.farmer_total || 0), 0);
            const pending = orders.filter(o => o.status === 'pending').reduce((s, o) => s + (o.farmer_total || 0), 0);
            const el1 = document.getElementById('pay-total');
            const el2 = document.getElementById('pay-pending');
            if (el1) el1.textContent = `₹${total.toLocaleString('en-IN')}`;
            if (el2) el2.textContent = `₹${pending.toLocaleString('en-IN')}`;
        } catch (_) {}
    }
}

async function savePaymentDetails() {
    const payload = {
        upi_id:       document.getElementById('pay-upi')?.value,
        bank_account: document.getElementById('pay-bank')?.value,
        payment_method: 'upi'
    };
    try {
        await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Payment details saved!', 'success');
    } catch (e) {
        showToast('Saved locally!', 'success');
    }
}

function downloadInvoice() {
    showToast('Invoice downloaded (demo)!', 'success');
}

/* ── DELIVERY ──────────────────────────────────────── */
async function loadDeliveryData() {
    const list = document.getElementById('farmer-delivery-list');
    if (!list) return;
    list.innerHTML = '<tr><td colspan="6" class="text-center">Loading deliveries...</td></tr>';
    try {
        const data = await apiFetch('/delivery/farmer');
        const deliveries = data.deliveries || [];
        if (!deliveries.length) {
            list.innerHTML = '<tr><td colspan="6" class="text-center">No active deliveries.</td></tr>';
            return;
        }
        list.innerHTML = '';
        deliveries.forEach(d => {
            const statusClass = d.status === 'delivered' ? 'success' : d.status === 'in_transit' ? 'warning' : 'pending';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${d.order_id}</strong></td>
                <td>${d.customer_name || 'Customer'}</td>
                <td>${d.delivery_address}</td>
                <td><span class="fd-badge ${statusClass}">${d.status}</span></td>
                <td>${d.estimated_delivery ? new Date(d.estimated_delivery).toLocaleDateString('en-IN') : 'N/A'}</td>
                <td>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button class="fd-btn fd-btn-sm fd-btn-primary" onclick="updateDelivery(${d.order_id}, 'in_transit')">🚚 Ship</button>
                        <button class="fd-btn fd-btn-sm" style="background:#2e7d32;color:#fff;" onclick="updateDelivery(${d.order_id}, 'delivered')">✅ Done</button>
                    </div>
                </td>`;
            list.appendChild(tr);
        });
    } catch (e) {
        if (list) list.innerHTML = '<tr><td colspan="6" class="text-center" style="color:#c62828">Could not load deliveries.</td></tr>';
    }
}

async function updateDelivery(orderId, status) {
    try {
        await apiFetch(`/delivery/order/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        showToast(`Delivery marked as ${status}!`, 'success');
        loadDeliveryData();
        loadFarmerOrders();
        loadFarmerDashboard();
    } catch (e) {
        showToast('Update failed. Try again.', 'error');
    }
}

function viewDeliveryHistory(id) {
    window.open(`track-order.html?id=${id}`, '_blank');
}

/* ── SMART FEATURES ────────────────────────────────── */
async function loadDemandPrediction() {
    const el = document.getElementById('demand-list');
    if (!el) { showToast('Demand predictions refreshed!', 'success'); return; }
    el.innerHTML = '<p style="color:#999;">Loading predictions...</p>';
    try {
        const data = await apiFetch('/weather/demand');
        const preds = data.predictions || [];
        el.innerHTML = '';
        preds.forEach(p => {
            const color = p.demand_change > 0 ? '#2e7d32' : '#e53935';
            el.innerHTML += `
                <div class="fd-demand-item">
                    <div><strong>${p.name}</strong><br><small class="text-muted">${p.reason}</small></div>
                    <span style="color:${color};font-weight:700;font-size:1rem;">${p.trend} ${p.demand_change > 0 ? '+' : ''}${p.demand_change}%</span>
                </div>`;
        });
        showToast('Demand predictions refreshed! 🤖', 'success');
    } catch (e) {
        if (el) el.innerHTML = '<p style="color:#e53935;">Could not load predictions.</p>';
    }
}

async function loadWeather() {
    const user   = getUser();
    const loc    = user?.address || 'Nagpur';
    const el     = document.getElementById('weather-card');
    const tipsEl = document.getElementById('crop-tips');
    if (!el) return;
    el.innerHTML = '<p style="color:#999;">Loading weather...</p>';
    try {
        const data = await apiFetch(`/weather/?location=${encodeURIComponent(loc)}`);
        el.innerHTML = `
            <div class="fd-weather-display">
                <div class="fd-weather-icon">${data.icon}</div>
                <div class="fd-weather-info">
                    <h2>${data.temperature}°C</h2>
                    <p>${data.description}</p>
                    <p class="text-muted">📍 ${data.location} | 💧 ${data.humidity}% | 💨 ${data.wind_speed} km/h</p>
                    <span class="fd-badge info" style="text-transform:capitalize;">${data.season} Season</span>
                </div>
            </div>
            ${data.alerts.map(a => `<div class="fd-alert-item warning" style="margin-top:8px;">${a}</div>`).join('')}
            <div class="fd-forecast">
                ${data.forecast.map(f => `<div class="fd-forecast-day"><strong>${f.day}</strong><br>${f.icon}<br>${f.temp}°C</div>`).join('')}
            </div>`;
        if (tipsEl) {
            tipsEl.innerHTML = data.crop_tips
                .map(t => `<div class="fd-alert-item success"><i class="fas fa-leaf"></i> ${t}</div>`)
                .join('');
        }
    } catch (e) {
        if (el) el.innerHTML = '<p style="color:#e53935;">Weather unavailable.</p>';
    }
}

async function loadCropRecommendations() {
    const el = document.getElementById('crop-rec-list');
    if (!el) return;
    el.innerHTML = '<p style="color:#999;">Loading recommendations...</p>';
    try {
        const user = getUser();
        const loc  = user?.farm_location || 'India';
        const data = await apiFetch(`/weather/crops?location=${encodeURIComponent(loc)}`);
        el.innerHTML = `<p class="text-muted" style="margin-bottom:12px;">Season: <strong style="color:#1b5e20;text-transform:capitalize;">${data.season}</strong></p>`;
        el.innerHTML += data.recommended.map(r => `
            <div class="fd-demand-item">
                <div><strong>🌱 ${r.crop}</strong><br><small class="text-muted">${r.reason}</small></div>
                <div style="text-align:right;">
                    <span class="fd-badge ${r.profit === 'High' ? 'success' : 'info'}">${r.profit} Profit</span>
                    <br><small>${r.price_trend}</small>
                </div>
            </div>`).join('');
        if (data.avoid.length) {
            el.innerHTML += `<p style="margin-top:14px;font-weight:700;color:#e53935;">⚠️ Avoid This Season:</p>`;
            el.innerHTML += data.avoid.map(c => `<span class="fd-badge danger" style="margin:3px;">${c}</span>`).join('');
        }
    } catch (e) {
        if (el) el.innerHTML = '<p style="color:#e53935;">Could not load recommendations.</p>';
    }
}

/* ── VOICE UPLOAD ──────────────────────────────────── */
let recognition = null;

function startVoiceUpload() {
    const btn    = document.getElementById('voice-btn');
    const status = document.getElementById('voice-status');
    const result = document.getElementById('voice-result');

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        showToast('Voice recognition not supported in this browser.', 'error');
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    btn.classList.add('listening');
    if (status) status.textContent = '🎤 Listening... speak now';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        btn.classList.remove('listening');
        if (status) status.textContent = `Heard: "${transcript}"`;
        parseVoiceCommand(transcript, result);
    };

    recognition.onerror = () => {
        btn.classList.remove('listening');
        if (status) status.textContent = 'Could not hear. Try again.';
    };

    recognition.onend = () => {
        btn.classList.remove('listening');
    };

    recognition.start();
}

function parseVoiceCommand(text, resultEl) {
    // Simple parsing: "Add 50kg Tomato at 40 rupees"
    const lower = text.toLowerCase();
    const qty   = lower.match(/(\d+)\s*(kg|liter|piece)/i);
    const price = lower.match(/(\d+)\s*(rupees|rs|₹)/i);

    if (resultEl) {
        resultEl.style.display = 'block';
        if (qty && price) {
            resultEl.innerHTML = `✅ Parsed: <strong>${qty[1]} ${qty[2]}</strong> at <strong>₹${price[1]}</strong><br>
                <button class="fd-btn fd-btn-primary mt-1" onclick="openAddProductModal()">Open Product Form</button>`;
            if (qty) document.getElementById('stock') && (document.getElementById('stock').value = qty[1]);
            if (price) document.getElementById('price') && (document.getElementById('price').value = price[1]);
        } else {
            resultEl.textContent = `Heard: "${text}" — Try: "Add 50kg Tomato at 40 rupees"`;
        }
    }
}

/* ── PROFILE ───────────────────────────────────────── */
function loadUserProfile() {
    const user = getUser();
    if (!user) return;

    const nameEl   = document.getElementById('profile-name');
    const emailEl  = document.getElementById('profile-email');
    const dispEl   = document.getElementById('profile-display-name');
    const sideEl   = document.getElementById('sidebar-farmer-name');
    const topEl    = document.getElementById('topbar-farmer-name');

    if (nameEl)  nameEl.value  = user.name || '';
    if (emailEl) emailEl.value = user.email || '';
    if (dispEl)  dispEl.textContent = user.name || 'Farmer';
    if (sideEl)  sideEl.textContent = user.name || 'Farmer';
    if (topEl)   topEl.textContent  = user.name || 'Farmer';
}

async function saveProfile() {
    const payload = {
        name:          document.getElementById('profile-name')?.value,
        phone:         document.getElementById('profile-mobile')?.value,
        address:       document.getElementById('profile-location')?.value,
        farm_location: document.getElementById('profile-location')?.value,
        upi_id:        document.getElementById('profile-upi')?.value,
        bank_account:  document.getElementById('profile-bank')?.value
    };
    try {
        await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Profile saved!', 'success');
    } catch (e) {
        showToast('Profile saved locally!', 'success');
    }
}

/* ── NOTIFICATIONS ─────────────────────────────────── */
// toggleNotifications is now centralized in main.js


/* ── REVIEWS ───────────────────────────────────────── */
async function loadFarmerReviews() {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    try {
        const data = await apiFetch('/reviews/farmer');
        const reviews = data.reviews || [];
        
        // Update Stats Summary if elements exist
        const scoreEl = document.querySelector('.fd-rating-score');
        if (scoreEl) scoreEl.innerHTML = `${data.avg_rating || 0} <span>⭐</span>`;
        
        // Update Bars
        if (data.distribution) {
            Object.keys(data.distribution).forEach(star => {
                const count = data.distribution[star];
                const pct = data.total ? (count / data.total * 100).toFixed(0) : 0;
                // Find matching bar - this assumes specific HTML structure
                const barFill = document.querySelector(`.fd-rating-bar:nth-child(${6-star}) .fd-bar-fill`);
                const pctLabel = document.querySelector(`.fd-rating-bar:nth-child(${6-star}) span:last-child`);
                if (barFill) barFill.style.width = `${pct}%`;
                if (pctLabel) pctLabel.textContent = `${pct}%`;
            });
        }

        if (!reviews.length) {
            list.innerHTML = '<div class="fd-review-item text-center">No reviews from customers yet.</div>';
            return;
        }

        list.innerHTML = '';
        reviews.forEach(r => {
            const stars = '⭐'.repeat(Math.round(r.rating));
            const date = new Date(r.created_at).toLocaleDateString('en-IN');
            const item = document.createElement('div');
            item.className = 'fd-review-item';
            item.innerHTML = `
                <div class="fd-review-top">
                    <strong>${r.customer_name || 'Customer'}</strong> 
                    <span>${stars}</span>
                </div>
                <p style="font-size:0.85rem; color:#666; margin:4px 0;">Product: <strong>${r.product_name}</strong> | ${date}</p>
                <p>${r.review || 'No comment provided.'}</p>
            `;
            list.appendChild(item);
        });
    } catch (e) {
        list.innerHTML = '<div class="fd-review-item text-center" style="color:#c62828">Failed to load reviews.</div>';
    }
}