const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;
const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (isTouch) document.body.classList.add("touch");
if (prefersReduced) document.body.classList.add("reduced-motion");

document.addEventListener("DOMContentLoaded", () => {
  initNavScroll();
  initMobileNav();
  initSearchOverlay();
  initCartDrawer();
  initScrollReveal();
  initCustomCursor();
  initQuickView();
  initToast();
  initScrollProgress();
  syncCartCount();
  if (typeof onPageReady === "function") onPageReady();
});

/* ---------- Scroll progress ---------- */
function initScrollProgress() {
  const bar = document.querySelector("[data-scroll-bar]");
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (scrolled * 100) + "%";
  };
  document.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------- Nav blur/shrink on scroll ---------- */
function initNavScroll() {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;
  const update = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  document.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------- Mobile drawer ---------- */
function initMobileNav() {
  const burger = document.querySelector("[data-burger]");
  const drawer = document.querySelector("[data-drawer]");
  const closeBtn = document.querySelector("[data-drawer-close]");
  if (!burger || !drawer) return;
  const open = () => drawer.classList.add("open");
  const close = () => drawer.classList.remove("open");
  burger.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ---------- Search overlay ---------- */
function initSearchOverlay() {
  const overlay = document.querySelector("[data-search-overlay]");
  const input = document.querySelector("[data-search-input]");
  if (!overlay) return;
  const open = () => { overlay.classList.add("open"); setTimeout(() => input?.focus(), 300); };
  const close = () => overlay.classList.remove("open");
  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", open));
  document.querySelector("[data-search-close]")?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------- Cart (persisted in-memory across the session via localStorage-free window store) ---------- */
window.CART = window.CART || JSON.parse(sessionStorage.getItem("kopou_cart") || "[]");

function persistCart() {
  try { sessionStorage.setItem("kopou_cart", JSON.stringify(window.CART)); } catch (e) {}
}

function initCartDrawer() {
  const overlay = document.querySelector("[data-cart-overlay]");
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!overlay || !drawer) return;
  const open = () => { overlay.classList.add("open"); drawer.classList.add("open"); renderCart(); };
  const close = () => { overlay.classList.remove("open"); drawer.classList.remove("open"); };
  document.querySelectorAll("[data-cart-open]").forEach((b) => b.addEventListener("click", open));
  document.querySelector("[data-cart-close]")?.addEventListener("click", close);
  overlay.addEventListener("click", close);
  renderCart();
}

function addToCart(product, qty) {
  qty = qty || 1;
  const existing = window.CART.find((l) => l.id === product.id);
  if (existing) existing.qty += qty;
  else window.CART.push({ ...product, qty });
  persistCart();
  renderCart();
  syncCartCount();
}
function removeFromCart(id) {
  window.CART = window.CART.filter((l) => l.id !== id);
  persistCart(); renderCart(); syncCartCount();
  if (typeof onPageReady === "function" && document.querySelector("[data-cart-page]")) renderCartPage();
}
function setCartQty(id, qty) {
  const line = window.CART.find((l) => l.id === id);
  if (!line) return;
  line.qty = Math.max(1, qty);
  persistCart(); renderCart(); syncCartCount();
  if (document.querySelector("[data-cart-page]")) renderCartPage();
}

function syncCartCount() {
  const totalQty = window.CART.reduce((s, l) => s + l.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(totalQty);
    el.classList.add("bump");
    setTimeout(() => el.classList.remove("bump"), 220);
  });
}

function renderCart() {
  const body = document.querySelector("[data-cart-body]");
  const subtotalEl = document.querySelector("[data-cart-subtotal]");
  if (!body) return;
  if (!window.CART.length) {
    body.innerHTML = '<div class="cart-empty">Your bag is empty. Add something from Assam.</div>';
  } else {
    body.innerHTML = window.CART.map((l) => {
      const price = l.sale_price || l.price;
      return `<div class="cart-line">
        <img src="${l.img1}" alt="">
        <div class="cart-line-body">
          <h4>${l.name}</h4>
          <div class="cart-line-meta">Qty ${l.qty}</div>
          <div class="cart-line-price">&#8377;${(price * l.qty).toLocaleString("en-IN")}</div>
        </div>
      </div>`;
    }).join("");
  }
  const subtotal = window.CART.reduce((sum, l) => sum + (l.sale_price || l.price) * l.qty, 0);
  if (subtotalEl) subtotalEl.textContent = "₹" + subtotal.toLocaleString("en-IN");
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  items.forEach((el) => io.observe(el));
}

/* ---------- Custom cursor ---------- */
function initCustomCursor() {
  if (isTouch || prefersReduced) return;
  const dot = document.querySelector("[data-cursor]");
  const ring = document.querySelector("[data-cursor-ring]");
  const label = document.querySelector("[data-cursor-label]");
  if (!dot || !ring) return;
  let rx = 0, ry = 0, tx = 0, ty = 0;
  window.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px";
    tx = e.clientX; ty = e.clientY;
  });
  function ringLoop() {
    rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
    ring.style.left = rx + "px"; ring.style.top = ry + "px";
    requestAnimationFrame(ringLoop);
  }
  ringLoop();
  function bindHoverables() {
    document.querySelectorAll("[data-hoverable], .product-card, .cat-panel").forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "1";
      el.addEventListener("mouseenter", () => {
        dot.classList.add("cur-hover"); ring.classList.add("cur-hover");
        label.textContent = el.getAttribute("data-cursor-text") || "";
      });
      el.addEventListener("mouseleave", () => { dot.classList.remove("cur-hover"); ring.classList.remove("cur-hover"); label.textContent = ""; });
    });
  }
  bindHoverables();
  new MutationObserver(bindHoverables).observe(document.body, { childList: true, subtree: true });
}

/* ---------- Toast ---------- */
let toastTimer = null;
function initToast() {
  if (document.querySelector(".toast")) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = '<span class="dot"></span><span data-toast-text></span>';
  document.body.appendChild(toast);
}
function showToast(message) {
  const toast = document.querySelector(".toast");
  const text = document.querySelector("[data-toast-text]");
  if (!toast || !text) return;
  text.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function flyToCart(startEl) {
  const cartIcon = document.querySelector("[data-cart-count]");
  if (!cartIcon || !startEl) return;
  const startRect = startEl.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();
  const dot = document.createElement("div");
  dot.className = "fly-dot";
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  dot.style.left = startX + "px"; dot.style.top = startY + "px";
  dot.style.transform = "translate(-50%, -50%) scale(1)"; dot.style.opacity = "1";
  document.body.appendChild(dot);
  requestAnimationFrame(() => {
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;
    dot.style.transform = `translate(${endX - startX - 7}px, ${endY - startY - 7}px) scale(0.2)`;
    dot.style.opacity = "0.15";
  });
  setTimeout(() => dot.remove(), 650);
}

/* ---------- Quick View modal ---------- */
function initQuickView() {
  const overlay = document.querySelector("[data-qv-overlay]");
  const modal = document.querySelector("[data-qv-modal]");
  if (!overlay) return;
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-view");
    if (!btn) return;
    e.preventDefault();
    const card = btn.closest(".product-card");
    const id = parseInt(card.getAttribute("data-id"), 10);
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    renderQuickView(p);
    overlay.classList.add("open");
  });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeQV(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeQV(); });
  function closeQV() { overlay.classList.remove("open"); }

  function renderQuickView(p) {
    const hasDiscount = p.sale_price && p.sale_price < p.price;
    const pct = hasDiscount ? Math.round((1 - p.sale_price / p.price) * 100) : 0;
    modal.innerHTML = `
      <div class="qv-media"><img src="${p.img1}" alt="${p.name}"></div>
      <div class="qv-body">
        <button class="qv-close" data-qv-close aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        <div class="qv-cat">${p.category}</div>
        <h3 class="qv-name">${p.name}</h3>
        <div class="qv-rating"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span>${p.rating.toFixed(1)} (${p.review_count} reviews)</span></div>
        <div class="qv-price-row">
          <span class="qv-price">&#8377;${(hasDiscount ? p.sale_price : p.price).toLocaleString("en-IN")}</span>
          ${hasDiscount ? `<span class="product-price-old">&#8377;${p.price.toLocaleString("en-IN")}</span><span class="product-discount">${pct}% off</span>` : ""}
        </div>
        <p class="qv-desc">${p.desc}</p>
        <div class="qv-origin">
          <div class="qv-origin-label">Traced Origin</div>
          <div class="qv-origin-path">${p.origin.join(' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg> ')}</div>
        </div>
        <div class="qv-actions">
          <div class="qv-qty"><button data-qv-dec aria-label="Decrease quantity">−</button><span data-qv-qty>1</span><button data-qv-inc aria-label="Increase quantity">+</button></div>
          <button class="btn btn-primary" data-qv-add>Add to Cart</button>
        </div>
        <a href="product.html?id=${p.id}" class="btn btn-outline btn-block" style="margin-top:0.7rem;" data-hoverable>View Full Details</a>
      </div>`;
    let qty = 1;
    modal.querySelector("[data-qv-close]").addEventListener("click", closeQV);
    modal.querySelector("[data-qv-inc]").addEventListener("click", () => { qty++; modal.querySelector("[data-qv-qty]").textContent = qty; });
    modal.querySelector("[data-qv-dec]").addEventListener("click", () => { qty = Math.max(1, qty - 1); modal.querySelector("[data-qv-qty]").textContent = qty; });
    modal.querySelector("[data-qv-add]").addEventListener("click", () => {
      addToCart(p, qty);
      showToast(`${p.name} added to cart`);
      closeQV();
    });
  }
}

/* ---------- Product card binding (tilt, wishlist, quick add) ---------- */
function bindCard(card) {
  if (card.dataset.bound) return;
  card.dataset.bound = "1";
  if (!isTouch && !prefersReduced) {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  }
  card.querySelector(".wishlist-btn")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    const btn = e.currentTarget;
    const active = btn.classList.toggle("active");
    btn.setAttribute("aria-pressed", String(active));
    showToast(active ? "Added to wishlist" : "Removed from wishlist");
  });
  card.querySelector(".quick-add")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    const btn = e.currentTarget;
    const id = parseInt(card.getAttribute("data-id"), 10);
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    flyToCart(btn);
    addToCart(product);
    showToast(`${product.name} added to cart`);
  });
}

/* =========================================================
   PRODUCT DATA (shared catalog across all pages)
========================================================= */
const PRODUCTS = [
  {id:1,slug:'premium-assam-orthodox-black-tea',name:'Premium Assam Orthodox Black Tea',category:'Assam Tea',price:799,sale_price:649,rating:4.8,review_count:126,stock_quantity:42,badges:['BESTSELLER','ASSAM ORIGINAL'],
   img1:'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8ee?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1597318181409-cf64d0b5d8ee?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1200&auto=format&fit=crop'],
   desc:'Hand-plucked orthodox black tea from a single Dibrugarh estate, slow-oxidised for a malty, full-bodied cup. Brews a deep coppery liquor with notes of honey and stone fruit — the second-flush character Assam is known for worldwide.',
   origin:['Estate Worker · Deepjyoti Gogoi','Tea Estate, Dibrugarh','Dibrugarh District','Assam'],
   specs:[['Weight','250g, resealable tin'],['Grade','Orthodox, second flush'],['Harvest','May – June'],['Brew','2 tsp per cup, 4 min, 95°C'],['Shelf life','18 months, store airtight']],
   variants:['100g Tin','250g Tin','500g Pouch']},
  {id:2,slug:'traditional-gamosa-handwoven',name:'Traditional Handwoven Gamosa',category:'Handloom & Textiles',price:599,sale_price:null,rating:4.9,review_count:84,stock_quantity:6,badges:['HANDCRAFTED'],
   img1:'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1610030180053-4a6c2c1f0e1e?q=80&w=1200&auto=format&fit=crop'],
   desc:'A pure cotton gamosa woven on a traditional throw-shuttle loom, with the classic red geometric border. Used across Assam as a mark of respect, and equally at home as a table runner or wall hanging.',
   origin:['Weaver · Runumi Das','Household Loom, Sualkuchi','Kamrup District','Assam'],
   specs:[['Material','100% handspun cotton'],['Dimensions','94cm x 165cm'],['Care','Hand wash cold, line dry'],['Weave time','Approx. 2 days per piece']],
   variants:['Red Border','Maroon Border','Green Border']},
  {id:3,slug:'muga-silk-stole-sualkuchi',name:'Muga Silk Stole',category:'Handloom & Textiles',price:4200,sale_price:3780,rating:4.7,review_count:39,stock_quantity:11,badges:['PREMIUM','HANDCRAFTED'],
   img1:'https://images.unsplash.com/photo-1610030180053-4a6c2c1f0e1e?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1610030180053-4a6c2c1f0e1e?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop'],
   desc:'Naturally golden muga silk, handwoven in Sualkuchi — a fibre found nowhere else in the world. The stole deepens in lustre with every wash and is traditionally passed down across generations.',
   origin:['Weaver · Probin Kalita','Silk Workshop, Sualkuchi','Kamrup District','Assam'],
   specs:[['Material','100% Muga silk'],['Dimensions','70cm x 200cm'],['Care','Dry clean only'],['Origin fibre','Antheraea assamensis silkworm']],
   variants:['Natural Gold','Gold with Zari Border']},
  {id:4,slug:'assam-joha-rice-1kg',name:'Assam Joha Rice, 1kg',category:'Food & Delicacies',price:349,sale_price:null,rating:4.6,review_count:58,stock_quantity:73,badges:['ORGANIC'],
   img1:'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop'],
   desc:'Aromatic short-grain joha rice grown in the flood plains of the Brahmaputra, prized for its natural fragrance. A staple at Assamese festive meals, best enjoyed simply steamed.',
   origin:['Farmer · Ratul Bora','Paddy Field, Nagaon','Nagaon District','Assam'],
   specs:[['Weight','1kg, vacuum sealed'],['Type','Short-grain aromatic rice'],['Cooking ratio','1:1.5 rice to water'],['Shelf life','12 months']],
   variants:['500g','1kg','5kg']},
  {id:5,slug:'bell-metal-traditional-bowl',name:'Bell Metal Traditional Bowl (Kahi)',category:'Handicrafts',price:1450,sale_price:1250,rating:4.8,review_count:22,stock_quantity:15,badges:['HANDCRAFTED'],
   img1:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200&auto=format&fit=crop'],
   desc:'A hand-hammered bell-metal kahi, forged by a family workshop that has practised this craft for four generations. Naturally antimicrobial and develops a warm patina with use.',
   origin:['Artisan · Nabin Karmakar','Metal Workshop, Sarthebari','Barpeta District','Assam'],
   specs:[['Material','Bell metal (kanh)'],['Diameter','18cm'],['Care','Hand wash, dry immediately'],['Craft time','3–4 days, hand-hammered']],
   variants:['Small (14cm)','Medium (18cm)','Large (22cm)']},
  {id:6,slug:'wild-forest-honey-500g',name:'Assam Wild Forest Honey, 500g',category:'Food & Delicacies',price:549,sale_price:null,rating:4.7,review_count:91,stock_quantity:4,badges:['ORGANIC','LIMITED'],
   img1:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop'],
   desc:'Raw, unprocessed honey foraged from the forests bordering Kaziranga, harvested in small seasonal batches. Unfiltered and unheated to preserve natural enzymes.',
   origin:['Forager · Ismail Ahmed','Forest Edge, Kaziranga','Golaghat District','Assam'],
   specs:[['Weight','500g glass jar'],['Type','Raw, unfiltered, unheated'],['Harvest season','Spring forage'],['Shelf life','24 months']],
   variants:['250g','500g']},
  {id:7,slug:'bamboo-handcrafted-basket',name:'Bamboo Handcrafted Storage Basket',category:'Handicrafts',price:899,sale_price:749,rating:4.5,review_count:17,stock_quantity:28,badges:['HANDCRAFTED','NEW'],
   img1:'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop'],
   desc:'A finely woven bamboo basket using techniques passed down through generations of Assamese bamboo craft. Durable, breathable, and suited to pantry or laundry storage.',
   origin:['Artisan · Bhaskar Rabha','Craft Cluster, Goalpara','Goalpara District','Assam'],
   specs:[['Material','Locally sourced bamboo'],['Dimensions','30cm dia x 24cm h'],['Care','Wipe clean, keep dry'],['Craft time','1–2 days per piece']],
   variants:['Small','Medium','Large']},
  {id:8,slug:'premium-assam-tea-gift-box',name:'Premium Assam Tea Gift Box',category:'Gift Boxes',price:1899,sale_price:1599,rating:4.9,review_count:63,stock_quantity:20,badges:['BESTSELLER','PREMIUM'],
   img1:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1597318181409-cf64d0b5d8ee?q=80&w=1200&auto=format&fit=crop'],
   desc:'A curated box of three signature Assam teas, packed in a hand-finished gamosa-lined case. A ready-made gift that carries the story of three different estates.',
   origin:['Curated by KOPOU','Multiple Estates','Multiple Districts','Assam'],
   specs:[['Contents','3 x 100g tins'],['Packaging','Gamosa-lined gift box'],['Includes','Tasting notes card'],['Shelf life','18 months']],
   variants:['3-Tea Set','5-Tea Set']},
  {id:9,slug:'eri-silk-shawl',name:'Eri Silk Shawl',category:'Handloom & Textiles',price:2650,sale_price:null,rating:4.6,review_count:28,stock_quantity:19,badges:['HANDCRAFTED'],
   img1:'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1610030180053-4a6c2c1f0e1e?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1610030180053-4a6c2c1f0e1e?q=80&w=1200&auto=format&fit=crop'],
   desc:'Known as "peace silk" for its non-violent extraction process, eri silk gives a soft, matte-textured shawl that is warm without weight.',
   origin:['Weaver · Monami Bordoloi','Household Loom, Dhemaji','Dhemaji District','Assam'],
   specs:[['Material','100% Eri silk'],['Dimensions','80cm x 210cm'],['Care','Dry clean recommended']],
   variants:['Natural Cream','Deep Maroon']},
  {id:10,slug:'assam-pitha-mix',name:'Traditional Til Pitha Mix',category:'Food & Delicacies',price:279,sale_price:249,rating:4.4,review_count:31,stock_quantity:34,badges:['NEW'],
   img1:'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop'],
   desc:'A ready sesame-and-rice-flour mix for making til pitha at home, made from a recipe kept by a Nagaon home kitchen for three generations.',
   origin:['Home Kitchen · Junumoni Saikia','Home Kitchen, Nagaon','Nagaon District','Assam'],
   specs:[['Weight','400g pack'],['Makes','Approx. 12 pithas'],['Shelf life','6 months']],
   variants:['400g Pack','800g Pack']},
  {id:11,slug:'brass-sarai-ceremonial-tray',name:'Brass Sarai Ceremonial Tray',category:'Handicrafts',price:2100,sale_price:null,rating:4.9,review_count:14,stock_quantity:9,badges:['PREMIUM','HANDCRAFTED'],
   img1:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop'],
   desc:'A footed brass sarai used for offerings and ceremonial serving, hand-cast and finished by artisans in Sarthebari.',
   origin:['Artisan · Dilip Karmakar','Metal Workshop, Sarthebari','Barpeta District','Assam'],
   specs:[['Material','Brass'],['Diameter','24cm'],['Care','Polish occasionally with a soft cloth']],
   variants:['Plain Finish','Engraved Finish']},
  {id:12,slug:'discovery-gift-box',name:'Assam Discovery Gift Box',category:'Gift Boxes',price:2999,sale_price:2549,rating:4.8,review_count:19,stock_quantity:13,badges:['BESTSELLER'],
   img1:'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=900&auto=format&fit=crop',
   img2:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=900&auto=format&fit=crop',
   gallery:['https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1200&auto=format&fit=crop'],
   desc:'One of each: orthodox tea, forest honey, a gamosa and a small bell-metal dish — a complete first taste of Assam in a single box.',
   origin:['Curated by KOPOU','Multiple Makers','Multiple Districts','Assam'],
   specs:[['Contents','4 products, gift-wrapped'],['Packaging','Kraft box with gamosa ribbon'],['Includes','Handwritten origin cards']],
   variants:['Standard Box','Deluxe Box']},
];
const badgeClass = { BESTSELLER: 'bestseller', ORGANIC: 'organic', LIMITED: 'limited' };

function cardHTML(p) {
  const hasDiscount = p.sale_price && p.sale_price < p.price;
  const pct = hasDiscount ? Math.round((1 - p.sale_price / p.price) * 100) : 0;
  return `<article class="product-card" data-id="${p.id}">
    <div class="product-media">
      <div class="product-badges">${p.badges.map(b => `<span class="badge ${badgeClass[b] || ''}">${b}</span>`).join('')}</div>
      <button class="wishlist-btn" aria-label="Add ${p.name} to wishlist" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>
      <a href="product.html?id=${p.id}" data-hoverable data-cursor-text="View">
        <img class="img-primary" src="${p.img1}" alt="${p.name}" loading="lazy">
        <img class="img-hover" src="${p.img2}" alt="" loading="lazy">
      </a>
      <div class="product-quick-row">
        <button class="quick-add">Add to Cart</button>
        <button class="quick-view">Quick View</button>
      </div>
    </div>
    <div class="product-body">
      <div class="product-cat">${p.category}</div>
      <h3 class="product-name"><a href="product.html?id=${p.id}" data-hoverable>${p.name}</a></h3>
      <div class="product-rating"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span>${p.rating.toFixed(1)} (${p.review_count})</span></div>
      <div class="product-price-row">
        <span class="product-price">&#8377;${(hasDiscount ? p.sale_price : p.price).toLocaleString('en-IN')}</span>
        ${hasDiscount ? `<span class="product-price-old">&#8377;${p.price.toLocaleString('en-IN')}</span><span class="product-discount">${pct}% off</span>` : ''}
      </div>
      ${p.stock_quantity <= 6 ? `<div class="stock-low">Only ${p.stock_quantity} left</div>` : ''}
      <div class="product-origin-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z"/></svg>${p.origin[p.origin.length-2] || p.origin[0]}</div>
    </div>
  </article>`;
}

function renderProductGrid(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = list.map(cardHTML).join('');
  el.querySelectorAll('.product-card').forEach(bindCard);
}
