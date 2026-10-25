// Finance calculator: deposit slider and RM field stay in sync, term
// changes the monthly figure, and the variant tabs change the price.
const depRange = $('#f-dep-range');
const depInput = $('#f-dep');
let shownMonthly = 0;

function renderFinance() {
  const v = variantOf();
  const m = monthly(v.price, S.deposit, S.term);
  $('#f-model').textContent = `${v.full.toUpperCase()} · ${rm(v.price)}`;
  $('#f-dep-pct').textContent = S.deposit + '%';
  depRange.value = S.deposit;
  depRange.style.setProperty('--p', ((S.deposit - 10) / 40) * 100 + '%');
  if (document.activeElement !== depInput) depInput.value = Math.round(v.price * S.deposit / 100).toLocaleString('en-MY');
  $('#f-term').value = String(S.term);
  $('#f-charge').textContent = rm(1500 * ({ std: 0.155, pro: 0.165, le: 0.17 }[v.id]) * 0.4);
  animateMonthly(m);
}

function animateMonthly(to) {
  const from = shownMonthly, t0 = performance.now();
  shownMonthly = to;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 450);
    $('#f-monthly').innerHTML = `${rm(from + (to - from) * (1 - Math.pow(1 - k, 3)))}<small>/mo</small>`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

let finSignal;
function financeChanged() {
  renderFinance();
  clearTimeout(finSignal);
  finSignal = setTimeout(() => signal(`Finance · ${S.deposit}% down · ${S.term} yrs`), 700);
}

depRange.addEventListener('input', () => { S.deposit = +depRange.value; financeChanged(); });
depInput.addEventListener('change', () => {
  const v = variantOf();
  const n = parseInt(depInput.value.replace(/[^\d]/g, ''), 10) || 0;
  S.deposit = Math.max(10, Math.min(50, Math.round((n / v.price) * 100)));
  depInput.value = '';
  financeChanged();
});
$('#f-term').addEventListener('change', (e) => { S.term = +e.target.value; financeChanged(); });

renderFinance();
