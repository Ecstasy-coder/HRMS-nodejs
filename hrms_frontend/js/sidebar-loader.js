function setActiveSidebarLink() {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const links = document.querySelectorAll(".sidebar .nav-link");

    links.forEach(link => {
        const linkPage = link.getAttribute("href")
            .split("/")
            .pop()
            .toLowerCase();

        link.classList.remove("active");

        if (currentPage === linkPage) {
            link.classList.add("active");
        }
    });
}

fetch("sidebar.html")
    .then(res => res.text())
    .then(data => {
        const sidebarContainer = document.getElementById("sidebar-container");

        if (!sidebarContainer) return;

        sidebarContainer.innerHTML = data;

        setTimeout(setActiveSidebarLink, 50);
    });