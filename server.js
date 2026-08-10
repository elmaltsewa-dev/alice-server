const express = require('express');
const app = express();
app.use(express.json());

const TZ = 'Europe/Moscow';
const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_REPO = process.env.GH_REPO || 'elmaltsewa-dev/alice-server';
const clients = new Set();

let lastView = null, lastSearch = null, reader = null, timer = null;
let reminders = [], reminderId = 1, pomo = null, stopwatch = null;
let db = { tasks: [], lists: {}, notes: [] };
let dbSha = null;

function send(p) { lastView = p; const d = 'data: ' + JSON.stringify(p) + '\n\n'; clients.forEach(c => c.write(d)); }

// ---------- память (GitHub) ----------
async function loadDb() {
  if (!GH_TOKEN) return;
  try {
    const r = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/data.json', { headers: { Authorization: 'Bearer ' + GH_TOKEN, 'User-Agent': 'alice', Accept: 'application/vnd.github+json' } });
    if (r.status === 200) { const j = await r.json(); dbSha = j.sha; db = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')); }
  } catch (e) {}
}
let saveT = null;
function saveDb() {
  if (!GH_TOKEN) return;
  clearTimeout(saveT);
  saveT = setTimeout(async () => {
    try {
      const body = { message: 'data', content: Buffer.from(JSON.stringify(db)).toString('base64') };
      if (dbSha) body.sha = dbSha;
      const r = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/data.json', { method: 'PUT', headers: { Authorization: 'Bearer ' + GH_TOKEN, 'User-Agent': 'alice', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json(); if (j.content) dbSha = j.content.sha;
    } catch (e) {}
  }, 1500);
}

// ---------- утилиты ----------
function decode(s){return String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&amp;/g,'&');}
function strip(s){return decode(String(s).replace(/<[^>]+>/g,''));}
function now(){return new Date();}
function fmtClock(d){return d.toLocaleTimeString('ru-RU',{timeZone:TZ,hour:'2-digit',minute:'2-digit'});}
function fmtDate(d){return d.toLocaleDateString('ru-RU',{timeZone:TZ,day:'numeric',month:'long',year:'numeric'});}
function fmtDay(d){return d.toLocaleDateString('ru-RU',{timeZone:TZ,weekday:'long'});}
function isoWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil((((x-y)/86400000)+1)/7);}
const NUMWORDS=[['одиннадцать',11],['двенадцать',12],['тринадцать',13],['четырнадцать',14],['пятнадцать',15],['шестнадцать',16],['семнадцать',17],['восемнадцать',18],['девятнадцать',19],['двадцать',20],['тридцать',30],['сорок',40],['пятьдесят',50],['один',1],['два',2],['три',3],['четыре',4],['пять',5],['шесть',6],['семь',7],['восемь',8],['девять',9],['десять',10]];
function numify(s){let r=' '+s+' ';NUMWORDS.forEach(p=>{r=r.split(' '+p[0]+' ').join(' '+p[1]+' ');});return r;}
function firstNum(s){const m=numify(s).match(/(\d+)/);return m?parseInt(m[1]):null;}
function parseDur(s){const t=numify(s);let m=t.match(/(\d+)\s*(сек|секунд)/);if(m)return parseInt(m[1])*1000;m=t.match(/(\d+)\s*(мин|минут)/);if(m)return parseInt(m[1])*60000;m=t.match(/(\d+)\s*(час|часа|часов)/);if(m)return parseInt(m[1])*3600000;return null;}
const MONTHS={января:0,февраля:1,марта:2,апреля:3,мая:4,июня:5,июля:6,августа:7,сентября:8,октября:9,ноября:10,декабря:11};
function parseDateRu(s){
  if(/нов(ый|ого|ым)\s+год/.test(s))return new Date(now().getFullYear()+1,0,1);
  const m=s.match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
  if(!m)return null;
  const d=parseInt(m[1]),mo=MONTHS[m[2]];let y=now().getFullYear();let dt=new Date(y,mo,d);
  const t=now();t.setHours(0,0,0,0);
  if(/до/.test(s)&&dt<t)dt=new Date(y+1,mo,d);
  if(/прошло/.test(s)&&dt>t)dt=new Date(y-1,mo,d);
  return dt;
}
function daysDiff(a,b){return Math.round((b-a)/86400000);}

// ---------- поиск и чтение ----------
async function ddgSearch(q,p){
  try{
    const r=await fetch('https://lite.duckduckgo.com/lite/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0'}});
    const h=await r.text();const out=[];const re=/<a[^>]+rel="nofollow"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;let m;
    while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(m[1].startsWith('http')&&t&&m[1].indexOf('duckduckgo')===-1)out.push({title:t,url:m[1]});}
    return out;
  }catch(e){return[];}
}
async function ddgHtmlSearch(q,p){
  try{
    const r=await fetch('https://html.duckduckgo.com/html/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}});
    const h=await r.text();const out=[];const re=/<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;let m;
    while((m=re.exec(h))&&out.length<6){let href=m[1];if(href.indexOf('uddg=')!==-1){try{href=decodeURIComponent(href.split('uddg=')[1].split('&')[0]);}catch(e){}}
      const t=strip(m[2]).trim();if(href.startsWith('http')&&t)out.push({title:t,url:href});}
    return out;
  }catch(e){return[];}
}
async function jinaSearch(q){
  try{
    const r=await fetch('https://s.jina.ai/'+encodeURIComponent(q),{headers:{'User-Agent':'Mozilla/5.0'}});
    const t=await r.text();const out=[];const re=/##\s*\[\d+\]\s*([^\n]+)\n\s*(?:URL Source|URL):\s*(https?:\/\/\S+)/gi;let m;
    while((m=re.exec(t))&&out.length<6)out.push({title:m[1].trim(),url:m[2].trim()});
    return out;
  }catch(e){return[];}
}
async function bingSearch(q){
  try{
    const r=await fetch('https://www.bing.com/search?q='+encodeURIComponent(q),{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36','Accept-Language':'ru-RU,ru;q=0.9'}});
    const h=await r.text();const out=[];const re=/<li class="b_algo"[\s\S]*?<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;let m;
    while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(t&&m[1].indexOf('bing.com')===-1&&m[1].indexOf('microsoft.com')===-1)out.push({title:t,url:m[1]});}
    return out;
  }catch(e){return[];}
}
async function searchAll(q,p){
  let r=await ddgSearch(q,p);if(!r.length)r=await ddgHtmlSearch(q,p);if(!r.length)r=await jinaSearch(q);if(!r.length)r=await bingSearch(q);return r;
}
async function readPage(url){
  try{const x=new URL(url);}catch(e){return null;}
  try{
    const r=await fetch('https://r.jina.ai/'+url,{headers:{'User-Agent':'Mozilla/5.0'}});
    let t=await r.text();t=t.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[#>*`_]/g,'').replace(/\n{3,}/g,'\n\n');
    if(t.length>300)return t.slice(0,20000);
  }catch(e){}
  try{
    const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});let h=await r.text();
    h=h.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'');
    const parts=h.match(/<(p|h1|h2|h3|li)[^>]*>([\s\S]*?)<\/(p|h1|h2|h3|li)>/gi)||[];
    const t=parts.map(p=>strip(p)).filter(x=>x.length>40).join('\n\n');
    return t.slice(0,20000)||null;
  }catch(e){return null;}
}
function splitPages(t){const pages=[];let cur='';t.split(/\n+/).forEach(p=>{if((cur+p).length>1200&&cur){pages.push(cur.trim());cur='';}cur+=p+'\n';});if(cur.trim())pages.push(cur.trim());return pages.length?pages:[t];}
async function wikiImages(q){
  try{
    const r=await fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch='+encodeURIComponent('filetype:bitmap '+q)+'&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=480');
    const j=await r.json();const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];
    pages.sort((a,b)=>(a.index||0)-(b.index||0));
    return pages.map(p=>p.imageinfo&&p.imageinfo[0]?{thumb:p.imageinfo[0].thumburl}:null).filter(Boolean);
  }catch(e){return[];}
}

// ---------- карточки ----------
function card(t,i){return '<div class="card"><h1>'+t+'</h1>'+i+'</div>';}
function searchHtml(q,res){
  const rows=res.map((r,i)=>{let dom='';try{dom=new URL(r.url).hostname;}catch(e){}
    return '<div class="row"><span class="num">'+(i+1)+'</span><div><div class="t">'+r.title+'</div><div class="d">'+dom+'</div></div></div>';}).join('');
  return card('Поиск: '+q,rows+'<div class="hint">«открой 1…6», «покажи ещё», «зачитай»</div>');
}
function readerHtml(){return card(reader.title,'<div class="text">'+reader.pages[reader.idx].replace(/\n/g,'<br>')+'</div><div class="hint">Стр. '+(reader.idx+1)+' из '+reader.pages.length+' — «дальше», «назад», «зачитай»</div>');}
function imagesHtml(q,imgs){return card('Фото: '+q,'<div class="grid">'+imgs.map(i=>'<img src="'+i.thumb+'" alt="">').join('')+'</div>');}
function clockHtml(){const d=now();return card('Сейчас','<div class="big">'+fmtClock(d)+'</div><div class="sub">'+fmtDate(d)+', '+fmtDay(d)+'</div>');}
function worldHtml(){
  const z=[['Москва','Europe/Moscow'],['Нью-Йорк','America/New_York'],['Лондон','Europe/London'],['Токио','Asia/Tokyo'],['Дубай','Asia/Dubai']];
  return card('Время в мире',z.map(x=>'<div class="row"><span class="t">'+x[0]+'</span><span class="big2">'+now().toLocaleTimeString('ru-RU',{timeZone:x[1],hour:'2-digit',minute:'2-digit'})+'</span></div>').join(''));
}
function timerHtml(e,l,s){return card(l,'<div class="big" data-ends="'+e+'" data-speakend="'+(s||'')+'">--:--</div>');}
function remindersHtml(){
  if(!reminders.length)return card('Напоминания','<div class="sub">Пусто. Скажи: «напомни через 5 минут …»</div>');
  return card('Напоминания',reminders.map((r,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t">'+r.text+' — в '+new Date(r.endsAt).toLocaleTimeString('ru-RU',{timeZone:TZ,hour:'2-digit',minute:'2-digit'})+'</div></div>').join(''));
}
function pomoHtml(){return timerHtml(pomo.endsAt,pomo.phase==='work'?'Помодоро: РАБОТА ('+pomo.round+'/4)':'Помодоро: перерыв',pomo.phase==='work'?'Перерыв! Пять минут отдыха.':'Отдых окончен, за работу!');}
function tasksHtml(list){
  if(!list.length)return card('Задачи','<div class="sub">Пусто. Скажи: «добавь задачу …»</div>');
  return card('Задачи',list.map((t,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t'+(t.done?' done':'')+'">'+(t.star?'★ ':'')+t.text+(t.done?' ✔':'')+'</div></div>').join(''));
}
function listsHtml(){
  const keys=Object.keys(db.lists);
  if(!keys.length)return card('Списки','<div class="sub">Пусто. Скажи: «создай список покупки»</div>');
  return card('Списки',keys.map(k=>'<div class="sub" style="text-align:left;margin:12px 0 4px">📋 '+k+' ('+db.lists[k].filter(x=>!x.done).length+'/'+db.lists[k].length+')</div>'+db.lists[k].map((it,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t'+(it.done?' done':'')+'">'+it.text+'</div></div>').join('')).join(''));
}
function notesHtml(list){
  if(!list.length)return card('Заметки','<div class="sub">Пусто. Скажи: «запиши …»</div>');
  return card('Заметки',list.map((n,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t">'+n+'</div></div>').join(''));
}
function helpHtml(){
  return card('Команды (версия 2)','<div class="text">ПОИСК: найди … / найди фото … / открой N / дальше / назад / назад к списку / покажи ещё / зачитай / стоп чтение<br>ВРЕМЯ: который час / какое число / день недели / выходной / неделя года / время в мире / сколько дней до … / сколько осталось до … / сколько дней прошло с … / сколько до нового года<br>ТАЙМЕРЫ: таймер N минут / останови таймер / сколько осталось / напомни через N … / покажи напоминания / отмени напоминание N / помодоро / стоп помодоро / секундомер<br>ЗАДАЧИ: добавь задачу … / покажи задачи / выполни N / удали задачу N / очисти выполненные / сколько задач / важная N / покажи важные / зачитай задачи<br>СПИСКИ: создай список … / добавь в …: … / покажи все списки / покажи СПИСОК / вычеркни N из … / удали N из … / очисти список … / сколько позиций в … / удали список … / зачитай СПИСОК<br>ЗАМЕТКИ: запиши … / покажи заметки / удали заметку N / очисти заметки / зачитай заметки / найди в заметках …</div>');
}

// ---------- маршрутизатор ----------
function route(cmd){
  if(/привет|здравствуй|добрый (день|вечер|утро)/.test(cmd))return{html:card('Привет!','<div class="sub">Я на связи. «помощь» — все команды.</div>'),reply:'Привет! Я на связи.'};
  if(/помощь|что ты умеешь/.test(cmd))return{html:helpHtml(),reply:'Список команд на экране.'};

  if(/который час|сколько времени|время сейчас/.test(cmd))return{html:clockHtml(),reply:'Сейчас '+fmtClock(now())+'.'};
  if(/какое число|какая дата/.test(cmd))return{html:clockHtml(),reply:'Сегодня '+fmtDate(now())+'.'};
  if(/день недели/.test(cmd))return{html:clockHtml(),reply:'Сегодня '+fmtDay(now())+'.'};
  if(/выходной/.test(cmd)){const w=now().getDay();return{html:clockHtml(),reply:(w===0||w===6)?'Да, сегодня выходной.':'Нет, сегодня будний день.'};}
  if(/неделя года/.test(cmd))return{html:clockHtml(),reply:'Сейчас '+isoWeek(now())+'-я неделя года.'};
  if(/до нового года/.test(cmd)){const d=daysDiff(now(),new Date(now().getFullYear()+1,0,1));return{html:card('До Нового года 🎄','<div class="big">'+d+'</div><div class="sub">дней</div>'),reply:'До Нового года '+d+' дней.'};}
  if(/время в мире/.test(cmd))return{html:worldHtml(),reply:'Мировое время на экране.'};
  if(/сколько/.test(cmd)&&/прошло/.test(cmd)){
    const dt=parseDateRu(cmd);if(!dt)return{reply:'Назови дату, например: сколько дней прошло с 1 мая.'};
    const d=daysDiff(dt,now());if(d<0)return{reply:'Эта дата ещё впереди.'};
    return{html:card('Прошло','<div class="big">'+d+'</div><div class="sub">дней</div>'),reply:'Прошло '+d+' дней.'};
  }
  if(/сколько/.test(cmd)&&/до/.test(cmd)){
    const dt=parseDateRu(cmd);if(!dt)return{reply:'Назови дату, например: сколько дней осталось до 15 августа.'};
    const d=daysDiff(now(),dt);if(d<0)return{reply:'Эта дата уже прошла, '+(-d)+' дней назад.'};
    return{html:card('Отсчёт','<div class="big">'+d+'</div><div class="sub">дней до '+dt.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})+'</div>'),reply:'Осталось '+d+' дней.'};
  }
  if(/какое число будет через/.test(cmd)){
    const n=firstNum(cmd);if(!n)return{reply:'Скажи, через сколько дней.'};
    return{reply:'Через '+n+' дней будет '+new Date(now().getTime()+n*86400000).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})+'.'};
  }

  if(/останови таймер|стоп таймер/.test(cmd)){timer=null;return{html:card('Таймер','<div class="sub">Остановлен.</div>'),reply:'Таймер остановлен.'};}
  if(/сколько осталось/.test(cmd)){
    if(!timer)return{reply:'Таймер не запущен.'};
    const s=Math.max(0,Math.round((timer.endsAt-Date.now())/1000));
    return{reply:'Осталось '+Math.floor(s/60)+' минут '+(s%60)+' секунд.'};
  }
  if(/^таймер|запусти таймер|таймер на/.test(cmd)){
    const ms=parseDur(cmd);if(!ms)return{reply:'Скажи, например: таймер 5 минут.'};
    timer={endsAt:Date.now()+ms};
    return{html:timerHtml(timer.endsAt,'Таймер','Таймер завершён!'),reply:'Таймер запущен.'};
  }
  if(/напомни/.test(cmd)){
    const ms=parseDur(cmd);if(!ms)return{reply:'Скажи, например: напомни через 10 минут позвонить маме.'};
    const text=cmd.replace(/.*напомни/,'').replace(/через\s*\d+\s*(секунд|сек|минут|мин|час[аов]?)/,'').trim()||'Напоминание';
    const r={id:reminderId++,endsAt:Date.now()+ms,text};reminders.push(r);
    setTimeout(()=>{reminders=reminders.filter(x=>x.id!==r.id);send({html:card('⏰ Напоминание','<div class="big2">'+r.text+'</div>'),speak:'Напоминаю: '+r.text});},ms);
    return{html:remindersHtml(),reply:'Хорошо, напомню.'};
  }
  if(/покажи напоминания/.test(cmd))return{html:remindersHtml(),reply:'Напоминания на экране.'};
  if(/отмени напоминание/.test(cmd)){
    const n=firstNum(cmd);if(n&&reminders[n-1]){const t=reminders[n-1].text;reminders.splice(n-1,1);return{html:remindersHtml(),reply:'Отменила: '+t};}
    return{reply:'Не нашла такое напоминание.'};
  }
  if(/стоп помодоро|останови помодоро/.test(cmd)){if(pomo){clearTimeout(pomo.t);pomo=null;}return{html:card('Помодоро','<div class="sub">Остановлено.</div>'),reply:'Помодоро остановлен.'};}
  if(/помодоро/.test(cmd)){if(pomo)clearTimeout(pomo.t);pomo={phase:'work',round:1};startPomoPhase(25*60000);return{html:pomoHtml(),reply:'Помодоро начат: 25 минут работы.'};}
  if(/секундомер/.test(cmd)){
    if(!stopwatch||!stopwatch.running){stopwatch={startAt:Date.now(),acc:(stopwatch&&!stopwatch.running)?stopwatch.acc:0,running:true};return{html:card('Секундомер','<div class="big">▶ 00:00</div>'),reply:'Секундомер запущен.'};}
    const ms=stopwatch.acc+(Date.now()-stopwatch.startAt);stopwatch={acc:ms,running:false};const s=Math.round(ms/1000);
    return{html:card('Секундомер','<div class="big">⏸ '+Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)+'</div>'),reply:'Время: '+Math.floor(s/60)+' минут '+(s%60)+' секунд.'};
  }

  // задачи
  if(/добавь задачу/.test(cmd)){
    const t=cmd.replace(/.*добавь задачу/,'').trim();if(!t)return{reply:'Какую задачу добавить?'};
    db.tasks.push({text:t,done:false,star:false});saveDb();
    return{html:tasksHtml(db.tasks),reply:'Задача добавлена: '+t};
  }
  if(/покажи важные/.test(cmd))return{html:tasksHtml(db.tasks.filter(t=>t.star)),reply:'Важные задачи на экране.'};
  if(/покажи задачи|план на сегодня/.test(cmd))return{html:tasksHtml(db.tasks),reply:'Задачи на экране.'};
  if(/выполни/.test(cmd)){
    const n=firstNum(cmd);if(n&&db.tasks[n-1]){db.tasks[n-1].done=true;saveDb();return{html:tasksHtml(db.tasks),reply:'Готово: '+db.tasks[n-1].text};}
    return{reply:'Не нашла такую задачу.'};
  }
  if(/удали задачу/.test(cmd)){
    const n=firstNum(cmd);if(n&&db.tasks[n-1]){const t=db.tasks[n-1].text;db.tasks.splice(n-1,1);saveDb();return{html:tasksHtml(db.tasks),reply:'Удалила: '+t};}
    return{reply:'Не нашла такую задачу.'};
  }
  if(/очисти выполненные/.test(cmd)){db.tasks=db.tasks.filter(t=>!t.done);saveDb();return{html:tasksHtml(db.tasks),reply:'Выполненные удалены.'};}
  if(/сколько задач/.test(cmd)){const a=db.tasks.filter(t=>!t.done).length;return{reply:'Активных задач: '+a+'.'};}
  if(/важная/.test(cmd)){
    const n=firstNum(cmd);if(n&&db.tasks[n-1]){db.tasks[n-1].star=!db.tasks[n-1].star;saveDb();return{html:tasksHtml(db.tasks),reply:'Отметила важной.'};}
    return{reply:'Какую задачу отметить?'};
  }
  if(/зачитай задачи/.test(cmd)){
    if(!db.tasks.length)return{reply:'Задач нет.'};
    return{speakOnly:db.tasks.map((t,i)=>(i+1)+'. '+t.text+(t.done?' (выполнено)':'')).join('. '),reply:'Зачитываю задачи.'};
  }

  // списки
  if(/создай список/.test(cmd)){
    const n=cmd.replace(/.*создай список/,'').trim();if(!n)return{reply:'Как назвать список?'};
    db.lists[n]=db.lists[n]||[];saveDb();
    return{html:listsHtml(),reply:'Список «'+n+'» создан.'};
  }
  if(/добавь в /.test(cmd)){
    let rest=cmd.replace(/.*добавь в /,'');let name=null,itemsStr='';
    if(rest.includes(':')){name=rest.split(':')[0].trim();itemsStr=rest.split(':').slice(1).join(':');}
    else{for(const k in db.lists){if(rest.startsWith(k)){name=k;itemsStr=rest.slice(k.length);break;}}if(!name){name=rest;itemsStr='';}}
    if(!name)return{reply:'В какой список добавить?'};
    if(!itemsStr.trim())return{reply:'Что добавить в «'+name+'»?'};
    db.lists[name]=db.lists[name]||[];
    itemsStr.split(/,| и /).forEach(x=>{x=x.trim();if(x)db.lists[name].push({text:x,done:false});});
    saveDb();
    return{html:listsHtml(),reply:'Добавила в «'+name+'».'};
  }
  if(/покажи все списки/.test(cmd))return{html:listsHtml(),reply:'Все списки на экране.'};
  if(/вычеркни/.test(cmd)){
    const n=firstNum(cmd);const k=findList(cmd);
    if(k&&n&&db.lists[k][n-1]){db.lists[k][n-1].done=true;saveDb();return{html:listsHtml(),reply:'Вычеркнула: '+db.lists[k][n-1].text};}
    return{reply:'Не нашла позицию.'};
  }
  if(/удали \d+ из/.test(cmd)){
    const n=firstNum(cmd);const k=findList(cmd);
    if(k&&n&&db.lists[k][n-1]){const t=db.lists[k][n-1].text;db.lists[k].splice(n-1,1);saveDb();return{html:listsHtml(),reply:'Удалила: '+t};}
    return{reply:'Не нашла позицию.'};
  }
  if(/очисти список/.test(cmd)){
    const k=findList(cmd);if(k){db.lists[k]=[];saveDb();return{html:listsHtml(),reply:'Список «'+k+'» очищен.'};}
    return{reply:'Какой список очистить?'};
  }
  if(/сколько позиций в/.test(cmd)){
    const k=findList(cmd);if(k){const a=db.lists[k].filter(x=>!x.done).length;return{reply:'В списке «'+k+'» осталось позиций: '+a+'.'};}
    return{reply:'В каком списке?'};
  }
  if(/удали список/.test(cmd)){
    const n=cmd.replace(/.*удали список/,'').trim();
    if(db.lists[n]){delete db.lists[n];saveDb();return{html:listsHtml(),reply:'Список удалён.'};}
    return{reply:'Не нашла такой список.'};
  }
  if(/зачитай список|зачитай покупки|зачитай /.test(cmd)){
    const k=findList(cmd);
    if(k&&db.lists[k].length)return{speakOnly:k+': '+db.lists[k].map((x,i)=>(i+1)+'. '+x.text).join('. '),reply:'Зачитываю список '+k+'.'};
    return{reply:'Какой список зачитать?'};
  }
  if(/покажи /.test(cmd)){
    const k=findList(cmd);if(k)return{html:listsHtml(),reply:'Список «'+k+'» на экране.'};
  }

  // заметки
  if(/запиши/.test(cmd)){
    const t=cmd.replace(/.*запиши/,'').trim();if(!t)return{reply:'Что записать?'};
    db.notes.push(t);saveDb();
    return{html:notesHtml(db.notes),reply:'Записала: '+t};
  }
  if(/покажи заметки/.test(cmd))return{html:notesHtml(db.notes),reply:'Заметки на экране.'};
  if(/удали заметку/.test(cmd)){
    const n=firstNum(cmd);if(n&&db.notes[n-1]){const t=db.notes[n-1];db.notes.splice(n-1,1);saveDb();return{html:notesHtml(db.notes),reply:'Удалила заметку.'};}
    return{reply:'Не нашла заметку.'};
  }
  if(/очисти заметки/.test(cmd)){db.notes=[];saveDb();return{html:notesHtml(db.notes),reply:'Заметки очищены.'};}
  if(/найди в заметках/.test(cmd)){
    const q=cmd.replace(/.*найди в заметках/,'').trim();
    const f=db.notes.filter(n=>n.includes(q));
    return{html:notesHtml(f),reply:f.length?'Нашла '+f.length+' заметок.':'Не нашла в заметках.'};
  }
  if(/зачитай заметки/.test(cmd)){
    if(!db.notes.length)return{reply:'Заметок нет.'};
    return{speakOnly:db.notes.join('. '),reply:'Зачитываю заметки.'};
  }

  // браузер
  if(/найди фото/.test(cmd)){
    const q=cmd.replace(/.*найди фото/,'').trim()||'кот';
    return{async:true,run:async()=>{
      const imgs=await wikiImages(q);if(!imgs.length)return{reply:'Не нашла фото.'};
      return{html:imagesHtml(q,imgs),reply:'Фото на экране.'};
    }};
  }
  if(/^найди|поищи|поиск/.test(cmd)){
    const q=cmd.replace(/^(найди|поищи|поиск)/,'').trim();if(!q)return{reply:'Что найти?'};
    return{async:true,run:async()=>{
      const results=await searchAll(q,0);if(!results.length)return{reply:'Не нашла результатов.'};
      lastSearch={query:q,page:0,results};
      return{html:searchHtml(q,results),reply:'Нашла. Результаты на экране.'};
    }};
  }
  if(/покажи ещё/.test(cmd)){
    if(!lastSearch)return{reply:'Сначала что-нибудь найди.'};
    return{async:true,run:async()=>{
      const p=lastSearch.page+1;const results=await searchAll(lastSearch.query,p);
      if(!results.length)return{reply:'Больше результатов нет.'};
      lastSearch.page=p;lastSearch.results=results;
      return{html:searchHtml(lastSearch.query,results),reply:'Следующая страница.'};
    }};
  }
  if(/открой сайт/.test(cmd)){
    const name=cmd.replace(/.*открой сайт/,'').trim().replace(/\s+/g,'');
    return{async:true,run:async()=>{
      let url=null;
      if(/\./.test(name))url='https://'+name;
      else{const r=await searchAll(name+' официальный сайт',0);if(r.length)url=r[0].url;}
      if(!url)return{reply:'Не нашла такой сайт.'};
      const text=await readPage(url);if(!text)return{reply:'Не смогла открыть сайт.'};
      reader={title:name,pages:splitPages(text),idx:0};
      return{html:readerHtml(),reply:'Открыла сайт в режиме чтения.'};
    }};
  }
  if(/^открой/.test(cmd)){
    const map={перв:1,втор:2,треть:3,четверт:4,пят:5,шест:6};let n=firstNum(cmd);
    if(!n){for(const k in map)if(cmd.indexOf(k)!==-1){n=map[k];break;}}
    if(!lastSearch||!n||!lastSearch.results[n-1])return{reply:'Сначала скажи «найди …», потом «открой номер».'};
    const r=lastSearch.results[n-1];
    return{async:true,run:async()=>{
      const text=await readPage(r.url);if(!text)return{reply:'Не смогла открыть страницу.'};
      reader={title:r.title,pages:splitPages(text),idx:0};
      return{html:readerHtml(),reply:'Открыла. Текст на экране.'};
    }};
  }
  if(/^дальше|^далее/.test(cmd)){
    if(!reader)return{reply:'Сначала открой что-нибудь: «открой 1».'};
    if(reader.idx<reader.pages.length-1){reader.idx++;return{html:readerHtml(),reply:'Следующая часть.'};}
    return{reply:'Это конец текста.'};
  }
  if(/назад к списку/.test(cmd)){
    if(!lastSearch)return{reply:'Списка нет.'};
    return{html:searchHtml(lastSearch.query,lastSearch.results),reply:'Список на экране.'};
  }
  if(/^назад/.test(cmd)){
    if(!reader)return{reply:'Нечего листать.'};
    if(reader.idx>0){reader.idx--;return{html:readerHtml(),reply:'Предыдущая часть.'};}
    return{reply:'Это начало.'};
  }
  if(/^зачитай|прочитай вслух|озвучь/.test(cmd)){
    let t=null;
    if(reader)t=reader.pages[reader.idx];
    else if(lastSearch)t=lastSearch.results.map((r,i)=>(i+1)+'. '+r.title).join('. ');
    if(!t)return{reply:'Нечего зачитывать.'};
    return{speakOnly:t.slice(0,1000),reply:'Зачитываю.'};
  }
  if(/стоп чтение|хватит читать|замолчи/.test(cmd))return{stopSpeak:true,reply:'Остановилась.'};

  return{html:card('Не поняла','<div class="sub">Команда: «'+cmd+'». Скажи «помощь».</div>'),reply:'Я пока не знаю такую команду. Скажи «помощь».'};
}
function findList(cmd){for(const k in db.lists)if(cmd.indexOf(k)!==-1)return k;return null;}

function startPomoPhase(ms){
  pomo.endsAt=Date.now()+ms;
  pomo.t=setTimeout(()=>{
    if(!pomo)return;
    if(pomo.phase==='work'){
      const long=pomo.round>=4;pomo.phase='rest';startPomoPhase(long?15*60000:5*60000);
      send({html:pomoHtml(),speak:long?'Большой перерыв, 15 минут!':'Перерыв, 5 минут.'});
    }else{
      if(pomo.round>=4){pomo=null;send({html:card('Помодоро','<div class="sub">Цикл завершён! 🎉</div>'),speak:'Помодоро завершён!'});return;}
      pomo.round++;pomo.phase='work';startPomoPhase(25*60000);
      send({html:pomoHtml(),speak:'Отдых окончен, за работу!'});
    }
  },ms);
}

// ---------- HTTP ----------
app.get('/events',(req,res)=>{
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
  if(lastView)res.write('data: '+JSON.stringify(lastView)+'\n\n');
  clients.add(res);req.on('close',()=>clients.delete(res));
});
app.get('/alice',(req,res)=>res.json({status:'ok',text:'Сервер Алисы работает'}));
app.head('/alice',(req,res)=>res.status(200).end());
app.post('/alice',async(req,res)=>{
  const body=req.body||{};
  const cmd=((body.request&&body.request.command)||'').toLowerCase().replace(/ё/g,'е').replace(/[.,!?;:"]/g,' ').trim();
  let out;
  try{out=route(cmd);}catch(e){out={reply:'Ошибка: '+e.message};}
  try{if(out&&out.async)out=await out.run();}catch(e){out={reply:'Не получилось: '+e.message};}
  if(out){
    const p={};
    if(out.html)p.html=out.html;
    if(out.speakOnly)p.speak=out.speakOnly;
    if(out.stopSpeak)p.stopSpeak=true;
    if(Object.keys(p).length)send(p);
  }
  res.json({version:'1.0',session:body.session||{},response:{text:(out&&out.reply)||'Готово.',end_session:false}});
});
app.get('/',(req,res)=>{
  res.send('<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Панель Алисы</title><style>'+
    'body{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;text-align:center;padding:30px}'+
    '.card{display:inline-block;background:#1e293b;padding:30px 50px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.4);max-width:900px;text-align:left}'+
    'h1{color:#7dd3fc;margin-top:0;font-size:26px}.big{font-size:64px;color:#fbbf24;text-align:center;margin:10px 0}'+
    '.big2{font-size:28px;color:#fbbf24}.sub{color:#94a3b8;font-size:18px;text-align:center}'+
    '.row{display:flex;gap:12px;align-items:center;margin:10px 0}.num{background:#334155;border-radius:8px;padding:4px 10px;font-size:20px;color:#7dd3fc}'+
    '.t{font-size:20px}.done{text-decoration:line-through;opacity:.5}.d{color:#64748b;font-size:14px}.hint{color:#64748b;margin-top:16px;font-size:15px}'+
    '.text{font-size:20px;line-height:1.6;max-height:60vh;overflow:auto}'+
    '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.grid img{width:100%;border-radius:8px}'+
    '</style></head><body><div id="box"><div class="card"><h1>Панель Алисы</h1><div class="sub">Жду команду…</div></div></div><script>'+
    'var box=document.getElementById("box");var tick=null;'+
    'function speak(t){try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang="ru-RU";speechSynthesis.speak(u);}catch(e){}}'+
    'function fmt(ms){var s=Math.ceil(ms/1000);var h=Math.floor(s/3600);var m=Math.floor(s%3600/60);var ss=s%60;function p(n){return(n<10?"0":"")+n}return h>0?p(h)+":"+p(m)+":"+p(ss):p(m)+":"+p(ss)}'+
    'function startTicks(){if(tick)clearInterval(tick);tick=setInterval(function(){var els=document.querySelectorAll("[data-ends]");for(var i=0;i<els.length;i++){var el=els[i];var ms=+el.getAttribute("data-ends")-Date.now();if(ms<=0){el.textContent="00:00";var se=el.getAttribute("data-speakend");if(se&&!el.getAttribute("data-done")){el.setAttribute("data-done","1");speak(se);}}else{el.textContent=fmt(ms);}}},500);startTicks();}'+
    'var es=new EventSource("/events");es.onmessage=function(e){var d=JSON.parse(e.data);if(d.speak)speak(d.speak);if(d.stopSpeak){try{speechSynthesis.cancel()}catch(e){}}if(d.html){box.innerHTML=d.html;startTicks();}};'+
    '</script></body></html>');
});

loadDb();
app.listen(process.env.PORT||3000,()=>console.log('Сервер запущен в облаке!'));
