document.addEventListener('DOMContentLoaded', () => {
    if(isLoggedIn()) {
        loadProfileData();
    }
    
    document.getElementById('profile-update-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
});

async function loadProfileData() {
    try {
        const response = await apiFetch('/user/profile');
        const user = response.user;
        
        // Update View UI
        document.getElementById('profile-name-header').textContent = user.name;
        document.getElementById('avatar-initials').textContent = user.name.charAt(0).toUpperCase();
        
        const badge = document.getElementById('profile-role-badge');
        badge.textContent = user.role;
        badge.className = `role-badge role-${user.role.toLowerCase()}`;
        
        document.getElementById('view-email').textContent = user.email;
        document.getElementById('view-phone').textContent = user.phone || 'Not provided';
        document.getElementById('view-address').textContent = user.address || 'Not provided';
        
        const date = new Date(user.created_at);
        document.getElementById('view-joined').textContent = date.toLocaleDateString();
        
        // Populate Edit Form
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-address').value = user.address || '';
        
        // Update LocalStorage User Info in case it changed
        localStorage.setItem('user', JSON.stringify(user));
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function toggleEditMode() {
    const viewMode = document.getElementById('view-mode');
    const editForm = document.getElementById('edit-form');
    
    viewMode.classList.toggle('hidden');
    editForm.classList.toggle('active');
}

async function updateProfile() {
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    const address = document.getElementById('edit-address').value;
    
    try {
        const response = await apiFetch('/user/profile', {
            method: 'PUT',
            body: JSON.stringify({ name, phone, address })
        });
        
        showToast('Profile updated successfully', 'success');
        
        // Re-load data and switch view
        await loadProfileData();
        toggleEditMode();
        
        // Update navbar name if changed
        updateNavbar();
        
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}
