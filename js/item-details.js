function openCart() {
	document.getElementById("cartModalitem").style.display = "flex";
}

function closeCart() {
	document.getElementById("cartModalitem").style.display = "none";
}

function removeItem(el) {
	el.closest(".cart-item").remove();
	updateTotal();
}





let quantity=1

function changeQty(val){

quantity+=val

if(quantity<1) quantity=1

document.getElementById("qty").innerText=quantity

}


const img = document.getElementById("mainImage");
const zoom = document.getElementById("zoomView");

function setZoom() {
  zoom.style.backgroundImage = `url(${img.src})`;
}

// Initialize
setZoom();

// Zoom on hover
img.addEventListener("mousemove", function(e){
  zoom.style.display = "block";
  const rect = img.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  zoom.style.backgroundPosition = x + "% " + y + "%";
});

img.addEventListener("mouseleave", function(){
  zoom.style.display = "none";
});

// Change main image AND zoom image when clicking thumbnails
function changeImage(el){
  img.src = el.src; // change main image
  setZoom(); // update zoom overlay
}