const API = "/api";
let token = localStorage.getItem("tradeToken");
let currentUser = null;
let stocks = [];
let portfolio = null;

const $ = (id) => document.getElementById(id);
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function request(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(API + url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2600);
}

function showApp(user) {
  currentUser = user;
  $("authPanel").classList.add("hidden");
  $("appPanel").classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");
  $("welcome").textContent = `Hi, ${user.name}`;
  refresh();
}

function showAuth() {
  $("authPanel").classList.remove("hidden");
  $("appPanel").classList.add("hidden");
  $("logoutBtn").classList.add("hidden");
  $("welcome").textContent = "";
}

async function refresh() {
  try {
    stocks = await request("/stocks");
    portfolio = await request("/portfolio");
    renderStocks(stocks);
    renderPortfolio();
  } catch (err) {
    toast(err.message);
    if (err.message.toLowerCase().includes("log in") || err.message.toLowerCase().includes("session")) logout();
  }
}

function renderStocks(list) {
  $("stockRows").innerHTML = list.map(s => `
    <tr><td>${escapeHtml(s.company)}</td><td>${s.symbol}</td><td>${escapeHtml(s.sector)}</td>
    <td>${money(s.price)}</td><td class="${s.changePercent >= 0 ? "positive" : "negative"}">${s.changePercent >= 0 ? "+" : ""}${s.changePercent}%</td>
    <td><button class="mini-btn buy" data-trade="BUY" data-symbol="${s.symbol}">Buy</button><button class="mini-btn sell" data-trade="SELL" data-symbol="${s.symbol}">Sell</button></td></tr>
  `).join("") || `<tr><td colspan="6">No stocks found.</td></tr>`;
}

function renderPortfolio() {
  const p = portfolio;
  $("cashValue").textContent = money(p.user.cashBalance);
  const totalValue = p.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const invested = p.holdings.reduce((sum, h) => sum + h.invested, 0);
  const pnl = p.holdings.reduce((sum, h) => sum + h.profitLoss, 0);
  $("portfolioValue").textContent = money(totalValue);
  $("investedValue").textContent = money(invested);
  $("pnlValue").textContent = money(pnl);
  $("pnlValue").className = pnl >= 0 ? "positive" : "negative";
  $("holdingRows").innerHTML = p.holdings.map(h => `
    <tr><td>${escapeHtml(h.company)}<small>${h.symbol}</small></td><td>${h.quantity}</td>
    <td>${money(h.averageBuyPrice)}</td><td>${money(h.currentValue)}</td>
    <td class="${h.profitLoss >= 0 ? "positive" : "negative"}">${money(h.profitLoss)}</td></tr>
  `).join("");
  $("emptyHoldings").classList.toggle("hidden", p.holdings.length > 0);
  $("transactions").innerHTML = p.transactions.map(t => `
    <div class="transaction"><div><strong>${t.type} ${t.symbol}</strong><small>${new Date(t.createdAt).toLocaleString()}</small></div>
    <div class="${t.type === "BUY" ? "negative" : "positive"}">${t.type === "BUY" ? "−" : "+"}${money(t.total)}<small>${t.quantity} shares</small></div></div>
  `).join("") || `<p class="empty">No transactions yet.</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function openTrade(type, symbol) {
  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock) return;
  $("tradeTitle").textContent = `${type === "BUY" ? "Buy" : "Sell"} ${stock.company}`;
  $("tradeInfo").textContent = `${stock.symbol} · Sample price ${money(stock.price)} per share`;
  $("tradeForm").elements.symbol.value = symbol;
  $("tradeForm").elements.type.value = type;
  $("tradeForm").elements.quantity.value = 1;
  $("tradeMessage").textContent = "";
  $("tradeModal").classList.remove("hidden");
}

function logout() {
  token = null; currentUser = null; localStorage.removeItem("tradeToken"); showAuth();
}

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
  $("loginForm").classList.toggle("hidden", tab.dataset.tab !== "login");
  $("registerForm").classList.toggle("hidden", tab.dataset.tab !== "register");
  $("authMessage").textContent = "";
}));

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try {
    const data = await request("/auth/login", { method: "POST", body: JSON.stringify(body) });
    token = data.token; localStorage.setItem("tradeToken", token); showApp(data.user);
  } catch (err) { $("authMessage").textContent = err.message; }
});

$("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try {
    const data = await request("/auth/register", { method: "POST", body: JSON.stringify(body) });
    token = data.token; localStorage.setItem("tradeToken", token); showApp(data.user);
  } catch (err) { $("authMessage").textContent = err.message; }
});

$("logoutBtn").addEventListener("click", logout);
$("stockRows").addEventListener("click", e => {
  const btn = e.target.closest("[data-trade]");
  if (btn) openTrade(btn.dataset.trade, btn.dataset.symbol);
});
$("searchStock").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderStocks(stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)));
});
$("closeModal").addEventListener("click", () => $("tradeModal").classList.add("hidden"));
$("tradeModal").addEventListener("click", e => { if (e.target.id === "tradeModal") $("tradeModal").classList.add("hidden"); });

$("tradeForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  body.quantity = Number(body.quantity);
  try {
    const result = await request("/portfolio/trade", { method: "POST", body: JSON.stringify(body) });
    $("tradeModal").classList.add("hidden");
    toast(result.message);
    await refresh();
  } catch (err) { $("tradeMessage").textContent = err.message; }
});

(async function init() {
  if (token) {
    try {
      const p = await request("/portfolio");
      showApp({ name: p.user.name });
    } catch { logout(); }
  } else showAuth();
})();