const galleryImages = [

    "assets/images/2025-12-08.jpg",
    "assets/images/2025-12-09.jpg",
    "assets/images/2026-03-16.jpg"

];

const mainImage =
document.getElementById("mainGalleryImage");

const thumbnails =
document.querySelectorAll(".mini-img");

let current = 0;

/* AUTO SLIDE */

function changeGallery(){

    current++;

    if(current >= galleryImages.length){
        current = 0;
    }

    mainImage.style.opacity = 0;

    setTimeout(()=>{

        mainImage.src = galleryImages[current];

        mainImage.style.opacity = 1;

    },400);

    thumbnails.forEach((img,index)=>{

        img.classList.remove("active");

        if(index === current){
            img.classList.add("active");
        }

    });

}

/* AUTO CHANGE */

setInterval(changeGallery,4000);

/* CLICK CHANGE */

thumbnails.forEach((img,index)=>{

    img.addEventListener("click",()=>{

        current = index;

        mainImage.src = img.src;

        thumbnails.forEach(i=>{
            i.classList.remove("active");
        });

        img.classList.add("active");

    });

});



    fetch('sidebar.html')
    .then(response => response.text()) 
    .then(data => {
        document.getElementById('sidebar').innerHTML = data;
    });

    document.addEventListener('click', function(e) {
        const navLinks = e.target.closest("#sidebar .nav-link");
        if (!navLinks) return;

        document.querySelectorAll("#sidebar .nav-link").forEach(link => {
            link.classList.remove("active");
        });   
    
    });