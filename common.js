/* common.js — dados e cálculos compartilhados entre as páginas do app */

const STORAGE_KEYS = {
  points: 'geo_declividade_points',
  obra: 'geo_declividade_obra',
  logoLeft: 'geo_declividade_logoLeft',
  logoRight: 'geo_declividade_logoRight',
  reports: 'geo_declividade_reports'
};

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    return fallback;
  }
}
function saveJSON(key, value){
  try{
    localStorage.setItem(key, JSON.stringify(value));
  }catch(e){
    console.warn('Não foi possível salvar', key, e);
  }
}

function loadPoints(){
  return loadJSON(STORAGE_KEYS.points, [
    {id:'E1', e:'', n:'', z:'', desc:''},
    {id:'E2', e:'', n:'', z:'', desc:''}
  ]);
}
function savePoints(points){ saveJSON(STORAGE_KEYS.points, points); }

function loadObra(){
  return loadJSON(STORAGE_KEYS.obra, {responsavel:'', obra:'', data:''});
}
function saveObra(obra){ saveJSON(STORAGE_KEYS.obra, obra); }

function loadLogo(side){
  return localStorage.getItem(STORAGE_KEYS[side]) || null;
}
function saveLogo(side, dataUrl){
  if(dataUrl){ localStorage.setItem(STORAGE_KEYS[side], dataUrl); }
  else{ localStorage.removeItem(STORAGE_KEYS[side]); }
}

function loadReports(){
  return loadJSON(STORAGE_KEYS.reports, []);
}
function saveReports(reports){ saveJSON(STORAGE_KEYS.reports, reports); }

function genId(){
  return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function fmt(n, d=3){ return Number(n).toFixed(d); }

/* Cálculo geométrico entre dois pontos de coordenadas (E, N, Z) */
function calcPair(p1, p2){
  const e1=parseFloat(p1.e), n1=parseFloat(p1.n), z1=parseFloat(p1.z);
  const e2=parseFloat(p2.e), n2=parseFloat(p2.n), z2=parseFloat(p2.z);
  if([e1,n1,z1,e2,n2,z2].some(v => isNaN(v))) return null;
  const dE = e2-e1, dN = n2-n1, dZ = z2-z1;
  const distH = Math.sqrt(dE*dE + dN*dN);
  if(distH === 0) return null;
  const distIncl = Math.sqrt(distH*distH + dZ*dZ);
  const pct = (dZ/distH)*100;
  const deg = Math.atan(dZ/distH) * 180 / Math.PI;
  let az = Math.atan2(dE, dN) * 180 / Math.PI; // azimute de p1 para p2 (0-360, referência N)
  if(az < 0) az += 360;
  return {dE,dN,dZ,distH,distIncl,pct,deg,az};
}

/* Conversão declividade (%) <-> proporção de talude 1:N */
function pctToTalude(pct){
  if(!pct || pct === 0 || !isFinite(pct)) return null;
  return 100/Math.abs(pct);
}
function taludeToPct(n){
  if(!n || n === 0 || !isFinite(n)) return null;
  return 100/n;
}
function formatTalude(n){
  if(n === null || n === undefined || !isFinite(n)) return '—';
  return '1:' + n.toFixed(1);
}
