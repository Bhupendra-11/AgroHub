let map;
let marker;
let trackingInterval;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    
    if (!orderId) {
        window.location.href = 'customer.html';
        return;
    }

    document.getElementById('order-id-display').textContent = `#${orderId}`;
    
    // Initial fetch
    fetchTrackingData(orderId);
    
    // Poll every 5 seconds for simulated movement
    trackingInterval = setInterval(() => {
        fetchTrackingData(orderId, false);
    }, 5000);
});

async function fetchTrackingData(orderId, isFirstLoad = true) {
    try {
        const data = await apiFetch(`/track/${orderId}`);
        updateTrackingUI(data, isFirstLoad);
    } catch (error) {
        clearInterval(trackingInterval);
        document.getElementById('status-text').textContent = "Error loading tracking info.";
    }
}

function updateTrackingUI(data, isFirstLoad) {
    const delivery = data.delivery;
    const tracking = data.tracking;

    // Update Text Details
    document.getElementById('status-text').textContent = delivery.status.replace(/_/g, ' ').toUpperCase();
    document.getElementById('courier-text').textContent = delivery.courier_name || 'Pending';
    document.getElementById('tracking-number-text').textContent = delivery.tracking_number || 'Pending';
    
    if (delivery.estimated_delivery) {
        const date = new Date(delivery.estimated_delivery);
        document.getElementById('est-delivery-text').textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Update Timeline
    const timelineContainer = document.getElementById('tracking-timeline');
    if (isFirstLoad) {
        timelineContainer.innerHTML = '';
        tracking.steps.forEach((step, index) => {
            const div = document.createElement('div');
            div.className = `step`;
            div.innerHTML = `
                <div class="icon">${step.icon}</div>
                <div class="step-label">${step.label}</div>
            `;
            timelineContainer.appendChild(div);
        });
    }

    // Update Timeline Progress
    const steps = document.querySelectorAll('.step');
    let currentIdx = tracking.current_step;
    
    steps.forEach((step, idx) => {
        if (idx < currentIdx) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (idx === currentIdx) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    // Calculate progress bar width
    const progressWidth = (currentIdx / (tracking.total_steps - 1)) * 100;
    document.getElementById('timeline-progress').style.width = `${progressWidth}%`;

    // Update Map
    if (delivery.current_lat && delivery.current_lng) {
        updateMap(delivery.current_lat, delivery.current_lng, isFirstLoad);
    }
    
    // Stop polling if delivered
    if (delivery.status === 'delivered') {
        clearInterval(trackingInterval);
    }
}

function updateMap(lat, lng, isFirstLoad) {
    if (!map) {
        // Initialize Leaflet Map
        map = L.map('map').setView([lat, lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Custom tractor/truck icon could go here, using default for now
        marker = L.marker([lat, lng]).addTo(map)
            .bindPopup('Delivery is here!')
            .openPopup();
    } else {
        // Update marker position smoothly
        marker.setLatLng([lat, lng]);
        
        // Only pan map if marker goes too far off center, but for demo we just follow it
        map.panTo([lat, lng], {animate: true, duration: 1.0});
    }
}

// Cleanup interval on page leave
window.addEventListener('beforeunload', () => {
    if (trackingInterval) clearInterval(trackingInterval);
});
