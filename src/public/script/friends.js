'use strict';
async function loadFriends() {
    const response = await fetch("/api/friends", {
        method: "GET",
        header: {
            "Content-Type": "application/json"
        }
    });
    const friends = await response.json();
    let friendsDiv = document.querySelector(".friends");
    friendsDiv.innerHTML = "";
    for (const friend of friends) {
        const friendDiv = document.createElement("div");
        friendDiv.classList.add("row_contain");
        friendDiv.classList.add("friend-sidebar");
        friendDiv.dataset.username = friend.followed_username;
        friendDiv.style.cursor = "pointer";
        friendDiv.innerHTML = `<img src="/images/users/${friend.user_image}" alt="" />`;
        const userStatus = document.createElement("div");
        userStatus.classList.add("user-status");
        if (friend.lastseen.current_status === "online") {
            userStatus.classList.add("online");
        } else {
            userStatus.classList.add("offline");
        }
        friendDiv.appendChild(userStatus);
        const span = document.createElement("span");
        span.innerHTML = `<b>${friend.followed_username}</b>`;
        friendDiv.appendChild(span);
        friendsDiv.appendChild(friendDiv);
        friendDiv.addEventListener("click", function () {
            openChatBox(friend.followed_username);
        });
    }
}
loadFriends();
document.querySelectorAll(".follow_button").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        follow_person(btn, btn.dataset.username);
    });
});
document.querySelectorAll(".unfollow_button").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        unfollow_person(btn, btn.dataset.username);
    });
});
document.querySelectorAll(".delete_follower").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        delete_follower(btn, btn.dataset.username);
    });
});
async function delete_follower(btn, username) {
    const response = await fetch(`/api/delete/${username}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    if (data.success) {
        btn.remove();
    }
}