const change_password_btn = document.querySelector('button[name="change-password-btn"]');
if (change_password_btn) {
    change_password_btn.addEventListener('click', async function () {
        change_password_btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        change_password_btn.setAttribute('disabled', true);
        alertDiv.setAttribute('hidden', true);
        alertDiv.classList.remove('success');
        alertDiv.classList.remove('error');
        const password = document.querySelector('input[name="password"]').value.trim();
        const confirm_password = document.querySelector('input[name="confirm-password"]').value.trim();
        if (password !== confirm_password) {
            alertDiv.removeAttribute('hidden');
            alertDiv.classList.add('error');
            alertDiv.textContent = 'Passwords do not match';
            change_password_btn.removeAttribute('disabled');
            return;
        }
        const password_regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!password_regex.test(password)) {
            alertDiv.removeAttribute('hidden');
            alertDiv.classList.add('error');
            alertDiv.textContent = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
            change_password_btn.removeAttribute('disabled');
            return;
        }
        const response = await fetch('/api/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        const result = await response.json();
        alertDiv.removeAttribute('hidden');
        if (result.success) {
            change_password_btn.innerHTML = 'Confirm';
            alertDiv.classList.add('success');
            alertDiv.textContent = 'Password changed successfully';
        }
        else {
            alertDiv.classList.add('error');
            alertDiv.textContent = result.message;
        }
        document.querySelector('input[name="password"]').value = '';
        document.querySelector('input[name="confirm-password"]').value = '';
        document.querySelector('input[name="password"]').focus();
        change_password_btn.removeAttribute('disabled');
    });

}