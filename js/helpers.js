// Common helpers
function normalizeInput(str){
  try{ return str.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim(); }
  catch(e){ return String(str||'').toLowerCase().trim(); }
}
function show(id){ const el=document.getElementById(id); if(el) el.style.display='block'; }
function hide(id){ const el=document.getElementById(id); if(el) el.style.display='none'; }
