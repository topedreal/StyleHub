document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    document.getElementById("product-container").innerHTML =
      "<p class='text-center text-danger'>No product selected.</p>";
    return;
  }

  // Fetch product details from FakeStore API
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      renderProduct(product);
    })
    .catch(() => {
      document.getElementById("product-container").innerHTML =
        "<p class='text-center text-danger'>Failed to load product.</p>";
    });

  function renderProduct(p) {
    const container = document.getElementById("product-container");

    container.innerHTML = `
      <div class="col-lg-6 text-center">
        <img src="${p.image}" alt="${p.title}" class="img-fluid rounded shadow" style="max-height:400px;object-fit:contain;">
      </div>
      <div class="col-lg-6 d-flex flex-column justify-content-center">
        <h2>${p.title}</h2>
        <p class="text-muted">${p.category}</p>
        <h4 class="text-success fw-bold mb-3">$${p.price}</h4>
        <p>${p.description}</p>
        <button class="btn btn-lg cart-toggle mt-3 add_to_cart" data-id="${p.id}">
          <i class="bi bi-cart-plus"></i> Add to Cart
        </button>
      </div>
    `;

    const btn = container.querySelector(".cart-toggle");

    function updateButton() {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const inCart = cart.find((item) => item.id === p.id);

      if (inCart) {
        btn.classList.remove("add_to_cart");
        btn.classList.add("btn-secondary");
        btn.innerHTML = `<i class="bi bi-cart-dash"></i> Remove`;
      } else {
        btn.classList.remove("btn-secondary");
        btn.classList.add("add_to_cart");
        btn.innerHTML = `<i class="bi bi-cart-plus"></i> Add to Cart`;
      }
    }

    function updateBadge() {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const badge = document.getElementById("cart-count");
      const count = cart.reduce((sum, item) => sum + item.qty, 0);
      if (badge) badge.textContent = count > 0 ? count : "";
    }

    // Initial state
    updateButton();
    updateBadge();

    // ✅ Toggle cart on click
    btn.addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const index = cart.findIndex((item) => item.id === p.id);

      if (index > -1) {
        // Remove from cart
        cart.splice(index, 1);
      } else {
        // Add to cart
        cart.push({
          id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
          qty: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateButton();
      updateBadge();
    });
  }
});
