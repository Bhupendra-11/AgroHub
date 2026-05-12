// =====================================================
// AgroHub — Products Shared Logic
// - Farmer product functions are handled in farmer.js
// - This file handles: Customer Marketplace, Reviews, AI Price (shared)
// =====================================================

// --- Customer Marketplace Logic ---

async function loadMarketplaceProducts() {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;

    // Show Loading
    grid.innerHTML = '<div class="cd-loading">Loading fresh produce...</div>';

    const filterEl = document.getElementById('filter-category');
    const searchEl = document.getElementById('search-product');
    const category = filterEl ? filterEl.value : 'All';
    const search = searchEl ? searchEl.value : '';
    
    let url = '/products/?';
    if (category !== 'All') url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;

    try {
        const data = await apiFetch(url);
        const products = data.products || [];
        const countLabel = document.getElementById('product-count-label');
        if (countLabel) countLabel.textContent = `${products.length} products found`;
        
        renderProductsToGrid(products, grid);
    } catch (error) {
        grid.innerHTML = '<div class="cd-loading text-danger">Failed to load products. Please check your connection.</div>';
    }
}

function renderProductsToGrid(products, grid) {
    if (!grid) return;
    grid.innerHTML = '';
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1;" class="text-center text-muted mt-2">No products found. 🌾</p>';
        return;
    }

    const categoryEmojis = { Vegetables:'🥦', Fruits:'🍎', Grains:'🌾', Dairy:'🥛', Spices:'🌶️', Pulses:'🥣' };

    products.forEach(p => {
        const imgUrl = getProductImage(p);
        const isWished = typeof wishlist !== 'undefined' ? wishlist.some(w => w.id === p.id) : false;
        const stockHtml = p.stock > 0 
            ? `<span style="font-size:0.75rem; color:#2e7d32">✅ In Stock (${p.stock} ${p.unit})</span>` 
            : `<span style="font-size:0.75rem; color:#e53935">❌ Out of Stock</span>`;

        const card = document.createElement('div');
        card.className = 'cd-product-card';
        card.innerHTML = `
            <div class="cd-product-img-wrap">
                <img src="${imgUrl}" alt="${p.name}" class="cd-product-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="cd-product-emoji" style="display:none;">${categoryEmojis[p.category] || '🌿'}</div>
            </div>
            <div class="cd-product-body">
                <div class="cd-product-cat">${p.category}</div>
                <h3 class="cd-product-name">${p.name}</h3>
                <p class="cd-product-farmer">By ${p.farmer_name || 'AgroHub Farmer'}</p>
                <div class="cd-product-price">₹${parseFloat(p.price).toFixed(2)} <small>/ ${p.unit}</small></div>
                <div class="cd-product-stock">${stockHtml}</div>
                <div class="cd-product-actions">
                    <button class="cd-btn cd-btn-primary" onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price})" ${p.stock <= 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                        🛒 Add to Cart
                    </button>
                    <button class="cd-wish-btn ${isWished ? 'wished' : ''}" id="wish-${p.id}" onclick="toggleWishlist(${p.id},'${p.name.replace(/'/g,"\\'")}',${p.price},'${p.category}')">
                        ❤️
                    </button>
                </div>
                <div style="margin-top:10px; cursor:pointer; color:var(--primary); font-size:0.8rem;" onclick="viewReviews(${p.id}, '${p.name.replace(/'/g, "\\'")}')">⭐ View Reviews</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function viewReviews(productId, productName) {
    try {
        const data = await apiFetch(`/reviews/product/${productId}`);
        const reviews = data.reviews || [];
        
        let html = `<div style="padding:15px;"><h4>Reviews for ${productName}</h4><hr style="margin:10px 0;">`;
        if (reviews.length === 0) {
            html += `<p class="text-muted">No reviews yet for this product.</p>`;
        } else {
            reviews.forEach(r => {
                html += `
                    <div style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                        <div style="color:#f5a623">${'⭐'.repeat(Math.round(r.rating))} (${r.rating})</div>
                        <p style="margin:5px 0;">${r.review}</p>
                        <small class="text-muted">By ${r.customer_name || 'AgroHub Customer'} on ${new Date(r.created_at).toLocaleDateString()}</small>
                    </div>
                `;
            });
        }
        html += `</div>`;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>
                ${html}
            </div>
        `;
        document.body.appendChild(modal);
    } catch (e) {}
}

// AI Price suggestion (used by both farmer modal and smart features section)
async function suggestAIPrice() {
    const nameEl = document.getElementById('name');
    const catEl  = document.getElementById('category');
    const msg    = document.getElementById('ai-price-msg');
    if (!nameEl || !nameEl.value) { showToast('Enter product name first', 'info'); return; }
    if (msg) { msg.style.display = 'block'; msg.textContent = '🤖 AI analyzing market trends...'; }
    try {
        const res = await apiFetch(`/products/ai-price?name=${encodeURIComponent(nameEl.value)}&category=${encodeURIComponent(catEl ? catEl.value : '')}`);
        const priceEl = document.getElementById('price');
        if (priceEl) priceEl.value = res.suggested_price;
        if (msg) msg.textContent = `✅ Suggested: ₹${res.suggested_price} (${res.confidence}% confidence)`;
    } catch (e) {
        if (msg) msg.textContent = '❌ AI suggestion failed. Please set manually.';
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted', 'success');
        if (typeof loadFarmerProducts === 'function') loadFarmerProducts();
    } catch (error) {
        console.error(error);
    }
}
