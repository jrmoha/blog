const profilephotospage = document.querySelectorAll(".row_contain_profilephotospage img");
for (let i = 0; i < profilephotospage.length; i++) {
    profilephotospage[i].addEventListener("click", () => {
        const imageGallery = document.querySelector(".image-gallery");
        const imageContainer = document.querySelector(".image-container");
        imageGallery.style.display = "flex";
        const image = imageGallery.querySelector("img");
        image.src = profilephotospage[i].getAttribute("src");

        const left_span = document.createElement("span");
        left_span.classList.add("arrow-button");
        left_span.classList.add("left");
        left_span.innerHTML = "&lt;";

        const right_span = document.createElement("span");
        right_span.classList.add("arrow-button");
        right_span.classList.add("right");
        right_span.innerHTML = "&gt;";


        if (i === 0) {
            imageContainer.appendChild(right_span);
        } else if (i === profilephotospage.length - 1) {
            imageContainer.appendChild(left_span);
        } else {
            imageContainer.appendChild(left_span);
            imageContainer.appendChild(right_span);
        }
        document.querySelector(".exit-button").addEventListener("click", () => {
            imageGallery.style.display = "none";
            imageContainer.removeChild(left_span);
            imageContainer.removeChild(right_span);
        });
        left_span.addEventListener("click", () => {
            if (i > 0) {
                i--;
                image.src = profilephotospage[i].getAttribute("src");
                imageContainer.appendChild(right_span);
                if (i === 0) {
                    imageContainer.removeChild(left_span);
                }
            }
        });
        right_span.addEventListener("click", () => {
            if (i < profilephotospage.length - 1) {
                i++;
                image.src = profilephotospage[i].getAttribute("src");
                imageContainer.appendChild(left_span);
                if (i === profilephotospage.length - 1) {
                    imageContainer.removeChild(right_span);
                }
            }
        });
    });
}
const delete_button = document.querySelectorAll(".delete-image-button");
for (let i = 0; i < delete_button.length; i++) {
    delete_button[i].addEventListener("click", async () => {
        const img_src = delete_button[i].nextElementSibling.getAttribute("src");
        const response = await fetch("http://localhost:3000/api/delete/photo", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                image: img_src.split("/")[2],
            }),
        });
        const data = await response.json();
        console.log(data);
        if (data.success) {
            delete_button[i].nextElementSibling.remove();
            delete_button[i].remove();
        }
    });
};