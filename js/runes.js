(function(){
  const TEMPLS = {
    default: {
      past:    ["{m}", "Na úsvitu: {m}", "Začátek napovídá: {m}"],
      present: ["Nyní: {m}", "Cestou zjistíš: {m}", "Překážka: {m}", "Pozor: {m}"],
      future:  ["Nakonec: {m}", "Závěr: {m}", "A výsledek? {m}", "Až se kruh uzavře, {m}"]
    },
    today: {
      past:    ["{m}", "Dnešní ráno: {m}", "Na začátku dne: {m}"],
      present: ["Dnes tě čeká: {m}", "Během dne: {m}", "Dej si pozor: {m}"],
      future:  ["Do večera: {m}", "Výsledek dne: {m}", "Dnes se ukáže: {m}"]
    },
    fight: {
      past:    ["{m}", "Na úsvitu boje: {m}", "První střet: {m}"],
      present: ["Uprostřed boje: {m}", "Zkouška síly: {m}", "Nepřítel klade odpor: {m}"],
      future:  ["Výsledek bitvy: {m}", "Vítězství: {m}", "Korouhev spadne tam, kde {m}"]
    },
    future: {
      past:    ["{m}", "Z počátku: {m}", "První znamení říká: {m}"],
      present: ["Osud praví: {m}", "Na cestě osudu: {m}", "Je předpovězeno: {m}"],
      future:  ["Budoucnost přinese: {m}", "Osud odhalí, že {m}", "Nakonec se zjeví, že {m}"]
    }
  };

  const RULES = [
    { when: { past: 'algiz', present: 'hagalaz' }, override: { present: 'Bouře prověří pevnost štítu.' } },
    { when: { present: 'isa', future: 'sowilo' }, override: { future: 'Slunce roztaví i nejtužší led.' } },
    { when: { past: 'fehu', future: 'wunjo' }, override: { future: 'Radost má větší cenu než zlato.' } },
    { when: { present: 'nauthiz', future: 'gebo' }, override: { future: 'Dar v nouzi má nevyčíslitelnou cenu.' } },
    { when: { past: 'thurisaz', future: 'tiwaz' }, override: { future: 'Bez boje není vítězství.' } },
    { when: { past: 'tiwaz', present: 'thurisaz' }, override: { present: 'Čest zkrotí i hrot trnu.' } },
    { when: { past: 'raidho', present: 'ehwaz' }, override: { present: 'Společná cesta překoná i dlouhé míle.' } },
    { when: { past: 'raidho', present: 'nauthiz' }, override: { present: 'Cesta se zužuje – odlehči náklad a pokračuj.' } },
    { when: { past: 'ansuz', present: 'perthro' }, override: { present: 'Osud k tobě promlouvá skrytými znameními.' } },
    { when: { past: 'berkana', present: 'hagalaz' }, override: { present: 'Bouře pročistí cestu k novému životu.' } },
    { when: { past: 'berkana', present: 'isa' }, override: { present: 'Růst si žádá trpělivost – led neuspěcháš.' } },
    { when: { past: 'othala', present: 'fehu' }, override: { future: 'Poklad předků převyšuje pomíjivé zlato.' } },
    { when: { present: 'mannaz', future: 'laguz' }, override: { future: 'Jen kdo zná sám sebe, propluje proudy života.' } },
    { when: { past: 'ingwaz', present: 'berkana' }, override: { future: 'Ze semínka vyroste posvátný strom života.' } },
    { when: { present: 'eihwaz', future: 'dagaz' }, override: { future: 'Po nejtemnější noci přichází úsvit.' } },
    { when: { past: 'eihwaz', future: 'berkana' }, override: { future: 'Ze smrti vzejde nový život.' } },
    { when: { past: 'gebo', future: 'wunjo' }, override: { future: 'Sdílená radost je největší dar.' } },
    { when: { present: 'isa', future: 'jera' }, override: { future: 'Každá zima se jednou promění ve sklizeň.' } },
    { when: { past: 'uruz', present: 'thurisaz' }, override: { present: 'Býčí síla prorazí i trnité překážky.' } },
    { when: { past: 'uruz', present: 'ehwaz' }, override: { present: 'Sebevětší síla nic nezmůže bez spolupráce.' } },
    { when: { past: 'kenaz', present: 'hagalaz' }, override: { present: 'Ani bouře neuhasí jiskru poznání.' } },
    { when: { past: 'kenaz', present: 'laguz' }, override: { present: 'Žár poznání se setkává s chladivým proudem intuice.' } },
    { when: { past: 'gebo', future: 'tiwaz' }, override: { future: 'Pravé spojenectví vyžaduje oběť.' } }
  ];

  let _runes = null;
  let _index = null;

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
      _index[key] = r;
      if (Array.isArray(r.aliases)){
        for(const a of r.aliases){ if(a) _index[(a||'').toLowerCase()] = r; }
      }
      _index[(r.id||'').toLowerCase()] = r;
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

  function normalizeName(input){
    const q = (input||'').trim().toLowerCase();
    if(!_index) return null;
    return _index[q] || null;
  }

  function getQuestionType(){
    try{
      const q = (localStorage.getItem('q')||'').trim();
      if(q==='today' || q==='fight' || q==='future') return q;
    }catch(e){}
    return 'today';
  }

  function generateLine(run, role, seed){
    const meanings = (run.meanings && run.meanings[role]) || [];
    const meaning = pick(meanings, run.id + ':' + role + ':' + seed) || '';
    const templSet = TEMPLS[getQuestionType()] || TEMPLS.default;
    const templ = pick(templSet[role], role + ':' + seed + ':' + run.id) || '{m}';
    return templ.replace('{m}', meaning);
  }

  function applyOverrides(runs, lines){
    if(runs.some(r => r.id === 'wyrd')){
      lines.future = (lines.future ? (lines.future + ' ') : '') + 'Osud si část příběhu nechává pro sebe.';
    }
    for(const rule of RULES){
      const okPast = !rule.when.past || (runs[0] && rule.when.past === runs[0].id);
      const okPresent = !rule.when.present || (runs[1] && rule.when.present === runs[1].id);
      const okFuture = !rule.when.future || (runs[2] && rule.when.future === runs[2].id);
      if(okPast && okPresent && okFuture){
        if(rule.override.past)    lines.past    = rule.override.past;
        if(rule.override.present) lines.present = rule.override.present;
        if(rule.override.future)  lines.future  = rule.override.future;
      }
    }
    return lines;
  }

  function unknownRun(name){
    const pretty = name && name.trim() ? name.trim() : 'Neznámo';
    return {
      id: 'unknown',
      name: pretty,
      meanings: {
        past:    [ 'Minulost šeptá o kroku vpřed.' ],
        present: [ 'Přítomnost se na chvíli ztrácí v mlze.' ],
        future:  [ 'Budoucnost svou cestu zná.' ]
      }
    };
  }

  function generateForecast(pastName, presentName, futureName){
    const rPast    = normalizeName(pastName)    || unknownRun(pastName);
    const rPresent = normalizeName(presentName) || unknownRun(presentName);
    const rFuture  = normalizeName(futureName)  || unknownRun(futureName);

    const seed = (rPast.name + '|' + rPresent.name + '|' + rFuture.name);

    const pastLine    = generateLine(rPast, 'past', seed + ':P');
    const presentLine = generateLine(rPresent, 'present', seed + ':N');
    const futureLine  = generateLine(rFuture, 'future', seed + ':B');

    const lines = applyOverrides([rPast, rPresent, rFuture], { past: pastLine, present: presentLine, future: futureLine });
    return { lines, runs: [rPast, rPresent, rFuture] };
  }

  window.Runes = { loadRunes, generateForecast, normalizeName };
})();