/* ELEMENTS */
// Show only the dashboard section by default, hide others
window.addEventListener("DOMContentLoaded", function () {
  const dashboardSections = document.querySelectorAll(".section");
  let firstActive = false;
  dashboardSections.forEach(function (section) {
    if (section.classList.contains("active") && !firstActive) {
      section.style.display = "block";
      firstActive = true;
    } else {
      section.style.display = "none";
    }
  });
  // When a menu item is clicked, show only the corresponding section
  const navLinks = document.querySelectorAll(".nav-item");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      const page = link.getAttribute("data-section");
      dashboardSections.forEach(function (section) {
        if (section.id === page) {
          section.style.display = "block";
        } else {
          section.style.display = "none";
        }
      });
    });
  });
});

// Subscription Button
// const subBtn = document.getElementById("subBtn");
// subBtn.addEventListener("click", () => {
//   alert("Subscription coming soon 🚀");
// });

// Mock user data
const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "profile-pic.jpg", // Replace with uploaded picture
  subscription: "pro", // basic | pro | premium | expired
  notifications: 3,
};

// Fill user data
document.getElementById("userName").textContent = user.name;
document.getElementById("userEmail").textContent = user.email;
document.getElementById("userAvatar").src = user.avatar || "default-avatar.png";

// Subscription badge
const subBadge = document.getElementById("subBadge");
if (user.subscription && user.subscription !== "expired") {
  subBadge.textContent =
    user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1);
  subBadge.classList.add(user.subscription);
} else {
  subBadge.style.display = "none";
}

// Notifications
const notifBadge = document.getElementById("notifCount");
if (user.notifications === 0) notifBadge.style.display = "none";
else notifBadge.textContent = user.notifications;

// Dropdown toggle
const userMenuToggle = document.getElementById("userMenuToggle");
const userDropdown = document.getElementById("userDropdown");

userMenuToggle.addEventListener("click", () => {
  userDropdown.style.display =
    userDropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown on outside click
document.addEventListener("click", (e) => {
  if (!userMenuToggle.contains(e.target)) {
    userDropdown.style.display = "none";
  }
});

//===================================

const sidebar = document.getElementById("sidebar");
const topMenuBtn = document.getElementById("topMenuBtn");
const collapseBtn = document.getElementById("collapseBtn");
const overlay = document.getElementById("overlay");
const links = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");
const app = document.getElementById("app");

/* toggle behavior:
     - on mobile (<=880px): topMenuBtn toggles mobile drawer
     - on desktop: topMenuBtn just toggles collapsed state
     - collapseBtn toggles collapsed state on desktop
  */
function isMobile() {
  return window.innerWidth <= 880;
}

function openMobileSidebar() {
  sidebar.classList.add("mobile-open");
  overlay.classList.add("show");
  overlay.style.display = "block";
}
function closeMobileSidebar() {
  sidebar.classList.remove("mobile-open");
  overlay.classList.remove("show");
  overlay.style.display = "none";
}

topMenuBtn.addEventListener("click", () => {
  if (isMobile()) {
    if (sidebar.classList.contains("mobile-open")) closeMobileSidebar();
    else openMobileSidebar();
  } else {
    sidebar.classList.toggle("collapsed");
  }
});

collapseBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  // rotate arrow icon
  const icon = collapseBtn.querySelector("i");
  if (sidebar.classList.contains("collapsed"))
    icon.style.transform = "rotate(180deg)";
  else icon.style.transform = "rotate(0deg)";
});

overlay.addEventListener("click", () => closeMobileSidebar());

// Navigation click
links.forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    links.forEach((x) => x.classList.remove("active"));
    a.classList.add("active");
    const page = a.getAttribute("data-section");
    sections.forEach((s) => s.classList.remove("active"));
    document.getElementById(page).classList.add("active");

    if (isMobile()) closeMobileSidebar();
  });
});

// ---- Rules management (localStorage) ----
const rulesKey = "ct_rules_v1";
const rulesForm = document.getElementById("rulesForm");
const rulesListEl = document.getElementById("rulesList");
const statRules = document.getElementById("statRules");
const activityList = document.getElementById("activityList");
const formMsg = document.getElementById("formMsg");
let editId = null;

function readRules() {
  try {
    const raw = localStorage.getItem(rulesKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function writeRules(arr) {
  localStorage.setItem(rulesKey, JSON.stringify(arr));
}

function renderRules() {
  const rules = readRules();
  if (rules.length === 0) {
    rulesListEl.innerHTML = '<div class="empty">No rules saved yet.</div>';
  } else {
    rulesListEl.innerHTML = "";
    rules.forEach((r) => {
      const el = document.createElement("div");
      el.className = "rule-item";
      el.innerHTML = `
          <div><strong>Rule #${r.id}</strong></div>
          <div style="margin-top:8px; color:var(--slate); font-size:14px;">
            ${r.lossLimit ? `Daily Loss Limit: ${r.lossLimit}%` : ""}
            ${
              r.consecutiveLosses
                ? `<br>Consecutive Losses: ${r.consecutiveLosses}`
                : ""
            }
            ${
              r.overtrading
                ? `<br>Overtrading Limit: ${r.overtrading} trades/day`
                : ""
            }
            ${r.timeLimit ? `<br>Time Limit: ${r.timeLimit} hours` : ""}
            ${r.cooldown ? `<br>Cooldown: ${r.cooldown}` : ""}
            ${r.customRule ? `<br>Custom: ${r.customRule}` : ""}
          </div>
          <div class="rule-meta">
            <div>
              <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" data-action="toggle" data-id="${r.id}" ${
        r.active ? "checked" : ""
      } /> <span class="small-muted">Active</span>
              </label>
            </div>
            <div class="rule-actions">
              <button data-action="edit" data-id="${
                r.id
              }" title="Edit"><i class="fas fa-pen"></i></button>
              <button data-action="delete" data-id="${
                r.id
              }" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `;
      rulesListEl.appendChild(el);
    });
  }
  updateStats();
}

function updateStats() {
  const rules = readRules();
  const activeCount = rules.filter((r) => r.active).length;
  statRules.textContent = activeCount;
  // placeholder counts for other stats — will connect to real logic later
  const alerts = 0;
  const locked = 0;
  const score = Math.min(100, 50 + activeCount * 5);
  document.getElementById("statAlerts").textContent = alerts;
  document.getElementById("statLocked").textContent = locked;
  document.getElementById("statScore").textContent = score + "%";

  // activity list from recent actions stored in localStorage (simple)
  const activityRaw = localStorage.getItem("ct_activity") || "[]";
  const activity = JSON.parse(activityRaw);
  if (activity.length === 0) activityList.innerHTML = "No activity yet.";
  else
    activityList.innerHTML = activity
      .slice(-6)
      .reverse()
      .map(
        (a, i) =>
          `<div style="padding:8px 0;border-bottom:1px dashed rgba(255,255,255,0.03);display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <span>${a}</span>
            <button class="btn small danger delete-activity" data-index="${
              activity.length - 1 - i
            }" style="background:#e74c3c;color:#fff;border:none;padding:2px 8px;border-radius:5px;cursor:pointer;font-size:12px;">Delete</button>
          </div>`
      )
      .join("");
  // Handle delete activity click
  activityList.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-activity")) {
      const idx = parseInt(e.target.getAttribute("data-index"), 10);
      let activity = JSON.parse(localStorage.getItem("ct_activity") || "[]");
      activity.splice(idx, 1);
      localStorage.setItem("ct_activity", JSON.stringify(activity));
      updateStats();
    }
  });
}

function pushActivity(msg) {
  const activityRaw = localStorage.getItem("ct_activity") || "[]";
  const activity = JSON.parse(activityRaw);
  activity.push(`${new Date().toLocaleString()} — ${msg}`);
  while (activity.length > 200) activity.shift();
  localStorage.setItem("ct_activity", JSON.stringify(activity));
  updateStats();
}

// handle clicks on rule item actions (delegation)
rulesListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const action = btn.getAttribute("data-action");
  const id = btn.getAttribute("data-id");
  if (action === "delete") {
    deleteRule(id);
  } else if (action === "edit") {
    startEdit(id);
  }
});

rulesListEl.addEventListener("change", (e) => {
  const cb = e.target;
  if (cb.dataset.action === "toggle") {
    const id = cb.dataset.id;
    toggleRuleActive(id, cb.checked);
  }
});

function deleteRule(id) {
  const rules = readRules().filter((r) => String(r.id) !== String(id));
  writeRules(rules);
  renderRules();
  pushActivity(`Deleted rule ${id}`);
}

function startEdit(id) {
  const rules = readRules();
  const r = rules.find((x) => String(x.id) === String(id));
  if (!r) return;
  // populate form
  document.getElementById("lossLimit").value = r.lossLimit || "";
  document.getElementById("consecutiveLosses").value =
    r.consecutiveLosses || "";
  document.getElementById("overtrading").value = r.overtrading || "";
  document.getElementById("timeLimit").value = r.timeLimit || "";
  document.getElementById("cooldown").value = r.cooldown || "";
  document.getElementById("customRule").value = r.customRule || "";
  editId = r.id;
  formMsg.textContent = "Editing rule — save to update";
}

function toggleRuleActive(id, isActive) {
  const rules = readRules();
  const idx = rules.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return;
  rules[idx].active = !!isActive;
  writeRules(rules);
  renderRules();
  pushActivity(`${isActive ? "Activated" : "Deactivated"} rule ${id}`);
}

rulesForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const lossLimit = document.getElementById("lossLimit").value.trim();
  const consecutiveLosses = document
    .getElementById("consecutiveLosses")
    .value.trim();
  const overtrading = document.getElementById("overtrading").value.trim();
  const timeLimit = document.getElementById("timeLimit").value.trim();
  const cooldown = document.getElementById("cooldown").value;
  const customRule = document.getElementById("customRule").value.trim();

  // at least one field required
  if (
    !(
      lossLimit ||
      consecutiveLosses ||
      overtrading ||
      timeLimit ||
      cooldown ||
      customRule
    )
  ) {
    formMsg.textContent = "Please enter at least one rule field.";
    setTimeout(() => (formMsg.textContent = ""), 3000);
    return;
  }

  const rules = readRules();
  if (editId) {
    // update
    const idx = rules.findIndex((r) => r.id === editId);
    if (idx !== -1) {
      rules[idx] = {
        ...rules[idx],
        lossLimit: lossLimit || "",
        consecutiveLosses: consecutiveLosses || "",
        overtrading: overtrading || "",
        timeLimit: timeLimit || "",
        cooldown: cooldown || "",
        customRule: customRule || "",
      };
      writeRules(rules);
      pushActivity(`Updated rule ${editId}`);
    }
    editId = null;
    formMsg.textContent = "Rule updated";
    setTimeout(() => (formMsg.textContent = ""), 2000);
  } else {
    // create new
    const id = Date.now();
    const newRule = {
      id,
      lossLimit: lossLimit || "",
      consecutiveLosses: consecutiveLosses || "",
      overtrading: overtrading || "",
      timeLimit: timeLimit || "",
      cooldown: cooldown || "",
      customRule: customRule || "",
      active: true,
    };
    rules.push(newRule);
    writeRules(rules);
    pushActivity(`Saved new rule ${id}`);
    formMsg.textContent = "Rule saved";
    setTimeout(() => (formMsg.textContent = ""), 2000);
  }

  rulesForm.reset();
  renderRules();
});

document.getElementById("resetForm").addEventListener("click", () => {
  rulesForm.reset();
  editId = null;
  formMsg.textContent = "";
});

// initial render
renderRules();
updateStats();

// handle window resize: if desktop and sidebar mobile-open, close it
window.addEventListener("resize", () => {
  if (!isMobile()) {
    closeMobileSidebar();
  }
});

// small helper to close mobile sidebar
function closeMobileSidebar() {
  sidebar.classList.remove("mobile-open");
  overlay.style.display = "none";
}

// //price alerts

(function () {
  // ---------- CONFIG ----------
  const ALERTS_KEY = "ct_alerts_v2";
  const POLL_INTERVAL_MS = 15000; // 15s polling
  const COINGECKO_COINS_LIST_URL =
    "https://api.coingecko.com/api/v3/coins/list";
  const COINGECKO_SIMPLE_PRICE =
    "https://api.coingecko.com/api/v3/simple/price";
  const EXCHANGERATE_CONVERT = "https://api.exchangerate.host/convert";

  // ---------- DOM ----------
  const alertForm = document.getElementById("alertForm");
  const assetInput = document.getElementById("asset");
  const typeSelect = document.getElementById("type");
  const conditionSelect = document.getElementById("condition");
  const priceInput = document.getElementById("targetPrice");
  const alertsListEl = document.getElementById("alertsList");
  const alertsHistoryEl = document.getElementById("alertsHistory");
  const statAlertsEl = document.getElementById("statAlerts");
  const resetAlertBtn = document.getElementById("resetAlert");
  const editAlertIdInput = document.getElementById("editAlertId");
  const alertFormMsg = document.getElementById("alertFormMsg");

  // ---------- STATE ----------
  let alerts = []; // active & inactive stored together (active flag)
  let coinsMap = null; // map symbol -> coingecko id fetched on init
  let checking = false;
  let pollTimer = null;

  // UTIL: localStorage read/write
  function loadAlerts() {
    try {
      const raw = localStorage.getItem(ALERTS_KEY);
      alerts = raw ? JSON.parse(raw) : [];
    } catch (e) {
      alerts = [];
    }
  }
  function saveAlerts() {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }

  // UTIL: parse pair "BTC/USD" -> {base:'BTC', quote:'USD'}
  function parsePair(pair) {
    if (!pair || pair.indexOf("/") === -1) return null;
    const [b, q] = pair.split("/").map((s) => s.trim().toUpperCase());
    if (!b || !q) return null;
    return { base: b, quote: q };
  }

  // UTIL: basic detection: is fiat? we'll treat 3-letter typical fiat codes as fiat
  const FIAT_SET = new Set([
    "USD",
    "EUR",
    "GBP",
    "NGN",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "NZD",
    "SEK",
    "SGD",
  ]);
  function detectType(base, quote) {
    // If both fiat => forex
    if (FIAT_SET.has(base) && FIAT_SET.has(quote)) return "forex";
    // If quote is USDT or USD and base is likely crypto -> crypto
    // fallback to crypto
    return "crypto";
  }

  // ---------- COINGECKO COINS MAP ----------
  async function ensureCoinsMap() {
    if (coinsMap) return coinsMap;
    try {
      const raw = await fetch(COINGECKO_COINS_LIST_URL).then((r) => r.json());
      // build map: symbol->id (note: coin symbols can repeat; map first appearance)
      coinsMap = {};
      raw.forEach((c) => {
        if (!coinsMap[c.symbol.toUpperCase()])
          coinsMap[c.symbol.toUpperCase()] = c.id;
      });
      return coinsMap;
    } catch (err) {
      console.warn("CoinGecko coins list fetch failed", err);
      coinsMap = {};
      return coinsMap;
    }
  }

  // ---------- GET CURRENT PRICE ----------
  async function getPrice(alert) {
    // returns numeric price or null on error
    const pair = parsePair(alert.asset);
    if (!pair) return null;

    const base = pair.base;
    const quote = pair.quote;

    const type =
      alert.type && alert.type !== "auto"
        ? alert.type
        : detectType(base, quote);

    if (type === "forex") {
      // exchangerate.host convert
      try {
        const url = `${EXCHANGERATE_CONVERT}?from=${encodeURIComponent(
          base
        )}&to=${encodeURIComponent(quote)}`;
        const resp = await fetch(url).then((r) => r.json());
        if (resp && typeof resp.result === "number") return resp.result;
        return null;
      } catch (err) {
        console.warn("Forex price fetch failed", err);
        return null;
      }
    } else {
      // crypto price via CoinGecko
      try {
        await ensureCoinsMap();
        const baseId = coinsMap[base] || base.toLowerCase(); // fallback to lower-case input
        // normalize quote to 'usd' for 'USDT' or 'USD'
        let vs = quote.toLowerCase();
        if (vs === "usdt") vs = "usd";
        const url = `${COINGECKO_SIMPLE_PRICE}?ids=${encodeURIComponent(
          baseId
        )}&vs_currencies=${encodeURIComponent(vs)}`;
        const resp = await fetch(url).then((r) => r.json());
        if (resp && resp[baseId] && typeof resp[baseId][vs] === "number")
          return resp[baseId][vs];
        // try alternative: if baseId not found, maybe symbol==id
        if (
          resp &&
          resp[base.toLowerCase()] &&
          typeof resp[base.toLowerCase()][vs] === "number"
        ) {
          return resp[base.toLowerCase()][vs];
        }
        return null;
      } catch (err) {
        console.warn("Crypto price fetch failed", err);
        return null;
      }
    }
  }

  // ---------- RENDER ----------
  function renderActiveAlerts() {
    const active = alerts.filter((a) => a.active);
    if (active.length === 0) {
      alertsListEl.innerHTML =
        '<div class="small-muted">No active alerts yet.</div>';
    } else {
      alertsListEl.innerHTML = active
        .map((a) => {
          return `
          <div class="alert-row" data-id="${a.id}">
            <div>
              <div style="font-weight:700">${a.asset}</div>
              <div class="alert-meta">${a.condition.toUpperCase()} ${
            a.price
          } · created ${new Date(a.createdAt).toLocaleString()}</div>
            </div>
            <div class="alert-actions">
              <button data-action="edit" data-id="${a.id}">Edit</button>
              <button data-action="del" data-id="${a.id}">Delete</button>
            </div>
          </div>
        `;
        })
        .join("");
    }
    statAlertsEl.textContent = active.length;
  }

  function renderHistory() {
    const hist = alerts
      .filter((a) => a.triggeredAt || a.deletedAt)
      .sort(
        (x, y) =>
          (y.triggeredAt || y.deletedAt) - (x.triggeredAt || x.deletedAt)
      );
    if (hist.length === 0) {
      alertsHistoryEl.innerHTML =
        '<div class="small-muted">No triggered alerts yet.</div>';
    } else {
      alertsHistoryEl.innerHTML = hist
        .map((h) => {
          const time = h.triggeredAt
            ? new Date(h.triggeredAt).toLocaleString()
            : new Date(h.deletedAt).toLocaleString();
          const why = h.triggeredAt ? "TRIGGERED" : "REMOVED";
          return `
          <div class="history-row">
            <div>
              <div style="font-weight:700">${h.asset}</div>
              <div class="alert-meta">${why} ${h.condition.toUpperCase()} ${
            h.price
          } · ${time}</div>
            </div>
          </div>
        `;
        })
        .join("");
    }
  }

  // toast
  function showToast(msg) {
    const t = document.createElement("div");
    t.className = "ct-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => (t.style.opacity = 1), 50);
    setTimeout(() => {
      t.style.opacity = 0;
      setTimeout(() => t.remove(), 400);
    }, 5000);
  }

  // ---------- CRUD ----------
  function addAlert(alert) {
    alerts.push(alert);
    saveAlerts();
    renderActiveAlerts();
    renderHistory();
  }

  function updateAlert(id, patch) {
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    alerts[idx] = { ...alerts[idx], ...patch };
    saveAlerts();
    renderActiveAlerts();
    renderHistory();
    return true;
  }

  function deleteAlert(id) {
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) return;
    alerts[idx].active = false;
    alerts[idx].deletedAt = Date.now();
    saveAlerts();
    renderActiveAlerts();
    renderHistory();
  }

  // ---------- TRIGGER LOGIC ----------
  async function checkAlert(a) {
    try {
      const current = await getPrice(a);
      if (current === null || typeof current !== "number") return false;
      const target = Number(a.price);
      if (a.condition === "above" && current >= target) return { current };
      if (a.condition === "below" && current <= target) return { current };
      return false;
    } catch (err) {
      console.warn("checkAlert error", err);
      return false;
    }
  }

  async function checkAllAlerts() {
    if (checking) return;
    checking = true;
    const active = alerts.filter((a) => a.active);
    for (const a of active) {
      try {
        const res = await checkAlert(a);
        if (res) {
          // trigger
          a.active = false;
          a.triggeredAt = Date.now();
          a.lastPrice = res.current;
          saveAlerts();
          renderActiveAlerts();
          renderHistory();
          showToast(
            `${a.asset} ${a.condition} ${a.price} — current ${res.current}`
          );
          // increment notification count visually
          try {
            incrementNotifCount();
          } catch (e) {
            /*no-op*/
          }

          // Optionally: store in history (it's in same array because active=false and triggeredAt set)
        }
      } catch (err) {
        console.warn("error checking alert", err);
      }
    }
    checking = false;
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(checkAllAlerts, POLL_INTERVAL_MS);
  }

  // ---------- UI interactions ----------
  alertForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const assetStr = assetInput.value.trim().toUpperCase();
    const condition = conditionSelect.value;
    const price = Number(priceInput.value);
    const type = typeSelect.value; // auto, crypto, forex

    const parsed = parsePair(assetStr);
    if (!parsed) {
      alertFormMsg.textContent =
        "Asset must be in BASE/QUOTE format (e.g. BTC/USD).";
      setTimeout(() => (alertFormMsg.textContent = ""), 3000);
      return;
    }
    if (!price || isNaN(price)) {
      alertFormMsg.textContent = "Enter a valid target price.";
      setTimeout(() => (alertFormMsg.textContent = ""), 3000);
      return;
    }

    // create or update
    const editId = editAlertIdInput.value;
    if (editId) {
      updateAlert(Number(editId), {
        asset: assetStr,
        condition,
        price,
        type: type === "auto" ? "auto" : type,
      });
      alertFormMsg.textContent = "Alert updated";
      setTimeout(() => (alertFormMsg.textContent = ""), 2000);
      editAlertIdInput.value = "";
    } else {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const newAlert = {
        id,
        asset: assetStr,
        condition,
        price,
        type: type === "auto" ? "auto" : type,
        active: true,
        createdAt: Date.now(),
      };
      addAlert(newAlert);
      alertFormMsg.textContent = "Alert saved";
      setTimeout(() => (alertFormMsg.textContent = ""), 2000);
    }

    alertForm.reset();
    // immediate check for the added alert
    setTimeout(() => checkAllAlerts(), 300);
  });

  resetAlertBtn.addEventListener("click", () => {
    alertForm.reset();
    editAlertIdInput.value = "";
    alertFormMsg.textContent = "";
  });

  // delegate click inside alerts list for edit/delete
  alertsListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.getAttribute("data-action"),
      id = Number(btn.getAttribute("data-id"));
    if (act === "del") {
      if (confirm("Delete this alert?")) deleteAlert(id);
    } else if (act === "edit") {
      const a = alerts.find((x) => x.id === id);
      if (!a) return;
      assetInput.value = a.asset;
      conditionSelect.value = a.condition;
      priceInput.value = a.price;
      typeSelect.value = a.type || "auto";
      editAlertIdInput.value = a.id;
      alertFormMsg.textContent = "Editing... save to apply";
    }
  });

  // ---------- notification count helper ----------
  function incrementNotifCount() {
    try {
      const el = document.getElementById("notifCount");
      if (!el) return;
      let n = parseInt(el.textContent) || 0;
      n++;
      el.textContent = n;
      el.style.display = "inline-block";
    } catch (e) {}
  }

  // ---------- init ----------
  function init() {
    loadAlerts();
    renderActiveAlerts();
    renderHistory();
    ensureCoinsMap().catch(() => {
      /*ignore*/
    });
    // check once now and start polling
    checkAllAlerts().finally(() => startPolling());
  }

  // kick off
  init();

  // expose some helpers globally for debugging (optional)
  window.CoTraderAlerts = {
    getAll: () => alerts,
    checkNow: checkAllAlerts,
    stopPolling: () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    },
  };
})();
