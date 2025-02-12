const profilephotospage = document.querySelectorAll(".row_contain_profilephotospage img");
for (let i = 0; i < profilephotospage.length; i++) {
    profilephotospage[i].addEventListener("click", () => {
        const blurContainer = document.createElement("div");
        blurContainer.style.position = "fixed";
        blurContainer.style.top = "0";
        blurContainer.style.left = "0";
        blurContainer.style.width = "100%";
        blurContainer.style.height = "100%";
        blurContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        blurContainer.style.backdropFilter = "blur(5px)";
        blurContainer.style.zIndex = "999";


        const imageGallery = document.querySelector(".image-gallery");
        const imageContainer = document.querySelector(".image-container");
        imageGallery.style.display = "block";
        blurContainer.appendChild(imageGallery);
        document.body.appendChild(blurContainer);
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
            if (i !== profilephotospage.length - 1) imageContainer.appendChild(right_span);
        } else if (i === profilephotospage.length - 1) {
            if (i !== 0) imageContainer.appendChild(left_span);
        } else {
            imageContainer.appendChild(left_span);
            imageContainer.appendChild(right_span);
        }
        window.addEventListener("keydown", (e) => {
            if (document.querySelector(".image-gallery").style.display == "none") return;
            console.log("key pressed");
            if (e.key === "ArrowLeft") {
                loadNextImage("left");
            } else if (e.key === "ArrowRight") {
                loadNextImage("right");
            } else if (e.key === "Escape") {
                closeImageGallery();
            }
        });
        function loadNextImage(direction) {
            if (direction === "left") {
                if (i > 0) {
                    i--;
                    image.src = profilephotospage[i].getAttribute("src");
                    imageContainer.appendChild(right_span);
                    if (i === 0) {
                        imageContainer.removeChild(left_span);
                    }
                }
            } else if (direction === "right") {
                if (i < profilephotospage.length - 1) {
                    i++;
                    image.src = profilephotospage[i].getAttribute("src");
                    imageContainer.appendChild(left_span);
                    if (i === profilephotospage.length - 1) {
                        imageContainer.removeChild(right_span);
                    }
                }
            }
        }
        function closeImageGallery() {
            blurContainer.remove();
            const new_image_gallery = document.createElement("div");
            new_image_gallery.classList.add("image-gallery");
            const new_image_container = document.createElement("div");
            new_image_container.classList.add("image-container");
            new_image_container.innerHTML = `
                    <img src="" crossorigin="anonymous" alt="Image 1">
                    <span class="exit-button">&times;</span>
                `;
            new_image_gallery.appendChild(new_image_container);
            document.querySelector(".row.shadow").after(new_image_gallery);

        }
        document.querySelector(".exit-button").addEventListener("click", closeImageGallery);
        left_span.addEventListener("click", () => {
            loadNextImage("left");
        });
        right_span.addEventListener("click", () => {
            loadNextImage("right");
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