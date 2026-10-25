// Live feature poll. Votes keep arriving while the reveal is on screen,
// weighted towards the current leader so the bars move believably.
const poll = DATA.poll.opts.map((o) => ({ ...o }));

$('#poll-q').textContent = DATA.poll.q;
$('#poll-opts').innerHTML = poll.map((o) => `<button class="poll-opt" data-id="${o.id}"><span class="bar"></span><span class="l">${o.label}<span class="you">YOUR PICK</span></span><span class="pct">0%</span></button>`).join('');
$('#poll').classList.add('voted');

function renderPoll() {
  const total = poll.reduce((a, o) => a + o.votes, 0);
  poll.forEach((o) => {
    const el = $(`.poll-opt[data-id="${o.id}"]`);
    const pct = (o.votes / total) * 100;
    $('.bar', el).style.transform = `scaleX(${pct / 100})`;
    $('.pct', el).textContent = Math.round(pct) + '%';
    el.classList.toggle('mine', S.vote === o.id);
  });
  $('#poll-total').textContent = `${total.toLocaleString('en-MY')} votes`;
}

function tickPoll() {
  poll.forEach((o, i) => { o.votes += Math.floor(Math.random() * (i === 1 ? 26 : 16)); });
  renderPoll();
}

$('#poll-opts').addEventListener('click', (e) => {
  const b = e.target.closest('.poll-opt');
  if (!b || S.vote) return;
  S.vote = b.dataset.id;
  poll.find((o) => o.id === S.vote).votes += 1;
  renderPoll();
  signal(`Poll · ${b.querySelector('.l').firstChild.textContent.split(' · ')[0]}`);
});

renderPoll();
