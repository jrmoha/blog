'use strict';
$("#change-profile").click(function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch('http://localhost:3000/api/image/change', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        console.log(result);
        const src = result.response.image;
        document.querySelector("#profile_pic").src = `/images/users/${src}`;
        document.querySelector(".navbar_user img").src = `/images/users/${src}`;
        console.log(result.response.title);
    }
    input.click();
});