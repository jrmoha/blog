if (window.location.pathname === '/settings/') {
    console.log('settings page');
    const settings_content = document.querySelector('.settings_content');
    const updateBtn = settings_content.querySelector('button');
    const show_last_seen = settings_content.querySelectorAll('input')[0];
    const gender = settings_content.querySelector('select');
    const show_status = settings_content.querySelectorAll('input')[1];
    const phone = settings_content.querySelectorAll('input')[2];
    const bio = settings_content.querySelectorAll('input')[3];
    const address = settings_content.querySelectorAll('input')[4];

    const alertDiv = document.querySelector('.alert');

    const old_data = {
        show_last_seen: show_last_seen.checked,
        gender: gender.value,
        show_status: show_status.checked,
        phone: phone.value,
        address: address.value,
        bio: bio.value
    };

    if (updateBtn) {
        updateBtn.addEventListener('click', async function () {
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            alertDiv.setAttribute('hidden', true);
            alertDiv.classList.remove('success');
            alertDiv.classList.remove('error');
            const data = {
                show_last_seen: show_last_seen.checked,
                gender: gender.value.trim(),
                show_status: show_status.checked,
                phone: phone.value.trim(),
                address: address.value.trim(),
                bio: bio.value.trim()
            };
            if (JSON.stringify(data) === JSON.stringify(old_data) || Object.keys(data).length === 0) {
                console.log('No changes made');
                updateBtn.innerHTML = 'Save Profile';
                return;
            }
            for (let key in data) {
                if (data[key] === old_data[key]) {
                    delete data[key];
                }
                if (data[key] === '') {
                    data[key] = null;
                }
            }
            const response = await fetch('/api/editSettings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            alertDiv.removeAttribute('hidden');
            if (result.success) {
                updateBtn.innerHTML = 'Save Profile';
                Object.assign(old_data, data);
                alertDiv.classList.add('success');
                alertDiv.textContent = 'Settings updated successfully';
            } else {
                alertDiv.classList.add('error');
                alertDiv.textContent = result.message;
            }
        });
    }
}