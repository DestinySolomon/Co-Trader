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
        (a) =>
          `<div style="padding:8px 0;border-bottom:1px dashed rgba(255,255,255,0.03)">${a}</div>`
      )
      .join("");
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
