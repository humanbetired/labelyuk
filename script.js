// script.js - pembaruan: auto-trigger dropdown setelah load + counter per-label

let data = [];            // array of row objects (kept in order)
let headers = [];         // original headers
let current = 0;          // current index into data
let colToLabel = "";      // selected column key
let deletedCount = 0;     // number of deletions

// DOM
const csvFile = document.getElementById('csvFile');
const columnSelectContainer = document.getElementById('columnSelectContainer');
const columnSelect = document.getElementById('columnSelect');
const monitor = document.getElementById('monitor');
const totalDataEl = document.getElementById('totalData');
const labeledCountEl = document.getElementById('labeledCount');
const deletedCountEl = document.getElementById('deletedCount');
const remainingDataEl = document.getElementById('remainingData');
const currentIndexEl = document.getElementById('currentIndex');

const positiveCountEl = document.getElementById('positiveCount');
const negativeCountEl = document.getElementById('negativeCount');
const neutralCountEl  = document.getElementById('neutralCount');

const labelArea = document.getElementById('labelArea');
const currentTextEl = document.getElementById('currentText');

const btnPositive = document.getElementById('btnPositive');
const btnNegative = document.getElementById('btnNegative');
const btnNeutral  = document.getElementById('btnNeutral');
const btnDelete   = document.getElementById('btnDelete');
const btnSkip     = document.getElementById('btnSkip');

const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const finishBtn   = document.getElementById('finishBtn');
const downloadBtn = document.getElementById('downloadBtn');
const labelColNameInput = document.getElementById('labelColName');

// ---------- Helper: safe show/hide ----------
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

// ---------- CSV load ----------
csvFile.addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  Papa.parse(f, {
    header: true,
    skipEmptyLines: true,
    complete: (res) => {
      if (!res || !res.meta || !res.meta.fields) {
        alert('Gagal membaca CSV (tidak ada header). Pastikan file CSV valid.');
        return;
      }
      headers = res.meta.fields;
      data = res.data.map(row => {
        // Ensure all headers exist as keys
        const out = {};
        headers.forEach(h => out[h] = row[h] ?? "");
        return out;
      });

      // reset state
      current = 0;
      deletedCount = 0;
      colToLabel = "";

      populateColumnSelect();
      show(columnSelectContainer);
      hide(labelArea);
      hide(monitor);
      hide(downloadBtn);
      updateMonitor();

      // === AUTO-SELECT & TRIGGER: pilih kolom pertama & trigger change event ===
      if (headers.length > 0) {
        columnSelect.value = headers[0];
        // set colToLabel and start (dispatch event triggers same handler as manual change)
        const ev = new Event('change', { bubbles: true });
        columnSelect.dispatchEvent(ev);
      }
    },
    error: (err) => {
      alert('Error parsing CSV: ' + err.message);
    }
  });
});

// ---------- Populate column dropdown ----------
function populateColumnSelect(){
  columnSelect.innerHTML = headers.map(h => `<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`).join('');
  // auto-select first option by default (but actual trigger done after parse)
  if (headers.length>0) {
    columnSelect.value = headers[0];
  }
}

// ---------- When user picks a column ----------
columnSelect.addEventListener('change', () => {
  colToLabel = columnSelect.value;
  current = 0;
  deletedCount = 0;
  // show UI
  if (data.length === 0) return;
  show(labelArea);
  show(monitor);
  hide(downloadBtn);
  renderCurrent();
  updateMonitor();
});

// ---------- Render current row ----------
function renderCurrent(){
  // find next index >= current that is not deleted (we mark deletions by null)
  if (data.length === 0) {
    currentTextEl.textContent = "Data kosong.";
    updateMonitor();
    return;
  }

  // clamp current
  if (current < 0) current = 0;
  if (current >= data.length) current = data.length - 1;

  // skip any deleted slots (we will set deleted rows to null)
  while (current < data.length && data[current] === null) current++;
  if (current >= data.length) {
    // Try moving backwards to find any non-deleted
    let found = -1;
    for (let i = data.length - 1; i >= 0; i--) if (data[i] !== null) { found = i; break; }
    if (found === -1) {
      currentTextEl.textContent = "Tidak ada data tersisa.";
      updateMonitor();
      return;
    }
    current = found;
  }

  // Display text for column
  const row = data[current];
  const txt = (colToLabel && row && Object.prototype.hasOwnProperty.call(row, colToLabel)) ? row[colToLabel] : "";
  currentTextEl.textContent = txt ?? "";
  updateMonitor();
}

// ---------- Actions: label, delete, skip ----------
function labelCurrent(labelValue){
  if (!colToLabel) { alert('Pilih kolom dulu.'); return; }
  if (!data[current]) { // if current is null (deleted) try to move
    next();
    return;
  }
  const labelCol = labelColNameInput.value && labelColNameInput.value.trim() ? labelColNameInput.value.trim() : 'label';
  data[current][ labelCol ] = labelValue;
  next();
}

function deleteCurrent(){
  if (!data[current]) { next(); return; }
  // remove the row from dataset by setting to null so indexes remain stable
  // but first remove any label (not necessary since null row is ignored)
  data[current] = null;
  deletedCount++;
  renderNextAfterDelete();
}

function skipCurrent(){
  // skip = leave label empty and move on (do NOT remove the row)
  next();
}

// ---------- Navigation helpers ----------
function next(){
  // advance to next non-deleted row
  let i = current + 1;
  while (i < data.length && data[i] === null) i++;
  if (i >= data.length) {
    // reached end -> show finished message
    // but keep current as last non-deleted if exists
    let last = -1;
    for (let j = data.length -1; j >=0; j--) if (data[j] !== null) { last = j; break; }
    if (last === -1) {
      currentTextEl.textContent = "Tidak ada data tersisa.";
      updateMonitor();
      return;
    }
    current = last;
    if (isAllDone()) {
      currentTextEl.textContent = "🎉 Semua data terproses (label/deleted/skip). Klik Selesai untuk unduh.";
      updateMonitor();
      return;
    }
    renderCurrent();
    return;
  }
  current = i;
  renderCurrent();
}

function prev(){
  // move to previous non-deleted row
  let i = current - 1;
  while (i >= 0 && data[i] === null) i--;
  if (i < 0) return;
  current = i;
  renderCurrent();
}

function renderNextAfterDelete(){
  // after deletion, try to show the item now at same index (which is next)
  let i = current;
  while (i < data.length && data[i] === null) i++;
  if (i < data.length) {
    current = i;
    renderCurrent();
    return;
  }
  // otherwise move back to closest previous non-deleted
  let prevIdx = -1;
  for (let j = data.length - 1; j >= 0; j--) {
    if (data[j] !== null) { prevIdx = j; break; }
  }
  if (prevIdx === -1) {
    currentTextEl.textContent = "Tidak ada data tersisa.";
    updateMonitor();
    return;
  }
  current = prevIdx;
  renderCurrent();
}

// ---------- Utility: all done? ----------
function isAllDone(){
  const labelCol = labelColNameInput.value || 'label';
  let anyRow = false;
  for (let i=0; i<data.length; i++){
    const r = data[i];
    if (r === null) continue;
    anyRow = true;
    if (!Object.prototype.hasOwnProperty.call(r, labelCol) || r[labelCol] === "") return false;
  }
  return true;
}

// ---------- Monitor update (termasuk per-label counts) ----------
function updateMonitor(){
  const total = data.length;
  const deleted = deletedCount;
  const labelCol = (labelColNameInput.value && labelColNameInput.value.trim()) ? labelColNameInput.value.trim() : 'label';

  let positive = 0, negative = 0, neutral = 0, labeled = 0, remaining = 0;
  for (let i=0;i<data.length;i++){
    const r = data[i];
    if (r === null) continue;
    const v = (Object.prototype.hasOwnProperty.call(r, labelCol) ? (r[labelCol]||"").toString().toLowerCase() : "");
    if (v === 'positive') { positive++; labeled++; }
    else if (v === 'negative') { negative++; labeled++; }
    else if (v === 'neutral')  { neutral++; labeled++; }
    else {
      // if there is some other non-empty label treat as labeled
      if (v !== "") labeled++;
      else remaining++;
    }
  }

  totalDataEl.textContent = total;
  labeledCountEl.textContent = labeled;
  deletedCountEl.textContent = deleted;
  remainingDataEl.textContent = remaining;
  currentIndexEl.textContent = (current < data.length ? (current+1) : 0);

  // per-label UI
  if (positiveCountEl) positiveCountEl.textContent = positive;
  if (negativeCountEl) negativeCountEl.textContent = negative;
  if (neutralCountEl)  neutralCountEl.textContent = neutral;
}

// ---------- Download CSV ----------
function downloadCSV(){
  if (data.length === 0) { alert('Tidak ada data untuk diunduh.'); return; }

  const labelCol = (labelColNameInput.value && labelColNameInput.value.trim()) ? labelColNameInput.value.trim() : 'label';

  // ensure header list includes the label column (append if missing)
  const existingHeaders = Array.from(headers);
  if (!existingHeaders.includes(labelCol)) existingHeaders.push(labelCol);

  // prepare rows for export: exclude deleted (null)
  const exportRows = data
    .filter(r => r !== null)
    .map(r => {
      // ensure all headers exist in the row
      const out = {};
      existingHeaders.forEach(h => {
        out[h] = (r && Object.prototype.hasOwnProperty.call(r, h)) ? r[h] : "";
      });
      return out;
    });

  const csv = Papa.unparse(exportRows, { columns: existingHeaders });
  // trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'labeled_data.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Keyboard shortcuts ----------
window.addEventListener('keydown', (e) => {
  if (!labelArea.classList.contains('hidden')) {
    const k = e.key.toLowerCase();
    if (k === '1') { labelCurrent('positive'); }
    if (k === '2') { labelCurrent('negative'); }
    if (k === '3') { labelCurrent('neutral'); }
    if (k === '4') { deleteCurrent(); }
    if (k === '5') { skipCurrent(); }
    if (k === 'd') { if (!downloadBtn.classList.contains('hidden')) downloadCSV(); }
  }
});

// ---------- Buttons wiring ----------
btnPositive.addEventListener('click', () => labelCurrent('positive'));
btnNegative.addEventListener('click', () => labelCurrent('negative'));
btnNeutral.addEventListener('click',  () => labelCurrent('neutral'));
btnDelete.addEventListener('click',   () => deleteCurrent());
btnSkip.addEventListener('click',     () => skipCurrent());

prevBtn.addEventListener('click', () => { prev(); });
nextBtn.addEventListener('click', () => { next(); });

finishBtn.addEventListener('click', () => {
  updateMonitor();
  show(downloadBtn);
  if (isAllDone()) {
    currentTextEl.textContent = "🎉 Semua data selesai. Klik Download CSV untuk menyimpan hasil.";
  } else {
    currentTextEl.textContent = "Proses belum sepenuhnya selesai — baris tanpa label masih ada (atau klik Download untuk menyimpan sementara).";
  }
});

downloadBtn.addEventListener('click', () => downloadCSV());

// ---------- small util ----------
function escapeHtml(s){
  if (s==null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                   .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}