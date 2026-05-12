// --- Cart State ---
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId, name, price) {
    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ product_id: productId, name, price, qty: 1 });
    }
    saveCart();
    showToast(`${name} added to cart`, 'success');
    
    // Open cart automatically when item added
    const panel = document.querySelector('.cart-panel');
    if(panel && !panel.classList.contains('open')) {
        toggleCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.product_id !== productId);
    saveCart();
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    if (!countEl || !itemsContainer || !totalEl) return;

    countEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="text-muted text-center mt-2">Your cart is empty.</p>';
        totalEl.textContent = '₹0.00';
        return;
    }

    itemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <span class="text-muted">₹${item.price} x ${item.qty}</span>
            </div>
            <div class="text-right">
                <strong>₹${subtotal.toFixed(2)}</strong><br>
                <button class="btn btn-danger" style="padding: 2px 5px; font-size: 0.7rem; margin-top: 5px;" onclick="removeFromCart(${item.product_id})">Remove</button>
            </div>
        `;
        itemsContainer.appendChild(div);
    });

    totalEl.textContent = `₹${total.toFixed(2)}`;
}

// --- UI Toggles ---
function toggleCart() {
    document.querySelector('.cart-panel').classList.toggle('open');
    document.querySelector('.cart-overlay').classList.toggle('open');
}

function openCheckoutModal() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    toggleCart(); // close cart
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}




// --- Order Fetching Logic ---
async function loadCustomerOrders() {
    const tbody = document.getElementById('customer-orders-table');
    if (!tbody) return;

    try {
        const data = await apiFetch('/orders/customer');
        tbody.innerHTML = '';

        if (data.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found.</td></tr>';
            return;
        }

        data.orders.forEach(o => {
            const date = new Date(o.created_at).toLocaleDateString();
            const items = o.items.map(i => `${i.qty}x ${i.name}`).join(', ');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${o.id}</td>
                <td>${date}</td>
                <td>${items}</td>
                <td>₹${o.total_amount.toFixed(2)}</td>
                <td><span class="role-badge role-customer">${o.status}</span></td>
                <td>${o.delivery ? o.delivery.status : 'N/A'}</td>
                <td><a href="track-order.html?id=${o.id}" class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Track</a></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading orders.</td></tr>';
        console.error("Failed to load customer orders", error);
    }
}

async function loadFarmerOrders() {
    const tbody = document.getElementById('farmer-orders-table');
    if (!tbody) return;

    try {
        const data = await apiFetch('/orders/farmer');
        tbody.innerHTML = '';

        if (data.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders received yet.</td></tr>';
            return;
        }

        data.orders.forEach(o => {
            const items = o.items.map(i => `${i.qty}x ${i.name}`).join(', ');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${o.id}</td>
                <td>${o.customer_name || 'Customer'}</td>
                <td>${items}</td>
                <td><strong>₹${o.farmer_total ? o.farmer_total.toFixed(2) : '0.00'}</strong></td>
                <td>${o.status}</td>
                <td>${o.delivery ? o.delivery.status : 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading orders.</td></tr>';
        console.error("Failed to load farmer orders", error);
    }
}
