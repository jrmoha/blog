'use strict';
$(document).ready(function () {
    const TIME_OUT = 30000;
    let updateSessionLoop = setInterval(async function () {
        try {
            console.log('yeah science yeah');
            const response = await fetch("http://localhost:3000/api/users/updateSession", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const update = await response.json();
            console.log(update.success);
            if (!update.success) {
                console.log('not auth');
                window.location.href = 'http://localhost:3000/login';
            }
        } catch (err) {
            console.error(error);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }, TIME_OUT);
    window.addEventListener('beforeunload unload', function (e) {
        clearInterval(updateSessionLoop);
    });
});