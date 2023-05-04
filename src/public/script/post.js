
const likeBtns = document.querySelectorAll(".hover-orange.selected-orange");
likeBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
        await getLikes(btn);
    });
});

async function getLikes(btn) {
    const post_id = btn.closest(".feed_footer_left").querySelector("i").dataset.post_id;
    // create the blur container
    const blurContainer = document.createElement("div");
    blurContainer.style.position = "fixed";
    blurContainer.style.top = "0";
    blurContainer.style.left = "0";
    blurContainer.style.width = "100%";
    blurContainer.style.height = "100%";
    blurContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    blurContainer.style.backdropFilter = "blur(5px)";
    blurContainer.style.zIndex = "999";

    // create the likes list container
    const likesListContainer = document.createElement("div");
    likesListContainer.style.position = "fixed";
    likesListContainer.style.top = "50%";
    likesListContainer.style.left = "50%";
    likesListContainer.style.transform = "translate(-50%, -50%)";
    likesListContainer.style.width = "50%";
    likesListContainer.style.height = "75%";
    likesListContainer.style.backgroundColor = "#fff";
    likesListContainer.style.border = "1px solid #ddd";
    likesListContainer.style.padding = "10px";
    likesListContainer.style.zIndex = "1000";
    likesListContainer.style.overflowY = "scroll";
    // create the exit button
    const exitButton = document.createElement("h6");
    exitButton.textContent = "X";
    exitButton.style.position = "fixed";
    exitButton.style.top = "15px";
    exitButton.style.right = "15px";
    exitButton.style.cursor = "pointer"
    // add event listener to exit button to remove likes list container
    exitButton.addEventListener("click", function () {
        document.body.removeChild(blurContainer);
    });

    // append exit button to likes list container
    likesListContainer.appendChild(exitButton);

    // create the likes list
    const likesList = document.createElement("ul");

    // add dummy likes for demonstration purposes
    const response = await fetch(`/posts/api/post/likes/${post_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }

    });
    const likes = await response.json();
    console.log(likes);


    // const likes = ["John", "Jane", "Bob", "Sarah", "John", "Jane", "Bob", "Sarah", "John", "Jane", "Bob", "Sarah", "John", "Jane", "Bob", "Sarah", "John", "Jane", "Bob", "Sarah"];
    for (const like of likes) {
        const likeItem = document.createElement("li");
        likeItem.style.display = "flex";
        likeItem.style.flexDirection = "row";
        likeItem.style.justifyContent = "between";
        const name_image_div = document.createElement('div');
        name_image_div.classList.add('row_contain');

        const img_element = document.createElement('img');
        img_element.setAttribute('src', `images/users/${like.image}`)
        name_image_div.appendChild(img_element)

        const name_elemt = document.createElement('a');
        name_elemt.textContent = like.username;
        name_elemt.href = `/users/${like.username}`
        name_elemt.style.color = "black"
        name_image_div.appendChild(name_elemt);

        likeItem.appendChild(name_image_div);

        const follow_button = document.createElement('button');
        if (like.follow_status == 1) {
            console.log(like.username);
            follow_button.textContent = "Unfollow";
            follow_button.classList.add('unfollow_button');
            follow_button.addEventListener('click', async function () {
                unfollow_person(follow_button, like.username);
            });
            likeItem.appendChild(follow_button);
        } if (like.follow_status == null) {
            follow_button.textContent = "Follow";
            follow_button.classList.add('follow_button');
            follow_button.addEventListener('click', async function () {
                follow_person(follow_button, like.username);
            });
            likeItem.appendChild(follow_button);
        }
        likesList.appendChild(likeItem);
        const hr = document.createElement('hr');
        hr.style.width = "75%"
        hr.style.color = "brown"
        hr.style.margin = "auto"
        likesList.appendChild(hr)
    };

    // append likes list to likes list container
    likesListContainer.appendChild(likesList);

    // append likes list container to blur container
    blurContainer.appendChild(likesListContainer);

    // append blur container to body
    document.body.appendChild(blurContainer);
}


// document.querySelector('textarea[name="postArea"]').addEventListener('input', function (e) {
//     const text = e.target.value;
//     e.target.innerHTML = parseHashtag(text);
//     console.log(parseHashtag(text));
// });
function parseHashtag(text) {
    const regex = /\B(#[a-zA-Z0-9_]+\b)(?!;)/gm;
    matches = text.replace(regex, '<span style="color: blue;">$1</span>');
    return matches;
}
async function likePost(btn) {
    const post_id = btn.dataset.post_id;
    //api call
    const response = await fetch(`/posts/api/post/like/${post_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    btn.nextElementSibling.innerText = parseInt(btn.nextElementSibling.innerText) + 1;
    const unlikeBtn = document.createElement("i");
    unlikeBtn.classList.add("fa-solid");
    unlikeBtn.classList.add("fa-thumbs-up");
    unlikeBtn.classList.add("unlike-buttons");
    unlikeBtn.dataset.post_id = post_id;
    btn.replaceWith(unlikeBtn);
    unlikeBtn.addEventListener("click", function () {
        unlikePost(unlikeBtn);
    });
}

async function unlikePost(btn) {
    const post_id = btn.dataset.post_id;
    //api call
    const response = await fetch(`/posts/api/post/unlike/${post_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    btn.nextElementSibling.innerText = parseInt(btn.nextElementSibling.innerText) - 1;
    const unlikeBtn = document.createElement("i");
    unlikeBtn.classList.add("fa-regular");
    unlikeBtn.classList.add("fa-thumbs-up");
    unlikeBtn.classList.add("like-buttons");
    unlikeBtn.dataset.post_id = post_id;
    btn.replaceWith(unlikeBtn);
    unlikeBtn.addEventListener("click", function () {
        likePost(unlikeBtn);
    });
}
async function follow_person(btn, username) {
    const response = await fetch(`/api/follow/${username}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    if (data.success) {
        const unfollow_button = document.createElement('button');
        unfollow_button.textContent = "Unfollow";
        unfollow_button.classList.add('unfollow_button');
        unfollow_button.dataset.username = username;
        btn.replaceWith(unfollow_button);
        unfollow_button.addEventListener('click', async function () {
            unfollow_person(unfollow_button, username);
        });
    }

}
async function unfollow_person(btn, username) {
    const response = await fetch(`/api/unfollow/${username}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    if (data.success) {
        const follow_button = document.createElement('button');
        follow_button.textContent = "Follow";
        follow_button.classList.add('follow_button');
        follow_button.dataset.username = username;
        btn.replaceWith(follow_button);
        follow_button.addEventListener('click', async function () {
            follow_person(follow_button, username);
        });
    }
}

document.querySelectorAll(".like-buttons").forEach((btn) => {
    btn.addEventListener("click", function () {
        likePost(btn);
    });
});
document.querySelectorAll(".unlike-buttons").forEach((btn) => {
    btn.addEventListener("click", function () {
        unlikePost(btn);
    });
});
const postsImages = [];
const publishIcons = document.querySelector(".publish_icons")
if (publishIcons) {
    publishIcons.querySelector("li").addEventListener("click", function () {
        const inputTag = document.createElement("input");
        inputTag.type = "file";
        inputTag.accept = "image/*";
        inputTag.multiple = true;
        const imagesDiv = document.querySelector(".images");
        inputTag.addEventListener("change", function () {
            const files = inputTag.files;
            if (postsImages.length + files.length > 10) {
                const error_div = document.createElement("p");
                error_div.classList.add("error_div");
                error_div.textContent = "You can upload maximum 10 images";
                document.querySelector(".right_row").insertBefore(error_div, document.querySelector(".right_row").firstChild);
                console.log("You can upload maximum 10 images");
                return;
            } else {
                if (document.querySelector(".error_div")) {
                    document.querySelector(".error_div").remove();
                }
                for (let i = 0; i < files.length; i++) {
                    postsImages.push(files[i]);
                }
            }
            if (files.length) {
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = document.createElement("img");
                        img.src = e.target.result;
                        imagesDiv.appendChild(img);
                    }
                    reader.readAsDataURL(files[i]);
                }
            }
        });
        inputTag.click();
    });
}
//video button
// document.querySelector(".publish_icons").querySelector("li:nth-child(2)").addEventListener("click", function () {});
const publishButton = document.querySelector(".publish_icons");
if (publishButton) {
    publishButton.querySelector("button").addEventListener("click", async function () {
        const postArea = document.querySelector('textarea[name="postArea"]');
        const images = document.querySelector(".images");
        if (postArea.value.trim() === "" && postsImages.length === 0) {
            return;
        } else {
            const formData = new FormData();
            postsImages.forEach((image) => {
                formData.append("images", image);
            });
            formData.append("content", postArea.value.trim());
            const response = await fetch("/posts/api/create", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                postArea.value = "";
                images.innerHTML = "";
                postsImages.length = 0;
                const post = document.createElement("div");
                post.classList.add("row");
                post.classList.add("border-radius");
                post.innerHTML = `
           <div class="feed">
                                        <div class="feed_title">
                                            <a href="/users/${data.response.username}">
                                                <img src=${document.getElementById("profile_pic").src} alt="" /></a>
                                            <span><b>
                                                   You
                                                </b> Shared a <a href="/posts/post/${data.response.post_id}">Post<br>
                                                    <p style="color: #515365;">
                                                      Now
                                                    </p>
                                                </a>
                                            </span>
                                        </div>
                                        <div class="feed_content">
                                            <p>
                                                ${data.response.post_content}
                                            </p>`;
                if (data.response.single_image) {
                    post.innerHTML += `<div class="feed_content_image">
                                            <a href="/posts/post/${data.response.post_id}"><img
                                            src="images/posts/${data.response.single_image}" alt="" /></a>
                                                </div>`
                }

                post.innerHTML += `</div>
                                        <div class="feed_footer">
                                            <ul class="feed_footer_left">
                                               
                                                        <i class="fa-regular fa-thumbs-up like-buttons"
                                                        data-post_id=${data.response.post_id}></i>
                                                       
    
                                                            <li class="hover-orange selected-orange">
                                                               0
                                                            </li>
                                            </ul>
                                            <ul class="feed_footer_right">
                                                <li>
                                                <li class="hover-orange selected-orange">
                                                    <a href="/posts/post/${data.response.post_id}" style="color:#515365;">
                                                <li class="hover-orange"><i class="fa fa-comments-o"></i>
                                                    0 comments
                                                </li>
                                                </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>`;
                setTimeout(function () {
                    document.querySelector(".row").after(post);
                    document.querySelector(".like-buttons").addEventListener("click", function () {
                        likePost(document.querySelector(".like-buttons"));
                    });

                    document.querySelector(".hover-orange.selected-orange").addEventListener("click", function () {
                        getLikes(document.querySelector(".hover-orange.selected-orange"));
                    });
                    parseHashtags(post.querySelector(".feed_content p"));
                }, 1000);
            } else {
                console.log(data);
                window.location.reload();
            }
        }
    });
}
const comment_button = document.querySelector(".add-comment button")
if (comment_button) {
    comment_button.addEventListener("click", add_comment);
}
const delete_comment_buttons = document.querySelectorAll(".delete-comment-button");
const edit_comment_buttons = document.querySelectorAll(".edit-comment-button");
if (delete_comment_buttons) {
    delete_comment_buttons.forEach((btn) => {
        btn.addEventListener("click", function () {
            delete_comment(btn);
        });
    });
}
if (edit_comment_buttons) {
    edit_comment_buttons.forEach((btn) => {
        btn.addEventListener("click", function () {
            edit_comment(btn);
        });
    });
}
document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        if (document.activeElement.id === "comment") {
            add_comment();
        }
    }
});

async function add_comment() {
    const comment = document.getElementById("comment");
    const post_id = document.querySelector(".feed_footer_left i").dataset.post_id;

    const response = await fetch(`/posts/api/addComment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            comment: comment.value,
            post_id: post_id,
        }),
    });
    const data = await response.json();
    if (data.success) {
        comment.value = "";
        comment.focus();
        const commentResponse = data.response;
        let commentDiv = document.createElement("div");
        commentDiv.classList.add("comment");
        commentDiv.dataset.comment_id = commentResponse.comment_id;
        commentDiv.innerHTML = `
        <img src="images/users/${commentResponse.user_image}" alt="User Avatar"
      class="comment-avatar">
      <div class="comment-details">
        <h3 class="comment-author">
            <a href="/users/${commentResponse.username}">
            ${commentResponse.username}
            </a><small>
                Now
            </small>
         </h3>
        <p class="comment-text">
        ${commentResponse.comment_content}
        </p>
        </div>
      `;
        const edit_span = document.createElement("span");
        edit_span.classList.add("edit-comment-button");
        edit_span.title = "Edit Comment";
        edit_span.innerHTML = `<i class="fa-solid fa-pen fa-xs"></i>`;
        const delete_span = document.createElement("span");
        delete_span.classList.add("delete-comment-button");
        delete_span.title = "Delete Comment";
        delete_span.innerHTML = `<i class="fa-solid fa-minus"></i>`;
        edit_span.addEventListener("click", function () {
            edit_comment(edit_span);
        });
        delete_span.addEventListener("click", function () {
            delete_comment(delete_span);
        });
        commentDiv.appendChild(edit_span);
        commentDiv.appendChild(delete_span);
        const br = document.createElement("br");
        document.querySelector(".comment-form").after(br);
        br.after(commentDiv);
    } else {
        console.log(data);
    }
}
async function delete_comment(btn) {
    const comment_id = btn.closest(".comment").dataset.comment_id;
    const response = await fetch(`/posts/api/deleteComment`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            comment_id: comment_id,
        }),
    });
    const data = await response.json();
    if (data.success) {
        btn.closest(".comment").remove();
    } else {
        console.log(data);
    }
}
async function edit_comment(btn) {
    const comment_id = btn.closest(".comment").dataset.comment_id;
    const comment_content = btn.closest(".comment").querySelector(".comment-text");
    const comment_text = comment_content.innerHTML.trim();
    const comment_input = document.createElement("input");
    comment_input.type = "text";
    comment_input.value = comment_text;
    comment_input.classList.add("comment-input");
    comment_content.innerHTML = "";
    comment_content.appendChild(comment_input);
    comment_input.focus();
    comment_input.addEventListener("keypress", function (e) {
        if (e.key == "Enter") {
            update_comment(comment_input, comment_id);
        }
    });
}
async function update_comment(comment_input, comment_id) {
    const comment_content = comment_input.value;
    const response = await fetch(`/posts/api/editComment`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            comment_id: comment_id,
            new_comment: comment_content,
        }),
    });
    const data = await response.json();
    if (data.success) {
        const comment = data.response;
        const comment_div = comment_input.closest(".comment");
        comment_div.querySelector(".comment-text").innerHTML = comment;
        comment_input.remove();
    } else {
        console.log(data);
    }
}

window.onload = function () {
    const posts = document.querySelectorAll(".feed_content p");
    posts.forEach((post) => {
        parseHashtags(post);
    });

};

function parseHashtags(post) {
    const hashtag_regex = /\B#([a-zA-Z0-9_]+\b)(?!;)/gm;
    post.innerHTML = post.innerHTML.replace(hashtag_regex, `<a class="hashtag" href="/posts/hashtags/$1">#$1</a>`);

}