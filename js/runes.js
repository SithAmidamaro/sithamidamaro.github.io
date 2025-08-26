(function(){
  // Templáty vět – rozšířeno o varianty podle zvolené otázky
  const TEMPL = {
    default: {
      start:   ["{m}", "Na úsvitu: {m}", "První krok: {m}", "Začátek napovídá: {m}"],
      obstacle:["Ale {m}", "Cestou zjistíš: {m}", "Překážka: {m}", "Pozor: {m}"],
      result:  ["Nakonec {m}", "Závěr: {m}", "A výsledek? {m}", "Nakonec se ukáže, že {m}"]
    },
    today: { // „Co dnes potřebuji vědět?“
      start:   ["{m}", "Dnešní ráno: {m}", "Na začátku dne: {m}", "Dnes platí: {m}"],
      obstacle:["Dnes tě čeká výzva: {m}", "Během dne: {m}", "Dej si pozor: {m}", "Dnešní stín: {m}"],
      result:  ["Do večera {m}", "Nakonec dnešek přinese, že {m}", "Výsledek dne: {m}", "Dnes se ukáže: {m}"]
    },
    fight: { // „Jak dopadne boj?“
      start:   ["{m}", "Na úsvitu boje: {m}", "Bitva započne: {m}", "První střet: {m}"],
      obstacle:["Nepřítel klade odpor: {m}", "Uprostřed boje: {m}", "Zkouška síly: {m}", "Vřava odhalí: {m}"],
      result:  ["Vítězství: {m}", "Výsledek bitvy: {m}", "Nakonec boj ukáže, že {m}", "Korouhev spadne tam, kde {m}"]
    },
    future: { // „Co přinese budoucnost?“
      start:   ["{m}", "Z počátku: {m}", "Na počátku cesty: {m}", "První znamení říká: {m}"],
      obstacle:["Osud praví: {m}", "Na cestě osudu: {m}", "Je předpovězeno: {m}", "Mezitím tě prověří: {m}"],
      result:  ["Osud nakonec odhalí, že {m}", "Budoucnost přinese: {m}", "Nakonec se zjeví, že {m}", "Až se kruh uzavře, {m}"]
    }
  };

  // Rozšířené synergie – jemné override vyprávění
  const RULES = [
    { when: { start: 'algiz', obstacle: 'hagalaz' }, override: { obstacle: 'Bouře prověří pevnost štítu.' } },
    { when: { result: 'sowilo', obstacle: 'isa' }, override: { result: 'Slunce roztaví i nejtužší led.' } },
    { when: { start: 'fehu', result: 'wunjo' }, override: { result: 'Radost má větší cenu než zlato.' } },
    { when: { start: 'berkana', obstacle: 'isa' }, override: { obstacle: 'Růst si žádá trpělivost – led neuspěcháš.' } },
    { when: { start: 'raido', obstacle: 'nauthiz' }, override: { obstacle: 'Cesta se zužuje – odlehči náklad a pokračuj.' } },
    { when: { start: 'hagalaz', result: 'dagaz' }, override: { result: 'Bouře se zlomí ve svítání.' } },
    { when: { start: 'mannaz', obstacle: 'perthro' }, override: { obstacle: 'Ne vše ovládneš – přijmi, že část příběhu je skrytá.' } },
    { when: { start: 'algiz', obstacle: 'thurisaz' }, override: { obstacle: 'Útok se tříští o zvednutý štít.' } },
    { when: { start: 'jera', result: 'othala' }, override: { result: 'Domů se vrátíš se sklizní své práce.' } },
    { when: { obstacle: 'eihwaz', result: 'inguz' }, override: { result: 'Za tmavým kmenem tisu čeká zrod nového života.' } },
    { when: { start: 'laguz', result: 'sowilo' }, override: { result: 'Proud tě vynese ke slunci.' } },
    { when: { start: 'tiwaz', obstacle: 'thurisaz' }, override: { obstacle: 'Čest zkrotí i hrot trnu.' } },
  ];

  let _runes = null; // cache
  let _index = null; // jméno/alias/id -> run

  function getQType(){
    try{
      const t = (localStorage.getItem('rq')||'default').trim().toLowerCase();
      return (TEMPL[t] ? t : 'default');
    }catch(e){ return 'default'; }
  }

  function hash(str){
    let h = 0; for(let i=0;i<str.length;i++){ h = ((h<<5)-h) + str.charCodeAt(i); h |= 0; }
    return h;
  }
  function pick(arr, seed){
    if(!arr || !arr.length) return '';
    const i = Math.abs(hash(seed)) % arr.length;
    return arr[i];
  }

  function buildIndex(){
    _index = Object.create(null);
    for(const r of _runes){
      const key = (r.name||'').toLowerCase();
      if(key) _index[key] = r;
      if (Array.isArray(r.aliases)){
        for(const a of r.aliases){ if(a) _index[(a||'').toLowerCase()] = r; }
      }
      if(r.id) _index[String(r.id).toLowerCase()] = r; // id už lowercase
    }
  }

  async function loadRunes(){
    if(_runes) return _runes;
    const res = await fetch('data/runes.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('Nepodařilo se načíst runy');
    _runes = await res.json();
    buildIndex();
    return _runes;
  }

  function unknownRun(name){
    const pretty = name && String(name).trim() ? String(name).trim() : 'Neznámo';
    return {
      id: 'unknown',
      name: pretty,
      meanings: {
        start:    [ 'Začátek šeptá o kroku vpřed.' ],
        obstacle: [ 'Cesta se na chvíli ztrácí v mlze.' ],
        result:   [ 'Nakonec cesta ví, kam vede.' ]
      }
    };
  }

  function normalizeName(input){
    const q = (input||'').trim();
    if(!_index) return null;
    const hit = _index[q.toLowerCase()];
    return hit || null;
  }

  function generateLine(run, role, seed){
    const arr = (run.meanings && run.meanings[role]) || [];
    const meaning = pick(arr.length ? arr : ['…'], run.id + ':' + role + ':' + seed) || '';
    const qtype = getQType();
    const templArr = (TEMPL[qtype] && TEMPL[qtype][role]) || TEMPL.default[role];
    const templ = pick(templArr, role + ':' + seed + ':' + run.id + ':' + qtype) || '{m}';
    return templ.replace('{m}', meaning);
  }

  function applyOverrides(runs, lines){
    // Speciál: Wyrd přidá nádech neurčitosti do výsledku
    if(runs.some(r => (r.id||'').toLowerCase() === 'wyrd')){
      lines.result = (lines.result ? (lines.result + ' ') : '') + 'Osud si část příběhu nechává pro sebe.';
    }
    // Synergie
    for(const rule of RULES){
      const okStart = !rule.when.start || rule.when.start === (runs[0].id||'').toLowerCase();
      const okObst  = !rule.when.obstacle || rule.when.obstacle === (runs[1].id||'').toLowerCase();
      const okRes   = !rule.when.result || rule.when.result === (runs[2].id||'').toLowerCase();
      if(okStart && okObst && okRes){
        if(rule.override.start)    lines.start    = rule.override.start;
        if(rule.override.obstacle) lines.obstacle = rule.override.obstacle;
        if(rule.override.result)   lines.result   = rule.override.result;
      }
    }
    return lines;
  }

  function generateForecast(r1Name, r2Name, r3Name){
    const r1 = normalizeName(r1Name) || unknownRun(r1Name);
    const r2 = normalizeName(r2Name) || unknownRun(r2Name);
    const r3 = normalizeName(r3Name) || unknownRun(r3Name);

    const seed = (r1.name + '|' + r2.name + '|' + r3.name);

    const start    = generateLine(r1, 'start', seed + ':S');
    const obstacle = generateLine(r2, 'obstacle', seed + ':O');
    const result   = generateLine(r3, 'result', seed + ':R');

    const lines = applyOverrides([r1, r2, r3], { start, obstacle, result });

    return { lines, runs: [r1, r2, r3], questionType: getQType() };
  }

  window.Runes = { loadRunes, generateForecast, normalizeName };
})();