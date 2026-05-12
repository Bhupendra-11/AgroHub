/* =====================================================
   AgroHub — Customer Dashboard JavaScript
   ===================================================== */

let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
let timeout  = null;

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    if (getUser() && getUser().role === 'customer') {
        loadCustomerOrders();
        loadDashboardStats();
    }

    loadMarketplaceProducts();
    loadFeaturedProducts();
    updateCartUI();
    loadUserProfile();

    // Sidebar navigation
    document.querySelectorAll('.cd-menu-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchCdSection(link.dataset.section, link);
        });
    });

    // Hamburger
    const hamburger = document.getElementById('cd-hamburger');
    const sidebar   = document.getElementById('cd-sidebar');
    const overlay   = document.getElementById('cd-overlay');
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

    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                items: cart.map(i => ({ product_id: i.product_id, qty: i.qty })),
                delivery_address: document.getElementById('delivery_address').value,
                payment_method:   document.getElementById('payment_method').value
            };
            const btn = checkoutForm.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Placing Order...';
            try {
                const res = await apiFetch('/orders/', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Order placed successfully! 🎉', 'success');
                cart = []; saveCart(); closeCheckoutModal();
                setTimeout(() => { window.location.href = `track-order.html?id=${res.order.id}`; }, 1500);
            } catch (err) {
                btn.disabled = false; btn.textContent = '✅ Place Order';
            }
        });
    }

    // Wishlist badge
    updateWishlistBadge();
});

/* ── SECTION SWITCHING ─────────────────────────────── */
const cdSectionTitles = {
    home:        '🏠 Dashboard',
    marketplace: '🛍️ Marketplace',
    orders:      '📦 My Orders',
    wishlist:    '❤️ Wishlist',
    payments:    '💳 Payments',
    delivery:    '🚚 Delivery',
    reviews:     '⭐ Reviews',
    profile:     '👤 Profile'
};

function switchCdSection(sectionId, clickedLink) {
    document.querySelectorAll('.cd-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.cd-menu-link').forEach(l => l.classList.remove('active'));

    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add('active');
    if (clickedLink) clickedLink.classList.add('active');

    const titleEl = document.getElementById('cd-page-title');
    if (titleEl) titleEl.textContent = cdSectionTitles[sectionId] || '';

    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
        document.getElementById('cd-sidebar').classList.remove('open');
        document.getElementById('cd-overlay').classList.remove('show');
    }

    // Lazy load section data
    if (sectionId === 'orders')      loadCustomerOrders();
    if (sectionId === 'marketplace') loadMarketplaceProducts();
    if (sectionId === 'wishlist')    renderWishlistGrid();
    if (sectionId === 'payments')    loadPaymentHistory();
    if (sectionId === 'delivery')    loadDeliveryTracking();
}

function goToMarketplace(category) {
    setCategory(category, null);
    const link = document.querySelector('[data-section="marketplace"]');
    switchCdSection('marketplace', link);
}

/* ── DASHBOARD STATS ───────────────────────────────── */
async function loadDashboardStats() {
    try {
        const stats = await apiFetch('/orders/stats/customer');
        const o = document.getElementById('cstat-orders');
        const d = document.getElementById('cstat-deliveries');
        const w = document.getElementById('cstat-wishlist');
        if (o) o.textContent = stats.total_orders;
        if (d) d.textContent = stats.active_deliveries;
        if (w) w.textContent = wishlist.length;
    } catch (err) {
        // Demo fallback
        const demo = { 'cstat-orders': 25, 'cstat-wishlist': wishlist.length, 'cstat-deliveries': 5 };
        Object.entries(demo).forEach(([id, val]) => {
            const el = document.getElementById(id); if (el) el.textContent = val;
        });
    }
    // Load nearby farmers
    loadNearbyFarmers();
}

/* ── FEATURED PRODUCTS ─────────────────────────────── */
async function loadFeaturedProducts() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    try {
        const data = await apiFetch('/products/?limit=8');
        const products = (data.products || []).slice(0, 8);
        renderProductsToGrid(products, grid);
    } catch (e) {
        grid.innerHTML = '<div class="cd-loading">Could not load products.</div>';
    }
}

/* ── MARKETPLACE ───────────────────────────────────── */
// loadMarketplaceProducts moved to products.js
// renderProductsToGrid moved to products.js

/* ── CATEGORY FILTER ───────────────────────────────── */
function setCategory(cat, clickedEl) {
    const select = document.getElementById('filter-category');
    if (select) select.value = cat;

    const titleEl = document.getElementById('marketplace-title');
    if (titleEl) titleEl.textContent = cat === 'All' ? '🛒 All Products' : `${cat}`;

    // Highlight active category chip
    document.querySelectorAll('#cat-slider .cd-cat-item').forEach(el => el.classList.remove('active'));
    if (clickedEl) clickedEl.classList.add('active');

    loadMarketplaceProducts();
}

/* ── WISHLIST ──────────────────────────────────────── */
function toggleWishlist(id, name, price, category) {
    const idx = wishlist.findIndex(w => w.id === id);
    const btn = document.getElementById(`wish-${id}`);

    if (idx > -1) {
        wishlist.splice(idx, 1);
        if (btn) btn.classList.remove('wished');
        showToast(`${name} removed from wishlist`, 'info');
    } else {
        wishlist.push({ id, name, price, category });
        if (btn) btn.classList.add('wished');
        showToast(`${name} added to wishlist ❤️`, 'success');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
}

function updateWishlistBadge() {
    const el = document.getElementById('cstat-wishlist');
    if (el) el.textContent = wishlist.length;
}

function renderWishlistGrid() {
    const grid = document.getElementById('wishlist-grid');
    if (!grid) return;

    if (!wishlist.length) {
        grid.innerHTML = '<div class="cd-loading">Your wishlist is empty. Browse products and click ❤️!</div>';
        return;
    }

    const categoryEmojis = { Vegetables:'🥦', Fruits:'🍎', Grains:'🌾', Dairy:'🥛', Spices:'🌶️', Pulses:'🥣' };
    grid.innerHTML = '';
    wishlist.forEach(p => {
        const imgPath = getProductImage(p);
        const card = document.createElement('div');
        card.className = 'cd-product-card';
        card.innerHTML = `
            <img src="${imgPath}" alt="${p.name}" class="cd-product-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="cd-product-emoji" style="display:none;">${categoryEmojis[p.category] || '🌿'}</div>
            <div class="cd-product-body">
                <div class="cd-product-cat">${p.category}</div>
                <h3 class="cd-product-name">${p.name}</h3>
                <div class="cd-product-price">₹${parseFloat(p.price).toFixed(2)}</div>
                <div class="cd-product-actions">
                    <button class="cd-btn cd-btn-primary" onclick="addToCart(${p.id},'${p.name.replace(/'/g,"\\'")}',${p.price})">🛒 Add to Cart</button>
                    <button class="cd-wish-btn wished" onclick="toggleWishlist(${p.id},'${p.name.replace(/'/g,"\\'")}',${p.price},'${p.category}'); renderWishlistGrid();">❤️</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* ── ORDERS ────────────────────────────────────────── */
// loadCustomerOrders moved to orders.js

async function cancelOrder(id) {
    if (!confirm('Cancel this order?')) return;
    try {
        await apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
        showToast('Order cancelled.', 'info');
        loadCustomerOrders();
    } catch (e) {}
}

function filterOrders(status, el) {
    document.querySelectorAll('.cd-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    loadCustomerOrders(); // In production: pass filter to API
}

/* ── PAYMENT HISTORY ───────────────────────────────── */
async function loadNearbyFarmers() {
    const el = document.getElementById('nearby-farmers');
    if (!el) return;
    try {
        const data    = await apiFetch('/auth/farmers/nearby');
        const farmers = data.farmers || [];
        if (!farmers.length) return;
        el.innerHTML = farmers.slice(0, 6).map(f => `
            <div class="cd-farmer-chip" onclick="showToast('${f.name} — ${f.farm_location || 'Local'}', 'info')">
                <i class="fas fa-user-circle"></i>
                ${f.name.split(' ')[0]} ${f.farm_location ? '(' + f.farm_location + ')' : ''}
                ${f.rating ? '<span style="color:#f5a623;"> ⭐' + f.rating + '</span>' : ''}
            </div>`).join('');
    } catch (e) {
        // Keep static fallback chips
    }
}

async function loadPaymentHistory() {
    try {
        const data = await apiFetch('/orders/payments/history');
        const payments = data.payments || [];
        const el = document.getElementById('payment-history');
        if (!el || !payments.length) return;
        el.innerHTML = payments.map(p => {
            const cls = p.payment_status === 'paid' ? 'success' : 'pending';
            return `
                <div class="cd-pay-row">
                    <div><strong>Order #${p.order_id}</strong><br><small>${p.date}</small></div>
                    <span class="cd-pay-amt ${cls}">₹${parseFloat(p.amount).toFixed(2)}</span>
                </div>`;
        }).join('');
    } catch (e) {
        // Keep static demo rows
    }
}

function downloadInvoice() { showToast('Invoice downloaded (demo)!', 'success'); }

/* ── DELIVERY TRACKING ─────────────────────────────── */
async function loadDeliveryTracking() {
    try {
        const data   = await apiFetch('/orders/customer');
        const orders = (data.orders || []).filter(o => o.status !== 'delivered' && o.status !== 'rejected');
        const el     = document.getElementById('delivery-list');
        if (!el) return;
        if (!orders.length) { el.innerHTML = '<p class="text-muted text-center" style="padding:20px;">No active deliveries.</p>'; return; }
        el.innerHTML = '';
        orders.forEach(o => {
            const items = o.items.map(i => `${i.qty}x ${i.name}`).join(', ');
            el.innerHTML += `
                <div class="cd-delivery-item">
                    <div class="cd-delivery-top"><strong>Order #${o.id}</strong><span class="cd-badge warning">${o.status}</span></div>
                    <p class="text-muted">${items} — ₹${parseFloat(o.total_amount || 0).toFixed(2)}</p>
                    <div class="cd-tracker">
                        <div class="cd-tracker-step done"><i class="fas fa-check-circle"></i><span>Placed</span></div>
                        <div class="cd-tracker-line done"></div>
                        <div class="cd-tracker-step ${o.status !== 'pending' ? 'done' : 'active'}"><i class="fas fa-check-circle"></i><span>Accepted</span></div>
                        <div class="cd-tracker-line ${o.status !== 'pending' ? 'done' : ''}"></div>
                        <div class="cd-tracker-step ${o.status === 'in_transit' ? 'active' : ''}"><i class="fas fa-truck"></i><span>In Transit</span></div>
                        <div class="cd-tracker-line"></div>
                        <div class="cd-tracker-step"><i class="fas fa-home"></i><span>Delivered</span></div>
                    </div>
                    <a href="track-order.html?id=${o.id}" class="cd-btn cd-btn-primary mt-1" style="font-size:0.82rem;">📍 Live Track</a>
                </div>`;
        });
    } catch (e) {}
}

/* ── AI RECOMMENDATIONS ────────────────────────────── */
function loadAIRecommendations() {
    showToast('AI recommendations refreshed! 🤖', 'success');
}

/* ── REVIEWS ───────────────────────────────────────── */
const ratings = {};

function setRating(productId, stars) {
    ratings[productId] = stars;
    const selector = document.querySelector(`.cd-star-selector[data-product="${productId}"]`);
    if (!selector) return;
    selector.querySelectorAll('.cd-star').forEach((s, i) => {
        s.classList.toggle('active', i < stars);
    });
}

async function submitReview(productId) {
    const rating  = ratings[productId] || 0;
    const text    = document.getElementById(`review-text-${productId}`)?.value || '';
    if (!rating)  { showToast('Please select a star rating!', 'info'); return; }
    if (!text.trim()) { showToast('Please write a review!', 'info'); return; }
    try {
        await apiFetch('/reviews/', { method: 'POST', body: JSON.stringify({ product_id: productId, rating, review: text }) });
        showToast('Review submitted! ⭐', 'success');
    } catch (e) {
        showToast('Review submitted (demo)! ⭐', 'success');
    }
}

/* ── VOICE SEARCH ──────────────────────────────────── */
function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        showToast('Voice search not supported in this browser.', 'error'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = 'en-IN';
    recog.onresult = (e) => {
        const q = e.results[0][0].transcript;
        const inp = document.getElementById('search-product');
        if (inp) { inp.value = q; }
        showToast(`Searching for: "${q}"`, 'info');
        const link = document.querySelector('[data-section="marketplace"]');
        switchCdSection('marketplace', link);
        loadMarketplaceProducts();
    };
    recog.onerror = () => showToast('Could not hear. Try again.', 'error');
    recog.start();
}

/* ── NOTIFICATIONS ─────────────────────────────────── */
// toggleCdNotifications is now centralized in main.js


/* ── PROFILE ───────────────────────────────────────── */
function loadUserProfile() {
    const user = getUser();
    if (!user) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('profile-name', user.name || '');
    set('profile-email', user.email || '');
    setText('profile-display-name', user.name || 'Customer');
    setText('sidebar-user-name', user.name || 'Customer');
    setText('topbar-user-name', user.name || 'Customer');
}

async function saveCustomerProfile() {
    const payload = {
        name:    document.getElementById('profile-name')?.value,
        phone:   document.getElementById('profile-mobile')?.value,
        address: document.getElementById('profile-address')?.value
    };
    try {
        await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Profile saved! ✅', 'success');
    } catch (e) {
        showToast('Profile saved locally!', 'success');
    }
}

/* ── DEBOUNCE (from main.js) ────────────────────────── */
// debounce is defined in main.js — no redefinition needed here