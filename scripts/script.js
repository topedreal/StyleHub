// =====================
// Main Cart + Product Logic (Shared Across Pages)
// =====================
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------
  // Helpers
  // -----------------------
  function normalizeCartArray(arr) {
    // Merge duplicates by id and sum qty
    const map = new Map();
    (arr || []).forEach((raw) => {
      const id = Number(raw.id);
      const qty = Number(raw.qty || 1);
      const existing = map.get(id);
      if (existing) {
        existing.qty += qty;
      } else {
        map.set(id, {
          id,
          title: raw.title ?? raw.name ?? "",
          price: Number(raw.price ?? 0),
          image: raw.image ?? "",
          qty,
        });
      }
    });
    return Array.from(map.values());
  }

  function loadCart() {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    return normalizeCartArray(stored);
  }

  function persistCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // -----------------------
  // State
  // -----------------------
  let cart = loadCart();

  // -----------------------
  // UI Updaters
  // -----------------------
  function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const subEl = document.getElementById("subtotal");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");

    if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }

  function updateCartBadge() {
    // Count only UNIQUE items
    const uniqueCount = cart.length;

    let badge = document.getElementById("cart-count");
    const cartIcon = document.querySelector(".bi-cart-fill, .bi-cart");
    if (!cartIcon) return;

    if (!badge) {
      badge = document.createElement("span");
      badge.id = "cart-count";
      badge.className =
        "badge bg-danger ms-1 rounded-pill position-absolute translate-middle";
      badge.style.fontSize = "0.7rem";

      if (!cartIcon.parentElement.style.position) {
        cartIcon.parentElement.style.position = "relative";
      }
      cartIcon.parentElement.appendChild(badge);
    }

    badge.textContent = String(uniqueCount);
  }

  function saveAndNotify() {
    cart = normalizeCartArray(cart);
    persistCart();
    updateSummary();
    updateCartBadge();
    window.dispatchEvent(new Event("cartUpdated"));
  }

  // -----------------------
  // Cart operations
  // -----------------------
  function addToCart(product, qty = 1) {
    const id = Number(product.id);
    const idx = cart.findIndex((i) => Number(i.id) === id);
    if (idx >= 0) {
      cart[idx].qty = Number(cart[idx].qty || 0) + Number(qty);
    } else {
      cart.push({
        id,
        title: product.title ?? product.name ?? "",
        price: Number(product.price ?? 0),
        image: product.image ?? "",
        qty: Number(qty),
      });
    }
    saveAndNotify();
  }

  function removeFromCart(id) {
    id = Number(id);
    cart = cart.filter((i) => Number(i.id) !== id);
    saveAndNotify();
  }

  function setQty(id, newQty) {
    id = Number(id);
    const idx = cart.findIndex((i) => Number(i.id) === id);
    if (idx >= 0) {
      if (newQty > 0) {
        cart[idx].qty = Number(newQty);
      } else {
        cart.splice(idx, 1);
      }
      saveAndNotify();
    }
  }

  // -----------------------
  // Render cart page
  // -----------------------
  // -----------------------
  // Render cart page
  // -----------------------
  function renderCart() {
    const container = document.getElementById("cart-items");
    const checkoutBtn = document.getElementById("proceedCheckoutBtn");
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML =
        "<p class='text-center text-muted'>🛒 Your cart is empty.</p>";

      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.remove("btn-success");
        checkoutBtn.classList.add("btn-secondary");
      }

      updateSummary();
      updateCartBadge();
      return;
    }

    container.innerHTML = cart
      .map(
        (item) => `
      <div class="list-group-item d-flex align-items-center justify-content-between shadow-sm mb-2 rounded">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${escapeHtml(
          item.title
        )}" width="60" class="me-3 rounded">
          <div>
            <h6 class="mb-1">${escapeHtml(item.title)}</h6>
            <p class="mb-0 text-success fw-bold">$${Number(item.price).toFixed(
              2
            )}</p>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary qty-minus" data-id="${
            item.id
          }">-</button>
          <span class="qty-value fw-bold" data-id="${item.id}">${
          item.qty
        }</span>
          <button class="btn btn-sm btn-outline-secondary qty-plus" data-id="${
            item.id
          }">+</button>
          <button class="btn btn-sm btn-danger remove-item" data-id="${
            item.id
          }">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>`
      )
      .join("");

    // ✅ Enable checkout when items exist
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.classList.remove("btn-secondary");
      checkoutBtn.classList.add("add_to_cart");
    }

    // 🔹 Attach button listeners
    container.querySelectorAll(".qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const item = cart.find((i) => Number(i.id) === id);
        if (item) {
          item.qty = Number(item.qty || 0) + 1;
          saveAndNotify();
          renderCart();
        }
      });
    });

    container.querySelectorAll(".qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const item = cart.find((i) => Number(i.id) === id);
        if (!item) return;
        if (item.qty > 1) {
          item.qty = Number(item.qty) - 1;
        } else {
          cart = cart.filter((i) => Number(i.id) !== id);
        }
        saveAndNotify();
        renderCart();
      });
    });

    container.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        removeFromCart(id);
        renderCart();
      });
    });

    updateSummary();
    updateCartBadge();
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // -----------------------
  // Product rendering helpers
  // -----------------------
  function renderProducts(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cart = loadCart();

    // Determine base URL dynamically for GitHub Pages or local
    const repoBase = location.hostname.includes("github.io")
      ? "/" + location.pathname.split("/")[1] + "/"
      : "./";

    container.innerHTML = products
      .map((p) => {
        const inCart = cart.some((item) => item.id === p.id);
        return `
      <div class="col-6 col-md-4 mb-4">
        <div class="product-card h-100 p-3 shadow rounded">
          <a href="${repoBase}pages/product.html?id=${p.id}">
            <img src="${p.image}" alt="${p.title}" class="img-fluid mb-2">
            <h5>${p.title}</h5>
          </a>
          <p class="price text-success fw-bold">$${p.price}</p>
          <button 
            class="btn btn-sm add-to-cart ${
              inCart
                ? "btn-secondary in-cart"
                : "btn-outline-secondary add_to_cart"
            }" 
            data-id="${p.id}" style="min-width:150px">
            <i class="bi ${inCart ? "bi-cart-dash" : "bi-cart-plus"}"></i> 
            ${inCart ? "Remove" : "Add to Cart"}
          </button>
        </div>
      </div>`;
      })
      .join("");

    attachCartListeners(products);
  }

  function attachCartListeners(products) {
    const cart = loadCart();

    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      const id = parseInt(btn.dataset.id);

      function updateButtonState(inCart) {
        if (inCart) {
          btn.innerHTML = `<i class="bi bi-cart-dash"></i> Remove`;
          btn.classList.remove("btn-outline-secondary", "add_to_cart");
          btn.classList.add("btn-secondary", "in-cart");
        } else {
          btn.innerHTML = `<i class="bi bi-cart-plus"></i> Add to Cart`;
          btn.classList.remove("btn-secondary", "in-cart");
          btn.classList.add("btn-outline-secondary", "add_to_cart");
        }
        btn.style.minWidth = "150px";
      }

      updateButtonState(cart.some((item) => item.id === id));

      btn.addEventListener("click", () => {
        const product = products.find((p) => p.id === id);
        if (!product) return;

        const cart = loadCart();
        const index = cart.findIndex((item) => item.id === id);

        if (index > -1) {
          removeFromCart(id);
          updateButtonState(false);
        } else {
          addToCart(product);
          updateButtonState(true);
        }
        updateCartBadge();
      });
    });
  }

  function loadCategory(containerId, category, limit = 10) {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((products) => {
        const filtered = products
          .filter((p) => p.category === category)
          .slice(0, limit);
        renderProducts(containerId, filtered);
      })
      .catch((err) =>
        console.error(`Failed to load ${category} products`, err)
      );
  }

  // -----------------------
  // Page Setup
  // -----------------------
  if (document.getElementById("men-products")) {
    loadCategory("men-products", "men's clothing");
  }
  if (document.getElementById("women-products")) {
    loadCategory("women-products", "women's clothing");
  }
  if (document.getElementById("accessories")) {
    loadCategory("accessories", "jewelery");
  }
  if (document.getElementById("featured-products")) {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((products) => {
        const men = products
          .filter((p) => p.category === "men's clothing")
          .slice(1, 3);
        const women = products
          .filter((p) => p.category === "women's clothing")
          .slice(0, 2);
        const accessories = products
          .filter((p) => p.category === "jewelery")
          .slice(0, 2);
        renderProducts("featured-products", [...men, ...women, ...accessories]);
      });
  }

  // -----------------------
  // Events
  // -----------------------
  window.addEventListener("storage", (event) => {
    if (event.key === "cart") {
      cart = loadCart();
      renderCart();
    }
  });

  window.addEventListener("cartUpdated", () => {
    cart = loadCart();
    renderCart();
  });

  renderCart();
  updateCartBadge();
  updateSummary();

  // expose API if needed
  window.appCart = {
    addToCart,
    removeFromCart,
    setQty,
    getCart: () => cart.slice(),
  };
});

// =====================
// Spinner
// =====================

// =====================
// Spinner
// =====================

function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("active");
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.remove("active");
}

// ✅ Ensure spinner hides when page becomes visible (back/forward navigation)
window.addEventListener("pageshow", (event) => {
  // The page is loaded from cache or newly loaded
  hideLoading();
});
