
        function highlightCurrentSidebarPage() {
            const currentFile = window.location.pathname
                .split("/")
                .pop()
                .toLowerCase()
                .replace(/\s+/g, "")
                .trim();

            const links = document.querySelectorAll(".sidebar .nav-link");

            links.forEach(link => {
                const href = link.getAttribute("href") || "";

                const linkFile = href
                    .split("/")
                    .pop()
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .trim();

                link.classList.remove("active");

                if (currentFile === linkFile) {
                    link.classList.add("active");
                }
            });
        }

        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(highlightCurrentSidebarPage, 300);
        });



