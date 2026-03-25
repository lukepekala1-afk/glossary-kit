// ── Constants & State ──────────────────────────────────
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
  const query = filter.toLowerCase().trim();

  const filtered = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(query) ||
      item.definition.toLowerCase().includes(query),
  );

  filtered.sort((a, b) => a.term.localeCompare(b.term));

  if (filtered.length === 0) {
    list.innerHTML = `<p class="empty-state">${
      query
        ? `No results for "<strong>${escapeHTML(query)}</strong>"`
        : "No terms yet. Add your first term above."
    }</p>`;
    return;
  }

  list.innerHTML = filtered
    .map(
      (item) => `
    <div class="term-card" data-id="${item.id}">
      <div class="card-content">
        <div class="term">${escapeHTML(item.term)}</div>
        <div class="def">${escapeHTML(item.definition)}</div>
        <div class="meta">Added ${formatDate(item.createdAt)}</div>
      </div>
      <div class="card-actions">
        <button onclick="editTerm('${item.id}')">✏ Edit</button>
        <button class="delete-btn" onclick="deleteTerm('${item.id}')">✕ Delete</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// ── CRUD ───────────────────────────────────────────────
function addTerm() {
  const termInput = document.getElementById("term-input");
  const defInput = document.getElementById("definition-input");

  const term = termInput.value.trim();
  const definition = defInput.value.trim();

  if (!term || !definition) {
    showToast("⚠ Please enter both a term and a definition");
    return;
  }

  // Check for duplicate
  const duplicate = glossary.some(
    (item) => item.term.toLowerCase() === term.toLowerCase(),
  );
  if (duplicate) {
    showToast(`⚠ "${term}" already exists in your glossary`);
    return;
  }

  glossary.push({
    id: String(Date.now()),
    term,
    definition,
    createdAt: new Date().toISOString(),
  });

  saveGlossary();
  renderGlossary(document.getElementById("search-input").value);
  showToast(`✅ "${term}" added`);

  termInput.value = "";
  defInput.value = "";
  termInput.focus();
}

function deleteTerm(id) {
  const item = glossary.find((i) => i.id === id);
  if (!item) return;
  if (!confirm(`Delete "${item.term}"?`)) return;

  glossary = glossary.filter((i) => i.id !== id);
  saveGlossary();
  renderGlossary(document.getElementById("search-input").value);
  showToast(`🗑 "${item.term}" deleted`);
}

function editTerm(id) {
  const item = glossary.find((i) => i.id === id);
  if (!item) return;

  const newTerm = prompt("Edit term:", item.term);
  if (newTerm === null || newTerm.trim() === "") return;

  const newDef = prompt("Edit definition:", item.definition);
  if (newDef === null || newDef.trim() === "") return;

  item.term = newTerm.trim();
  item.definition = newDef.trim();

  saveGlossary();
  renderGlossary(document.getElementById("search-input").value);
  showToast(`✏ "${item.term}" updated`);
}

// ── Export ─────────────────────────────────────────────
function exportJSON() {
  if (glossary.length === 0) {
    showToast("⚠ Nothing to export yet");
    return;
  }
  const blob = new Blob([JSON.stringify(glossary, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, "glossary.json");
  showToast(
    `⬇ Exported ${glossary.length} term${glossary.length !== 1 ? "s" : ""} as JSON`,
  );
}

function exportCSV() {
  if (glossary.length === 0) {
    showToast("⚠ Nothing to export yet");
    return;
  }
  const header = "Term,Definition,Created At\n";
  const rows = glossary
    .map(
      (item) =>
        `"${item.term.replace(/"/g, '""')}","${item.definition.replace(/"/g, '""')}","${item.createdAt}"`,
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  triggerDownload(blob, "glossary.csv");
  showToast(
    `⬇ Exported ${glossary.length} term${glossary.length !== 1 ? "s" : ""} as CSV`,
  );
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import JSON ────────────────────────────────────────
function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".json")) {
    showToast("❌ Please select a .json file");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        showToast("❌ Invalid file — expected an array of terms");
        return;
      }

      const valid = imported.every(
        (item) =>
          typeof item.term === "string" && typeof item.definition === "string",
      );

      if (!valid) {
        showToast(
          '❌ File contains invalid entries — each needs "term" and "definition"',
        );
        return;
      }

      let added = 0;
      let skipped = 0;

      imported.forEach((incoming) => {
        const exists = glossary.some(
          (existing) =>
            existing.term.toLowerCase() === incoming.term.toLowerCase(),
        );

        if (exists) {
          skipped++;
        } else {
          glossary.push({
            id: String(Date.now()) + Math.random().toString(36).slice(2),
            term: incoming.term.trim(),
            definition: incoming.definition.trim(),
            createdAt: incoming.createdAt || new Date().toISOString(),
          });
          added++;
        }
      });

      saveGlossary();
      renderGlossary(document.getElementById("search-input").value);

      const msg =
        skipped > 0
          ? `✅ Imported ${added} term${added !== 1 ? "s" : ""} (${skipped} duplicate${skipped !== 1 ? "s" : ""} skipped)`
          : `✅ Imported ${added} term${added !== 1 ? "s" : ""}`;
      showToast(msg);
    } catch (err) {
      showToast("❌ Could not parse file — is it valid JSON?");
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}

// ── Utilities ──────────────────────────────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
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

document.getElementById("import-input").addEventListener("change", importJSON);

// Enter on term field moves focus to definition
document.getElementById("term-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("definition-input").focus();
});

// Ctrl/Cmd + Enter anywhere submits the form
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") addTerm();
});

// ── Init ───────────────────────────────────────────────
loadGlossary();
renderGlossary();
