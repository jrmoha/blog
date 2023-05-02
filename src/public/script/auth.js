'use strict';
$(document).ready(function () {
    const TIME_OUT = 30000;
    let updateSessionLoop = setInterval(async function () {
        try {
            const response = await fetch("http://localhost:3000/api/users/updateSession", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const update = await response.json();
            console.log(update);
            if (!update.success) {
                console.log('not auth');
                window.location.href = '/login';
            }
        } catch (err) {
            console.error(err);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }, TIME_OUT);
    window.addEventListener('beforeunload unload', function (e) {
        clearInterval(updateSessionLoop);
    });
});