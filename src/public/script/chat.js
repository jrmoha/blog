'use strict';
//to be deleted
const socket = io("http://localhost:3000");
socket.emit("join");
socket.emit('load-inbox');
socket.on("inbox", (current_user, inboxes) => {
    document.querySelector(".chats").innerHTML = "";
    inboxes.forEach((inbox) => {
        const li = document.createElement("li");
        li.dataset.inbox = inbox.inbox_id;
        if (inbox.username1 === current_user) {
            li.dataset.username = inbox.username2;
        } else {
            li.dataset.username = inbox.username1;
        }
        li.innerHTML = `
        <a href="javascript:void(0);">
            <img src="/images/users/${inbox.sender_image}" alt="" />
            <span><b>${li.dataset.username === current_user ? "You" : li.dataset.username}</b><br>${inbox.last_message.substr(0, 200)}<p>${inbox.last_message_time}</p></span>
        </a>`;
        document.querySelector(".chats").appendChild(li);
        li.addEventListener("click", function () {
            openChatBox(li.dataset.username, li.dataset.inbox);
        });
    });
});



function openChatBox(username = undefined, inbox = undefined) {
    socket.emit("load-messages", inbox, username);

    socket.on("messages", (current_user, messages) => {
        document.querySelector(".chat-popup").innerHTML = "";
        const chatHeader = document.createElement("div");
        chatHeader.classList.add("chat-header");
        chatHeader.innerHTML = `
    <h3>${username}</h3>
            <button class="close-btn">x</button>`;
        document.querySelector(".chat-popup").appendChild(chatHeader);
        const chatBody = document.createElement("div");
        chatBody.classList.add("chat-body");
        messages.forEach((message) => {
            if (message.sender_username === current_user) {
                chatBody.innerHTML += `
                <div class="chat-message">
                <p>${message.message}</p>
                <img src="/images/users/${message.receiver_image}" alt="">
                </div>`;
            } else {
                chatBody.innerHTML += `
                <div class="chat-message user">
                <p>${message.message}</p>
                <img src="/images/users/${message.sender_image}" alt="">
                </div>`;
            }

        });

        document.querySelector(".chat-popup").appendChild(chatBody);
        document.querySelector(".chat-popup").style.display = "block";
        document.querySelector(".chat-popup").style.animation = "chat-popup 0.5s ease-in-out forwards";
        const footer = document.createElement("div");
        footer.classList.add("chat-footer");
        footer.innerHTML = `
    <div class="chat-footer">
            <input type="text" placeholder="Type your message...">
            <img src="images/icons8-paper-plane-64.png"  alt="" class="send-btn">
        </div>`;
        document.querySelector(".chat-popup").appendChild(footer);
        document.querySelector(".chat-body").scrollTop = document.querySelector(".chat-body").scrollHeight;

        document.querySelector(".close-btn").addEventListener("click", closeChatBox);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closeChatBox();
            }
        });
        document.querySelector(".send-btn").addEventListener("click", () => {
            sendMessage(username, inbox);
        });
        document.querySelector(".chat-footer input").addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                sendMessage(username, inbox);
            }
        });
    });
}
function closeChatBox() {
    document.querySelector(".chat-popup").style.animation = "chat-popup-reverse 0.5s ease-in-out forwards";
    setTimeout(function () {
        document.querySelector(".chat-popup").style.display = "none";
        document.querySelector(".chat-popup").innerHTML = "";
    }, 500);
}
function sendMessage(receiver, inboxId = undefined) {
    const message = document.querySelector(".chat-footer input").value.trim();
    if (message !== "") {
        socket.emit("send-message", { receiver, message, inboxId });
        const img_src = document.getElementById("profile_pic").src;
        const chatMessage = document.createElement("div");
        chatMessage.classList.add("chat-message");
        chatMessage.innerHTML = `
            <p>${message}</p>
            <img src=${img_src} alt="">`;
        document.querySelector(".chat-body").appendChild(chatMessage);
        document.querySelector(".chat-body").scrollTop = document.querySelector(".chat-body").scrollHeight;
        document.querySelector(".chat-footer input").value = "";
        document.querySelector(".chat-footer input").focus();
        socket.emit("load-inbox");
    }
}
socket.on("new-message", (message) => {
    if (document.querySelector(".chat-popup").style.display === "block" && document.querySelector(".chat-popup .chat-header h3").textContent === message.sender_username) {
        const chatMessage = document.createElement("div");
        chatMessage.classList.add("chat-message", "user");
        chatMessage.innerHTML = `
        <p>${message.message}</p>
        <img src="/images/users/${message.sender_image}" alt="">`;
        document.querySelector(".chat-body").appendChild(chatMessage);
        document.querySelector(".chat-body").scrollTop = document.querySelector(".chat-body").scrollHeight;
    } else {
        openChatBox(message.sender_username, message.inbox_id);
    } 
    socket.emit("load-inbox");
});
document.querySelector(".fa.fa-power-off").addEventListener("click", function () {
    socket.emit("disconnect");
});
// document.addEventListener("beforeunload unload", function () {
//     socket.emit("disconnect");
// });