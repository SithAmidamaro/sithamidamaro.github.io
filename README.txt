
# Zaklínač – Duch Alchymisty (statické stránky)

Vícestránková interaktivní dialogová hra pro GitHub Pages.

## Struktura
- `index.html` (start) → `kap3.html` (první vyvolání) → `kap3a.html` (kvíz) → `kap4.html` (po kvízu) → `kap5.html` (bestiář) → `kap7.html` (přenosná laboratoř) → `kap7c.html` (lektvar Kočky) → `kap8.html` (krystalová lampa) → `kap9.html` (přání štěstí) → `kap12.html` (další část – kostra).
- `/css/style.css` – sdílené styly (mobil-first, velká tlačítka).
- `/js/helpers.js` – pár pomocných funkcí.
- `/img/alchymista_mavajici.png` – avatar alchymisty.

## Nasazení na GitHub Pages
1. Vytvoř nový veřejný repozitář a nahraj obsah této složky do rootu repa.
2. V **Settings → Pages** nastav **Branch:** `main` (nebo `master`) a `/ (root)`.
3. Vyčkej na publikaci a otevři URL GitHub Pages. Úvodní stránka je `index.html`.

## Úpravy
- Texty kapitol upravíš přímo v jednotlivých HTML souborech (hledáním bublin `<div class="bubble">`).
- Barvy/stylování v `css/style.css`.
- Přidání dalších kapitol: zkopíruj některý `kapX.html`, uprav texty a propoj odkazy.
