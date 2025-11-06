async function loadProducts() {
  const q = document.getElementById('search')?.value?.trim();
  const url = q ? '/api/products?q='+encodeURIComponent(q) : '/api/products';
  const data = await (await fetch(url)).json();
  const grid = document.getElementById('productGrid');
  grid.innerHTML = data.products.map(p=>`
    <div class="card">
      ${p.image_url?`<img src="${p.image_url}" alt="" style="width:100%;height:160px;object-fit:cover;border-radius:10px">`:''}
      <h3>${p.title}</h3>
      <div class="price">Rp ${(p.price_cents/100).toLocaleString('id-ID')}</div>
      <a class="btn" href="/product.html?id=${p.id}">Lihat</a>
    </div>
  `).join('');
}
loadProducts();
document.getElementById('search')?.addEventListener('input', ()=>loadProducts());
