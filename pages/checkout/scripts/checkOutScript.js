document.addEventListener("DOMContentLoaded", () => {
  // =====================
  // Input Formatting
  // =====================
  const cardInput = document.getElementById("cardNumber");
  const expiryInput = document.getElementById("expiryDate");

  // Card Number: format as XXXX XXXX XXXX XXXX
  cardInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.substring(0, 16);
    e.target.value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
  });

  // Expiry Date: format as MM/YY
  expiryInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length > 2) {
      e.target.value = value.substring(0, 2) + "/" + value.substring(2);
    } else {
      e.target.value = value;
    }
  });

  // =====================
  // Checkout Logic
  // =====================
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const itemsContainer = document.getElementById("order-items");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const taxEl = document.getElementById("checkout-tax");
  const totalEl = document.getElementById("checkout-total");
  const shippingEl = document.getElementById("checkout-shipping");

  let subtotal = 0;
  if (!cart.length) {
    itemsContainer.innerHTML = "<p class='text-muted'>Your cart is empty.</p>";
  } else {
    itemsContainer.innerHTML = cart
      .map((item) => {
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;
        return `
          <div class="d-flex justify-content-between align-items-start pb-2 mb-2 border-bottom">
            <div>
              <strong class="d-block text-truncate" style="max-width:200px;">
                ${item.title}
              </strong>
              <small class="text-muted">Qty: ${item.qty}</small>
            </div>
            <span class="fw-bold">$${lineTotal.toFixed(2)}</span>
          </div>
        `;
      })
      .join("");
  }

  function updateTotals() {
    const shipping = Number(
      document.querySelector("input[name='shippingMethod']:checked").value
    );
    const tax = subtotal * 0.05;
    const total = subtotal + tax + shipping;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    shippingEl.textContent = `$${shipping.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;

    return { shipping, tax, total };
  }

  // Initial calc
  let totals = updateTotals();

  // Recalculate when shipping method changes
  document.querySelectorAll("input[name='shippingMethod']").forEach((input) =>
    input.addEventListener("change", () => {
      totals = updateTotals();
    })
  );

  // Handle order placement
  document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();

    // Basic validation
    if (cardInput.value.replace(/\s/g, "").length !== 16) {
      alert("Please enter a valid 16-digit card number.");
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryInput.value)) {
      alert("Please enter a valid expiry date (MM/YY).");
      return;
    }
    const cvv = document.getElementById("cvv").value;
    if (!/^[0-9]{3,4}$/.test(cvv)) {
      alert("Please enter a valid CVV (3 or 4 digits).");
      return;
    }

    const btn = document.getElementById("placeOrderBtn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Processing...`;

    setTimeout(() => {
      const orderNumber = "ORD-" + Date.now();
      const orderDetails = {
        orderNumber,
        items: cart,
        subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
      };

      localStorage.setItem("lastOrder", JSON.stringify(orderDetails));
      localStorage.removeItem("cart");

      window.location.href = "/pages/orderConfrimation/order-confirmation.html";
    }, 1500);
  });
});
