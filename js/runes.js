(function(){
  const TEMPL = {
    start: [
      "{m}",
      "Na úsvitu: {m}",
      "První krok: {m}",
      "Začátek napovídá: {m}"
    ],
    obstacle: [
      "Ale {m}",
      "Cestou zjistíš: {m}",
      "Překážka: {m}",
      "Pozor: {m}"
    ],
    result: [
      "Nakonec {m}",
      "Závěr: {m}",
      "A výsledek? {m}",
      "Nakonec se ukáže, že {m}"
    ]
  };

  // Pár ukázkových synergií (volitelné override jedné věty)
  const RULES = [
    { when: { start: 'algiz', obstacle: 'hagalaz' }, override: { obstacle: 'Bouře prověří pevnost štítu.' } },
    { when: { result: 'sowilo', obstacle: 'isa' }, override: { result: 'Slunce roztaví i nejtužší led.' } },
    { when: { start: 'fehu', result: 'wunjo' }, override: { result: 'Radost má větší cenu než zlato.' } },
  ];

  let _runes = null; // cache
  let _index = null; // jméno/alias -> run

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
      const key = r.name.toLowerCase();
      _index[key] = r;
      if (Array.isArray(r.aliases)){
        for(const a of r.aliases){ _index[(a||'').toLowerCase()] = r; }
      }
      _index[r.id] = r; // id je už lowercase
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
    const pretty = name && name.trim() ? name.trim() : 'Neznámo';
    return {
      id: 'unknown',
      name: pretty,
      meanings: {
        start: [ 'Začátek šeptá o kroku vpřed.' ],
        obstacle: [ 'Cesta se na chvíli ztrácí v mlze.' ],
        result: [ 'Nakonec cesta ví, kam vede.' ]
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
    const templ = pick(TEMPL[role], role + ':' + seed + ':' + run.id) || '{m}';
    return templ.replace('{m}', meaning);
  }

  function applyOverrides(runs, lines){
    // Speciál: Wyrd přidá nádech neurčitosti do výsledku
    if(runs.some(r => r.id === 'wyrd')){
      lines.result = (lines.result ? (lines.result + ' ') : '') + 'Osud si část příběhu nechává pro sebe.';
    }
    // Synergie
    for(const rule of RULES){
      const okStart = !rule.when.start || rule.when.start === runs[0].id;
      const okObst  = !rule.when.obstacle || rule.when.obstacle === runs[1].id;
      const okRes   = !rule.when.result || rule.when.result === runs[2].id;
      if(okStart && okObst && okRes){
        if(rule.override.start)   lines.start  = rule.override.start;
        if(rule.override.obstacle)lines.obstacle = rule.override.obstacle;
        if(rule.override.result)  lines.result = rule.override.result;
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

    return { lines, runs: [r1, r2, r3] };
  }

  window.Runes = { loadRunes, generateForecast, normalizeName };
})();
