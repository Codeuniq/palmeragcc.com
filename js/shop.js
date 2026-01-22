const API_BASE = "https://erp.palmeragcc.com";
const sliderState = {};

/* LOAD PRODUCTS */
function load_items() {
	// Iniatial page load
	updateCartCount();
	$.ajax({
		url: `${API_BASE}/api/method/palmeragcc.apis.api.get_all_products`,
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
	const brand = product.brand || "";
	let stock_badge = "";
	if (product.status === "Available") {
		stock_badge = '<br>';
	}
	else {
		stock_badge = `
		<div class="d-flex justify-content-center mt-3">
			<div class="stock-badge out-stock">
				<span class="dot"></span>
				Out Of Stock
			</div>
		</div>
		`
	}

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
					<button class="prev_button PRBTN" onclick="slidePrev(${index})"><</button>
					<button class="next_button PRBTN" onclick="slideNext(${index})">></button>
				</div>
			</div>
			<div style="display:flex; justify-content:space-between; align-items:center;">
				<div class="pricing">
					<p class="price">
						<span>
							<img src="images/aed.webp" style="height:12px; margin-top:-2px; padding-right:2px;" />
							${price}
						</span>
					</p>
				</div>
	
				<div class="custom-qty">
					<button onclick="customQtyChange(this,-1)">-</button>
					<span class="custom-qty-num">1</span>
					<button onclick="customQtyChange(this,1)">+</button>
				</div>
			</div>
			<div class="text p-3">
				<h2 style="display:none;">${item_code}</h2>
				<h3>${item_name}</h3>
				<small>${brand}</small>
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

				${stock_badge}

				<div class="product-bottom-details" style="margin-top:11px; display:flex; align-items:center; gap:10px; width:100%;">
					<!-- BUY NOW BUTTON -->
					<a href="#" onclick="order_via_whatsapp(this);"
						target = "_blank"
						style = "flex:1;" >
						<button class="userlogin-button" style="width:100%;">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-bag-heart-fill" viewBox="0 0 16 16">
								<path d="M11.5 4v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m0 6.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132" />
							</svg>
							<span style="font-size:13px;font-weight:700;margin-left:6px;">
								BUY NOW
							</span>
						</button>
					</a>

					<button class="icon-only-btn" title="Add to Cart" onclick="add_to_cart(this);">
						<svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" fill="#003626" class="bi bi-plus-square-fill" viewBox="0 0 16 16">
							<path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0" />
						</svg>
					</button>
				</div >
			</div >
		</div >
	</div >
		`;
}

/* SLIDER CONTROLS */
function slideNext(index) {
	const slider = document.querySelector(
		`.carousels[data - index="${index}"] .content_inner_slider`
	);
	if (!slider) return;

	const total = slider.children.length;
	sliderState[index] = (sliderState[index] || 0) + 1;
	if (sliderState[index] >= total) sliderState[index] = 0;

	slider.style.transform = `translateX(-${sliderState[index] * 100} %)`;
}

function slidePrev(index) {
	const slider = document.querySelector(
		`.carousels[data - index= "${index}"] .content_inner_slider`
	);
	if (!slider) return;

	const total = slider.children.length;
	sliderState[index] = (sliderState[index] || 0) - 1;
	if (sliderState[index] < 0) sliderState[index] = total - 1;

	slider.style.transform = `translateX(-${sliderState[index] * 100} %)`;
}

function order_via_whatsapp(el) {
	const product = el.closest(".product");
	if (!product) return;

	const item_code = product.querySelector("h2")?.innerText || "Item Code";
	const item_name = product.querySelector("h3")?.innerText || "Item Name";
	const qty = product.querySelector(".custom-qty-num")?.innerText || "1";

	const message = encodeURIComponent(
		`I'd like to order *${item_code}* - *${item_name}* of Qty: *${qty}*.`
	);

	el.href = `https://wa.me/971507135589?text=${message}`;
}

function getCart() {
	return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
	localStorage.setItem("cart", JSON.stringify(cart));
}

function add_to_cart(el) {
	const product = el.closest(".product");
	if (!product) return;

	const item_code = product.querySelector("h2")?.innerText || "Item Code";
	const item_name = product.querySelector("h3")?.innerText || "Item Name";
	const qty = product.querySelector(".custom-qty-num")?.innerText || "1";
	const item_price = product.querySelector(".price span")?.innerText || "0.00";
	// Get FIRST image from slider
	const slider = product.querySelector(".content_inner_slider img");
	const item_image = slider ? slider.src : "";

	let cart = getCart();

	const item_data = {
		id: item_code,
		name: item_name,
		price: Number(item_price),
		image: item_image,
		qty: Number(qty)
	};

	const existing = cart.find(item => item.id === item_data.id);

	if (existing) {
		existing.qty += Number(qty);
	} else {
		cart.push(item_data);
	}

	saveCart(cart);
	updateCartCount();
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
		total += item.price * item.qty;

		whatsappText += `*${item.id}* - *${item.name}* x ${item.qty} %0A`;

		container.innerHTML += `
		<div class="cart-item">
			<div class="cart-gallery">
				<img src="${item.image}" class="main-img">
			</div>

			<div class="item-info">
				<h4>${item.name}</h4>
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

	const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

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