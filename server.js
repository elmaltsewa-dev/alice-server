const express = require('express');
const app = express();
app.use(express.json());

const TZ = 'Europe/Moscow';
const clients = new Set();

let lastView = null;
let lastSearch = null;
let reader = null;
let timer = null;
let reminders = [];
let reminderId = 1;
let pomo = null;
let stopwatch = null;

function send(payload) {
  lastView = payload;
  const data = 'data: ' + JSON.stringify(payload) + '\n\n';
  clients.forEach(c => c.write(data));
}

// ---------- утилиты ----------
function decode(s) {
  return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
}
function strip(s) { return decode(String(s).replace(/<[^>]+>/g, '')); }
function now() { return new Date(); }
function fmtClock(d) { return d.toLocaleTimeString('ru-RU', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }); }
function fmtDate(d) { return d.toLocaleDateString('ru-RU', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' }); }
function fmtDay(d) { return d.toLocaleDateString('ru-RU', { timeZone: TZ, weekday: 'long' }); }
function isoWeek(d) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil((((x - y) / 86400000) + 1) / 7);
}
const NUMWORDS = [['одиннадцать',11],['двенадцать',12],['тринадцать',13],['четырнадцать',14],['пятнадцать',15],['шестнадцать',16],['семнадцать',17],['восемнадцать',18],['девятнадцать',19],['двадцать',20],['тридцать',30],['сорок',40],['пятьдесят',50],['один',1],['два',2],['три',3],['четыре',4],['пять',5],['шесть',6],['семь',7],['восемь',8],['девять',9],['десять',10]];
function numify(s) {
  let r = ' ' + s + ' ';
  NUMWORDS.forEach(p => { r = r.split(' ' + p[0] + ' ').join(' ' + p[1] + ' '); });
  return r;
}
function firstNum(s) { const m = numify(s).match(/(\d+)/); return m ? parseInt(m[1]) : null; }
function parseDur(s) {
  const t = numify(s);
  let m = t.match(/(\d+)\s*(сек|секунд)/); if (m) return parseInt(m[1]) * 1000;
  m = t.match(/(\d+)\s*(мин|минут)/); if (m) return parseInt(m[1]) * 60000;
  m = t.match(/(\d+)\s*(час|часа|часов)/); if (m) return parseInt(m[1]) * 3600000;
  return null;
}
const MONTHS = {января:0,февраля:1,марта:2,апреля:3,мая:4,июня:5,июля:6,августа:7,сентября:8,октября:9,ноября:10,декабря:11};
function parseDateRu(s) {
  if (/нов(ый|ого|ым)\s+год/.test(s)) {
    const y = now().getMonth() === 11 && now().getDate() > 25 ? now().getFullYear() + 1 : now().getFullYear() + 1;
    return new Date(y, 0, 1);
  }
  const m = s.match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
  if (!m) return null;
  const d = parseInt(m[1]), mo = MONTHS[m[2]];
  let y = now().getFullYear();
  let dt = new Date(y, mo, d);
  const today = now(); today.setHours(0,0,0,0);
  if (/до/.test(s) && dt < today) dt = new Date(y + 1, mo, d);
  if (/прошло|с\s/.test(s) && dt > today) dt = new Date(y - 1, mo, d);
  return dt;
}
function daysDiff(a, b) { return Math.round((b - a) / 86400000); }

// ---------- поиск и чтение ----------
async function ddgSearch(query, page) {
  const url = 'https://lite.duckduckgo.com/lite/?q=' + encodeURIComponent(query) + (page ? '&s=' + (page * 10) : '');
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  const out = [];
  const re = /<a[^>]+rel="nofollow"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 6) {
    const href = m[1], title = strip(m[2]).trim();
    if (href.startsWith('http') && title && href.indexOf('duckduckgo') === -1) out.push({ title, url: href });
  }
  return out;
}
async function readPage(url) {
  try {
    const res = await fetch('https://r.jina.ai/' + url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    let t = await res.text();
    t = t.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#>*`_]/g, '').replace(/\n{3,}/g, '\n\n');
    if (t.length > 300) return t.slice(0, 20000);
  } catch (e) {}
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    let h = await res.text();
    h = h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const parts = h.match(/<(p|h1|h2|h3|li)[^>]*>([\s\S]*?)<\/(p|h1|h2|h3|li)>/gi) || [];
    let t = parts.map(p => strip(p.replace(/^<[^>]+>/, '').replace(/<[^>]+>$/, ''))).filter(x => x.length > 40).join('\n\n');
    return t.slice(0, 20000);
  } catch (e) { return null; }
}
function splitPages(text) {
  const pages = [];
  let cur = '';
  text.split(/\n+/).forEach(par => {
    if ((cur + par).length > 1200 && cur) { pages.push(cur.trim()); cur = ''; }
    cur += par + '\n';
  });
  if (cur.trim()) pages.push(cur.trim());
  return pages.length ? pages : [text];
}
async function wikiImages(query) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=' +
    encodeURIComponent('filetype:bitmap ' + query) + '&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=480';
  const res = await fetch(u);
  const j = await res.json();
  const pages = j.query && j.query.pages ? Object.values(j.query.pages) : [];
  pages.sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages.map(p => p.imageinfo && p.imageinfo[0] ? { thumb: p.imageinfo[0].thumburl, title: p.title } : null).filter(Boolean);
}

// ---------- HTML-карточки ----------
function card(title, inner) {
  return '<div class="card"><h1>' + title + '</h1>' + inner + '</div>';
}
function searchHtml(q, results, page) {
  let rows = results.map((r, i) => {
    let dom = ''; try { dom = new URL(r.url).hostname; } catch (e) {}
    return '<div class="row"><span class="num">' + (i + 1) + '</span><div><div class="t">' + r.title + '</div><div class="d">' + dom + '</div></div></div>';
  }).join('');
  return card('Поиск: ' + q, rows + '<div class="hint">Скажи «открой 1…6», «покажи ещё» или «назад к списку»</div>');
}
function readerHtml() {
  return card(reader.title, '<div class="text">' + reader.pages[reader.idx].replace(/\n/g, '<br>') + '</div><div class="hint">Стр. ' + (reader.idx + 1) + ' из ' + reader.pages.length + ' — «дальше», «назад», «зачитай»</div>');
}
function imagesHtml(q, imgs) {
  const g = imgs.map(i => '<img src="' + i.thumb + '" alt="">').join('');
  return card('Фото: ' + q, '<div class="grid">' + g + '</div>');
}
function clockHtml() {
  const d = now();
  return card('Сейчас', '<div class="big">' + fmtClock(d) + '</div><div class="sub">' + fmtDate(d) + ', ' + fmtDay(d) + '</div>');
}
function worldHtml() {
  const zones = [['Москва','Europe/Moscow'],['Нью-Йорк','America/New_York'],['Лондон','Europe/London'],['Токио','Asia/Tokyo'],['Дубай','Asia/Dubai']];
  const rows = zones.map(z => '<div class="row"><span class="t">' + z[0] + '</span><span class="big2">' + now().toLocaleTimeString('ru-RU', { timeZone: z[1], hour: '2-digit', minute: '2-digit' }) + '</span></div>').join('');
  return card('Время в мире', rows);
}
function timerHtml(endsAt, label, speakEnd) {
  return card(label, '<div class="big" data-ends="' + endsAt + '" data-speakend="' + (speakEnd || '') + '">--:--</div><div class="hint">«останови таймер» или «сколько осталось»</div>');
}
function remindersHtml() {
  if (!reminders.length) return card('Напоминания', '<div class="sub">Пока пусто. Скажи: «напомни через 5 минут …»</div>');
  const rows = reminders.map((r, i) => '<div class="row"><span class="num">' + (i + 1) + '</span><div class="t">' + r.text + ' — в ' + new Date(r.endsAt).toLocaleTimeString('ru-RU', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) + '</div></div>').join('');
  return card('Напоминания', rows);
}
function pomoHtml() {
  const lbl = pomo.phase === 'work' ? 'Помодоро: РАБОТА (круг ' + pomo.round + '/4)' : 'Помодоро: перерыв';
  return timerHtml(pomo.endsAt, lbl, pomo.phase === 'work' ? 'Перерыв! Пять минут отдыха.' : 'Отдых окончен, за работу!');
}
function helpHtml() {
  return card('Команды модуля 1',
    '<div class="text">найди … / найди фото … / открой N / дальше / назад / зачитай / стоп чтение<br>' +
    'который час / какое число / какой день недели / сегодня выходной / какая неделя года / время в мире / сколько дней до … / сколько дней прошло с … / сколько до нового года<br>' +
    'таймер N минут / останови таймер / сколько осталось / напомни через N минут … / покажи напоминания / отмени напоминание N / помодоро / стоп помодоро / секундомер</div>');
}

// ---------- маршрутизатор команд ----------
function route(cmd) {
  // привет
  if (/привет|здравствуй|добрый (день|вечер|утро)/.test(cmd)) {
    return { html: card('Привет!', '<div class="sub">Я на связи. Скажи «помощь» — покажу все команды.</div>'), reply: 'Привет! Я на связи, результат на экране.' };
  }
  if (/помощь|что ты умеешь/.test(cmd)) return { html: helpHtml(), reply: 'Список команд на экране.' };

  // время
  if (/который час|сколько времени|время сейчас/.test(cmd)) return { html: clockHtml(), reply: 'Сейчас ' + fmtClock(now()) + '.' };
  if (/какое число|какая дата/.test(cmd)) return { html: clockHtml(), reply: 'Сегодня ' + fmtDate(now()) + '.' };
  if (/день недели/.test(cmd)) return { html: clockHtml(), reply: 'Сегодня ' + fmtDay(now()) + '.' };
  if (/выходной/.test(cmd)) {
    const wd = now().getDay(); const yes = wd === 0 || wd === 6;
    return { html: clockHtml(), reply: yes ? 'Да, сегодня выходной.' : 'Нет, сегодня будний день.' };
  }
  if (/неделя года/.test(cmd)) return { html: clockHtml(), reply: 'Сейчас ' + isoWeek(now()) + '-я неделя года.' };
  if (/до нового года/.test(cmd)) {
    const ny = new Date(now().getFullYear() + 1, 0, 1);
    const d = daysDiff(now(), ny);
    return { html: card('До Нового года 🎄', '<div class="big">' + d + '</div><div class="sub">дней</div>'), reply: 'До Нового года ' + d + ' дней.' };
  }
  if (/время в мире|время в городах/.test(cmd)) return { html: worldHtml(), reply: 'Мировое время на экране.' };
  if (/сколько дней до/.test(cmd)) {
    const dt = parseDateRu(cmd);
    if (!dt) return { reply: 'Назови дату, например: сколько дней до 11 августа.' };
    const d = daysDiff(now(), dt);
    return { html: card('Отсчёт', '<div class="big">' + d + '</div><div class="sub">дней до ' + dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + '</div>'), reply: 'Осталось ' + d + ' дней.' };
  }
  if (/сколько дней прошло/.test(cmd)) {
    const dt = parseDateRu(cmd);
    if (!dt) return { reply: 'Назови дату, например: сколько дней прошло с 1 мая.' };
    const d = daysDiff(dt, now());
    return { html: card('Прошло', '<div class="big">' + d + '</div><div class="sub">дней с ' + dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + '</div>'), reply: 'Прошло ' + d + ' дней.' };
  }
  if (/через\s+\d+.*какое число|какое число будет через/.test(cmd)) {
    const n = firstNum(cmd);
    if (!n) return { reply: 'Скажи, через сколько дней: например, через 10 дней какое число.' };
    const dt = new Date(now().getTime() + n * 86400000);
    return { html: clockHtml(), reply: 'Через ' + n + ' дней будет ' + dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + '.' };
  }

  // таймеры
  if (/останови таймер|стоп таймер/.test(cmd)) {
    timer = null;
    return { html: card('Таймер', '<div class="sub">Таймер остановлен.</div>'), reply: 'Таймер остановлен.' };
  }
  if (/сколько осталось/.test(cmd)) {
    if (!timer) return { reply: 'Таймер не запущен.' };
    const s = Math.max(0, Math.round((timer.endsAt - Date.now()) / 1000));
    return { reply: 'Осталось ' + Math.floor(s / 60) + ' минут ' + (s % 60) + ' секунд.' };
  }
  if (/^таймер|запусти таймер|таймер на/.test(cmd)) {
    const ms = parseDur(cmd);
    if (!ms) return { reply: 'Скажи, например: таймер 5 минут или таймер 30 секунд.' };
    timer = { endsAt: Date.now() + ms };
    const m = Math.round(ms / 60000);
    return { html: timerHtml(timer.endsAt, 'Таймер', 'Таймер завершён!'), reply: 'Таймер запущен на ' + (ms >= 60000 ? m + ' минут' : Math.round(ms / 1000) + ' секунд') + '.' };
  }
  if (/напомни/.test(cmd)) {
    const ms = parseDur(cmd);
    if (!ms) return { reply: 'Скажи, например: напомни через 10 минут позвонить маме.' };
    const text = cmd.replace(/.*напомни/, '').replace(/через\s*\d+\s*(секунд|сек|минут|мин|час[аов]?)/, '').trim() || 'Напоминание';
    const r = { id: reminderId++, endsAt: Date.now() + ms, text };
    reminders.push(r);
    setTimeout(() => {
      reminders = reminders.filter(x => x.id !== r.id);
      send({ html: card('⏰ Напоминание', '<div class="big2">' + r.text + '</div>'), speak: 'Напоминаю: ' + r.text });
    }, ms);
    return { html: remindersHtml(), reply: 'Хорошо, напомню через ' + Math.round(ms / 60000) + ' минут.' };
  }
  if (/покажи напоминания/.test(cmd)) return { html: remindersHtml(), reply: 'Список напоминаний на экране.' };
  if (/отмени напоминание/.test(cmd)) {
    const n = firstNum(cmd);
    if (n && reminders[n - 1]) { const t = reminders[n - 1].text; reminders.splice(n - 1, 1); return { html: remindersHtml(), reply: 'Отменила: ' + t }; }
    return { reply: 'Не нашла такое напоминание.' };
  }
  if (/стоп помодоро|останови помодоро/.test(cmd)) {
    if (pomo) { clearTimeout(pomo.t); pomo = null; }
    return { html: card('Помодоро', '<div class="sub">Остановлено.</div>'), reply: 'Помодоро остановлен.' };
  }
  if (/помодоро/.test(cmd)) {
    if (pomo) { clearTimeout(pomo.t); }
    pomo = { phase: 'work', round: 1 };
    startPomoPhase(25 * 60000);
    return { html: pomoHtml(), reply: 'Помодоро начат: 25 минут работы.' };
  }
  if (/секундомер/.test(cmd)) {
    if (!stopwatch || !stopwatch.running) {
      stopwatch = { startAt: Date.now(), acc: stopwatch && !stopwatch.running ? stopwatch.acc : 0, running: true };
      return { html: card('Секундомер', '<div class="big">▶ 00:00</div>'), reply: 'Секундомер запущен.' };
    } else {
      const ms = stopwatch.acc + (Date.now() - stopwatch.startAt);
      stopwatch = { acc: ms, running: false };
      const s = Math.round(ms / 1000);
      return { html: card('Секундомер', '<div class="big">⏸ ' + Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2) + '</div>'), reply: 'Секундомер остановлен: ' + Math.floor(s / 60) + ' минут ' + (s % 60) + ' секунд.' };
    }
  }

  // браузер
  if (/найди фото|фотографии/.test(cmd)) {
    const q = cmd.replace(/.*найди фото/, '').replace(/фотографии/, '').trim() || cmd;
    return { async: true, run: async () => {
      const imgs = await wikiImages(q);
      if (!imgs.length) return { reply: 'Не нашла фото по этому запросу.' };
      return { html: imagesHtml(q, imgs), reply: 'Фотографии на экране.' };
    } };
  }
  if (/^найди|поищи|поиск/.test(cmd)) {
    const q = cmd.replace(/^(найди|поищи|поиск)/, '').trim();
    if (!q) return { reply: 'Что найти? Скажи, например: найди как подключить розетку.' };
    return { async: true, run: async () => {
      const results = await ddgSearch(q, 0);
      if (!results.length) return { reply: 'Не нашла результатов.' };
      lastSearch = { query: q, page: 0, results };
      return { html: searchHtml(q, results, 0), reply: 'Нашла. Результаты на экране.' };
    } };
  }
  if (/покажи ещё|следующая страница/.test(cmd)) {
    if (!lastSearch) return { reply: 'Сначала что-нибудь найди.' };
    return { async: true, run: async () => {
      const p = lastSearch.page + 1;
      const results = await ddgSearch(lastSearch.query, p);
      if (!results.length) return { reply: 'Больше результатов нет.' };
      lastSearch.page = p; lastSearch.results = results;
      return { html: searchHtml(lastSearch.query, results, p), reply: 'Следующая страница на экране.' };
    } };
  }
  if (/открой сайт/.test(cmd)) {
    let name = cmd.replace(/.*открой сайт/, '').trim();
    return { async: true, run: async () => {
      let url = null;
      if (/\./.test(name)) url = 'https://' + name.replace(/^https?:\/\//, '');
      else { const r = await ddgSearch(name + ' официальный сайт', 0); if (r.length) url = r[0].url; }
      if (!url) return { reply: 'Не нашла такой сайт.' };
      const text = await readPage(url);
      if (!text) return { reply: 'Не смогла открыть сайт.' };
      reader = { title: name || url, pages: splitPages(text), idx: 0 };
      return { html: readerHtml(), reply: 'Открыла сайт в режиме чтения.' };
    } };
  }
  if (/^открой\s+\d|открой\s+(перв|втор|треть|четверт|пят|шест)/.test(cmd)) {
    const map = { перв: 1, втор: 2, треть: 3, четверт: 4, пят: 5, шест: 6 };
    let n = firstNum(cmd);
    if (!n) { for (const k in map) if (cmd.indexOf(k) !== -1) { n = map[k]; break; } }
    if (!lastSearch || !n || !lastSearch.results[n - 1]) return { reply: 'Сначала скажи «найди …», потом «открой номер».' };
    const r = lastSearch.results[n - 1];
    return { async: true, run: async () => {
      const text = await readPage(r.url);
      if (!text) return { reply: 'Не смогла открыть эту страницу.' };
      reader = { title: r.title, pages: splitPages(text), idx: 0 };
      return { html: readerHtml(), reply: 'Открыла. Текст на экране.' };
    } };
  }
  if (/^дальше|^далее|следующая страница текста/.test(cmd)) {
    if (!reader) return { reply: 'Сначала открой что-нибудь: «открой 1».' };
    if (reader.idx < reader.pages.length - 1) { reader.idx++; return { html: readerHtml(), reply: 'Следующая часть.' }; }
    return { reply: 'Это был конец текста.' };
  }
  if (/назад к списку/.test(cmd)) {
    if (!lastSearch) return { reply: 'Списка поиска нет.' };
    return { html: searchHtml(lastSearch.query, lastSearch.results, lastSearch.page), reply: 'Список результатов на экране.' };
  }
  if (/^назад/.test(cmd)) {
    if (!reader) return { reply: 'Нечего листать.' };
    if (reader.idx > 0) { reader.idx--; return { html: readerHtml(), reply: 'Предыдущая часть.' }; }
    return { reply: 'Это начало текста.' };
  }
  if (/^зачитай|прочитай вслух|озвучь/.test(cmd)) {
    let t = null;
    if (reader) t = reader.pages[reader.idx];
    else if (lastSearch) t = lastSearch.results.map((r, i) => (i + 1) + '. ' + r.title).join('. ');
    if (!t) return { reply: 'Нечего зачитывать. Сначала найди или открой текст.' };
    return { speakOnly: t.slice(0, 1000), reply: 'Зачитываю.' };
  }
  if (/стоп чтение|хватит читать|замолчи/.test(cmd)) {
    return { stopSpeak: true, reply: 'Остановилась.' };
  }

  return { html: card('Не поняла', '<div class="sub">Команда: «' + cmd + '». Скажи «помощь» — покажу, что умею.</div>'), reply: 'Я пока не знаю такую команду. Скажи «помощь».' };
}

function startPomoPhase(ms) {
  pomo.endsAt = Date.now() + ms;
  pomo.t = setTimeout(() => {
    if (!pomo) return;
    if (pomo.phase === 'work') {
      const long = pomo.round >= 4;
      pomo.phase = 'rest';
      startPomoPhase(long ? 15 * 60000 : 5 * 60000);
      send({ html: pomoHtml(), speak: long ? 'Большой перерыв, 15 минут!' : 'Перерыв, 5 минут.' });
    } else {
      if (pomo.round >= 4) { pomo = null; send({ html: card('Помодоро', '<div class="sub">Цикл завершён! 🎉</div>'), speak: 'Помодоро завершён, отличная работа!' }); return; }
      pomo.round++; pomo.phase = 'work';
      startPomoPhase(25 * 60000);
      send({ html: pomoHtml(), speak: 'Отдых окончен, за работу!' });
    }
  }, ms);
}

// ---------- HTTP ----------
app.get('/events', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  if (lastView) res.write('data: ' + JSON.stringify(lastView) + '\n\n');
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

app.post('/alice', async (req, res) => {
  const body = req.body || {};
  let cmd = ((body.request && body.request.command) || '').toLowerCase().replace(/ё/g, 'е').replace(/[.,!?;:"]/g, ' ').trim();
  let out;
  try { out = route(cmd); } catch (e) { out = { reply: 'Ошибка: ' + e.message }; }
  try {
    if (out && out.async) out = await out.run();
  } catch (e) { out = { reply: 'Не получилось: ' + e.message }; }
  if (out) {
    const payload = {};
    if (out.html) payload.html = out.html;
    if (out.speakOnly) payload.speak = out.speakOnly;
    if (out.stopSpeak) payload.stopSpeak = true;
    if (Object.keys(payload).length) send(payload);
  }
  res.json({
    version: '1.0',
    session: body.session || {},
    response: { text: (out && out.reply) || 'Готово.', end_session: false }
  });
});

app.get('/', (req, res) => {
  res.send('<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Панель Алисы</title><style>' +
    'body{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;text-align:center;padding:30px}' +
    '.card{display:inline-block;background:#1e293b;padding:30px 50px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.4);max-width:900px;text-align:left}' +
    'h1{color:#7dd3fc;margin-top:0;font-size:26px}.big{font-size:64px;color:#fbbf24;text-align:center;margin:10px 0}' +
    '.big2{font-size:28px;color:#fbbf24}.sub{color:#94a3b8;font-size:18px;text-align:center}' +
    '.row{display:flex;gap:12px;align-items:center;margin:10px 0}.num{background:#334155;border-radius:8px;padding:4px 10px;font-size:20px;color:#7dd3fc}' +
    '.t{font-size:20px}.d{color:#64748b;font-size:14px}.hint{color:#64748b;margin-top:16px;font-size:15px}' +
    '.text{font-size:20px;line-height:1.6;max-height:60vh;overflow:auto}' +
    '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.grid img{width:100%;border-radius:8px}' +
    '</style></head><body><div id="box"><div class="card"><h1>Панель Алисы</h1><div class="sub">Жду команду…</div></div></div><script>' +
    'var box=document.getElementById("box");var tick=null;' +
    'function speak(t){try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang="ru-RU";speechSynthesis.speak(u);}catch(e){}}' +
    'function fmt(ms){var s=Math.ceil(ms/1000);var h=Math.floor(s/3600);var m=Math.floor(s%3600/60);var ss=s%60;function p(n){return(n<10?"0":"")+n}return h>0?p(h)+":"+p(m)+":"+p(ss):p(m)+":"+p(ss)}' +
    'function startTicks(){if(tick)clearInterval(tick);tick=setInterval(function(){var els=document.querySelectorAll("[data-ends]");for(var i=0;i<els.length;i++){var el=els[i];var ms=+el.getAttribute("data-ends")-Date.now();if(ms<=0){el.textContent="00:00";var se=el.getAttribute("data-speakend");if(se&&!el.getAttribute("data-done")){el.setAttribute("data-done","1");speak(se);}}else{el.textContent=fmt(ms);}}},500);}' +
    'var es=new EventSource("/events");es.onmessage=function(e){var d=JSON.parse(e.data);if(d.speak)speak(d.speak);if(d.stopSpeak){try{speechSynthesis.cancel()}catch(e){}}if(d.html){box.innerHTML=d.html;startTicks();}};' +
    '</script></body></html>');
});

app.listen(process.env.PORT || 3000, () => console.log('Сервер запущен в облаке!'));
