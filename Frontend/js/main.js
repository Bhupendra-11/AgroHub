const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.protocol === 'file:' ? 'http://127.0.0.1:5000/api' : '/api';
const TRANSLATIONS = {
    en: {
        welcome: "Welcome to AgroHub",
        dashboard: "Dashboard",
        profile: "Profile",
        logout: "Logout",
        login: "Login",
        signup: "Sign Up",
        home: "Home",
        weather: "Weather",
        orders: "Orders",
        products: "Products",
        marketplace: "Marketplace",
        wishlist: "Wishlist",
        payments: "Payments",
        delivery: "Delivery",
        reviews: "Reviews",
        fresh_produce: "Fresh Produce directly from Farms",
        search_placeholder: "Search for crops, vegetables...",
        error_msg: "Something went wrong",
        // Auth / Forms
        email: "Email",
        password: "Password",
        full_name: "Full Name",
        phone: "Mobile Number",
        address: "Address",
        country: "Country",
        state: "State",
        district: "District",
        village: "Village/Area",
        pin_code: "PIN Code",
        login_btn: "Login",
        register_btn: "Register",
        already_have_account: "Already have an account?",
        new_user: "New user?",
        brand_sub: "Fresh from farm to your door 🚀",
        // Roles
        farmer: "Farmer",
        customer: "Customer",
        delivery_partner: "Delivery Partner",
        admin: "Admin",
        // Farmer specific
        add_product: "Add Product",
        total_earnings: "Total Earnings",
        pending_orders: "Pending Orders",
        // Customer specific
        cart: "Cart",
        checkout: "Checkout",
        place_order: "Place Order",
        total_items: "Total Items",
        // Index Page
        hero_title: "Fresh Farm to Your Door!",
        hero_desc: "Connect directly with local farmers for the freshest organic vegetables, fruits & dairy. Support local agriculture and enjoy premium quality at fair prices.",
        get_started: "Get Started",
        our_services: "Our Services",
        core_services: "🚀 Core Services",
        services_subtitle: "Everything you need for seamless farm-to-door delivery",
        smart_features: "Smart Features",
        total_orders: "Total Orders",
        pending_deliveries: "Pending Deliveries",
        available_products: "Available Products",
        overview: "Overview",
        user_management: "User Management",
        all_orders: "All Orders",
        product_audit: "Product Audit",
        platform_settings: "Platform Settings",
        // Categories
        browse_categories: "Browse Categories",
        vegetables: "Vegetables",
        fruits: "Fruits",
        grains: "Grains",
        dairy: "Dairy",
        spices: "Spices",
        pulses: "Pulses",
        all: "All"
    },
    hi: {
        welcome: "AgroHub में आपका स्वागत है",
        dashboard: "डैशबोर्ड",
        profile: "प्रोफाइल",
        logout: "लॉगआउट",
        login: "लॉगिन",
        signup: "साइन अप",
        home: "होम",
        weather: "मौसम",
        orders: "ऑर्डर",
        products: "उत्पाद",
        marketplace: "बाज़ार",
        wishlist: "इच्छा सूची",
        payments: "भुगतान",
        delivery: "डिलीवरी",
        reviews: "समीक्षाएं",
        fresh_produce: "खेतों से सीधे ताज़ा उत्पाद",
        search_placeholder: "फसलों, सब्जियों की खोज करें...",
        error_msg: "कुछ गलत हो गया",
        // Auth / Forms
        email: "ईमेल",
        password: "पासवर्ड",
        full_name: "पूरा नाम",
        phone: "मोबाइल नंबर",
        address: "पता",
        country: "देश",
        state: "राज्य",
        district: "जिला",
        village: "गाँव/क्षेत्र",
        pin_code: "पिन कोड",
        login_btn: "लॉगिन करें",
        register_btn: "रजिस्टर करें",
        already_have_account: "पहले से अकाउंट है?",
        new_user: "नया अकाउंट बनाएं?",
        brand_sub: "खेत से आपके दरवाजे तक 🚀",
        // Roles
        farmer: "किसान",
        customer: "ग्राहक",
        delivery_partner: "डिलीवरी पार्टनर",
        admin: "एडमिन",
        // Farmer specific
        add_product: "उत्पाद जोड़ें",
        total_earnings: "कुल कमाई",
        pending_orders: "लंबित ऑर्डर",
        // Customer specific
        cart: "कार्ट",
        checkout: "चेकआउट",
        place_order: "ऑर्डर दें",
        total_items: "कुल आइटम",
        // Index Page
        hero_title: "खेत से सीधे आपके द्वार!",
        hero_desc: "ताजी जैविक सब्जियों, फलों और डेयरी के लिए सीधे स्थानीय किसानों से जुड़ें। उचित मूल्य पर प्रीमियम गुणवत्ता का आनंद लें और स्थानीय कृषि का समर्थन करें।",
        get_started: "शुरू करें",
        our_services: "हमारी सेवाएं",
        core_services: "🚀 मुख्य सेवाएं",
        services_subtitle: "खेत-से-द्वार तक निर्बाध डिलीवरी के लिए आपको जो कुछ भी चाहिए",
        smart_features: "स्मार्ट फीचर्स",
        total_orders: "कुल ऑर्डर",
        pending_deliveries: "लंबित डिलीवरी",
        available_products: "उपलब्ध उत्पाद",
        overview: "अवलोकन",
        user_management: "उपयोगकर्ता प्रबंधन",
        all_orders: "सभी ऑर्डर",
        product_audit: "उत्पाद ऑडिट",
        platform_settings: "प्लेटफॉर्म सेटिंग्स",
        // Categories
        browse_categories: "श्रेणियां खोजें",
        vegetables: "सब्जियां",
        fruits: "फल",
        grains: "अनाज",
        dairy: "डेयरी",
        spices: "मसाले",
        pulses: "दालें",
        all: "सब"
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

function t(key) {
    return TRANSLATIONS[currentLang][key] || key;
}

function translatePage() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        const translation = TRANSLATIONS[currentLang][key];
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                // Preserve emoji/icon if it exists
                const icon = el.querySelector('i, span.emoji, span.toast-icon');
                if (icon) {
                    // Find the text node and replace only that, or just append after icon
                    // Simplest: if it has an icon, we might need a different structure, 
                    // but for now let's just use innerHTML carefully or check for emojis
                    const emojiMatch = el.innerHTML.match(/^[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u);
                    if (emojiMatch) {
                        el.innerHTML = emojiMatch[0] + ' ' + translation;
                    } else {
                        el.textContent = translation;
                    }
                } else {
                    el.textContent = translation;
                }
            }
        }
    });
}

function setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        location.reload();
    }
}

// --- Fetch Wrapper with Refresh Token Support ---
async function apiFetch(endpoint, options = {}) {
    let token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    // Convert to FormData if files are present
    const isFormData = options.body instanceof FormData;
    
    const headers = {
        ...options.headers
    };
    
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        // Ensure endpoint starts with /
        const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        let response = await fetch(`${API_BASE_URL}${safeEndpoint}`, config);
        
        // Handle Token Expiry (401 or 422 if token is malformed/unprocessable)
        if ((response.status === 401 || response.status === 422) && localStorage.getItem('refresh_token')) {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('refresh_token')}` }
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                localStorage.setItem('access_token', refreshData.access_token);
                // Retry original request
                headers['Authorization'] = `Bearer ${refreshData.access_token}`;
                const retryEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
                response = await fetch(`${API_BASE_URL}${retryEndpoint}`, config);
            } else {
                logout();
                throw new Error('Session expired');
            }
        }

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            data = { error: await response.text() };
        }
        
        if (!response.ok) {
            throw new Error(data.error || data.message || t('error_msg'));
        }
        
        return data;
    } catch (error) {
        if (!options.silent) {
            showToast(error.message, 'error');
        }
        throw error;
    }
}

// Utility to clean names
function cleanName(name) {
    if (!name) return '';
    return name.replace(/\(Demo Farmer\)/g, '').replace(/\(Demo Customer\)/g, '').trim();
}

// --- Auth Utils ---
function getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    if (user && user.name) {
        user.name = cleanName(user.name);
    }
    return user;
}

function isLoggedIn() {
    return !!(localStorage.getItem('access_token') || localStorage.getItem('token'));
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function checkAuthAndRedirect() {
    const user = getUser();
    const currentPath = window.location.pathname;
    
    if (!user) {
        if (currentPath.includes('farmer.html') || currentPath.includes('customer.html') || currentPath.includes('dashboard.html') || currentPath.includes('profile.html')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Redirect logged-in users away from auth pages
    if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
        window.location.href = user.role === 'farmer' ? 'farmer.html' : 'customer.html';
    }

    // Role-based protection
    if (currentPath.includes('farmer.html') && user.role !== 'farmer') {
        window.location.href = 'customer.html';
    }
    if (currentPath.includes('customer.html') && user.role !== 'customer') {
        window.location.href = 'farmer.html';
    }
}

// --- Dynamic Navbar Update ---
function updateNavbar() {
    const user = getUser();
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const langSwitcher = `
        <div class="lang-switcher" style="display:inline-flex; gap:10px; margin-right:15px;">
            <span onclick="setLanguage('en')" style="cursor:pointer; font-weight:${currentLang==='en'?'bold':'normal'}">EN</span>
            <span onclick="setLanguage('hi')" style="cursor:pointer; font-weight:${currentLang==='hi'?'bold':'normal'}">हि</span>
        </div>
    `;

    if (user) {
        const dashboardLink = user.role === 'farmer' ? 'farmer.html' : 'customer.html';
        navLinks.innerHTML = `
            ${langSwitcher}
            <a href="${dashboardLink}">${t('dashboard')}</a>
            <a href="profile.html">${t('profile')}</a>
            <a href="#" onclick="logout(); return false;">${t('logout')}</a>
        `;
    } else {
        navLinks.innerHTML = `
            ${langSwitcher}
            <a href="index.html">${t('home')}</a>
            <a href="login.html">${t('login')}</a>
            <a href="register.html" class="btn btn-accent">${t('signup')}</a>
        `;
    }

    // Translate dynamic elements if they exist
    const welcomeEl = document.getElementById('welcome-text');
    if (welcomeEl) welcomeEl.textContent = t('welcome');
}

async function loadNotifications() {
    if (!isLoggedIn()) return;
    try {
        const data = await apiFetch('/notifications/', { silent: true });
        
        // Support both farmer (notif-count/notif-panel) and customer (cd-notif-count/cd-notif-panel)
        const countEl = document.getElementById('cd-notif-count') || document.getElementById('notif-count');
        const panel   = document.getElementById('cd-notif-panel') || document.getElementById('notif-panel');
        
        if (!countEl || !panel) return;

        const unread = data.notifications.filter(n => !n.is_read);
        countEl.textContent = unread.length;
        countEl.style.display = unread.length ? 'block' : 'none';

        // Update Panel
        const header = `
            <div class="cd-notif-header">
                <strong>🔔 Notifications</strong>
                <div class="cd-notif-actions">
                    ${unread.length > 0 ? `<button onclick="markAllNotifsRead()" class="cd-notif-clear">Mark all read</button>` : ''}
                    <button onclick="toggleCdNotifications()" class="cd-notif-close">×</button>
                </div>
            </div>`;
            
        const items = data.notifications.length > 0 
            ? data.notifications.map(n => `
                <div class="cd-notif-item ${n.is_read ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
                    <div class="cd-notif-icon ${n.type}"><i class="fas ${n.type==='success'?'fa-check-circle':n.type==='warning'?'fa-exclamation-triangle':'fa-info-circle'}"></i></div>
                    <div class="cd-notif-content">
                        <strong>${n.title}</strong>
                        <p>${n.message}</p>
                    </div>
                    ${!n.is_read ? '<span class="unread-indicator"></span>' : ''}
                </div>
            `).join('')
            : '<div class="cd-notif-empty">No notifications yet</div>';
        
        panel.innerHTML = header + `<div class="cd-notif-list">${items}</div>`;
        
        // Add styles if not already present
        if (!document.getElementById('notif-system-styles')) {
            const style = document.createElement('style');
            style.id = 'notif-system-styles';
            style.innerHTML = `
                .cd-notif-panel { border: none !important; box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important; border-radius: 16px !important; width: 350px !important; overflow: hidden; background: white; }
                .cd-notif-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
                .cd-notif-actions { display: flex; align-items: center; gap: 10px; }
                .cd-notif-clear { background: transparent; border: none; color: #2e7d32; font-size: 0.75rem; font-weight: 600; cursor: pointer; padding: 5px; }
                .cd-notif-clear:hover { text-decoration: underline; }
                .cd-notif-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }
                .cd-notif-list { max-height: 400px; overflow-y: auto; }
                .cd-notif-item { display: flex; gap: 12px; padding: 15px 20px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: 0.2s; position: relative; }
                .cd-notif-item:hover { background: #f9f9f9; }
                .cd-notif-item.unread { background: #e8f5e933; }
                .cd-notif-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; }
                .cd-notif-icon.success { background: #e8f5e9; color: #2e7d32; }
                .cd-notif-icon.warning { background: #fff3e0; color: #ef6c00; }
                .cd-notif-icon.info { background: #e3f2fd; color: #1565c0; }
                .cd-notif-content { flex: 1; }
                .cd-notif-content strong { display: block; font-size: 0.85rem; color: #333; margin-bottom: 3px; }
                .cd-notif-content p { font-size: 0.75rem; color: #666; line-height: 1.4; margin: 0; }
                .unread-indicator { width: 8px; height: 8px; background: #2e7d32; border-radius: 50%; position: absolute; right: 15px; top: 22px; }
                .cd-notif-empty { padding: 40px 20px; text-align: center; color: #999; font-size: 0.9rem; }
            `;
            document.head.appendChild(style);
        }
    } catch (e) {}
}

async function markAllNotifsRead() {
    try {
        const data = await apiFetch('/notifications/', { silent: true });
        const unreadIds = data.notifications.filter(n => !n.is_read).map(n => n.id);
        for (const id of unreadIds) {
            await apiFetch(`/notifications/${id}/read`, { method: 'PUT', silent: true });
        }
        loadNotifications();
    } catch (e) {}
}


async function markNotifRead(id) {
    try {
        await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
        loadNotifications();
    } catch (e) {}
}

// Initialize common features on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRedirect();
    updateNavbar();
    loadNotifications();
    translatePage();
    initChatWidget();
    initLanguageSwitcher();

    // Background polling for notifications every 60 seconds
    if (isLoggedIn()) {
        setInterval(loadNotifications, 60000);
    }
});

// Splash Screen Global Handler
// Splash Screen Global Handler
function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        const isLanding = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        const delay = isLanding ? 1200 : 500;
        
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => {
                if (splash.parentNode) splash.remove();
            }, 800);
        }, delay);
    }
}

// Fallback if DOMContentLoaded is too slow
window.addEventListener('load', hideSplashScreen);
document.addEventListener('DOMContentLoaded', hideSplashScreen);

function initLanguageSwitcher() {
    // 1. Check if we have a dashboard topbar
    const dashboardTopbar = document.querySelector('.cd-topbar-right, .fd-topbar-right');
    
    if (dashboardTopbar) {
        const switcher = document.createElement('div');
        switcher.className = 'dashboard-lang-switcher';
        switcher.innerHTML = `
            <span onclick="setLanguage('en')" class="${currentLang==='en'?'active':''}">EN</span>
            <span onclick="setLanguage('hi')" class="${currentLang==='hi'?'active':''}">हि</span>
        `;
        // Insert before profile
        const profile = dashboardTopbar.querySelector('.cd-topbar-profile, .fd-topbar-profile');
        if (profile) dashboardTopbar.insertBefore(switcher, profile);
        else dashboardTopbar.appendChild(switcher);
        
        const style = document.createElement('style');
        style.innerHTML = `
            .dashboard-lang-switcher { display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 20px; margin-right: 15px; border: 1px solid rgba(0,0,0,0.05); height: fit-content; }
            .dashboard-lang-switcher span { cursor: pointer; padding: 4px 10px; border-radius: 15px; font-size: 11px; font-weight: bold; transition: 0.3s; color: #666; }
            .dashboard-lang-switcher span.active { background: #2e7d32; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .dashboard-lang-switcher span:hover:not(.active) { background: rgba(0,0,0,0.1); }
        `;
        document.head.appendChild(style);
        return;
    }

    // 2. Check if we have a standard navbar (landing pages)
    if (document.getElementById('nav-links')) return; 

    // 3. Fallback: Floating Horizontal (Bottom Left) - Systematic & Non-overlapping
    const switcher = document.createElement('div');
    switcher.id = 'floating-lang-switcher';
    switcher.innerHTML = `
        <button onclick="setLanguage('en')" class="${currentLang==='en'?'active':''}">EN</button>
        <button onclick="setLanguage('hi')" class="${currentLang==='hi'?'active':''}">हि</button>
    `;
    document.body.appendChild(switcher);
    
    const style = document.createElement('style');
    style.innerHTML = `
        #floating-lang-switcher { position: fixed; bottom: 20px; left: 20px; display: flex; gap: 8px; z-index: 10001; }
        #floating-lang-switcher button { width: 42px; height: 42px; border-radius: 10px; border: none; background: white; color: #2e7d32; font-weight: bold; cursor: pointer; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: 0.3s; }
        #floating-lang-switcher button.active { background: #2e7d32; color: white; }
        #floating-lang-switcher button:hover { transform: translateY(-3px); }
    `;
    document.head.appendChild(style);
}

function initChatWidget() {
    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
        <div id="chat-header" onclick="toggleChat()">
            <span>💬 Agri-Support</span>
            <i class="fas fa-chevron-up" id="chat-chevron"></i>
        </div>
        <div id="chat-body" style="display:none">
            <div id="chat-messages">
                <div class="msg ai">Hello! How can I help you with your crops today? 🌾</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Ask about farming...">
                <button onclick="sendChatMessage()"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);
    
    // Add CSS for chat widget
    const style = document.createElement('style');
    style.innerHTML = `
        #chat-widget { position: fixed; bottom: 20px; right: 20px; width: 300px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 10000; font-family: sans-serif; }
        #chat-header { background: #2e7d32; color: white; padding: 12px; border-radius: 10px 10px 0 0; cursor: pointer; font-weight: bold; }
        #chat-body { height: 350px; display: flex; flex-direction: column; }
        #chat-messages { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        .chat-input-area { padding: 10px; border-top: 1px solid #eee; display: flex; gap: 5px; }
        .chat-input-area input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .chat-input-area button { background: #2e7d32; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
        .msg { padding: 8px 12px; border-radius: 15px; max-width: 80%; font-size: 0.9rem; }
        .msg.user { align-self: flex-end; background: #e8f5e9; color: #1b5e20; }
        .msg.ai { align-self: flex-start; background: #f5f5f5; color: #333; }
    `;
    document.head.appendChild(style);
}

function toggleChat() {
    const body = document.getElementById('chat-body');
    const chev = document.getElementById('chat-chevron');
    if (body.style.display === 'none') {
        body.style.display = 'flex';
        chev.className = 'fas fa-chevron-down';
    } else {
        body.style.display = 'none';
        chev.className = 'fas fa-chevron-up';
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msgText = input.value.trim();
    if (!msgText) return;

    const container = document.getElementById('chat-messages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.textContent = msgText;
    container.appendChild(userMsg);
    input.value = '';
    container.scrollTop = container.scrollHeight;

    try {
        const data = await apiFetch('/support/chat', {
            method: 'POST',
            body: JSON.stringify({ message: msgText })
        });
        
        // Add AI message
        const aiMsg = document.createElement('div');
        aiMsg.className = 'msg ai';
        aiMsg.textContent = data.reply;
        container.appendChild(aiMsg);
        container.scrollTop = container.scrollHeight;
    } catch (e) {}
}

// --- UI Helpers ---
function getProductImage(p) {
    if (!p) return '../images/agrohub_logo.png';
    
    // 1. If DB has a valid image_url, use it
    if (p.image_url && p.image_url.length > 2) {
        // If it's just a filename (no slash), prepend the images directory
        if (!p.image_url.includes('/') && !p.image_url.startsWith('http')) {
            return '../images/' + p.image_url;
        }
        return p.image_url;
    }

    const name = p.name ? p.name.toLowerCase() : '';
    
    // 2. Fallback logic for legacy products
    if (name.includes('tomato')) return '../images/tomato.jpg';
    if (name.includes('potato')) return '../images/potato.jpg';
    if (name.includes('onion')) return '../images/red onion.png';
    if (name.includes('cabbage')) return '../images/cabbage.png';
    if (name.includes('carrot')) return '../images/carrot.png';
    if (name.includes('spinach') || name.includes('palak')) return '../images/spinach.png';
    if (name.includes('cauliflower')) return '../images/cauliflower.png';
    if (name.includes('capsicum')) return '../images/capsicum.png';
    if (name.includes('peas')) return '../images/green peas.png';
    
    if (name.includes('rice')) return '../images/rice.jpg';
    if (name.includes('mango')) return '../images/mango.jpg';
    if (name.includes('milk')) return '../images/milk.jpg';
    if (name.includes('wheat') || name.includes('atta')) return '../images/wheat.jpg';
    if (name.includes('turmeric') || name.includes('haldi')) return '../images/turmaric powder.jpg';
    if (name.includes('moong dal')) return '../images/moong dal.jpg';
    if (name.includes('chana dal')) return '../images/chana dal.jpg';
    if (name.includes('arhar dal') || name.includes('toor dal')) {
        if (name.includes('arhar')) return '../images/arhar dal.jpg';
        return '../images/toor dal.jpg';
    }
    if (name.includes('lady finger') || name.includes('bhindi')) return '../images/lady finger.jpg';
    if (name.includes('brinjal') || name.includes('bringal') || name.includes('baigan')) return '../images/bringal.jpg';
    if (name.includes('bottle guard') || name.includes('bottleguard') || name.includes('lauki')) return '../images/bottleguard.jpg';
    
    if (name.includes('banana')) return '../images/banana.jpg';
    if (name.includes('apple')) return '../images/apple.jpg';
    if (name.includes('orange')) return '../images/orange.jpg';
    if (name.includes('grapes')) return '../images/grapes.png';
    if (name.includes('papaya')) return '../images/papaya.png';
    if (name.includes('pomegranate')) return '../images/pomegranate.png';
    if (name.includes('guava')) return '../images/guava.png';
    if (name.includes('watermelon')) return '../images/watermelon.jpg';
    if (name.includes('pineapple')) return '../images/pineapple.jpg';
    
    if (name.includes('bajra')) return '../images/bajra.png';
    if (name.includes('jowar')) return '../images/jowar.png';
    if (name.includes('maize') || name.includes('corn')) return '../images/maize.png';
    if (name.includes('ragi')) return '../images/ragi.png';
    if (name.includes('barley')) return '../images/barley.png';
    
    if (name.includes('paneer')) return '../images/paneer.jpg';
    if (name.includes('soyabean')) return '../images/soyabean.jpg';
    if (name.includes('oats')) return '../images/oats.jpg';
    if (name.includes('red chilli')) return '../images/red chilli powder.jpeg';
    if (name.includes('amchur')) return '../images/amchur powder.webp';
    if (name.includes('coriander') || name.includes('dhania')) return '../images/coriander.jpg';
    
    if (name.includes('curd') || name.includes('dahi')) return '../images/curd.png';
    if (name.includes('ghee')) return '../images/ghee.png';
    if (name.includes('honey')) return '../images/honey.png';
    if (name.includes('mustard oil')) return '../images/mustard_oil.png';
    if (name.includes('garlic') || name.includes('lehsun')) return '../images/garlic.png';
    if (name.includes('ginger') || name.includes('adrak')) return '../images/ginger.png';

    return '../images/agrohub_logo.png';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    // Add CSS for toast if not exists
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            .toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 12px 24px; border-radius: 50px; z-index: 10001; animation: slideUp 0.3s ease-out; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .toast.success { background: #2e7d32; }
            .toast.error { background: #c62828; }
            .toast-content { display: flex; align-items: center; gap: 10px; }
            @keyframes slideUp { from { bottom: -50px; opacity: 0; } to { bottom: 30px; opacity: 1; } }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function toggleNavbar() {
    const nav = document.getElementById('nav-links');
    const burger = document.querySelector('.hamburger');
    if (nav) nav.classList.toggle('active');
    if (burger) burger.classList.toggle('active');
}

function toggleCdNotifications() {
    const panel = document.getElementById('cd-notif-panel') || document.getElementById('notif-panel');
    if (panel) {
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'block' : 'none';
        
        // Add animation class if opening
        if (isHidden) {
            panel.classList.add('notif-panel-open');
        }
    }
}

// Alias for farmer dashboard
function toggleNotifications() {
    toggleCdNotifications();
}
