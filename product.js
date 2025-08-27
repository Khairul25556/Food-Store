const DATA_URL = './products.json';
document.getElementById('year2').textContent = new Date().getFullYear();

function getQueryParam(name){
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

async function loadDetail(){
  try{
    const res = await fetch(DATA_URL);
    const list = await res.json();
    const id = getQueryParam('id');
    const p = list.find(x => String(x.id) === String(id));
    const container = document.getElementById('productDetail');
    if(!p){ container.innerHTML = '<p>Product not found.</p>'; return }

    container.innerHTML = `
      <div class="card">
        <img src="${p.image}" alt="${escapeHtml(p.name)}"/>
      </div>
      <div>
        <h1>${escapeHtml(p.name)}</h1>
        <p class="price">৳ ${Number(p.price_per_kg).toFixed(2)} / kg ${p.discount?` <small>(${p.discount}% off)</small>`:''}</p>
        <p>${escapeHtml(p.description||'No description')}</p>
        <p><strong>Order on WhatsApp: </strong><a href="https://wa.me/8801673064324" target="_blank">Chat</a></p>
      </div>
    `;
  }catch(err){
    console.error(err);
  }
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

loadDetail();