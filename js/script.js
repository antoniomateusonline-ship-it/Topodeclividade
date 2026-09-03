let points = [
  {id:'E1', e:'', n:'', z:'', desc:''},
  {id:'E2', e:'', n:'', z:'', desc:''}
];
let entries = [];
let entryCounter = 0;

const pointsBody = document.getElementById('pointsBody');
const addBtn = document.getElementById('addPoint');
const selA = document.getElementById('selA');
const selB = document.getElementById('selB');
const pairResult = document.getElementById('pairResult');
const addToReportBtn = document.getElementById('addToReport');
const entriesList = document.getElementById('entriesList');
const reportEmptyMsg = document.getElementById('reportEmptyMsg');
const printBtn = document.getElementById('printBtn');

const inpResponsavel = document.getElementById('inpResponsavel');
const inpObra = document.getElementById('inpObra');
const inpData = document.getElementById('inpData');
const tbObra = document.getElementById('tbObra');
const tbResp = document.getElementById('tbResp');
const tbData = document.getElementById('tbData');

const todayISO = new Date().toISOString().slice(0,10);
inpData.value = todayISO;
tbData.textContent = new Date().toLocaleDateString('pt-BR');

function syncTitleBlock(){
  tbObra.textContent = inpObra.value.trim() || '—';
  tbResp.textContent = inpResponsavel.value.trim() || '—';
  if(inpData.value){
    const [y,m,d] = inpData.value.split('-');
    tbData.textContent = `${d}/${m}/${y}`;
  } else {
    tbData.textContent = '—';
  }
}
inpResponsavel.addEventListener('input', syncTitleBlock);
inpObra.addEventListener('input', syncTitleBlock);
inpData.addEventListener('input', syncTitleBlock);
syncTitleBlock();

function setupLogoField(inputId, removeId, previewId, reportBoxId){
  const input = document.getElementById(inputId);
  const removeBtn = document.getElementById(removeId);
  const preview = document.getElementById(previewId);
  const reportBox = document.getElementById(reportBoxId);

  function apply(dataUrl){
    if(dataUrl){
      preview.innerHTML = `<img src="${dataUrl}" alt="logo">`;
      reportBox.innerHTML = `<img src="${dataUrl}" alt="logo">`;
      removeBtn.style.display = '';
    } else {
      preview.innerHTML = `<span class="placeholder">nenhuma imagem</span>`;
      reportBox.innerHTML = `<span class="placeholder">logo</span>`;
      removeBtn.style.display = 'none';
    }
  }

  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => apply(ev.target.result);
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', () => {
    input.value = '';
    apply(null);
  });
}

setupLogoField('logoLeftInput', 'logoLeftRemove', 'logoLeftPreview', 'reportLogoLeft');
setupLogoField('logoRightInput', 'logoRightRemove', 'logoRightPreview', 'reportLogoRight');

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
      if(f !== 'id' && f !== 'desc'){ recomputePair(); }
      if(f === 'id'){ renderSelects(); }
    });
  });
  pointsBody.querySelectorAll('.rm-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = +e.target.dataset.i;
      points.splice(i,1);
      renderTable();
      renderSelects();
      recomputePair();
    });
  });
}

function renderSelects(){
  const prevA = selA.value, prevB = selB.value;
  const opts = points.map((p,i) => `<option value="${i}">${p.id || '(sem nome) #'+(i+1)}</option>`).join('');
  selA.innerHTML = opts;
  selB.innerHTML = opts;
  if(points.length > 1){
    selA.value = prevA && +prevA < points.length ? prevA : 0;
    selB.value = prevB && +prevB < points.length ? prevB : points.length - 1;
  }
}

function calc(p1, p2){
  const e1=parseFloat(p1.e), n1=parseFloat(p1.n), z1=parseFloat(p1.z);
  const e2=parseFloat(p2.e), n2=parseFloat(p2.n), z2=parseFloat(p2.z);
  if([e1,n1,z1,e2,n2,z2].some(v => isNaN(v))) return null;
  const dE = e2-e1, dN = n2-n1, dZ = z2-z1;
  const distH = Math.sqrt(dE*dE + dN*dN);
  if(distH === 0) return null;
  const distIncl = Math.sqrt(distH*distH + dZ*dZ);
  const pct = (dZ/distH)*100;
  const deg = Math.atan(dZ/distH) * 180 / Math.PI;
  return {dE,dN,dZ,distH,distIncl,pct,deg};
}

function fmt(n, d=3){ return n.toFixed(d); }

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
  const r = calc(pA, pB);
  if(!r){
    pairResult.className = 'result empty';
    pairResult.innerHTML = 'Preencha E, N e Z de ambos os pontos (distância horizontal não pode ser zero).';
    return;
  }
  currentPairCalc = {r, pA:{...pA}, pB:{...pB}};
  const dirLabel = r.pct > 0 ? 'subida' : (r.pct < 0 ? 'descida' : 'nível');
  pairResult.className = 'result';
  pairResult.innerHTML = `
    <div class="headline">${fmt(Math.abs(r.pct),2)}<span class="unit">%</span></div>
    <div class="dir">${dirLabel} de ${pA.id || iA} para ${pB.id || iB}</div>
    <div class="result-row"><span class="label">Ângulo (inclinação)</span><span class="val">${fmt(r.deg,2)}°</span></div>
    <div class="result-row"><span class="label">Desnível (Δz)</span><span class="val">${fmt(r.dZ,3)} m</span></div>
    <div class="result-row"><span class="label">Distância horizontal</span><span class="val">${fmt(r.distH,3)} m</span></div>
    <div class="result-row"><span class="label">Distância horizontal inclinada</span><span class="val">${fmt(r.distIncl,3)} m</span></div>
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
    note: '',
    photo: null
  });
  renderEntries();
}

function moveEntry(idx, dir){
  const newIdx = idx + dir;
  if(newIdx < 0 || newIdx >= entries.length) return;
  const tmp = entries[idx];
  entries[idx] = entries[newIdx];
  entries[newIdx] = tmp;
  renderEntries();
}

function removeEntry(idx){
  entries.splice(idx,1);
  renderEntries();
}

function renderEntries(){
  entriesList.innerHTML = '';
  reportEmptyMsg.style.display = entries.length ? 'none' : 'block';

  entries.forEach((en, idx) => {
    const dirLabel = en.pct > 0 ? 'subida' : (en.pct < 0 ? 'descida' : 'nível');
    const descA = en.descA ? ` (${en.descA})` : '';
    const descB = en.descB ? ` (${en.descB})` : '';
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
          <div class="entry-row"><span class="label">Sentido</span><span class="val" contenteditable="true">${dirLabel}</span></div>
          <div class="entry-row"><span class="label">Inclinação</span><span class="val" contenteditable="true">${fmt(en.deg,2)}°</span></div>
          <div class="entry-row"><span class="label">Desnível (Δz)</span><span class="val" contenteditable="true">${fmt(en.dZ,3)} m</span></div>
          <div class="entry-row"><span class="label">Dist. horizontal</span><span class="val" contenteditable="true">${fmt(en.distH,3)} m</span></div>
          <div class="entry-row"><span class="label">Dist. horiz. inclinada</span><span class="val" contenteditable="true">${fmt(en.distIncl,3)} m</span></div>
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
      if(act === 'up') moveEntry(idx, -1);
      else if(act === 'down') moveEntry(idx, 1);
      else if(act === 'del') removeEntry(idx);
      else if(act === 'rmphoto'){ entries[idx].photo = null; renderEntries(); }
    });
  });

  entriesList.querySelectorAll('input[type=file]').forEach(inp => {
    inp.addEventListener('change', e => {
      const idx = +e.target.dataset.idx;
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        entries[idx].photo = ev.target.result;
        renderEntries();
      };
      reader.readAsDataURL(file);
    });
  });

  entriesList.querySelectorAll('.entry-note').forEach((el, i) => {
    el.addEventListener('input', () => { entries[i].note = el.innerHTML; });
  });
}

addBtn.addEventListener('click', () => {
  points.push({id:'E'+(points.length+1), e:'', n:'', z:'', desc:''});
  renderTable();
  renderSelects();
  recomputePair();
});

selA.addEventListener('change', recomputePair);
selB.addEventListener('change', recomputePair);
addToReportBtn.addEventListener('click', addToReport);
printBtn.addEventListener('click', () => window.print());

renderTable();
renderSelects();
recomputePair();
renderEntries();
