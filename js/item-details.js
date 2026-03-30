const API_BASE_URL = CONFIG.API_BASE_URL;
const code = new URLSearchParams(window.location.search).get('code');

let quantity = 1;
let img, zoom; // Declare here, assign AFTER HTML is injected

function load_item_details() {
	updateCartCount();

	$.ajax({
		url: `${API_BASE_URL}/api/method/frappe_ecommerce.apis.api.get_product_details?product_id=${encodeURIComponent(code)}`,
		type: "GET",
		dataType: "json",
		success: function (res) {
			const product_data = res.data || [];
			const similar_items = product_data.similar_items || [];
			const container = document.getElementById('product-page');
			if (!container) return;
			container.insertAdjacentHTML("beforeend", productDetailsTemplate(product_data));

			similar_items.forEach((product, index) => {
				const similar_items_container = document.getElementById('items-container');
				if (!similar_items_container) return;

				similar_items_container.insertAdjacentHTML(
					"beforeend",
					productCardTemplate(product, index)
				);
			});

			// Select elements AFTER HTML is injected
			img = document.getElementById('mainImage');
			zoom = document.getElementById('zoomView');

			// Init zoom AFTER elements exist
			initZoom();
		},
		error: err => console.error("API Error", err)
	});
}

function initZoom() {
	if (!img || !zoom) return;

	setZoom();

	img.addEventListener("mousemove", function (e) {
		zoom.style.display = "block";
		const rect = img.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		zoom.style.backgroundPosition = x + "% " + y + "%";
	});

	img.addEventListener("mouseleave", function () {
		zoom.style.display = "none";
	});
}

function setZoom() {
	if (!img || !zoom) return;
	zoom.style.backgroundImage = `url(${img.src})`;
}

function changeImage(el) {
	if (!img) return;
	img.src = el.src;
	setZoom();
}

/* =======================
   SIZE SELECTION
   ======================= */

let selectedSize = "N/A";

function selectSize(el, size) {
	document.querySelectorAll(".size-circle").forEach(s => s.classList.remove("active"));
	el.classList.add("active");
	selectedSize = size;
	document.getElementById("selectedSize").value = size;

	// Enable the button once a size is picked
	document.getElementById("addToCartBtn").disabled = false;
}

function getSelectedSize() {
	return document.getElementById('selectedSize').value;
}

function getCart() {
	return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
	localStorage.setItem("cart", JSON.stringify(cart));
}

function add_to_cart(el) {
	const product = el.closest(".product-info");
	if (!product) return;

	const item_code = product.querySelector("h2[style='display:none;']")?.innerText || "Item Code";
	const item_name = product.querySelector(".product-title")?.innerText || "Item Name";
	const qty = document.getElementById("qty")?.innerText || "1";
	const item_price = product.querySelector(".price")?.innerText?.trim() || "0.00";
	const item_size = document.getElementById("selectedSize")?.value || "N/A";

	// Get first thumbnail image
	const firstThumb = document.querySelector(".thumbnails img");
	const item_image = firstThumb ? firstThumb.src : "";

	let cart = getCart();

	const item_data = {
		id: item_code,
		name: item_name,
		price: Number(item_price),
		image: item_image,
		qty: Number(qty),
		size: item_size
	};

	const existing = cart.find(item => item.id === item_data.id && item.size === item_data.size);

	if (existing) {
		existing.qty += Number(qty);
	} else {
		cart.push(item_data);
	}
	showToast("🛒 Product added to cart", "success");
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
	const checkoutBtn = document.getElementById("checkout");

	container.innerHTML = "";
	let total = 0;

	if (!cart.length) {
		container.innerHTML = "<p style='text-align:center'>Cart is empty</p>";
		totalEl.innerHTML = "0.00";
		checkoutBtn.style.pointerEvents = "none";  // ← disable
		checkoutBtn.style.opacity = "0.4";          // ← dim it
		return;
	}
	// Re-enable when cart has items
	checkoutBtn.style.pointerEvents = "auto";
	checkoutBtn.style.opacity = "1";

	let html = "";
	cart.forEach((item, index) => {
		let item_total = item.price * item.qty;
		total += item_total;
		html += `
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
	container.innerHTML = html;

	totalEl.innerHTML = `
		<img src="images/aed.webp" style="height:12px;margin-top:-4px;padding-right:2px;">
		${total.toFixed(2)}
	`;

	document.getElementById("checkout").onclick = function (e) {
		e.preventDefault();
		openCustomerPopup();
	};
}

function openCustomerPopup() {
	document.getElementById("customerPopup").style.display = "flex";

	const saved = JSON.parse(localStorage.getItem("customerDetails") || "{}");

	if (saved) {
		document.getElementById("custFirstName").value = saved.firstName || "";
		document.getElementById("custLastName").value = saved.lastName || "";
		document.getElementById("custMobile").value = saved.mobile || "";
		document.getElementById("custAddress").value = saved.address || "";
		document.getElementById("custApartment").value = saved.apartment || "";
		document.getElementById("custCity").value = saved.city || "";

		if (saved.emirate) {
			document.getElementById("custEmirate").value = saved.emirate;
		}

		// auto-check checkbox if data exists
		document.getElementById("saveInfo").checked = true;
	}
}

function closeCustomerPopup() {
	document.getElementById("customerPopup").style.display = "none";
}

function submitCustomerDetails() {
	const firstName = document.getElementById("custFirstName").value.trim();
	const lastName = document.getElementById("custLastName").value.trim();
	const mobile = document.getElementById("custMobile").value.trim();
	const address = document.getElementById("custAddress").value.trim();
	const apartment = document.getElementById("custApartment").value.trim();
	const post = document.getElementById("custPost").value.trim();
	const emirate = document.getElementById("custEmirate").value;
	const city = document.getElementById("custCity").value;

	if (!firstName || !mobile || !address) {
		showToast("Please fill required fields", "error");
		return;
	}
	const saveInfo = document.getElementById("saveInfo").checked;

	if (saveInfo) {
		const customerData = {
			firstName,
			lastName,
			mobile,
			address,
			apartment,
			post,
			emirate,
			city
		};

		localStorage.setItem("customerDetails", JSON.stringify(customerData));
	} else {
		localStorage.removeItem("customerDetails"); // optional cleanup
	}

	const fullName = `${firstName} ${lastName}`;

	const fullAddress = `Address: ${address}\nAppartment: ${apartment}\nCity: ${city}\nPost Code: ${post}\nEmirate : ${emirate}`.trim();

	let cart = getCart();
	let total = 0;
	let whatsappText = "I'd like to place an order:\n\n*Order Summary*\n";

	cart.forEach(item => {
		let item_total = item.price * item.qty;
		total += item_total;

		whatsappText += `*${item.id}* - *${item.name}* (Size:${item.size}) x ${item.qty} - ${item_total.toFixed(2)} AED\n`;
	});

	whatsappText += `\nTotal: ${total.toFixed(2)} AED\n`;

	whatsappText += `\n--------------------\n`;
	whatsappText += `\n*Customer Information*\n\n`;
	whatsappText += `Name: ${fullName}\n`;
	whatsappText += `Mobile: ${mobile}\n`;
	whatsappText += `\n*Delivery Address*\n`;
	whatsappText += `\n${fullAddress}\n`;

	const finalUrl = `https://wa.me/971507135589?text=${encodeURIComponent(whatsappText)}`;

	// window.location.href = finalUrl;
	window.open(finalUrl, '_blank');
}

window.showToast = function (message, type = "success") {
	const toast = document.createElement("div");
	toast.className = `toast-msg toast-${type}`;
	toast.innerText = message;

	document.body.appendChild(toast);

	setTimeout(() => toast.classList.add("show"), 50);

	setTimeout(() => {
		toast.classList.remove("show");
		setTimeout(() => toast.remove(), 300);
	}, 3000);
};

function updateQty(index, change) {
	let cart = getCart();
	cart[index].qty += change;
	if (cart[index].qty <= 0) cart.splice(index, 1);
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

function productDetailsTemplate(product) {
	const price = product.item_price || "0.00";
	const item_code = product.name || "";
	const item_name = product.item_name || "";
	const description = product.item_description || "No description available.";

	const sizeOptions = product.sizes?.length
		? product.sizes.map(size => `
		<div class="size-circle ${size.qty === 0 ? 'disabled' : ''}"
			 onclick="selectSize(this, '${size.size}')">
		  ${size.size}
		</div>
	  `).join("")
		: '<span>No sizes available</span>';

	const images = product.images?.length
		? product.images
		: ["images/item_place_holder.png"];

	const imageSlides = images.map(imgSrc => `
		<img src="${imgSrc}" onclick="changeImage(this)">
	`).join("");

	return `
		<div class="gallery">
			<div class="thumbnails">${imageSlides}</div>
			<div class="main-image">
				<img id="mainImage" src="${images[0]}">
			</div>
			<div class="zoom-view" id="zoomView"></div>
		</div>

		<div class="product-info">
			<h2 class="product-title">${item_name}</h2>
			<h2 style="display:none;">${item_code}</h2>

			<div class="details-title">DETAILS</div>
			<p class="desc">${description}</p>

			<p class="choose">Choose Size</p>
			<div class="sizes">${sizeOptions}</div>

			<input type="hidden" id="selectedSize" name="size" value="">

			<div class="buy-row">
				<div class="qty">
					<button onclick="changeQty(-1)">-</button>
					<span id="qty">1</span>
					<button onclick="changeQty(1)">+</button>
				</div>
			</div>
			<div class="buy-row">
				<button class="buy-btn" onclick="add_to_cart(this);" id="addToCartBtn" disabled>Add to Cart</button>
			</div>
			<div class="price">${price} <img src="images/aed.webp" style="height:17px; margin-left:5px; padding-right:2px;"/></div>
			<p class="tax">Taxes are included.</p>
		</div>
	`;
}

function changeQty(val) {
	quantity += val;
	if (quantity < 1) quantity = 1;
	document.getElementById("qty").innerText = quantity;
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
	<div class="col-6 col-md-4 col-lg-2 mb-4 d-flex">
		<div class="product w-100">
			<div class="carousels" data-index="${index}">
				<div class="carousel_slider">
					<div class="content_inner_slider">
						${imageSlides}
					</div>
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
			<div class="text p-2 pt-0" onclick="window.location.href='item-details.html?code=${encodeURIComponent(item_code)}'" style="cursor:pointer;">
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
		`;
}

$(document).ready(function() {
    $('#custCountry').select2({
        placeholder: "Search your country",
        allowClear: true
    });
});

const country = document.getElementById("custCountry");
const emirate = document.getElementById("custEmirate");

country.addEventListener("change", function () {
    if (this.value === "United Arab Emirates") {
        emirate.style.display = "block";
    } else {
        emirate.disabled = true;
        emirate.selectedIndex = 0; // reset
    }
});