/* =========================================================
   DOSA HOUSE — script.js
   Course: CSE326 Internet Programming
   ========================================================= */

// ---------- Data ----------
const MENU = [
  { name: "Plain Dosa", category: "Classic Dosas", price: 60, desc: "Crisp fermented rice and lentil crepe served with sambar and coconut chutney." },
  { name: "Butter Plain Dosa", category: "Classic Dosas", price: 80, desc: "Golden plain dosa finished with salted table butter." },
  { name: "Paper Dosa", category: "Classic Dosas", price: 90, bestseller: true, desc: "Extra-thin, crisp crepe roasted to a light golden finish." },
  { name: "Onion Dosa", category: "Classic Dosas", price: 85, desc: "Crisp dosa topped with finely chopped onions and green chillies." },

  { name: "Classic Masala Dosa", category: "Masala & Special", price: 95, bestseller: true, desc: "Signature crisp dosa filled with spiced potato and curry-leaf masala." },
  { name: "Mysore Masala Dosa", category: "Masala & Special", price: 120, bestseller: true, desc: "Spread with house garlic-red chilli chutney and potato masala." },
  { name: "Butter Masala Dosa", category: "Masala & Special", price: 115, desc: "Classic masala dosa roasted generously with butter." },
  { name: "Paneer Masala Dosa", category: "Masala & Special", price: 145, bestseller: true, desc: "Stuffed with spiced crumbled cottage cheese and onions." },
  { name: "Cheese Masala Dosa", category: "Masala & Special", price: 150, desc: "Potato masala dosa topped with grated melted cheese." },
  { name: "Rava Masala Dosa", category: "Masala & Special", price: 130, desc: "Lacy semolina crepe tempered with cumin, pepper, and ginger." },
  { name: "Ghee Roast Dosa", category: "Masala & Special", price: 135, bestseller: true, desc: "Crisp cone-rolled dosa slow-roasted in pure aromatic ghee." },

  { name: "Steamed Idli (2 pcs)", category: "Idli & Vada", price: 50, bestseller: true, desc: "Soft steamed rice cakes served with hot sambar and two chutneys." },
  { name: "Medu Vada (2 pcs)", category: "Idli & Vada", price: 60, desc: "Crisp golden lentil doughnuts seasoned with black pepper and curry leaves." },
  { name: "Idli Vada Combo", category: "Idli & Vada", price: 80, bestseller: true, desc: "Two steamed idlis paired with one crisp medu vada." },
  { name: "Ghee Podi Idli", category: "Idli & Vada", price: 95, desc: "Steamed idlis tossed in spiced gunpowder lentil mix and warm ghee." },

  { name: "Plain Uttapam", category: "Uttapam", price: 85, desc: "Thick, soft griddle-cooked lentil pancake." },
  { name: "Onion Tomato Uttapam", category: "Uttapam", price: 110, bestseller: true, desc: "Topped with diced onions, ripe tomatoes, and fresh coriander." },
  { name: "Mixed Veg Uttapam", category: "Uttapam", price: 125, desc: "Loaded with carrots, capsicum, onions, and green chillies." },
  { name: "Cheese Uttapam", category: "Uttapam", price: 145, desc: "Soft uttapam finished with grated cheese and herbs." },

  { name: "Filter Coffee", category: "Beverages", price: 35, bestseller: true, desc: "Traditional South Indian decoction coffee frothed with hot milk." },
  { name: "Masala Chai", category: "Beverages", price: 25, desc: "Assam tea brewed with crushed ginger and green cardamom." },
  { name: "Sweet Lassi", category: "Beverages", price: 65, desc: "Chilled churned yogurt lightly sweetened and topped with cardamom." },
  { name: "Fresh Buttermilk", category: "Beverages", price: 40, desc: "Spiced salted chaas tempered with roasted cumin and coriander." }
];

// Busy-ness (%) for each slot in TIME_LABELS, per day
const POPULAR_TIMES = {
  Mon: [25, 40, 55, 35, 45, 75, 65, 40],
  Tue: [20, 35, 50, 30, 45, 70, 60, 35],
  Wed: [25, 40, 55, 35, 50, 75, 65, 40],
  Thu: [25, 45, 55, 35, 50, 78, 68, 45],
  Fri: [30, 50, 60, 40, 60, 85, 80, 55],
  Sat: [45, 65, 70, 50, 65, 92, 90, 65],
  Sun: [55, 75, 75, 45, 60, 95, 88, 60]
};
const TIME_LABELS = ["8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];

const DEFAULT_REVIEWS = [
  { name: "Chandan Kumar", rating: 4, comment: "Quality of taste is good." },
  { name: "Roshan Prasad", rating: 4, comment: "Crisp masala dosa and quick takeaway service on Dimna Road." },
  { name: "Pavitra Shome", rating: 2, comment: "Not a decent way to communicate with your customers." }
];

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);                       // shortcut for getElementById
const v = (id) => $(id).value.trim();                                // trimmed value of an input
const todayStr = () => new Date().toLocaleDateString("en-CA");      // "YYYY-MM-DD" in local time

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer;
function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2600);
}

// ---------- 1. Live open/closed status ----------
function updateLiveStatus() {
  const hour = new Date().getHours();
  const isOpen = hour >= 8 && hour < 22; // open daily 8 AM - 10 PM
  $("statusDot").classList.toggle("closed", !isOpen);
  $("statusText").textContent = isOpen ? "Open now · Closes 10:00 PM" : "Closed · Opens 8:00 AM";
}

// ---------- 2. Menu: filter, search, sort ----------
const state = { category: "All", bestsellers: false, query: "", sort: "default" };

function renderMenu() {
  const query = state.query.trim().toLowerCase();
  const direction = { asc: 1, desc: -1 }[state.sort] || 0; // 0 keeps the original order

  const items = MENU
    .filter((i) =>
      (state.category === "All" || i.category === state.category) &&
      (!state.bestsellers || i.bestseller) &&
      [i.name, i.desc, i.category].some((text) => text.toLowerCase().includes(query)))
    .sort((a, b) => direction * (a.price - b.price));

  $("menuGrid").innerHTML = items.map((i) => `
    <article class="menu-item">
      <div>
        <div class="dish-title-row">
          <span class="veg-dot" title="Pure Vegetarian"></span>
          <span class="dish-name">${i.name}</span>
          ${i.bestseller ? '<span class="bestseller-tag">Bestseller</span>' : ""}
        </div>
        <p class="dish-desc">${i.desc}</p>
      </div>
      <span class="dish-price">₹${i.price}</span>
    </article>`).join("");

  $("emptyState").classList.toggle("hidden", items.length > 0);
}

// ---------- 3. Popular times chart ----------
function renderPopularTimes(day) {
  $("popularChart").innerHTML = POPULAR_TIMES[day].map((percent, i) => `
    <div class="bar-col">
      <div class="bar-fill ${TIME_LABELS[i] === "6p" ? "peak" : ""}" style="height: ${percent}%;" title="${TIME_LABELS[i]}: ${percent}% busy"></div>
      <span class="bar-label">${TIME_LABELS[i]}</span>
    </div>`).join("");

  document.querySelectorAll(".day-btn").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.day === day));
}

// ---------- 4. Reviews (saved in localStorage) ----------
function getReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem("dosaHouseReviews"));
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_REVIEWS;
  } catch {
    return DEFAULT_REVIEWS;
  }
}

function renderReviews() {
  $("reviewsList").innerHTML = getReviews().map((r) => `
    <article class="review-card">
      <div class="review-meta">
        <span class="review-author">${escapeHTML(r.name)}</span>
        <span class="review-stars" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
      </div>
      <p class="review-text">${escapeHTML(r.comment)}</p>
    </article>`).join("");
}

// ---------- 5. Form validation ----------
// Shows/clears the error under one field. Every error element is named "<fieldId>Error".
function setFieldState(id, message) {
  $(id + "Error").textContent = message;
  $(id).classList.toggle("invalid", Boolean(message));
  $(id).classList.toggle("valid", !message);
  return !message;
}

// rules = [[fieldId, isValid, errorMessage], ...]. Checks every rule so all errors show together.
function validate(rules) {
  return rules
    .map(([id, isValid, message]) => setFieldState(id, isValid ? "" : message))
    .every(Boolean);
}

function clearFieldStates(form) {
  form.querySelectorAll(".valid, .invalid").forEach((el) => el.classList.remove("valid", "invalid"));
}

function renderSavedBooking() {
  try {
    const b = JSON.parse(localStorage.getItem("dosaHouseBooking"));
    if (!b) return;
    $("savedBooking").classList.remove("hidden");
    $("savedBooking").innerHTML = `
      <strong>Latest Reservation Confirmed</strong><br />
      ${escapeHTML(b.name)} · ${b.guests} guest(s) on ${b.date} at ${b.time}`;
  } catch {
    // corrupted saved data: just show nothing
  }
}

// ---------- 6. Page setup ----------
// (script.js is loaded at the end of <body>, so the elements already exist)

$("currentYear").textContent = new Date().getFullYear();
$("reserveDate").min = todayStr();

// Mobile navigation
const nav = $("navLinks");
function setNav(open) {
  nav.classList.toggle("open", open);
  $("menuToggle").setAttribute("aria-expanded", open);
}
$("menuToggle").addEventListener("click", () => setNav(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => e.target.closest("a") && setNav(false));

// Menu controls. Category tabs are built from the data so they always match the menu.
const categories = ["All", ...new Set(MENU.map((i) => i.category))];
$("categoryTabs").innerHTML = categories.map((c, i) =>
  `<button type="button" class="tab ${i === 0 ? "active" : ""}" role="tab" aria-selected="${i === 0}" data-category="${c}">${c}</button>`).join("");

$("categoryTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  state.category = btn.dataset.category;
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t === btn);
    t.setAttribute("aria-selected", t === btn);
  });
  renderMenu();
});

$("menuSearch").addEventListener("input", (e) => {
  state.query = e.target.value;
  renderMenu();
});

$("priceSort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderMenu();
});

$("bestsellerToggle").addEventListener("click", (e) => {
  state.bestsellers = !state.bestsellers;
  e.currentTarget.classList.toggle("active", state.bestsellers);
  e.currentTarget.setAttribute("aria-pressed", state.bestsellers);
  renderMenu();
});

// Copy address
$("copyAddressBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("shopAddress").textContent);
    showToast("Address copied to clipboard.");
  } catch {
    showToast("Could not copy address.");
  }
});

// Popular-times day buttons (also built from the data); starts on today
$("daySelector").innerHTML = Object.keys(POPULAR_TIMES).map((d) =>
  `<button type="button" class="day-btn" data-day="${d}">${d}</button>`).join("");

$("daySelector").addEventListener("click", (e) => {
  const btn = e.target.closest(".day-btn");
  if (btn) renderPopularTimes(btn.dataset.day);
});
renderPopularTimes(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()]);

// Review form
$("reviewForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = validate([
    ["reviewerName", v("reviewerName").length >= 2, "Please enter your name."],
    ["reviewerComment", v("reviewerComment").length >= 5, "Please write a short review."]
  ]);
  if (!ok) return;

  const review = { name: v("reviewerName"), rating: Number($("reviewerRating").value), comment: v("reviewerComment") };
  localStorage.setItem("dosaHouseReviews", JSON.stringify([review, ...getReviews()]));
  renderReviews();
  e.target.reset();
  clearFieldStates(e.target);
  showToast("Thank you! Your review has been posted.");
});

// Reservation form
$("reservationForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const guests = Number(v("guestCount"));
  const ok = validate([
    ["guestName", v("guestName").length >= 2, "Please enter your full name."],
    ["guestPhone", /^[6-9]\d{9}$/.test(v("guestPhone")), "Enter a valid 10-digit Indian mobile number."],
    ["guestEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("guestEmail")), "Enter a valid email address."],
    ["guestCount", guests >= 1 && guests <= 20, "Guests must be between 1 and 20."],
    ["reserveDate", v("reserveDate") >= todayStr(), "Please select today or a future date."],
    ["reserveTime", v("reserveTime"), "Please choose a time slot."]
  ]);
  if (!ok) return;

  const booking = {
    name: v("guestName"), phone: v("guestPhone"), email: v("guestEmail"),
    guests: v("guestCount"), date: v("reserveDate"), time: v("reserveTime")
  };
  localStorage.setItem("dosaHouseBooking", JSON.stringify(booking));
  renderSavedBooking();
  e.target.reset();
  clearFieldStates(e.target);
  showToast("Table reservation confirmed!");
});

// Initial render
updateLiveStatus();
renderMenu();
renderReviews();
renderSavedBooking();
