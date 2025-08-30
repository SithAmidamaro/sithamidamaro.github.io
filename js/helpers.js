// Common helpers
function normalizeInput(str){
  try{ return str.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim(); }
  catch(e){ return String(str||'').toLowerCase().trim(); }
}
function show(id){ const el=document.getElementById(id); if(el) el.style.display='block'; }
function hide(id){ const el=document.getElementById(id); if(el) el.style.display='none'; }

// Globální zvuk na kliknutí tlačítka a automatický scroll dolů
// Vše až po načtení DOM

document.addEventListener('DOMContentLoaded', function() {
  // Přidej audio element, pokud neexistuje
  if (!document.getElementById('btn-audio')) {
    var audio = document.createElement('audio');
    audio.id = 'btn-audio';
    audio.src = 'audio/select_button.mp3';
    audio.style.display = 'none';
    document.body.appendChild(audio);
  }
  var btnAudio = document.getElementById('btn-audio');
  document.body.addEventListener('click', function(e) {
    if (e.target.matches('button, .btn, .continue-btn')) {
      try { btnAudio.currentTime = 0; btnAudio.play(); } catch(e) {}
      setTimeout(function() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 120);
      // Rozsvícení obrázku alchymisty
      var avatar = document.querySelector('.avatar');
      if (avatar) {
        avatar.classList.add('glow');
        setTimeout(function(){ avatar.classList.remove('glow'); }, 350);
      }
    }
  }, true);
});
