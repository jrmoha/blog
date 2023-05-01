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
                if(i === 0){
                    imageContainer.removeChild(left_span);
                }
            }
        });
        right_span.addEventListener("click", () => {
            if (i < profilephotospage.length - 1) {
                i++;
                image.src = profilephotospage[i].getAttribute("src");
                imageContainer.appendChild(left_span);
                if(i === profilephotospage.length - 1){
                    imageContainer.removeChild(right_span);
                }
            }
        });
    });
}