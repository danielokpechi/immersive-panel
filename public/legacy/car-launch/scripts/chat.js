// "Ask Aurora": canned Q&As that read the viewer's current build, streamed
// word by word so they land like a live assistant.
$('#qs').innerHTML = DATA.chat.map((c) => `<button class="chip" data-q="${c.id}">${c.q}</button>`).join('');

let chatBusy = false;

function openChat() {
  if (!$('#msgs').children.length) {
    const name = S.register ? `, ${S.register.name.split(' ')[0]}` : '';
    addMsg('ai', `Hi${name}. I'm Aurora, trained only on approved Nova data. You're looking at the ${variantOf().full} in ${paintOf().name}. What would you like to know?`);
  }
  openSheet('chat');
}

function addMsg(who, html) {
  const el = document.createElement('div');
  el.className = 'msg ' + who;
  el.innerHTML = html;
  $('#msgs').appendChild(el);
  $('#msgs').scrollTop = $('#msgs').scrollHeight;
  return el;
}

async function askChat(id) {
  if (chatBusy) return;
  chatBusy = true;
  const c = DATA.chat.find((x) => x.id === id);
  $(`#qs [data-q="${id}"]`).classList.add('on');
  addMsg('me', c.q);
  const ai = addMsg('ai', '<span class="dots"><i></i><i></i><i></i></span>');
  await sleep(850);
  const words = c.a(variantOf()).split(' ');
  ai.textContent = '';
  for (let i = 0; i < words.length; i++) {
    ai.textContent += (i ? ' ' : '') + words[i];
    $('#msgs').scrollTop = $('#msgs').scrollHeight;
    await sleep(38);
  }
  ai.insertAdjacentHTML('beforeend', '<span class="src">SOURCE · NOVA SPEC SHEET, APPROVED 10/2026</span>');
  $('#msgs').scrollTop = $('#msgs').scrollHeight;
  if (!S.chats.includes(id)) S.chats.push(id);
  signal(`Asked Aurora · ${id}`);
  chatBusy = false;
}

$('#ask').addEventListener('click', openChat);
$('#qs').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) askChat(b.dataset.q); });
