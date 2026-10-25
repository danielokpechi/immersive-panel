// Pulsing feature points on the reveal photo. Positions are percentages of
// the photo, so they track the car at any frame size.
$('#car-box').insertAdjacentHTML('beforeend', DATA.hotspots
  .map((h) => `<button class="hs" data-hs="${h.id}" style="left:${h.x}%;top:${h.y}%" aria-label="${h.name}"></button>`)
  .join(''));

function showHotspots() {
  $$('.hs').forEach((h, i) => setTimeout(() => h.classList.add('show'), i * 160));
}

function openHotspot(id) {
  const i = DATA.hotspots.findIndex((h) => h.id === id);
  const h = DATA.hotspots[i];
  $('#hs-k').textContent = `FEATURE ${String(i + 1).padStart(2, '0')} / ${String(DATA.hotspots.length).padStart(2, '0')}`;
  $('#hs-name').textContent = h.name;
  $('#hs-desc').textContent = h.desc;
  $('#hs-stat').textContent = h.stat;
  $('#hs-unit').textContent = h.unit;
  $$('.hs').forEach((el) => el.classList.toggle('lit', el.dataset.hs === id));
  const el = $(`.hs[data-hs="${id}"]`);
  el.classList.add('seen');
  $('#hs-hint').style.opacity = 0;
  if (!S.hotspots.includes(id)) {
    S.hotspots.push(id);
    signal(`Interest · ${h.name}`);
  }
  openSheet('hs-sheet', true);
}

$('#car-box').addEventListener('click', (e) => {
  const b = e.target.closest('.hs');
  if (b) openHotspot(b.dataset.hs);
});
