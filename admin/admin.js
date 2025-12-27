/* SIDEBAR TOGGLE */
// const toggleBtn = document.getElementById("toggleBtn");
// const sidebar = document.getElementById("sidebar");
// toggleBtn.onclick = () => {
//   sidebar.classList.toggle("collapsed");
// };

/* YOUR ORIGINAL PRODUCT LOGIC JS GOES HERE */


let products = JSON.parse(localStorage.getItem("products")) || [];
let images = [];
let editIndex = null;

const tableBody = document.getElementById("tableBody");
const imagesUpload = document.getElementById("imagesUpload");
const imgInput = document.getElementById("imgInput");
const formTitle = document.getElementById("formTitle");
const statusInput = document.getElementById("statusInput");
const productForm = document.getElementById("productForm");
const codeInput = document.getElementById("codeInput");
const categoryInput = document.getElementById("categoryInput");
const nameInput = document.getElementById("nameInput");
const priceInput = document.getElementById("priceInput");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");

/* STATUS TOGGLE */
document.querySelectorAll(".status-option").forEach(opt=>{
  opt.addEventListener("click",()=>{
    document.querySelectorAll(".status-option").forEach(o=>o.classList.remove("active","unavailable"));
    opt.classList.add("active");
    if(opt.dataset.value==="Unavailable") opt.classList.add("unavailable");
    statusInput.value = opt.dataset.value;
  });
});

/* IMAGE UPLOAD */
imagesUpload.addEventListener("click", function(e){
  if(e.target.closest(".add-img")) imgInput.click();
});
imgInput.addEventListener("change", e => {
  [...e.target.files].forEach(f => {
    const reader = new FileReader();
    reader.onload = ()=>{images.push(reader.result); renderImages()};
    reader.readAsDataURL(f);
  });
  imgInput.value = "";
});
function renderImages(){
  imagesUpload.innerHTML=`<div class="add-img"><i class="fa fa-plus"></i></div>`;
  images.forEach((img,i)=>{
    const wrapper = document.createElement("div");
    wrapper.className = "image-wrapper";
    wrapper.innerHTML=`<img src="${img}" class="image-thumb">
    <button class="remove-img" onclick="removeImage(${i})">×</button>`;
    imagesUpload.prepend(wrapper);
  });
}
function removeImage(i){images.splice(i,1);renderImages()}

/* SUBMIT FORM */
productForm.onsubmit=e=>{
  e.preventDefault();
  if(images.length===0) return alert("Upload at least one image");
  const product={
    code:codeInput.value.trim(),
    category:categoryInput.value,
    name:nameInput.value.trim(),
    price:priceInput.value,
    status:statusInput.value,
    images:[...images]
  };
  editIndex!==null ? products[editIndex]=product : products.push(product);
  localStorage.setItem("products",JSON.stringify(products));
  resetForm();
  renderTable();
}

/* EDIT & DELETE */
function editProduct(i){
  const p=products[i];
  codeInput.value=p.code;
  categoryInput.value=p.category;
  nameInput.value=p.name;
  priceInput.value=p.price;
  statusInput.value=p.status;
  document.querySelectorAll(".status-option").forEach(o=>o.classList.remove("active","unavailable"));
  const active=document.querySelector(`.status-option[data-value="${p.status}"]`);
  active.classList.add("active");
  if(p.status==="Unavailable") active.classList.add("unavailable");
  images=[...p.images];
  renderImages();
  editIndex=i;
  formTitle.innerText="Edit Product";
  window.scrollTo({top:0,behavior:"smooth"});
}
function deleteProduct(i){
  if(confirm("Delete product?")){
    products.splice(i,1);
    localStorage.setItem("products",JSON.stringify(products));
    renderTable();
  }
}

/* TABLE & FILTER */
function renderTable(){
  let filtered = products.filter(p=>{
    const searchText = searchInput.value.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchText) || p.code.toLowerCase().includes(searchText);
    const matchesCategory = filterCategory.value ? p.category===filterCategory.value : true;
    const matchesStatus = filterStatus.value ? p.status===filterStatus.value : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  tableBody.innerHTML="";
  filtered.forEach((p,i)=>{
    tableBody.innerHTML+=`
    <tr>
      <td>
        <button class="action edit" onclick="editProduct(${products.indexOf(p)})"><i class="fa fa-pen"></i></button>
        <button class="action delete" onclick="deleteProduct(${products.indexOf(p)})"><i class="fa fa-trash"></i></button>
      </td>
      <td>${p.code}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td><span class="status-badge ${p.status==="Available"?"status-available":"status-unavailable"}">${p.status}</span></td>
      <td>${p.price||"-"}</td>
      <td>${p.images.map(img=>`<img src="${img}" style="width:40px;height:40px;border-radius:6px;margin:2px;">`).join('')}</td>
    </tr>`;
  });
}

/* RESET FORM */
function resetForm(){
  productForm.reset();
  images=[];
  editIndex=null;
  statusInput.value="Available";
  document.querySelectorAll(".status-option").forEach(o=>o.classList.remove("active","unavailable"));
  document.querySelector('.status-option[data-value="Available"]').classList.add("active");
  formTitle.innerText="Add Product";
  renderImages();
}

/* FILTER EVENTS */
searchInput.addEventListener("input",renderTable);
filterCategory.addEventListener("change",renderTable);
filterStatus.addEventListener("change",renderTable);

/* INITIAL RENDER */
renderTable();
renderImages();





