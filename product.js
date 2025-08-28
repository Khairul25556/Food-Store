// ================= CONFIG =================
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTJpocpnaaKNWJWGu4GpygD04YUa-tMjRfOrGN-QLWW8RwU9_QETOQ-OgPA1kVHgMebgJH4a9qE_k0d/pub?gid=0&single=true&output=csv';
document.getElementById('year2').textContent = new Date().getFullYear();

const productDetail = document.getElementById('productDetail');
let products = [];

// ================= GET PRODUCT ID FROM URL =================
function getQueryParam(name) {
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

// ================= FETCH PRODUCTS =================
async function loadProducts() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    products = csvToJson(text);
    showProduct();
  } catch (err) {
    console.error(err);
    productDetail.innerHTML = '<p>Failed to load product data.</p>';
  }
}

// ================= CSV TO JSON =================
function csvToJson(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1)
    .map(line => {
      if (!line.trim()) return null;
      const data = line.split(',').map(d => d.trim());
      const obj = {};
      headers.forEach((h, i) => {
        if (h === 'price_per_kg' || h === 'discount') {
          obj[h] = Number(data[i]) || 0;
        } else if (h === 'id') {
          obj[h] = data[i];
        } else {
          obj[h] = data[i] || '';
        }
      });
      return obj;
    })
    .filter(x => x);
}

// ================= SHOW SINGLE PRODUCT =================
function showProduct() {
  const id = getQueryParam('id');
  const product = products.find(p => p.id === id);
  if (!product) {
    productDetail.innerHTML = '<p>Product not found.</p>';
    return;
  }

  productDetail.innerHTML = `
    <img src="${product.image}" alt="${escapeHtml(product.name)}" />
    <div>
      <h2>${escapeHtml(product.name)}</h2>
      <p>${escapeHtml(product.description)}</p>
      <p><strong>Price:</strong> ৳ ${Number(product.price_per_kg).toFixed(2)} / kg</p>
      ${product.discount ? `<p><strong>Discount:</strong> ${product.discount}% off</p>` : ''}
       <p><strong>Order on WhatsApp: </strong><a href="https://wa.me/8801673064324" target="_blank"><button style="border-color: red; padding: 10px; border-radius: 10px;">Chat</button></a></p>
    </div>
  `;
}

// ================= HELPERS =================
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ================= INIT =================
loadProducts();
