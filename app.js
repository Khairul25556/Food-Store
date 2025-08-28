

// ================= CONFIG =================
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTJpocpnaaKNWJWGu4GpygD04YUa-tMjRfOrGN-QLWW8RwU9_QETOQ-OgPA1kVHgMebgJH4a9qE_k0d/pub?gid=0&single=true&output=csv';
const whatsappNumber = '8801673064324'; // change if needed
const facebookLink = '#';

// ================= DOM ELEMENTS =================
document.getElementById('year').textContent = new Date().getFullYear();

const whatsappBtn = document.getElementById('whatsapp');
const facebookBtn = document.getElementById('facebook');
const searchInput = document.getElementById('search');
const productsGrid = document.getElementById('productsGrid');
const discountText = document.getElementById('discountText');

whatsappBtn.href = `https://wa.me/${whatsappNumber}`;
facebookBtn.href = facebookLink;

// ================= DATA =================
let products = [];

// ================= FETCH PRODUCTS =================
async function loadProducts() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    products = csvToJson(text);
    if (!products.length) {
      productsGrid.innerHTML = '<p style="grid-column:1/-1">No products found.</p>';
      discountText.textContent = 'No discounts available.';
      return;
    }
    renderProducts(products);
    renderDiscounts(products);
  } catch (err) {
    console.error(err);
    productsGrid.innerHTML = '<p style="grid-column:1/-1">Failed to load products from sheet.</p>';
    discountText.textContent = 'No discounts available.';
  }
}

// ================= CSV TO JSON =================
function csvToJson(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1)
    .map(line => {
      if (!line.trim()) return null; // skip empty lines
      const data = line.split(',').map(d => d.trim());
      const obj = {};
      headers.forEach((h, i) => {
        if (h === 'price_per_kg' || h === 'discount') {
          obj[h] = Number(data[i]) || 0;
        } else if (h === 'id') {
          obj[h] = data[i]; // keep id as string
        } else {
          obj[h] = data[i] || '';
        }
      });
      return obj;
    })
    .filter(x => x); // remove nulls from empty rows
}

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  if (!list.length) {
    productsGrid.innerHTML = '<p style="grid-column:1/-1">No products found.</p>';
    return;
  }
  productsGrid.innerHTML = list.map(p => `
    <article class="card" aria-labelledby="name-${p.id}">
      <img src="${p.image}" alt="${escapeHtml(p.name)}" />
      <div class="name" id="name-${p.id}">${escapeHtml(p.name)}</div>
      <div class="price">৳ ${formatPrice(p.price_per_kg)} / kg</div>
      <div class="actions">
        <a class="button" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
        <div>${p.discount ? `<small>${p.discount}% off</small>` : ''}</div>
      </div>
    </article>
  `).join('');
}

// ================= RENDER DISCOUNTS =================
function renderDiscounts(list) {
  const discounted = list.filter(p => p.discount && p.discount > 0);
  if (!discounted.length) {
    discountText.textContent = 'No active discounts.';
    return;
  }
  discounted.sort((a, b) => b.discount - a.discount);
  const first = discounted[0];
  discountText.textContent = ` ${first.discount}% discount on '${first.name}' `;
}

// ================= SEARCH =================
searchInput.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  );
  renderProducts(filtered);
});

// ================= HELPERS =================
function formatPrice(v) {
  return Number(v).toFixed(2);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ================= INIT =================
loadProducts();
