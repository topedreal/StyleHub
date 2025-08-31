document.addEventListener("DOMContentLoaded", () => {
  // ✅ Determine base path dynamically
  const path = window.location.pathname;

  const isRoot =
    path === "/StyleHub/" || path.endsWith("/index.html") || path === "/"; // safety for root without repo-name

  const basePath = isRoot ? "./" : "../";

  // ================================
  // Load Loader
  // ================================
  fetch(`${basePath}pages/components/loader.html`)
    .then((res) => res.text())
    .then((data) => {
      document.body.insertAdjacentHTML("beforeend", data);

      // Loader helpers
      window.showLoading = () => {
        const overlay = document.getElementById("loadingOverlay");
        if (overlay) overlay.classList.add("active");
      };
      window.hideLoading = () => {
        const overlay = document.getElementById("loadingOverlay");
        if (overlay) overlay.classList.remove("active");
      };

      // Show loader on link clicks
      document.querySelectorAll("a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          link.addEventListener("click", () => showLoading());
        }
      });

      window.addEventListener("load", hideLoading);
    })
    .catch((err) => console.error("Loader load error:", err));

  // ================================
  // Load Footer
  // ================================
  fetch(`${basePath}pages/components/footer.html`)
    .then((res) => res.text())
    .then((data) => {
      const footerEl = document.getElementById("footer");
      if (footerEl) footerEl.innerHTML = data;
    })
    .catch((err) => console.error("Footer load error:", err));

  // ================================
  // Load Search Overlay
  // ================================
  fetch(`${basePath}pages/components/searchOverlay.html`)
    .then((res) => res.text())
    .then((data) => {
      const searchEl = document.getElementById("searchComponent");
      if (searchEl) searchEl.innerHTML = data;

      const openSearch = document.getElementById("openSearch");
      const searchOverlay = document.getElementById("searchOverlay");
      const closeSearch = document.getElementById("closeSearch");
      const searchInput = document.getElementById("searchInput");
      const searchResults = document.getElementById("searchResults");

      if (!openSearch || !searchOverlay) return;

      const openOverlay = () => {
        searchOverlay.style.display = "flex";
        searchInput.value = "";
        searchResults.innerHTML = "";
        setTimeout(() => searchInput.focus(), 0);
      };
      const closeOverlayFn = () => {
        searchOverlay.style.display = "none";
        searchInput.value = "";
        searchResults.innerHTML = "";
      };

      openSearch.addEventListener("click", openOverlay);
      closeSearch.addEventListener("click", closeOverlayFn);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeOverlayFn();
      });
      searchOverlay.addEventListener("click", (e) => {
        if (e.target === searchOverlay) closeOverlayFn();
      });
    })
    .catch((err) => console.error("Search Overlay load error:", err));
});
