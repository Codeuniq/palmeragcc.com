const sliderState = {};
const API_BASE_URL = CONFIG.API_BASE_URL

/* LOAD PRODUCTS */
function load_items() {
	// Iniatial page load
	updateCartCount();
	$.ajax({
		url: `${API_BASE_URL}/api/method/frappe_ecommerce.apis.api.get_all_products`,
		type: "GET",
		dataType: "json",
		success: function (res) {
			const products = res.data || [];
			// Clear all tabs
			["shemagh", "shawl", "thobe", "inner"].forEach(cat => {
				const el = document.getElementById(`${cat}_items`);
				if (el) el.innerHTML = "";
			});

			products.forEach((product, index) => {
				const category = product.item_category?.toLowerCase();
				const container = document.getElementById(`${category}_items`);
				if (!container) return;

				container.insertAdjacentHTML(
					"beforeend",
					productCardTemplate(product, index)
				);
			});
		},
		error: err => console.error("API Error", err)
	});
}

/* PRODUCT CARD TEMPLATE */
function productCardTemplate(product, index) {
	const price = product.item_price || "0.00";
	const item_code = product.name || "";
	const item_name = product.item_name || "";

	const images = product.images?.length
		? product.images
		: ["images/item_place_holder.png"];

	const imageSlides = images.map(img => `
	<img src="${img}" class="PRimg">
  `).join("");

	return `
	<div class="col-6 col-md-4 col-lg-3 mb-4 d-flex">
		<div class="product w-100">
			<div class="carousels" data-index="${index}">
				<div class="carousel_slider">
					<div class="content_inner_slider">
						${imageSlides}
					</div>
					
					<button class="prev_button PRBTN" onclick="slidePrev(${index})">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
								fill="currentColor" class="bi bi-caret-left-fill"
								viewBox="0 0 16 16">
								<path
								d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
							</svg>
					</button>
					<button class="next_button PRBTN" onclick="slideNext(${index})">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
									fill="currentColor" class="bi bi-caret-right-fill"
									viewBox="0 0 16 16">
									<path
									d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
							</svg>
							</button>
				</div>
			</div>
			<div class="p-2" style="display:flex; justify-content:space-between; align-items:center;">
				<div class="pricing">
					<p class="price">
						<span>
							<img src="images/aed.webp" style="height:12px; margin-top:-2px; padding-right:2px;" />
							${price}
						</span>
					</p>
				</div>
			</div>
			<div class="text p-2 pt-0" onclick="window.location.href='item-details.html?code=${item_code}'" style="cursor:pointer;">
				<h2 style="display:none;">${item_code}</h2>
				<h3>${item_name}</h3>
				<div class="d-flex margb">
					<div class="cat">
						<span>Palmera</span>
					</div>
					<div class="rating">
						<p class="text-right mb-0">
							<span class="fa fa-star starrat"></span>
							<span class="fa fa-star starrat"></span>
							<span class="fa fa-star starrat"></span>
							<span class="fa fa-star starrat"></span>
							<span class="fa fa-star starrat"></span>
						</p>
					</div>
				</div>
			</div >
		</div >
	</div >
		`;
}

/* SLIDER CONTROLS */
function slideNext(index) {
	const slider = document.querySelector(
		`.carousels[data-index="${index}"] .content_inner_slider`
	);
	if (!slider) return;

	const total = slider.children.length;
	sliderState[index] = (sliderState[index] || 0) + 1;

	if (sliderState[index] >= total) sliderState[index] = 0;

	slider.style.transform = `translateX(-${sliderState[index] * 100}%)`;
}

function slidePrev(index) {
	const slider = document.querySelector(
		`.carousels[data-index="${index}"] .content_inner_slider`
	);
	if (!slider) return;

	const total = slider.children.length;
	sliderState[index] = (sliderState[index] || 0) - 1;

	if (sliderState[index] < 0) sliderState[index] = total - 1;

	slider.style.transform = `translateX(-${sliderState[index] * 100}%)`;
}

function getCart() {
	return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
	localStorage.setItem("cart", JSON.stringify(cart));
}

function open_cart_popup() {
	renderCart();
	document.getElementById("cartModal").style.display = "flex";
}

function closeCart() {
	document.getElementById("cartModal").style.display = "none";
}

function renderCart() {
	const cart = getCart();
	const container = document.querySelector(".cart-items");
	const totalEl = document.querySelector(".cart-footer .total strong");

	container.innerHTML = "";
	let total = 0;
	let whatsappText = "I'd like to place an order:%0A";

	if (!cart.length) {
		container.innerHTML = "<p style='text-align:center'>Cart is empty</p>";
		totalEl.innerHTML = "0.00";
		return;
	}

	cart.forEach((item, index) => {
		let item_total = item.price * item.qty;
		total += item_total;

		whatsappText += `*${item.id}* - *${item.name}* ( *${item.size}* ) x ${item.qty} - ${item_total.toFixed(2)} AED %0A`;

		container.innerHTML += `
		<div class="cart-item">
			<div class="cart-gallery">
				<img src="${item.image}" class="main-img">
			</div>

			<div class="item-info">
				<h4>${item.name}</h4>
				<h5 style="color: #000;">Size : ${item.size}</h5>
				<div class="price-qty">
					<p class="price">
						<img src="images/aed.webp" style="height:15px;margin-top:-4px;padding-right:2px;">
						<span>${item.price.toFixed(2)}</span>
					</p>

					<div class="qty modern-qty">
						<button onclick="updateQty(${index}, -1)">-</button>
						<span class="qty-num">${item.qty}</span>
						<button onclick="updateQty(${index}, 1)">+</button>
					</div>
				</div>
			</div>

		  <span class="remove" onclick="removeItem(${index})">&times;</span>
		</div>
	  `;
	});

	whatsappText += `%0ATotal: ${total.toFixed(2)} AED`;

	totalEl.innerHTML = `
	  <img src="images/aed.webp" style="height:12px;margin-top:-4px;padding-right:2px;">
	  ${total.toFixed(2)}
	`;

	document.getElementById("chechout").href = `https://wa.me/971507135589?text=${whatsappText}`;
}

function updateQty(index, change) {
	let cart = getCart();
	cart[index].qty += change;

	if (cart[index].qty <= 0) {
		cart.splice(index, 1);
	}

	saveCart(cart);
	updateCartCount();
	renderCart();
}

function removeItem(index) {
	let cart = getCart();
	cart.splice(index, 1);
	saveCart(cart);
	updateCartCount();
	renderCart();
}

function updateCartCount() {
	const cart = JSON.parse(localStorage.getItem("cart")) || [];
	const cartCountEl1 = document.getElementById("cartCount1");
	const cartCountEl2 = document.getElementById("cartCount2");

	const totalQty = cart.length;

	if (totalQty > 0) {
		cartCountEl1.textContent = totalQty;
		cartCountEl2.textContent = totalQty;
		cartCountEl1.style.display = "flex";
		cartCountEl2.style.display = "flex";
	} else {
		cartCountEl1.style.display = "none";
		cartCountEl2.style.display = "none";
	}
}
