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
        document.querySelector("#profile_pic").src = src;
        document.querySelector(".navbar_user img").src = src;
        console.log(result.response.title);
    }
    input.click();
});
const profile_buttons = document.querySelectorAll(".profile_buttons i");
if (profile_buttons.length) {
    const message_button = profile_buttons[0];
    const follow_button = profile_buttons[1];
    if (message_button) {
        message_button.addEventListener("click", async function () {
            const username = this.closest(".left_row_profile").dataset.username;
            await openChatBox(username);
        });
    }
    if (follow_button) {
        follow_button.addEventListener("click", async function () {
            const username = this.closest(".left_row_profile").dataset.username;
            if (this.classList.contains("fa-user-minus")) {
                await unfollow_person(profile_buttons[1], username);
            } else {
                await follow_person(profile_buttons[1], username);
            }
        });
    }
}