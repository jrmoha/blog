const navbar_search = document.querySelector('.navbar_search');
if (navbar_search) {
    const searchBtn = document.querySelector('.navbar_search button');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            search();
        });
    }
    const searchInput = document.querySelector('input[name="searchInput"]');
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            search();
        } if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.blur();
        }
    });
}
function search() {
    const searchInput = document.querySelector('input[name="searchInput"]');
    const searchValue = searchInput.value.trim();
    if (searchValue) {
        window.location.href = `/search?q=${searchValue}`;
    }
}
const search_people = document.querySelector(".search-people");
if (search_people) {
    let max_height = 0;
    let scrollableDifference = search_people.scrollHeight - Math.ceil(search_people.scrollTop);
    search_people.addEventListener("scroll", async () => {
        if (scrollableDifference >= search_people.clientHeight && scrollableDifference != max_height) {
            max_height = scrollableDifference;
            await loadMoreUsersFromSearch();
        }

    });
}
async function loadMorePostsFromSearch() {
    const q = window.location.search.split("=")[1];
    const skeleton = document.createElement("div");
    skeleton.classList.add("skeleton");
    const right_row = document.querySelectorAll(".right_row")[1];
    const lastIndex = parseInt(right_row.lastElementChild.dataset.index);
    if (!lastIndex) return;
    const page = Math.ceil(lastIndex / 6) + 1;
    const response = await fetch(`/posts/api/search?q=${q}&page=${page}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    const posts = data.posts;
    if (posts.length) {
        skeleton.remove();
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            createSearchPost(post, data.liked_posts, right_row);
        }
    }
    else {
        right_row.removeEventListener("scroll", loadMorePostsFromSearch);
    }

}
async function loadMoreUsersFromSearch() {
    const q = window.location.search.split("=")[1];
    const skeleton = document.createElement("div");
    skeleton.classList.add("skeleton");
    const search_people_div = document.querySelector(".search-people");
    const row = search_people_div.querySelector(".row.border-radius");
    const lastIndex = parseInt(row.lastElementChild.dataset.index);
    if (!lastIndex) return;
    const page = Math.ceil(lastIndex / 5);
    const response = await fetch(`/api/users/search?q=${q}&page=${page}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    const users = data.response;
    if (users.length) {
        skeleton.remove();
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            createSearchUser(user, row);
        }
    } else {
        search_people_div.removeEventListener("scroll", loadMoreUsersFromSearch);
    }

}
function createSearchUser(user, row) {
    let friendDiv = document.createElement("div");
    friendDiv.classList.add("friend");
    const lastIndex = parseInt(row.lastElementChild.dataset.index);
    friendDiv.dataset.index = lastIndex + 1;
    const friend_title = document.createElement("div");
    friend_title.classList.add("friend_title");
    friend_title.innerHTML = `<img src="images/users/${user.profile_image}" alt="" />
    <span>
        <a href="/users/${user.username}"><b>
                ${user.full_name}
            </b><br></a>
    </span>`;

    const follow_button = document.createElement("button");
    if (user.follow_status == null) {
        follow_button.classList.add("follow_button");
        follow_button.dataset.username = user.username;
        follow_button.innerText = "Follow";
        friend_title.appendChild(follow_button);
    }
    else if (user.follow_status == 1) {
        follow_button.classList.add("unfollow_button");
        follow_button.dataset.username = user.username;
        follow_button.innerText = "Unfollow";
        friend_title.appendChild(follow_button);
    }
    friendDiv.appendChild(friend_title);
    friendDiv.innerHTML += `</div>`;
    row.appendChild(friendDiv);
}
function createSearchPost(post, liked_posts, right_row) {
    const row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("border-radius");
    const lastIndex = parseInt(right_row.lastElementChild.dataset.index);
    row.dataset.index = lastIndex + 1;
    let feed = document.createElement("div");
    feed.classList.add("feed");

    let feed_title = document.createElement("div");
    feed_title.classList.add("feed_title");
    feed_title.innerHTML = `<a href="/users/${post.username}">
    <img src="images/users/${post.user_image}" alt="" /></a>
    <span><b>
    ${post.full_name}
    </b> Shared a <a href="/posts/post/${post.post_id}">Post<br>
    <p style="color: #515365;">
    ${post.last_update}`;
    if (post.modified) {
        feed_title.innerHTML += `<small>modified</small>`
    }
    feed_title.innerHTML += `</p></a></span>`;

    let feed_content = document.createElement("div");
    feed_content.classList.add("feed_content");
    feed_content.innerHTML = `<p>${post.post_content}</p>`;
    if (post.images != undefined && post.images.length) {
        feed_content.innerHTML += `<div class="feed_content_image">
        <a href="/posts/post/${post.post_id}"><img
                src="images/posts/${post.single_image.img_src}"
                alt="" /></a>
            </div>`;
    }
    let feed_footer = document.createElement("div");
    feed_footer.classList.add("feed_footer");
    let feed_footer_left = document.createElement("ul");
    feed_footer_left.classList.add("feed_footer_left");
    if (liked_posts.includes(post.post_id)) {
        feed_footer_left.innerHTML = `
        <i class="fa-solid fa-thumbs-up unlike-buttons" data-post_id=${post.post_id}></i>`;
    } else {
        feed_footer_left.innerHTML = `
        <i class="fa-regular fa-thumbs-up like-buttons" data-post_id=${post.post_id}></i>`;
    }
    feed_footer_left.innerHTML += `<li class="hover-orange selected-orange">
    ${post.likes_number}
    </li>`;
    feed.appendChild(feed_title);
    feed.appendChild(feed_content);
    feed_footer.appendChild(feed_footer_left);
    let feed_footer_right = document.createElement("ul");
    feed_footer_right.classList.add("feed_footer_right");
    feed_footer_right.innerHTML = ` <li>
    <li class="hover-orange selected-orange">
        <a href="/posts/post/${post.post_id}" style="color:#515365;">
    <li class="hover-orange"><i class="fa fa-comments-o"></i>
       ${post.comments_number} comments
    </li>
    </a>
    </li>`;
    feed_footer.appendChild(feed_footer_right);
    feed.appendChild(feed_footer);
    row.appendChild(feed);
    right_row.appendChild(row);
    const like_buttons = document.querySelector(".like-buttons");
    const unlike_buttons = document.querySelector(".unlike-buttons");
    if (like_buttons) {
        like_buttons.addEventListener("click", async () => {
            await likePost(like_buttons);
        });
    }
    if (unlike_buttons) {
        unlike_buttons.addEventListener("click", async () => {
            await unlikePost(unlike_buttons);
        });
    }
    feed_footer_right.querySelector(".hover-orange").addEventListener("click", async () => {
        await getLikes(feed_footer_right.querySelector(".hover-orange"));
    });
    parseHashtags(feed_content.querySelector(".feed_content p"));
}
async function deleteHistory(btn) {
    const query = btn.parentElement.querySelector('.history-title').innerHTML.trim();
    const res = await fetch('/api/history/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query
        })
    });
    const data = await res.json();
    if (data.success) {
        btn.parentElement.remove();
        if (document.querySelector('.history').children.length == 0) {
            deleteHistoryElements();
        }
    } else {
        console.log('Something went wrong');
        console.table(data);
    }
}
document.querySelectorAll('.delete-history-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
        await deleteHistory(btn);
    });
});
document.querySelectorAll('.history-title').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const query = btn.innerHTML.trim();
        window.location.href = `/search?q=${query}`;
    });
}
);
const deleteallHistory_btn = document.querySelector(".deleteallHistory-btn");
if (deleteallHistory_btn) {
    deleteallHistory_btn.addEventListener("click", async () => {
        await deleteallHistory();
    });
}
async function deleteallHistory() {
    const res = await fetch('/api/history/clear', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    if (data.success) {
        deleteHistoryElements();
    } else {
        console.log('Something went wrong');
    }
}
function deleteHistoryElements() {
    document.querySelector('.history').remove();
    document.querySelector('.deleteallHistory').remove();
    const history_alert = document.createElement('div');
    history_alert.classList.add('history-alert');
    history_alert.innerHTML = `<h3>Your Search history is clean.</h3>`;
    document.querySelector('.right_row').appendChild(history_alert);
}