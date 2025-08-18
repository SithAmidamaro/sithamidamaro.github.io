
// Common small helpers (not heavily used; most pages use inline handlers)
function normalizeInput(str){
  return str.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
}
function show(id){ const el=document.getElementById(id); if(el) el.style.display='block'; }
function hide(id){ const el=document.getElementById(id); if(el) el.style.display='none'; }
