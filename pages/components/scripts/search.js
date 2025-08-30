document.addEventListener("DOMContentLoaded", () => {
  // Dynamically determine base path for any page depth
  const basePath = (() => {
    const path = window.location.pathname.split("/").filter(Boolean);
    return path.length > 1 ? "../".repeat(path.length - 1) : "./";
  })();

  // ================================
  // Load Search Overlay
  // ================================
  fetch(`${basePath}pages/components/searchOverlay.html`)
    .then((res) => res.text())
    .then((data) => {
      const searchEl = document.getElementById("searchComponent");
      if (!searchEl) return; // Stop if container doesn't exist
      searchEl.innerHTML = data;

      const openSearch = document.getElementById("openSearch");
      const searchOverlay = document.getElementById("searchOverlay");
      const closeSearch = document.getElementById("closeSearch");
      const searchInput = document.getElementById("searchInput");
      const searchResults = document.getElementById("searchResults");

      if (!openSearch || !searchOverlay || !searchInput || !searchResults)
        return;

      // ================================
      // Cart Helpers
      // ================================
      const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
      const setCart = (c) => {
        localStorage.setItem("cart", JSON.stringify(c));
        window.dispatchEvent(new Event("cartUpdated"));
      };
      const inCart = (id) => getCart().some((item) => item.id === id);

      // ================================
      // Overlay Functions
      // ================================
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

      // ================================
      // Product Data & Rendering
      // ================================
      let allProducts = [];
      let loaded = false;

      const ensureProducts = async () => {
        if (loaded) return allProducts;
        const res = await fetch("https://fakestoreapi.com/products");
        allProducts = await res.json();
        loaded = true;
        return allProducts;
      };

      const renderResults = (items) => {
        if (!items.length) {
          searchResults.innerHTML = `<p class="text-center text-muted">No products found.</p>`;
          return;
        }

        searchResults.innerHTML = items
          .map(
            (p) => `
            <div class="col-6 col-md-4 col-lg-3">
              <div class="product-card h-100">
                <img src="${p.image}" alt="${
              p.title
            }" class="img-fluid mb-2" style="height:200px;object-fit:contain;">
                <h6 class="mb-1 text-truncate" title="${p.title}">${
              p.title
            }</h6>
                <p class="price text-success fw-bold mb-2">$${p.price}</p>
                <button class="btn btn-sm w-100 ${
                  inCart(p.id) ? "btn-secondary in-cart" : "add_to_cart"
                }" data-id="${p.id}">
                  <i class="bi ${
                    inCart(p.id) ? "bi-cart-dash" : "bi-cart-plus"
                  }"></i>
                  ${inCart(p.id) ? "Remove" : "Add to Cart"}
                </button>
              </div>
            </div>
          `
          )
          .join("");

        // Attach button click events
        searchResults.querySelectorAll("button[data-id]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id, 10);
            const product = allProducts.find((p) => p.id === id);
            if (!product) return;
            let cart = getCart();
            if (inCart(id)) {
              cart = cart.filter((i) => i.id !== id);
              btn.classList.remove("btn-secondary", "in-cart");
              btn.classList.add("add_to_cart");
              btn.innerHTML = `<i class="bi bi-cart-plus"></i> Add to Cart`;
            } else {
              cart.push({ ...product, qty: 1 });
              btn.classList.remove("add_to_cart");
              btn.classList.add("btn-secondary", "in-cart");
              btn.innerHTML = `<i class="bi bi-cart-dash"></i> Remove`;
            }
            setCart(cart);
          });
        });
      };

      // ================================
      // Search Input
      // ================================
      let t;
      searchInput.addEventListener("input", async () => {
        clearTimeout(t);
        const query = searchInput.value.trim().toLowerCase();
        t = setTimeout(async () => {
          const products = await ensureProducts();
          const filtered = query
            ? products.filter(
                (p) =>
                  p.title.toLowerCase().includes(query) ||
                  p.category.toLowerCase().includes(query)
              )
            : products.slice(0, 12);
          renderResults(filtered);
        }, 180);
      });

      // Initial render on open
      openSearch.addEventListener("click", async () => {
        const products = await ensureProducts();
        renderResults(products.slice(0, 12));
      });
    })
    .catch((err) => console.error("Search Overlay load error:", err));
});
