/* ==================== Navegação por abas ==================== */
const tabButtons = document.querySelectorAll('#tabNav a');
const tabPanels = {
  levantamento: document.getElementById('tab-levantamento'),
  projeto: document.getElementById('tab-projeto'),
  relatorios: document.getElementById('tab-relatorios')
};
const sharedConfig = document.getElementById('sharedConfig');

function switchTab(tab){
  tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  Object.keys(tabPanels).forEach(k => tabPanels[k].classList.toggle('active', k === tab));
  sharedConfig.style.display = (tab === 'relatorios') ? 'none' : '';
  if(tab === 'relatorios') renderReportsList();
}
tabButtons.forEach(b => b.addEventListener('click', e => {
  e.preventDefault();
  switchTab(b.dataset.tab);
}));

/* ==================== Dados da obra (compartilhado) ==================== */
const inpResponsavel = document.getElementById('inpResponsavel');
const inpObra = document.getElementById('inpObra');
const inpData = document.getElementById('inpData');
const tbObra = document.getElementById('tbObra');
const tbResp = document.getElementById('tbResp');
const tbData = document.getElementById('tbData');
const tbObraProj = document.getElementById('tbObraProj');
const tbRespProj = document.getElementById('tbRespProj');
const tbDataProj = document.getElementById('tbDataProj');

const savedObra = loadObra();
inpResponsavel.value = savedObra.responsavel || '';
inpObra.value = savedObra.obra || '';
inpData.value = savedObra.data || new Date().toISOString().slice(0,10);

function syncTitleBlock(){
  const obraTxt = inpObra.value.trim() || '—';
  const respTxt = inpResponsavel.value.trim() || '—';
  let dataTxt = '—';
  if(inpData.value){
    const [y,m,d] = inpData.value.split('-');
    dataTxt = `${d}/${m}/${y}`;
  }
  tbObra.textContent = obraTxt; tbResp.textContent = respTxt; tbData.textContent = dataTxt;
  tbObraProj.textContent = obraTxt; tbRespProj.textContent = respTxt; tbDataProj.textContent = dataTxt;
  saveObra({responsavel: inpResponsavel.value, obra: inpObra.value, data: inpData.value});
}
inpResponsavel.addEventListener('input', syncTitleBlock);
inpObra.addEventListener('input', syncTitleBlock);
inpData.addEventListener('input', syncTitleBlock);
syncTitleBlock();

/* ==================== Logotipos (compartilhado) ==================== */
function setupLogoField(inputId, removeId, previewId, reportBoxIds, storageSide){
  const input = document.getElementById(inputId);
  const removeBtn = document.getElementById(removeId);
  const preview = document.getElementById(previewId);
  const reportBoxes = reportBoxIds.map(id => document.getElementById(id));

  function apply(dataUrl, persist){
    if(dataUrl){
      preview.innerHTML = `<img src="${dataUrl}" alt="logo">`;
      reportBoxes.forEach(box => box.innerHTML = `<img src="${dataUrl}" alt="logo">`);
      removeBtn.style.display = '';
    } else {
      preview.innerHTML = `<span class="placeholder">nenhuma imagem</span>`;
      reportBoxes.forEach(box => box.innerHTML = `<span class="placeholder">logo</span>`);
      removeBtn.style.display = 'none';
    }
    if(persist) saveLogo(storageSide, dataUrl);
  }

  const existing = loadLogo(storageSide);
  if(existing) apply(existing, false);

  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => apply(ev.target.result, true);
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', () => {
    input.value = '';
    apply(null, true);
  });
}
setupLogoField('logoLeftInput', 'logoLeftRemove', 'logoLeftPreview', ['reportLogoLeft','reportLogoLeftProj'], 'logoLeft');
setupLogoField('logoRightInput', 'logoRightRemove', 'logoRightPreview', ['reportLogoRight','reportLogoRightProj'], 'logoRight');

/* ==================== Pontos levantados (compartilhado) ==================== */
let points = loadPoints();

const pointsBody = document.getElementById('pointsBody');
const addBtn = document.getElementById('addPoint');
const selA = document.getElementById('selA');
const selB = document.getElementById('selB');
const selAProj = document.getElementById('selAProj');
const selBProj = document.getElementById('selBProj');

function renderTable(){
  pointsBody.innerHTML = '';
  points.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" data-i="${i}" data-f="id" value="${p.id}"></td>
      <td><input type="number" step="any" data-i="${i}" data-f="e" value="${p.e}" placeholder="—"></td>
      <td><input type="number" step="any" data-i="${i}" data-f="n" value="${p.n}" placeholder="—"></td>
      <td><input type="number" step="any" data-i="${i}" data-f="z" value="${p.z}" placeholder="—"></td>
      <td><input type="text" data-i="${i}" data-f="desc" value="${p.desc}" placeholder="ex.: meio-fio, PV"></td>
      <td class="rm-col">${points.length > 2 ? `<button class="rm-btn" data-i="${i}">✕</button>` : ''}</td>
    `;
    pointsBody.appendChild(tr);
  });

  pointsBody.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', e => {
      const i = +e.target.dataset.i;
      const f = e.target.dataset.f;
      points[i][f] = e.target.value;
      savePoints(points);
      if(f !== 'id' && f !== 'desc'){ recomputePair(); recomputeProj(); }
      if(f === 'id'){ renderSelects(); }
    });
  });
  pointsBody.querySelectorAll('.rm-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = +e.target.dataset.i;
      points.splice(i,1);
      savePoints(points);
      renderTable();
      renderSelects();
      recomputePair();
      recomputeProj();
    });
  });
}

function renderSelects(){
  const prevA = selA.value, prevB = selB.value, prevAP = selAProj.value, prevBP = selBProj.value;
  const opts = points.map((p,i) => `<option value="${i}">${p.id || '(sem nome) #'+(i+1)}</option>`).join('');
  selA.innerHTML = opts; selB.innerHTML = opts;
  selAProj.innerHTML = opts; selBProj.innerHTML = opts;
  if(points.length > 1){
    selA.value = prevA && +prevA < points.length ? prevA : 0;
    selB.value = prevB && +prevB < points.length ? prevB : points.length - 1;
    selAProj.value = prevAP && +prevAP < points.length ? prevAP : 0;
    selBProj.value = prevBP && +prevBP < points.length ? prevBP : points.length - 1;
  }
}

addBtn.addEventListener('click', () => {
  points.push({id:'E'+(points.length+1), e:'', n:'', z:'', desc:''});
  savePoints(points);
  renderTable();
  renderSelects();
  recomputePair();
  recomputeProj();
});

/* ==================== ABA Levantamento — relatório real ==================== */
let entries = [];
let entryCounter = 0;

const pairResult = document.getElementById('pairResult');
const addToReportBtn = document.getElementById('addToReport');
const entriesList = document.getElementById('entriesList');
const reportEmptyMsg = document.getElementById('reportEmptyMsg');
const printBtn = document.getElementById('printBtn');
const saveReportBtn = document.getElementById('saveReportBtn');
const reportTitleEl = document.querySelector('#reportPanel .report-title');
const reportHeaderEl = document.querySelector('#reportPanel .report-header');
const titleBlockEl = document.getElementById('titleBlock');

let currentPairCalc = null;

function recomputePair(){
  const iA = +selA.value, iB = +selB.value;
  const pA = points[iA], pB = points[iB];
  currentPairCalc = null;
  if(!pA || !pB || isNaN(iA) || isNaN(iB)){
    pairResult.className = 'result empty';
    pairResult.innerHTML = 'Selecione dois pontos válidos.';
    return;
  }
  const r = calcPair(pA, pB);
  if(!r){
    pairResult.className = 'result empty';
    pairResult.innerHTML = 'Preencha E, N e Z de ambos os pontos (distância horizontal não pode ser zero).';
    return;
  }
  currentPairCalc = {r, pA:{...pA}, pB:{...pB}};
  const dirLabel = r.pct > 0 ? 'subida' : (r.pct < 0 ? 'descida' : 'nível');
  const talude = formatTalude(pctToTalude(r.pct));
  pairResult.className = 'result';
  pairResult.innerHTML = `
    <div class="headline">${fmt(Math.abs(r.pct),2)}<span class="unit">%</span></div>
    <div class="dir">${dirLabel} de ${pA.id || iA} para ${pB.id || iB}</div>
    <div class="result-row"><span class="label">Ângulo (inclinação)</span><span class="val">${fmt(r.deg,2)}°</span></div>
    <div class="result-row"><span class="label">Proporção do talude</span><span class="val">${talude}</span></div>
    <div class="result-row"><span class="label">Desnível (Δz)</span><span class="val">${fmt(r.dZ,3)} m</span></div>
    <div class="result-row"><span class="label">Distância horizontal</span><span class="val">${fmt(r.distH,3)} m</span></div>
    <div class="result-row"><span class="label">Distância inclinada</span><span class="val">${fmt(r.distIncl,3)} m</span></div>
  `;
}

function addToReport(){
  if(!currentPairCalc) return;
  entryCounter++;
  const {r, pA, pB} = currentPairCalc;
  entries.push({
    key: entryCounter,
    idA: pA.id, idB: pB.id,
    eA: pA.e, nA: pA.n, zA: pA.z, descA: pA.desc,
    eB: pB.e, nB: pB.n, zB: pB.z, descB: pB.desc,
    pct: r.pct, deg: r.deg, dZ: r.dZ, distH: r.distH, distIncl: r.distIncl,
    note: '', photo: null
  });
  renderEntries();
}

function moveEntry(arr, idx, dir, renderFn){
  const newIdx = idx + dir;
  if(newIdx < 0 || newIdx >= arr.length) return;
  const tmp = arr[idx]; arr[idx] = arr[newIdx]; arr[newIdx] = tmp;
  renderFn();
}

function renderEntries(){
  entriesList.innerHTML = '';
  reportEmptyMsg.style.display = entries.length ? 'none' : 'block';

  entries.forEach((en, idx) => {
    const dirLabel = en.pct > 0 ? 'subida' : (en.pct < 0 ? 'descida' : 'nível');
    const descA = en.descA ? ` (${en.descA})` : '';
    const descB = en.descB ? ` (${en.descB})` : '';
    const talude = formatTalude(pctToTalude(en.pct));
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <div class="entry-head">
        <div class="entry-head-left">
          <span class="entry-num">Nº ${String(idx+1).padStart(2,'0')}</span>
          <div class="entry-title" contenteditable="true">${en.idA} → ${en.idB}</div>
        </div>
        <div class="entry-controls no-print">
          <button data-act="up" data-idx="${idx}" title="Mover para cima">↑</button>
          <button data-act="down" data-idx="${idx}" title="Mover para baixo">↓</button>
          <button data-act="del" data-idx="${idx}" title="Remover">✕</button>
        </div>
      </div>
      <div class="entry-body">
        <div class="entry-grid">
          <div class="entry-row full"><span class="label">Coordenadas ${en.idA}${descA}</span><span class="val" contenteditable="true">E ${fmt(+en.eA,3)} / N ${fmt(+en.nA,3)} / Z ${fmt(+en.zA,3)}</span></div>
          <div class="entry-row full"><span class="label">Coordenadas ${en.idB}${descB}</span><span class="val" contenteditable="true">E ${fmt(+en.eB,3)} / N ${fmt(+en.nB,3)} / Z ${fmt(+en.zB,3)}</span></div>
          <div class="entry-row"><span class="label">Declividade</span><span class="val" contenteditable="true">${en.pct>0?'+':''}${fmt(en.pct,2)}%</span></div>
          <div class="entry-row"><span class="label">Proporção do talude</span><span class="val" contenteditable="true">${talude}</span></div>
          <div class="entry-row"><span class="label">Sentido</span><span class="val" contenteditable="true">${dirLabel}</span></div>
          <div class="entry-row"><span class="label">Inclinação</span><span class="val" contenteditable="true">${fmt(en.deg,2)}°</span></div>
          <div class="entry-row"><span class="label">Desnível (Δz)</span><span class="val" contenteditable="true">${fmt(en.dZ,3)} m</span></div>
          <div class="entry-row"><span class="label">Dist. horizontal</span><span class="val" contenteditable="true">${fmt(en.distH,3)} m</span></div>
          <div class="entry-row full"><span class="label">Distância inclinada</span><span class="val" contenteditable="true">${fmt(en.distIncl,3)} m</span></div>
        </div>
        <div class="entry-extra">
          <div class="entry-note-wrap">
            <div class="entry-note-label">Observações</div>
            <div class="entry-note" contenteditable="true">${en.note || ''}</div>
          </div>
          <div class="photo-wrap">
            <div class="photo-label">Foto (9 × 6 cm)</div>
            <div class="photo-box" data-idx="${idx}">
              ${en.photo ? `<img src="${en.photo}" alt="Foto do trecho">` : `<span class="placeholder">Nenhuma foto</span>`}
            </div>
            <div class="photo-controls no-print">
              <label class="btn">Câmera
                <input type="file" accept="image/*" capture="environment" data-idx="${idx}" data-mode="camera">
              </label>
              <label class="btn">Arquivo
                <input type="file" accept="image/*" data-idx="${idx}" data-mode="file">
              </label>
              ${en.photo ? `<button data-act="rmphoto" data-idx="${idx}" type="button">Remover foto</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    entriesList.appendChild(div);
  });

  entriesList.querySelectorAll('button[data-act]').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = +e.target.dataset.idx;
      const act = e.target.dataset.act;
      if(act === 'up') moveEntry(entries, idx, -1, renderEntries);
      else if(act === 'down') moveEntry(entries, idx, 1, renderEntries);
      else if(act === 'del'){ entries.splice(idx,1); renderEntries(); }
      else if(act === 'rmphoto'){ entries[idx].photo = null; renderEntries(); }
    });
  });
  entriesList.querySelectorAll('input[type=file]').forEach(inp => {
    inp.addEventListener('change', e => {
      const idx = +e.target.dataset.idx;
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ev => { entries[idx].photo = ev.target.result; renderEntries(); };
      reader.readAsDataURL(file);
    });
  });
  entriesList.querySelectorAll('.entry-note').forEach((el, i) => {
    el.addEventListener('input', () => { entries[i].note = el.innerHTML; });
  });
}

function saveReportGeneric(type, titleEl, headerEl, listEl, tBlockEl, btn){
  const reports = loadReports();
  reports.push({
    id: genId(),
    type,
    createdAt: new Date().toISOString(),
    titleText: titleEl.textContent.trim() || (type === 'projeto' ? 'Relatório de Declividade Projetada' : 'Relatório de Declividades'),
    obra: (type === 'projeto' ? tbObraProj : tbObra).textContent.trim(),
    responsavel: (type === 'projeto' ? tbRespProj : tbResp).textContent.trim(),
    dataTexto: (type === 'projeto' ? tbDataProj : tbData).textContent.trim(),
    itemCount: (type === 'projeto' ? entriesProj : entries).length,
    headerHTML: headerEl.innerHTML,
    entriesHTML: listEl.innerHTML,
    titleBlockHTML: tBlockEl.innerHTML
  });
  saveReports(reports);
  const original = btn.textContent;
  btn.textContent = 'Relatório salvo ✓';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1800);
}

selA.addEventListener('change', recomputePair);
selB.addEventListener('change', recomputePair);
addToReportBtn.addEventListener('click', addToReport);
printBtn.addEventListener('click', () => window.print());
saveReportBtn.addEventListener('click', () => saveReportGeneric('levantamento', reportTitleEl, reportHeaderEl, entriesList, titleBlockEl, saveReportBtn));

/* ==================== ABA Projeto de Execução ==================== */
let entriesProj = [];
let entryCounterProj = 0;

const currentResult = document.getElementById('currentResult');
const projResult = document.getElementById('projResult');
const modePct = document.getElementById('modePct');
const modeTalude = document.getElementById('modeTalude');
const pctField = document.getElementById('pctField');
const taludeField = document.getElementById('taludeField');
const inpTargetPct = document.getElementById('inpTargetPct');
const inpTargetTalude = document.getElementById('inpTargetTalude');
const addToReportBtnProj = document.getElementById('addToReportProj');
const entriesListProj = document.getElementById('entriesListProj');
const reportEmptyMsgProj = document.getElementById('reportEmptyMsgProj');
const printBtnProj = document.getElementById('printBtnProj');
const saveReportBtnProj = document.getElementById('saveReportBtnProj');
const reportTitleElProj = document.querySelector('#reportPanelProj .report-title');
const reportHeaderElProj = document.querySelector('#reportPanelProj .report-header');
const titleBlockElProj = document.getElementById('titleBlockProj');

let currentBase = null;
let currentProj = null;

function setMode(mode){
  if(mode === 'talude'){ pctField.style.display = 'none'; taludeField.style.display = ''; }
  else { pctField.style.display = ''; taludeField.style.display = 'none'; }
  recomputeProj();
}
modePct.addEventListener('change', () => { if(modePct.checked) setMode('pct'); });
modeTalude.addEventListener('change', () => { if(modeTalude.checked) setMode('talude'); });

function getTargetPct(){
  if(modeTalude.checked){
    const n = parseFloat(inpTargetTalude.value);
    if(isNaN(n) || n === 0) return null;
    return taludeToPct(n);
  }
  const v = parseFloat(inpTargetPct.value);
  if(isNaN(v) || v === 0) return null;
  return v;
}

function recomputeProj(){
  const iA = +selAProj.value, iB = +selBProj.value;
  const pA = points[iA], pB = points[iB];
  currentBase = null; currentProj = null;

  if(!pA || !pB || isNaN(iA) || isNaN(iB)){
    currentResult.className = 'result empty';
    currentResult.innerHTML = 'Selecione dois pontos válidos.';
    projResult.innerHTML = '';
    return;
  }
  const base = calcPair(pA, pB);
  if(!base){
    currentResult.className = 'result empty';
    currentResult.innerHTML = 'Preencha E, N e Z de ambos os pontos (distância horizontal não pode ser zero).';
    projResult.innerHTML = '';
    return;
  }
  currentBase = {base, pA:{...pA}, pB:{...pB}};
  const dirLabel = base.pct > 0 ? 'subida' : (base.pct < 0 ? 'descida' : 'nível');
  const taludeAtual = formatTalude(pctToTalude(base.pct));
  currentResult.className = 'result';
  currentResult.innerHTML = `
    <div class="headline">${fmt(Math.abs(base.pct),2)}<span class="unit">%</span></div>
    <div class="dir">declividade atual — ${dirLabel} de ${pA.id || iA} para ${pB.id || iB}</div>
    <div class="result-row"><span class="label">Proporção do talude atual</span><span class="val">${taludeAtual}</span></div>
    <div class="result-row"><span class="label">Desnível (Δz)</span><span class="val">${fmt(base.dZ,3)} m</span></div>
    <div class="result-row"><span class="label">Distância horizontal atual</span><span class="val">${fmt(base.distH,3)} m</span></div>
    <div class="result-row"><span class="label">Distância inclinada atual</span><span class="val">${fmt(base.distIncl,3)} m</span></div>
  `;

  if(base.dZ === 0){
    projResult.innerHTML = `<div class="result empty">Desnível nulo entre os pontos — não é possível projetar uma declividade a partir de um trecho plano.</div>`;
    return;
  }
  const targetPct = getTargetPct();
  if(targetPct === null){
    projResult.innerHTML = `<div class="result empty">Informe a declividade desejada (%) ou a proporção do talude para calcular o ajuste necessário.</div>`;
    return;
  }

  const distNecessaria = Math.abs(base.dZ) / (Math.abs(targetPct)/100);
  const diff = distNecessaria - base.distH;
  const azRad = base.az * Math.PI/180;
  const eProj = parseFloat(pA.e) + distNecessaria*Math.sin(azRad);
  const nProj = parseFloat(pA.n) + distNecessaria*Math.cos(azRad);
  const zProj = parseFloat(pB.z);
  const taludeSolicitado = formatTalude(pctToTalude(targetPct));
  const signedTargetPct = (base.dZ < 0 ? -1 : 1) * Math.abs(targetPct);

  currentProj = {targetPct: signedTargetPct, distNecessaria, diff, eProj, nProj, zProj, taludeSolicitado};

  const diffLabel = diff > 0.0005 ? 'aumentar' : (diff < -0.0005 ? 'reduzir' : 'manter');
  const diffText = diffLabel === 'manter' ? 'a distância atual já atende à declividade solicitada' : `é preciso ${diffLabel} a distância horizontal em`;

  projResult.innerHTML = `
    <div class="result">
      <div class="result-row"><span class="label">Declividade solicitada</span><span class="val">${signedTargetPct>0?'+':''}${fmt(signedTargetPct,2)}%</span></div>
      <div class="result-row"><span class="label">Proporção do talude solicitada</span><span class="val">${taludeSolicitado}</span></div>
      <div class="result-row"><span class="label">Distância horizontal necessária</span><span class="val">${fmt(distNecessaria,3)} m</span></div>
    </div>
    <div class="diff-box">
      <div class="diff-label">${diffText}</div>
      <div class="diff-value">${diffLabel === 'manter' ? '—' : fmt(Math.abs(diff),3) + ' m'}</div>
      <div class="diff-sub">distância atual: ${fmt(base.distH,3)} m → distância necessária: ${fmt(distNecessaria,3)} m</div>
    </div>
    <div class="result">
      <div class="result-row"><span class="label">Coordenadas atuais de ${pB.id}</span><span class="val">E ${fmt(+pB.e,3)} / N ${fmt(+pB.n,3)} / Z ${fmt(+pB.z,3)}</span></div>
      <div class="result-row"><span class="label">Coordenadas projetadas de ${pB.id}</span><span class="val">E ${fmt(eProj,3)} / N ${fmt(nProj,3)} / Z ${fmt(zProj,3)}</span></div>
      <div class="result-row"><span class="label">Azimute usado (De ${pA.id} para ${pB.id})</span><span class="val">${fmt(base.az,2)}°</span></div>
    </div>
  `;
}

function addToReportProj(){
  if(!currentBase || !currentProj) return;
  entryCounterProj++;
  const {base, pA, pB} = currentBase;
  const {targetPct, distNecessaria, diff, eProj, nProj, zProj, taludeSolicitado} = currentProj;
  entriesProj.push({
    key: entryCounterProj,
    idA: pA.id, idB: pB.id,
    eA: pA.e, nA: pA.n, zA: pA.z, descA: pA.desc,
    eB: pB.e, nB: pB.n, zB: pB.z, descB: pB.desc,
    pctAtual: base.pct, distHAtual: base.distH, dZ: base.dZ,
    targetPct, taludeSolicitado, distNecessaria, diff,
    eProj, nProj, zProj,
    note: '', photo: null
  });
  renderEntriesProj();
}

function renderEntriesProj(){
  entriesListProj.innerHTML = '';
  reportEmptyMsgProj.style.display = entriesProj.length ? 'none' : 'block';

  entriesProj.forEach((en, idx) => {
    const descA = en.descA ? ` (${en.descA})` : '';
    const descB = en.descB ? ` (${en.descB})` : '';
    const diffLabel = en.diff > 0.0005 ? 'aumentar' : (en.diff < -0.0005 ? 'reduzir' : 'manter');
    const diffText = diffLabel === 'manter' ? 'manter distância atual' : `${diffLabel} ${fmt(Math.abs(en.diff),3)} m`;
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <div class="entry-head">
        <div class="entry-head-left">
          <span class="entry-num">Nº ${String(idx+1).padStart(2,'0')}</span>
          <div class="entry-title" contenteditable="true">${en.idA} → ${en.idB} (projeto)</div>
        </div>
        <div class="entry-controls no-print">
          <button data-act="up" data-idx="${idx}" title="Mover para cima">↑</button>
          <button data-act="down" data-idx="${idx}" title="Mover para baixo">↓</button>
          <button data-act="del" data-idx="${idx}" title="Remover">✕</button>
        </div>
      </div>
      <div class="entry-body">
        <div class="entry-grid">
          <div class="entry-row full"><span class="label">Coordenadas ${en.idA} (referência)${descA}</span><span class="val" contenteditable="true">E ${fmt(+en.eA,3)} / N ${fmt(+en.nA,3)} / Z ${fmt(+en.zA,3)}</span></div>
          <div class="entry-row full"><span class="label">Coordenadas ${en.idB} (atual)${descB}</span><span class="val" contenteditable="true">E ${fmt(+en.eB,3)} / N ${fmt(+en.nB,3)} / Z ${fmt(+en.zB,3)}</span></div>
          <div class="entry-row"><span class="label">Declividade atual</span><span class="val" contenteditable="true">${en.pctAtual>0?'+':''}${fmt(en.pctAtual,2)}%</span></div>
          <div class="entry-row"><span class="label">Declividade solicitada</span><span class="val" contenteditable="true">${en.targetPct>0?'+':''}${fmt(en.targetPct,2)}%</span></div>
          <div class="entry-row"><span class="label">Proporção do talude solicitada</span><span class="val" contenteditable="true">${en.taludeSolicitado}</span></div>
          <div class="entry-row"><span class="label">Desnível (Δz)</span><span class="val" contenteditable="true">${fmt(en.dZ,3)} m</span></div>
          <div class="entry-row"><span class="label">Distância horizontal atual</span><span class="val" contenteditable="true">${fmt(en.distHAtual,3)} m</span></div>
          <div class="entry-row"><span class="label">Distância horizontal necessária</span><span class="val" contenteditable="true">${fmt(en.distNecessaria,3)} m</span></div>
          <div class="entry-row full"><span class="label">Ajuste necessário</span><span class="val" contenteditable="true">${diffText}</span></div>
          <div class="entry-row full"><span class="label">Coordenadas projetadas de ${en.idB}</span><span class="val" contenteditable="true">E ${fmt(en.eProj,3)} / N ${fmt(en.nProj,3)} / Z ${fmt(en.zProj,3)}</span></div>
        </div>
        <div class="entry-extra">
          <div class="entry-note-wrap">
            <div class="entry-note-label">Observações</div>
            <div class="entry-note" contenteditable="true">${en.note || ''}</div>
          </div>
          <div class="photo-wrap">
            <div class="photo-label">Foto (9 × 6 cm)</div>
            <div class="photo-box" data-idx="${idx}">
              ${en.photo ? `<img src="${en.photo}" alt="Foto do trecho">` : `<span class="placeholder">Nenhuma foto</span>`}
            </div>
            <div class="photo-controls no-print">
              <label class="btn">Câmera
                <input type="file" accept="image/*" capture="environment" data-idx="${idx}" data-mode="camera">
              </label>
              <label class="btn">Arquivo
                <input type="file" accept="image/*" data-idx="${idx}" data-mode="file">
              </label>
              ${en.photo ? `<button data-act="rmphoto" data-idx="${idx}" type="button">Remover foto</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    entriesListProj.appendChild(div);
  });

  entriesListProj.querySelectorAll('button[data-act]').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = +e.target.dataset.idx;
      const act = e.target.dataset.act;
      if(act === 'up') moveEntry(entriesProj, idx, -1, renderEntriesProj);
      else if(act === 'down') moveEntry(entriesProj, idx, 1, renderEntriesProj);
      else if(act === 'del'){ entriesProj.splice(idx,1); renderEntriesProj(); }
      else if(act === 'rmphoto'){ entriesProj[idx].photo = null; renderEntriesProj(); }
    });
  });
  entriesListProj.querySelectorAll('input[type=file]').forEach(inp => {
    inp.addEventListener('change', e => {
      const idx = +e.target.dataset.idx;
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ev => { entriesProj[idx].photo = ev.target.result; renderEntriesProj(); };
      reader.readAsDataURL(file);
    });
  });
  entriesListProj.querySelectorAll('.entry-note').forEach((el, i) => {
    el.addEventListener('input', () => { entriesProj[i].note = el.innerHTML; });
  });
}

selAProj.addEventListener('change', recomputeProj);
selBProj.addEventListener('change', recomputeProj);
inpTargetPct.addEventListener('input', recomputeProj);
inpTargetTalude.addEventListener('input', recomputeProj);
addToReportBtnProj.addEventListener('click', addToReportProj);
printBtnProj.addEventListener('click', () => window.print());
saveReportBtnProj.addEventListener('click', () => saveReportGeneric('projeto', reportTitleElProj, reportHeaderElProj, entriesListProj, titleBlockElProj, saveReportBtnProj));

/* ==================== ABA Relatórios Salvos ==================== */
const reportsList = document.getElementById('reportsList');
const listEmptyMsg = document.getElementById('listEmptyMsg');
const viewerPanel = document.getElementById('viewerPanel');
const viewerHeader = document.getElementById('viewerHeader');
const viewerEntries = document.getElementById('viewerEntries');
const viewerTitleBlock = document.getElementById('viewerTitleBlock');
const viewerPrintBtn = document.getElementById('viewerPrintBtn');

const typeLabels = { levantamento: 'Levantamento', projeto: 'Projeto de execução' };

function formatDateTime(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  }catch(e){ return iso; }
}

function renderReportsList(){
  const reports = loadReports().sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  reportsList.innerHTML = '';
  listEmptyMsg.style.display = reports.length ? 'none' : 'block';

  reports.forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'report-list-item';
    div.innerHTML = `
      <div class="rli-info">
        <div class="rli-title"><span class="badge">Nº ${String(idx+1).padStart(2,'0')} · ${typeLabels[r.type] || r.type}</span>${r.titleText}</div>
        <div class="rli-meta">Obra/Local: ${r.obra || '—'} · Responsável: ${r.responsavel || '—'} · ${r.itemCount} item(ns) · criado em ${formatDateTime(r.createdAt)}</div>
      </div>
      <div class="rli-actions">
        <button data-act="view" data-id="${r.id}">Visualizar</button>
        <button data-act="del" data-id="${r.id}" class="danger">Excluir</button>
      </div>
    `;
    reportsList.appendChild(div);
  });

  reportsList.querySelectorAll('button[data-act]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      const act = e.target.dataset.act;
      if(act === 'view') openReport(id);
      else if(act === 'del') deleteReport(id);
    });
  });
}

function openReport(id){
  const reports = loadReports();
  const r = reports.find(x => x.id === id);
  if(!r) return;
  viewerHeader.innerHTML = r.headerHTML;
  viewerEntries.innerHTML = r.entriesHTML;
  viewerTitleBlock.innerHTML = r.titleBlockHTML;
  viewerPanel.style.display = '';
  viewerPanel.scrollIntoView({behavior:'smooth', block:'start'});
}

function deleteReport(id){
  let reports = loadReports();
  reports = reports.filter(x => x.id !== id);
  saveReports(reports);
  renderReportsList();
  viewerPanel.style.display = 'none';
  viewerHeader.innerHTML = ''; viewerEntries.innerHTML = ''; viewerTitleBlock.innerHTML = '';
}

viewerPrintBtn.addEventListener('click', () => window.print());

/* ==================== Inicialização ==================== */
renderTable();
renderSelects();
recomputePair();
recomputeProj();
renderEntries();
renderEntriesProj();
