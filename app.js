const DATA_URL = './products.json';
const whatsappNumber = '8801673064324'; // change if needed
const facebookLink = '#';

document.getElementById('year').textContent = new Date().getFullYear();

const whatsappBtn = document.getElementById('whatsapp');
const facebookBtn = document.getElementById('facebook');
const searchInput = document.getElementById('search');
const productsGrid = document.getElementById('productsGrid');
const discountText = document.getElementById('discountText');

whatsappBtn.href = `https://wa.me/${whatsappNumber}`;
facebookBtn.href = facebookLink;

let products = [];

async function loadProducts(){
  try{
    const res = await fetch(DATA_URL);
    products = await res.json();
    renderProducts(products);
    renderDiscounts(products);
  }catch(err){
    productsGrid.innerHTML = '<p style="grid-column:1/-1">Failed to load products. Make sure products.json is available on the server.</p>'
    discountText.textContent = 'No discounts available.'
    console.error(err);
  }
}

function renderProducts(list){
  if(!list.length){ productsGrid.innerHTML = '<p style="grid-column:1/-1">No products found.</p>'; return }
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
  `).join('')
}

function renderDiscounts(list){
  const discounted = list.filter(p => p.discount && p.discount > 0);
  if(!discounted.length){ discountText.textContent = 'No active discounts.'; return }
  // show highest discount first
  discounted.sort((a,b)=>b.discount-a.discount);
  const first = discounted[0];
  discountText.textContent = ` ${first.discount}% discount on '${first.name}' `;
}

searchInput.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
  renderProducts(filtered);
})

function formatPrice(v){
  return Number(v).toFixed(2);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

loadProducts();