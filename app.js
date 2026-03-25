// ── State ──────────────────────────────────────────────
const STORAGE_KEY = "glossarykit-data";
let glossary = [];

// ── Load & Save ────────────────────────────────────────
function loadGlossary() {
  const stored = localStorage.getItem(STORAGE_KEY);
  glossary = stored ? JSON.parse(stored) : [];
}

function saveGlossary() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(glossary));
}

// ── Render ─────────────────────────────────────────────
function renderGlossary(filter = "") {
  const list = document.getElementById("glossary-list");
  const query = filter.toLowerCase();

  const filtered = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(query) ||
      item.definition.toLowerCase().includes(query),
  );

  // Sort A–Z
  filtered.sort((a, b) => a.term.localeCompare(b.term));

  if (filtered.length === 0) {
    list.innerHTML =
      '<p style="color:#64748b">No terms yet. Add one above.</p>';
    return;
  }

  list.innerHTML = filtered
    .map(
      (item) => `
    <div class="term-card">
      <div>
        <div class="term">${escapeHTML(item.term)}</div>
        <div class="def">${escapeHTML(item.definition)}</div>
      </div>
      <div class="card-actions">
        <button onclick="editTerm('${item.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTerm('${item.id}')">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// ── CRUD ───────────────────────────────────────────────
function addTerm() {
  const term = document.getElementById("term-input").value.trim();
  const definition = document.getElementById("definition-input").value.trim();

  if (!term || !definition) {
    alert("Please enter both a term and a definition.");
    return;
  }

  glossary.push({
    id: String(Date.now()),
    term,
    definition,
    createdAt: new Date().toISOString(),
  });

  saveGlossary();
  renderGlossary();

  document.getElementById("term-input").value = "";
  document.getElementById("definition-input").value = "";
  document.getElementById("term-input").focus();
}

function deleteTerm(id) {
  if (!confirm("Delete this term?")) return;
  glossary = glossary.filter((item) => item.id !== id);
  saveGlossary();
  renderGlossary(document.getElementById("search-input").value);
}

function editTerm(id) {
  const item = glossary.find((i) => i.id === id);
  if (!item) return;

  const newTerm = prompt("Edit term:", item.term);
  if (newTerm === null) return;
  const newDef = prompt("Edit definition:", item.definition);
  if (newDef === null) return;

  item.term = newTerm.trim();
  item.definition = newDef.trim();
  saveGlossary();
  renderGlossary(document.getElementById("search-input").value);
}

// ── Export ─────────────────────────────────────────────
function exportJSON() {
  const blob = new Blob([JSON.stringify(glossary, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, "glossary.json");
}

function exportCSV() {
  const header = "Term,Definition,Created At\n";
  const rows = glossary
    .map(
      (item) =>
        `"${item.term.replace(/"/g, '""')}","${item.definition.replace(/"/g, '""')}","${item.createdAt}"`,
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  triggerDownload(blob, "glossary.csv");
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Utility ────────────────────────────────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Event Wiring ───────────────────────────────────────
document.getElementById("add-btn").addEventListener("click", addTerm);
document
  .getElementById("search-input")
  .addEventListener("input", (e) => renderGlossary(e.target.value));
document
  .getElementById("export-json-btn")
  .addEventListener("click", exportJSON);
document.getElementById("export-csv-btn").addEventListener("click", exportCSV);

// Allow Enter key in term input to move to definition
document.getElementById("term-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("definition-input").focus();
});

// ── Init ───────────────────────────────────────────────
loadGlossary();
renderGlossary();
