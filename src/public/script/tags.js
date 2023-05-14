'use strict';
const tagsBody = document.querySelector(".trending");
async function updateTags() {
    tagsBody.innerHTML = "";
    const response = await fetch("http://localhost:3000/posts/trendingtags");
    const tags = await response.json();
    tags.forEach((tag) => {
        const tagDiv = document.createElement("div");
        tagDiv.classList.add("row_contain");
        tagDiv.innerHTML = `
        <span><a href="/posts/hashtags/${tag.tag}"><b style="color:#38A9FF;font-size:20px">#${tag.tag}</b></a><br>${tag.frequency} Are Talking About this</span>`;
        tagsBody.appendChild(tagDiv);
    });
}
if (tagsBody) {
    updateTags();
}