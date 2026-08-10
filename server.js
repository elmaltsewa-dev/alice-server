const express = require('express');
const app = express();
app.use(express.json());

const TZ = 'Europe/Moscow';
const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_REPO = process.env.GH_REPO || 'elmaltsewa-dev/alice-server';
const clients = new Set();

let lastView = null, lastSearch = null, reader = null, timer = null;
let reminders = [], reminderId = 1, pomo = null, stopwatch = null;
let lastFun = 'joke', lastRiddle = null;
let db = { tasks: [], lists: {}, notes: [], city: 'Москва' };
let dbSha = null;

function send(p) { lastView = p; const d = 'data: ' + JSON.stringify(p) + '\n\n'; clients.forEach(c => c.write(d)); }

// ---------- память ----------
async function loadDb() {
  if (!GH_TOKEN) return;
  try {
    const r = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/data.json', { headers: { Authorization: 'Bearer ' + GH_TOKEN, 'User-Agent': 'alice', Accept: 'application/vnd.github+json' } });
    if (r.status === 200) { const j = await r.json(); dbSha = j.sha; const d = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')); db = Object.assign({ tasks: [], lists: {}, notes: [], city: 'Москва' }, d); }
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
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function fmtClock(d){return d.toLocaleTimeString('ru-RU',{timeZone:TZ,hour:'2-digit',minute:'2-digit'});}
function fmtDate(d){return d.toLocaleDateString('ru-RU',{timeZone:TZ,day:'numeric',month:'long',year:'numeric'});}
function fmtDay(d){return d.toLocaleDateString('ru-RU',{timeZone:TZ,weekday:'long'});}
function isoWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil((((x-y)/86400000)+1)/7);}
const NUMWORDS=[['одиннадцать',11],['двенадцать',12],['тринадцать',13],['четырнадцать',14],['пятнадцать',15],['шестнадцать',16],['семнадцать',17],['восемнадцать',18],['девятнадцать',19],['двадцать',20],['тридцать',30],['сорок',40],['пятьдесят',50],['один',1],['два',2],['три',3],['четыре',4],['пять',5],['шесть',6],['семь',7],['восемь',8],['девять',9],['десять',10]];
function numify(s){let r=' '+s+' ';NUMWORDS.forEach(p=>{r=r.split(' '+p[0]+' ').join(' '+p[1]+' ');});return r;}
function firstNum(s){const m=numify(s).match(/(\d+)/);return m?parseInt(m[1]):null;}
function allNums(s){return (numify(s).match(/\d+/g)||[]).map(Number);}
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
function moonPhase(){const syn=29.53058867;const known=Date.UTC(2000,0,6,18,14);const days=(Date.now()-known)/86400000;const ph=((days%syn)+syn)%syn;const i=Math.floor(ph/syn*8+0.5)%8;return ['🌑 новолуние','🌒 растущий серп','🌓 первая четверть','🌔 растущая луна','🌕 полнолуние','🌖 убывающая луна','🌗 последняя четверть','🌘 убывающий серп'][i];}

// ---------- внешние API ----------
async function geoCity(n){try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(n)+'&count=1&language=ru&format=json');const j=await r.json();return j.results&&j.results[0]?j.results[0]:null;}catch(e){return null;}}
async function weatherFor(lat,lon){const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7');return await r.json();}
const WMO={0:'ясно',1:'в основном ясно',2:'переменная облачность',3:'пасмурно',45:'туман',48:'туман',51:'морось',53:'морось',55:'морось',61:'небольшой дождь',63:'дождь',65:'сильный дождь',71:'небольшой снег',73:'снег',75:'сильный снег',80:'ливень',81:'ливень',82:'сильный ливень',85:'снегопад',86:'снегопад',95:'гроза',96:'гроза',99:'гроза'};
function wmo(c){return WMO[c]||('код '+c);}
function isRain(c){return (c>=51&&c<=67)||(c>=80&&c<=82)||(c>=95&&c<=99);}
async function cbr(){try{const r=await fetch('https://www.cbr-xml-daily.ru/daily_json.js');return await r.json();}catch(e){return null;}}
async function crypto(ids){try{const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids='+ids+'&vs_currencies=usd');return await r.json();}catch(e){return null;}}
async function translate(t,dir){try{const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(t)+'&langpair='+dir);const j=await r.json();return j.responseData?j.responseData.translatedText:null;}catch(e){return null;}}
async function wikiSummary(q){
  try{
    const s=await fetch('https://ru.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=1&format=json&origin=*');
    const a=await s.json();const title=a[1]&&a[1][0];if(!title)return null;
    const r=await fetch('https://ru.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(title));
    const j=await r.json();return j.extract?{title:j.title,text:j.extract}:null;
  }catch(e){return null;}
}
async function onThisDay(){
  try{
    const d=now();const mm=('0'+(d.getMonth()+1)).slice(-2),dd=('0'+d.getDate()).slice(-2);
    const r=await fetch('https://ru.wikipedia.org/api/rest_v1/feed/onthisday/events/'+mm+'/'+dd);
    const j=await r.json();const ev=(j.events||[]).filter(e=>e.text&&e.year);
    const sel=[];while(sel.length<3&&ev.length)sel.push(ev.splice(Math.floor(Math.random()*ev.length),1)[0]);
    return sel;
  }catch(e){return[];}
}
function calcExpr(s){
  let t=s.replace(/плюс/g,'+').replace(/минус/g,'-').replace(/умножить/g,'*').replace(/разделить/g,'/').replace(/[хx×]/g,'*').replace(/[:]/g,'/').replace(/,/g,'.').replace(/[^0-9.+\-*/() ]/g,'');
  if(!t.trim()||!/\d/.test(t))return null;
  try{const v=Function('"use strict";return ('+t+')')();return (typeof v==='number'&&isFinite(v))?Math.round(v*100)/100:null;}catch(e){return null;}
}

// ---------- поиск и чтение ----------
async function ddgSearch(q,p){try{const r=await fetch('https://lite.duckduckgo.com/lite/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0'}});const h=await r.text();const out=[];const re=/<a[^>]+rel="nofollow"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;let m;while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(m[1].startsWith('http')&&t&&m[1].indexOf('duckduckgo')===-1)out.push({title:t,url:m[1]});}return out;}catch(e){return[];}}
async function ddgHtmlSearch(q,p){try{const r=await fetch('https://html.duckduckgo.com/html/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}});const h=await r.text();const out=[];const re=/<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;let m;while((m=re.exec(h))&&out.length<6){let href=m[1];if(href.indexOf('uddg=')!==-1){try{href=decodeURIComponent(href.split('uddg=')[1].split('&')[0]);}catch(e){}}const t=strip(m[2]).trim();if(href.startsWith('http')&&t)out.push({title:t,url:href});}return out;}catch(e){return[];}}
async function jinaSearch(q){try{const r=await fetch('https://s.jina.ai/'+encodeURIComponent(q),{headers:{'User-Agent':'Mozilla/5.0'}});const t=await r.text();const out=[];const re=/##\s*\[\d+\]\s*([^\n]+)\n\s*(?:URL Source|URL):\s*(https?:\/\/\S+)/gi;let m;while((m=re.exec(t))&&out.length<6)out.push({title:m[1].trim(),url:m[2].trim()});return out;}catch(e){return[];}}
async function bingSearch(q){try{const r=await fetch('https://www.bing.com/search?q='+encodeURIComponent(q),{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36','Accept-Language':'ru-RU,ru;q=0.9'}});const h=await r.text();const out=[];const re=/<li class="b_algo"[\s\S]*?<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;let m;while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(t&&m[1].indexOf('bing.com')===-1&&m[1].indexOf('microsoft.com')===-1)out.push({title:t,url:m[1]});}return out;}catch(e){return[];}}
async function searchAll(q,p){let r=await ddgSearch(q,p);if(!r.length)r=await ddgHtmlSearch(q,p);if(!r.length)r=await jinaSearch(q);if(!r.length)r=await bingSearch(q);return r;}
async function readPage(url){
  try{new URL(url);}catch(e){return null;}
  try{const r=await fetch('https://r.jina.ai/'+url,{headers:{'User-Agent':'Mozilla/5.0'}});let t=await r.text();t=t.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[#>*`_]/g,'').replace(/\n{3,}/g,'\n\n');if(t.length>300)return t.slice(0,20000);}catch(e){}
  try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});let h=await r.text();h=h.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'');const parts=h.match(/<(p|h1|h2|h3|li)[^>]*>([\s\S]*?)<\/(p|h1|h2|h3|li)>/gi)||[];const t=parts.map(p=>strip(p)).filter(x=>x.length>40).join('\n\n');return t.slice(0,20000)||null;}catch(e){return null;}
}
function splitPages(t){const pages=[];let cur='';t.split(/\n+/).forEach(p=>{if((cur+p).length>1200&&cur){pages.push(cur.trim());cur='';}cur+=p+'\n';});if(cur.trim())pages.push(cur.trim());return pages.length?pages:[t];}
async function wikiImages(q){try{const r=await fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch='+encodeURIComponent('filetype:bitmap '+q)+'&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=480');const j=await r.json();const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];pages.sort((a,b)=>(a.index||0)-(b.index||0));return pages.map(p=>p.imageinfo&&p.imageinfo[0]?{thumb:p.imageinfo[0].thumburl}:null).filter(Boolean);}catch(e){return[];}}

// ---------- базы знаний ----------
const JOKES=['Программист ставит на ночь два стакана: один с водой — если захочет пить, второй пустой — если не захочет.','— Почему программисты путают Хэллоуин и Рождество? — Потому что OCT 31 == DEC 25.','Жена посылает мужа-программиста в магазин: «Купи батон хлеба. Если будут яйца — возьми десяток». Муж возвращается с десятью батонами.','— Алло, это техподдержка? У меня в компьютере мышь завелась! — Скачайте кота.','Оптимист видит стакан наполовину полным, пессимист — наполовину пустым, программист — в два раза больше, чем нужно.','Заходит QA-инженер в бар. Заказывает пиво. Заказывает 0 кружек пива. Заказывает -1 кружку. Заказывает ящерицу. А потом заходит настоящий пользователь — и бар падает.','— Сколько программистов нужно, чтобы вкрутить лампочку? — Ни одного, это аппаратная проблема.','У программиста спрашивают: «Почему ты такой спокойный?» — «У меня всё в try-catch».','Два байта встречаются. Первый спрашивает: «Ты чего такой бледный?» — «Да приболел немного».','— Что говорит программист, когда тонет? — F1! F1!'];
const FACTS=['Осьминоги имеют три сердца и голубую кровь.','Мёд не портится тысячелетиями: в египетских гробницах находили съедобный мёд.','За один день молния может нагреть воздух до 30 000 °C — это в 5 раз горячее поверхности Солнца.','Сердце синего кита бьётся всего 2 раза в минуту.','В космосе пахнет жареным стейком и раскалённым металлом — так описывают астронавты.','Бананы — это ягоды, а клубника — нет.','У уток вода не скатывается с перьев из-за особой смазки, а не из-за формы пера.','Слоны — единственные животные, которые не умеют прыгать.','В теле человека больше бактерий, чем человеческих клеток.','Свет Солнца доходит до Земли за 8 минут 20 секунд.','Шахматная партия теоретически может длиться 11 797 ходов без взятия фигур.','Коалы спят до 22 часов в сутки.'];
const FACTS_SPACE=['Космос полностью бесшумен — звуку нечем передаваться.','Нейтронные звёзды вращаются до 600 раз в секунду.','На Венере день длиннее года.','В наблюдаемой Вселенной больше звёзд, чем песчинок на всех пляжах Земли.','Следы астронавтов на Луне останутся на миллионы лет — там нет ветра.'];
const FACTS_ANIMALS=['Муравьи никогда не спят.','Дельфины дают друг другу имена.','Сердце креветки находится в голове.','Тигры имеют полосатую кожу, а не только шерсть.','Вороны умеют узнавать человеческие лица и помнить обиды.'];
const COMPLIMENTS=['Ты разбираешься в вещах, которые большинству даже не снились.','С тобой любая задача становится проще.','Ты из тех людей, кто доводит дело до конца.','У тебя отличный вкус — хотя бы потому, что ты создал себе голосового помощника.','Ты сегодня выглядишь на все сто процентов заряда.','Твоя настойимость вызывает уважение.'];
const ADVICE=['Сделай сегодня одно маленькое дело, которое откладывал неделю.','Выпей стакан воды прямо сейчас.','Поставь телефон в другую комнату на один час.','Запиши три вещи, за которые ты благодарен сегодня.','Прогуляйся 15 минут без наушников.','Позвони тому, с кем давно не разговаривал.'];
const MOTIVATE=['Дорогу осилит идущий. Ты уже идёшь.','Большие дела начинаются с маленьких шагов. Ты свой уже сделал.','Не сравнивай себя с другими — сравнивай себя со вчерашним собой.','Ошибки — это просто данные для следующей попытки.','Ты уже справился со множеством вещей, которые раньше казались невозможными.'];
const RIDDLES=[{q:'Что можно увидеть с закрытыми глазами?',a:'Сон'},{q:'Висит груша — нельзя скушать. Что это?',a:'Лампочка'},{q:'Зимой и летом одним цветом. Что это?',a:'Ёлка'},{q:'Без рук, без ног, а в дверь стучит. Что это?',a:'Ветер'},{q:'Что принадлежит тебе, но другие пользуются этим чаще?',a:'Твоё имя'},{q:'Чем больше из неё берёшь, тем больше она становится. Что это?',a:'Яма'},{q:'Какой месяц короче всех?',a:'Май — три буквы'},{q:'Что стоит между окном и дверью?',a:'Буква «и»'}];
const MOVIES=[['Интерстеллар','космос, любовь и физика'],['Начало','сны внутри снов'],['Матрица','что реально?'],['Побег из Шоушенка','надежда и свобода'],['Игра в имитацию','как взломали Энигму'],['Марсианин','выживание на Марсе с юмором'],['Терминал','человек застрял в аэропорту'],['Искусственный разум','робот, который хотел любить']];
const DISHES=[['Паста карбонара','спагетти, бекон, яйцо, пармезан — 20 минут'],['Овощное рагу','кабачок, перец, морковь, томат — тушить 30 минут'],['Куриный суп','классика: курица, картофель, морковь, лук'],['Сырники','творог, яйцо, мука, сахар — 25 минут'],['Греческий салат','овощи, фета, оливки, масло'],['Плов','рис, морковь, мясо, специи — около часа'],['Оладьи','кефир, мука, яйцо — 20 минут'],['Шакшука','яйца в томатном соусе с перцем']];
const GIFTS=['Настольная игра для компании','Термокружка для поездок','Книга-бестселлер в твёрдом переплёте','Сертификат на впечатления','Плед крупной вязки','Умная колонка или лампа','Набор хорошего чая или кофе','Фотоальбом с вашими общими снимками'];

// ---------- карточки ----------
function card(t,i){return '<div class="card"><h1>'+t+'</h1>'+i+'</div>';}
function searchHtml(q,res){const rows=res.map((r,i)=>{let dom='';try{dom=new URL(r.url).hostname;}catch(e){}return '<div class="row"><span class="num">'+(i+1)+'</span><div><div class="t">'+r.title+'</div><div class="d">'+dom+'</div></div></div>';}).join('');return card('Поиск: '+q,rows+'<div class="hint">«открой 1…6», «покажи ещё», «зачитай»</div>');}
function readerHtml(){return card(reader.title,'<div class="text">'+reader.pages[reader.idx].replace(/\n/g,'<br>')+'</div><div class="hint">Стр. '+(reader.idx+1)+' из '+reader.pages.length+'</div>');}
function imagesHtml(q,imgs){return card('Фото: '+q,'<div class="grid">'+imgs.map(i=>'<img src="'+i.thumb+'" alt="">').join('')+'</div>');}
function clockHtml(){const d=now();return card('Сейчас','<div class="big">'+fmtClock(d)+'</div><div class="sub">'+fmtDate(d)+', '+fmtDay(d)+'</div>');}
function worldHtml(){const z=[['Москва','Europe/Moscow'],['Нью-Йорк','America/New_York'],['Лондон','Europe/London'],['Токио','Asia/Tokyo'],['Дубай','Asia/Dubai']];return card('Время в мире',z.map(x=>'<div class="row"><span class="t">'+x[0]+'</span><span class="big2">'+now().toLocaleTimeString('ru-RU',{timeZone:x[1],hour:'2-digit',minute:'2-digit'})+'</span></div>').join(''));}
function timerHtml(e,l,s){return card(l,'<div class="big" data-ends="'+e+'" data-speakend="'+(s||'')+'">--:--</div>');}
function remindersHtml(){if(!reminders.length)return card('Напоминания','<div class="sub">Пусто. Скажи: «напомни через 5 минут …»</div>');return card('Напоминания',reminders.map((r,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t">'+r.text+' — в '+new Date(r.endsAt).toLocaleTimeString('ru-RU',{timeZone:TZ,hour:'2-digit',minute:'2-digit'})+'</div></div>').join(''));}
function pomoHtml(){return timerHtml(pomo.endsAt,pomo.phase==='work'?'Помодоро: РАБОТА ('+pomo.round+'/4)':'Помодоро: перерыв',pomo.phase==='work'?'Перерыв! Пять минут отдыха.':'Отдых окончен, за работу!');}
function tasksHtml(list){if(!list.length)return card('Задачи','<div class="sub">Пусто. Скажи: «добавь задачу …»</div>');return card('Задачи',list.map((t,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t'+(t.done?' done':'')+'">'+(t.star?'★ ':'')+t.text+(t.done?' ✔':'')+'</div></div>').join(''));}
function listsHtml(){const keys=Object.keys(db.lists);if(!keys.length)return card('Списки','<div class="sub">Пусто. Скажи: «создай список покупки»</div>');return card('Списки',keys.map(k=>'<div class="sub" style="text-align:left;margin:12px 0 4px">📋 '+k+' ('+db.lists[k].filter(x=>!x.done).length+'/'+db.lists[k].length+')</div>'+db.lists[k].map((it,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t'+(it.done?' done':'')+'">'+it.text+'</div></div>').join('')).join(''));}
function notesHtml(list){if(!list.length)return card('Заметки','<div class="sub">Пусто. Скажи: «запиши …»</div>');return card('Заметки',list.map((n,i)=>'<div class="row"><span class="num">'+(i+1)+'</span><div class="t">'+n+'</div></div>').join(''));}
function weatherHtml(name,w){const c=w.current;return card('Погода: '+name,'<div class="big">'+Math.round(c.temperature_2m)+'°</div><div class="sub">'+wmo(c.weather_code)+', ощущается как '+Math.round(c.apparent_temperature)+'°</div><div class="sub">ветер '+Math.round(c.wind_speed_10m)+' м/с · влажность '+c.relative_humidity_2m+'%</div>');}
function weekHtml(name,w){const d=w.daily;let rows='';for(let i=0;i<7;i++){rows+='<div class="row"><span class="t">'+new Date(d.time[i]+'T00:00:00').toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'numeric'})+'</span><span class="big2">'+Math.round(d.temperature_2m_min[i])+'…'+Math.round(d.temperature_2m_max[i])+'°</span><span class="d">'+wmo(d.weather_code[i])+'</span></div>';}return card('Неделя: '+name,rows);}
function moneyHtml(j){const v=j.Valute;return card('Курсы ЦБ',['USD','EUR','CNY','GBP'].map(k=>'<div class="row"><span class="t">'+k+'</span><span class="big2">'+v[k].Value.toFixed(2)+' ₽</span></div>').join(''));}
function calcHtml(expr,val){return card(expr,'<div class="big">= '+val+'</div>');}
function textCard(t,txt){return card(t,'<div class="text">'+txt.replace(/\n/g,'<br>')+'</div>');}
function helpHtml(){return card('Команды (версия 3)','<div class="text">ПОИСК/ВРЕМЯ/ТАЙМЕРЫ/ЗАДАЧИ/СПИСКИ/ЗАМЕТКИ — как раньше<br>ПОГОДА: погода / погода в … / будет дождь / нужна куртка / уф-индекс / рассвет / закат / фаза луны / прогноз на неделю<br>ДЕНЬГИ: курсы / курс доллара / курс евро / переведи 100 долларов в рубли / биткоин / топ криптовалют<br>КАЛЬКУЛЯТОР: посчитай … / 20 процентов от 500 / прибавь 20 процентов к 100 / раздели 1500 на 3 человек / случайное число от 1 до 100 / сколько дюймов в 30 см<br>ПЕРЕВОД: переведи … / как по-английски …<br>ЗНАНИЯ: кто такой … / что такое … / столица … / население … / в этот день<br>РАЗВЛЕЧЕНИЯ: анекдот / ещё / факт / факт о космосе / факт о животных / комплимент / совет / мотивируй / подбрось монетку / брось кубик / загадка / ответ / что посмотреть / что приготовить / идея подарка</div>');}

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
  if(/сколько/.test(cmd)&&/прошло/.test(cmd)){const dt=parseDateRu(cmd);if(!dt)return{reply:'Назови дату, например: сколько дней прошло с 1 мая.'};const d=daysDiff(dt,now());if(d<0)return{reply:'Эта дата ещё впереди.'};return{html:card('Прошло','<div class="big">'+d+'</div><div class="sub">дней</div>'),reply:'Прошло '+d+' дней.'};}
  if(/сколько/.test(cmd)&&/до/.test(cmd)){const dt=parseDateRu(cmd);if(!dt)return{reply:'Назови дату, например: сколько дней осталось до 15 августа.'};const d=daysDiff(now(),dt);if(d<0)return{reply:'Эта дата уже прошла.'};return{html:card('Отсчёт','<div class="big">'+d+'</div><div class="sub">дней до '+dt.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})+'</div>'),reply:'Осталось '+d+' дней.'};}
  if(/какое число будет через/.test(cmd)){const n=firstNum(cmd);if(!n)return{reply:'Скажи, через сколько дней.'};return{reply:'Через '+n+' дней будет '+new Date(now().getTime()+n*86400000).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})+'.'};}

  if(/останови таймер|стоп таймер/.test(cmd)){timer=null;return{html:card('Таймер','<div class="sub">Остановлен.</div>'),reply:'Таймер остановлен.'};}
  if(/сколько осталось/.test(cmd)){if(!timer)return{reply:'Таймер не запущен.'};const s=Math.max(0,Math.round((timer.endsAt-Date.now())/1000));return{reply:'Осталось '+Math.floor(s/60)+' минут '+(s%60)+' секунд.'};}
  if(/^таймер|запусти таймер|таймер на/.test(cmd)){const ms=parseDur(cmd);if(!ms)return{reply:'Скажи, например: таймер 5 минут.'};timer={endsAt:Date.now()+ms};return{html:timerHtml(timer.endsAt,'Таймер','Таймер завершён!'),reply:'Таймер запущен.'};}
  if(/напомни/.test(cmd)){const ms=parseDur(cmd);if(!ms)return{reply:'Скажи, например: напомни через 10 минут позвонить маме.'};const text=cmd.replace(/.*напомни/,'').replace(/через\s*\d+\s*(секунд|сек|минут|мин|час[аов]?)/,'').trim()||'Напоминание';const r={id:reminderId++,endsAt:Date.now()+ms,text};reminders.push(r);setTimeout(()=>{reminders=reminders.filter(x=>x.id!==r.id);send({html:card('⏰ Напоминание','<div class="big2">'+r.text+'</div>'),speak:'Напоминаю: '+r.text});},ms);return{html:remindersHtml(),reply:'Хорошо, напомню.'};}
  if(/покажи напоминания/.test(cmd))return{html:remindersHtml(),reply:'Напоминания на экране.'};
  if(/отмени напоминание/.test(cmd)){const n=firstNum(cmd);if(n&&reminders[n-1]){const t=reminders[n-1].text;reminders.splice(n-1,1);return{html:remindersHtml(),reply:'Отменила: '+t};}return{reply:'Не нашла такое напоминание.'};}
  if(/стоп помодоро|останови помодоро/.test(cmd)){if(pomo){clearTimeout(pomo.t);pomo=null;}return{html:card('Помодоро','<div class="sub">Остановлено.</div>'),reply:'Помодоро остановлен.'};}
  if(/помодоро/.test(cmd)){if(pomo)clearTimeout(pomo.t);pomo={phase:'work',round:1};startPomoPhase(25*60000);return{html:pomoHtml(),reply:'Помодоро начат: 25 минут работы.'};}
  if(/секундомер/.test(cmd)){if(!stopwatch||!stopwatch.running){stopwatch={startAt:Date.now(),acc:(stopwatch&&!stopwatch.running)?stopwatch.acc:0,running:true};return{html:card('Секундомер','<div class="big">▶ 00:00</div>'),reply:'Секундомер запущен.'};}const ms=stopwatch.acc+(Date.now()-stopwatch.startAt);stopwatch={acc:ms,running:false};const s=Math.round(ms/1000);return{html:card('Секундомер','<div class="big">⏸ '+Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)+'</div>'),reply:'Время: '+Math.floor(s/60)+' минут '+(s%60)+' секунд.'};}

  // задачи
  if(/добавь задачу/.test(cmd)){const t=cmd.replace(/.*добавь задачу/,'').trim();if(!t)return{reply:'Какую задачу добавить?'};db.tasks.push({text:t,done:false,star:false});saveDb();return{html:tasksHtml(db.tasks),reply:'Задача добавлена: '+t};}
  if(/покажи важные/.test(cmd))return{html:tasksHtml(db.tasks.filter(t=>t.star)),reply:'Важные на экране.'};
  if(/покажи задачи|план на сегодня/.test(cmd))return{html:tasksHtml(db.tasks),reply:'Задачи на экране.'};
  if(/выполни/.test(cmd)){const n=firstNum(cmd);if(n&&db.tasks[n-1]){db.tasks[n-1].done=true;saveDb();return{html:tasksHtml(db.tasks),reply:'Готово: '+db.tasks[n-1].text};}return{reply:'Не нашла задачу.'};}
  if(/удали задачу/.test(cmd)){const n=firstNum(cmd);if(n&&db.tasks[n-1]){const t=db.tasks[n-1].text;db.tasks.splice(n-1,1);saveDb();return{html:tasksHtml(db.tasks),reply:'Удалила: '+t};}return{reply:'Не нашла задачу.'};}
  if(/очисти выполненные/.test(cmd)){db.tasks=db.tasks.filter(t=>!t.done);saveDb();return{html:tasksHtml(db.tasks),reply:'Выполненные удалены.'};}
  if(/сколько задач/.test(cmd)){return{reply:'Активных задач: '+db.tasks.filter(t=>!t.done).length+'.'};}
  if(/важная/.test(cmd)){const n=firstNum(cmd);if(n&&db.tasks[n-1]){db.tasks[n-1].star=!db.tasks[n-1].star;saveDb();return{html:tasksHtml(db.tasks),reply:'Отметила.'};}return{reply:'Какую задачу отметить?'};}
  if(/зачитай задачи/.test(cmd)){if(!db.tasks.length)return{reply:'Задач нет.'};return{speakOnly:db.tasks.map((t,i)=>(i+1)+'. '+t.text).join('. '),reply:'Зачитываю.'};}

  // списки
  if(/создай список/.test(cmd)){const n=cmd.replace(/.*создай список/,'').trim();if(!n)return{reply:'Как назвать список?'};db.lists[n]=db.lists[n]||[];saveDb();return{html:listsHtml(),reply:'Список «'+n+'» создан.'};}
  if(/добавь в /.test(cmd)){let rest=cmd.replace(/.*добавь в /,'');let name=null,itemsStr='';if(rest.includes(':')){name=rest.split(':')[0].trim();itemsStr=rest.split(':').slice(1).join(':');}else{for(const k in db.lists){if(rest.startsWith(k)){name=k;itemsStr=rest.slice(k.length);break;}}if(!name){name=rest;itemsStr='';}}if(!name)return{reply:'В какой список?'};if(!itemsStr.trim())return{reply:'Что добавить?'};db.lists[name]=db.lists[name]||[];itemsStr.split(/,| и /).forEach(x=>{x=x.trim();if(x)db.lists[name].push({text:x,done:false});});saveDb();return{html:listsHtml(),reply:'Добавила в «'+name+'».'};}
  if(/покажи все списки/.test(cmd))return{html:listsHtml(),reply:'Все списки на экране.'};
  if(/вычеркни/.test(cmd)){const n=firstNum(cmd);const k=findList(cmd);if(k&&n&&db.lists[k][n-1]){db.lists[k][n-1].done=true;saveDb();return{html:listsHtml(),reply:'Вычеркнула.'};}return{reply:'Не нашла позицию.'};}
  if(/удали \d+ из/.test(cmd)){const n=firstNum(cmd);const k=findList(cmd);if(k&&n&&db.lists[k][n-1]){const t=db.lists[k][n-1].text;db.lists[k].splice(n-1,1);saveDb();return{html:listsHtml(),reply:'Удалила: '+t};}return{reply:'Не нашла позицию.'};}
  if(/очисти список/.test(cmd)){const k=findList(cmd);if(k){db.lists[k]=[];saveDb();return{html:listsHtml(),reply:'Очищен.'};}return{reply:'Какой список?'};}
  if(/сколько позиций в/.test(cmd)){const k=findList(cmd);if(k)return{reply:'Осталось позиций: '+db.lists[k].filter(x=>!x.done).length+'.'};return{reply:'В каком списке?'};}
  if(/удали список/.test(cmd)){const n=cmd.replace(/.*удали список/,'').trim();if(db.lists[n]){delete db.lists[n];saveDb();return{html:listsHtml(),reply:'Список удалён.'};}return{reply:'Не нашла список.'};}
  if(/зачитай /.test(cmd)&&findList(cmd)){const k=findList(cmd);if(db.lists[k].length)return{speakOnly:k+': '+db.lists[k].map((x,i)=>(i+1)+'. '+x.text).join('. '),reply:'Зачитываю.'};}
  if(/покажи /.test(cmd)){const k=findList(cmd);if(k)return{html:listsHtml(),reply:'Список на экране.'};}

  // заметки
  if(/запиши/.test(cmd)){const t=cmd.replace(/.*запиши/,'').trim();if(!t)return{reply:'Что записать?'};db.notes.push(t);saveDb();return{html:notesHtml(db.notes),reply:'Записала.'};}
  if(/покажи заметки/.test(cmd))return{html:notesHtml(db.notes),reply:'Заметки на экране.'};
  if(/удали заметку/.test(cmd)){const n=firstNum(cmd);if(n&&db.notes[n-1]){db.notes.splice(n-1,1);saveDb();return{html:notesHtml(db.notes),reply:'Удалила.'};}return{reply:'Не нашла.'};}
  if(/очисти заметки/.test(cmd)){db.notes=[];saveDb();return{html:notesHtml(db.notes),reply:'Очищено.'};}
  if(/найди в заметках/.test(cmd)){const q=cmd.replace(/.*найди в заметках/,'').trim();const f=db.notes.filter(n=>n.includes(q));return{html:notesHtml(f),reply:f.length?'Нашла: '+f.length:'Не нашла.'};}
  if(/зачитай заметки/.test(cmd)){if(!db.notes.length)return{reply:'Заметок нет.'};return{speakOnly:db.notes.join('. '),reply:'Зачитываю.'};}

  // погода
  if(/фаз(а|у) луны|луна/.test(cmd)&&!/калькулятор/.test(cmd))return{html:card('Луна','<div class="big">'+moonPhase().split(' ')[0]+'</div><div class="sub">'+moonPhase().split(' ').slice(1).join(' ')+'</div>'),reply:'Сейчас '+moonPhase().split(' ').slice(1).join('.')+'.'};
  if(/погода|будет дождь|нужна куртка|уф|рассвет|закат|прогноз на неделю/.test(cmd)){
    let city=db.city||'Москва';
    const m=cmd.match(/погода в\s+([а-яёa-z\s]+)$/i);if(m)city=m[1].trim();
    return{async:true,run:async()=>{
      const g=await geoCity(city);if(!g)return{reply:'Не нашла город '+city+'.'};
      if(m){db.city=g.name;saveDb();}
      const w=await weatherFor(g.latitude,g.longitude);
      if(/прогноз на неделю/.test(cmd))return{html:weekHtml(g.name,w),reply:'Прогноз на неделю на экране.'};
      if(/будет дождь/.test(cmd)){const rain=isRain(w.current.weather_code)||isRain(w.daily.weather_code[0]);return{html:weatherHtml(g.name,w),reply:rain?'Да, вероятен дождь. Возьми зонт.':'Дождя не ожидается.'};}
      if(/нужна куртка/.test(cmd)){const t=w.current.temperature_2m;return{html:weatherHtml(g.name,w),reply:(t<8)?'Да, нужна куртка, всего '+Math.round(t)+'°.':'Нет, тепло: '+Math.round(t)+'°.'};}
      if(/уф/.test(cmd))return{html:weatherHtml(g.name,w),reply:'УФ-индекс сегодня: '+Math.round(w.daily.uv_index_max[0])+' из 11.'};
      if(/рассвет/.test(cmd))return{reply:'Рассвет в '+w.daily.sunrise[0].slice(11,16)+'.'};
      if(/закат/.test(cmd))return{reply:'Закат в '+w.daily.sunset[0].slice(11,16)+'.'};
      return{html:weatherHtml(g.name,w),reply:'В городе '+g.name+' сейчас '+Math.round(w.current.temperature_2m)+'°, '+wmo(w.current.weather_code)+'.'};
    }};
  }

  // деньги
  if(/курсы|курс доллара|курс евро|биткоин|топ криптовалют|переведи.*в рубли|сколько.*доллар.*в рублях/.test(cmd)){
    return{async:true,run:async()=>{
      const j=await cbr();if(!j)return{reply:'Не смогла получить курсы ЦБ.'};
      if(/биткоин/.test(cmd)){const c=await crypto('bitcoin');const usd=c&&c.bitcoin?c.bitcoin.usd:null;return{html:card('Биткоин','<div class="big">'+(usd?Math.round(usd).toLocaleString('ru-RU')+' $':'—')+'</div><div class="sub">≈ '+(usd?Math.round(usd*j.Valute.USD.Value).toLocaleString('ru-RU')+' ₽':'')+'</div>'),reply:usd?'Биткоин стоит '+Math.round(usd).toLocaleString('ru-RU')+' долларов.':'Не нашла курс биткоина.'};}
      if(/топ криптовалют/.test(cmd)){const c=await crypto('bitcoin,ethereum,tether,binancecoin,ripple');if(!c)return{reply:'Не нашла крипто-курсы.'};const names={bitcoin:'Биткоин',ethereum:'Эфириум',tether:'Тезер',binancecoin:'BNB',ripple:'Рипл'};return{html:card('Топ-5 крипто',Object.keys(names).map(k=>'<div class="row"><span class="t">'+names[k]+'</span><span class="big2">'+(c[k]?c[k].usd+' $':'—')+'</span></div>').join('')),reply:'Криптовалюты на экране.'};}
      const cur=cmd.match(/(доллар|доллара|бакс|евро|юань|юаней|фунт|фунта)/);
      if(/переведи|сколько.*в рублях/.test(cmd)&&cur){const n=firstNum(cmd)||1;const map={доллар:'USD',доллара:'USD',бакс:'USD',евро:'EUR',юань:'CNY',юаней:'CNY',фунт:'GBP',фунта:'GBP'};const k=map[cur[1]];const val=j.Valute[k].Value*n;return{html:calcHtml(n+' '+k,val.toFixed(2)+' ₽'),reply:n+' '+k+' это '+val.toFixed(0)+' рублей.'};}
      if(/курс доллара/.test(cmd))return{reply:'Доллар: '+j.Valute.USD.Value.toFixed(2)+' рублей.'};
      if(/курс евро/.test(cmd))return{reply:'Евро: '+j.Valute.EUR.Value.toFixed(2)+' рублей.'};
      return{html:moneyHtml(j),reply:'Курсы валют на экране.'};
    }};
  }

  // калькулятор
  if(/посчитай/.test(cmd)){const v=calcExpr(cmd.replace(/.*посчитай/,''));if(v===null)return{reply:'Не поняла выражение. Скажи, например: посчитай 25 умножить на 4.'};return{html:calcHtml(cmd.replace(/.*посчитай/,'').trim(),v),reply:'Равно '+v+'.'};}
  if(/процент.*от/.test(cmd)){const n=allNums(cmd);if(n.length>=2){const v=n[0]*n[1]/100;return{html:calcHtml(n[0]+'% от '+n[1],v),reply:v+'.'};}return{reply:'Скажи, например: 20 процентов от 500.'};}
  if(/прибавь.*процент/.test(cmd)){const n=allNums(cmd);if(n.length>=2){const v=n[1]*(1+n[0]/100);return{html:calcHtml(n[1]+' + '+n[0]+'%',Math.round(v*100)/100),reply:Math.round(v*100)/100+'.'};}return{reply:'Скажи: прибавь 20 процентов к 100.'};}
  if(/раздели.*на.*человек/.test(cmd)){const n=allNums(cmd);if(n.length>=2&&n[1]){const v=Math.round(n[0]/n[1]*100)/100;return{html:calcHtml(n[0]+' / '+n[1],v+' на человека'),reply:'По '+v+' на каждого.'};}return{reply:'Скажи: раздели 1500 на 3 человек.'};}
  if(/случайное число/.test(cmd)){const n=allNums(cmd);const a=n[0]||1,b=n[1]||100;const v=a+Math.floor(Math.random()*(b-a+1));return{html:card('Случайное','<div class="big">'+v+'</div><div class="sub">от '+a+' до '+b+'</div>'),reply:'Выпало '+v+'.'};}
  if(/дюйм/.test(cmd)){const n=firstNum(cmd)||1;return{reply:(n/2.54).toFixed(2)+' дюймов.'};}
  if(/фунт/.test(cmd)&&/кг|килограмм/.test(cmd)){const n=firstNum(cmd)||1;return{reply:(n*2.2046).toFixed(2)+' фунтов.'};}
  if(/миль/.test(cmd)&&/км|километр/.test(cmd)){const n=firstNum(cmd)||1;return{reply:(n*0.6214).toFixed(2)+' миль.'};}

  // переводчик
  if(/переведи|как по-английски/.test(cmd)){
    const t=cmd.replace(/.*?(переведи|как по-английски)/,'').trim();if(!t)return{reply:'Что перевести?'};
    const dir=/[а-яё]/.test(t)?'ru|en':'en|ru';
    return{async:true,run:async()=>{
      const tr=await translate(t,dir);if(!tr)return{reply:'Не смогла перевести.'};
      return{html:textCard('Перевод',t+'\n\n➡️ '+tr),reply:tr};
    }};
  }

  // знания
  if(/в этот день/.test(cmd)){
    return{async:true,run:async()=>{
      const ev=await onThisDay();if(!ev.length)return{reply:'Не нашла события.'};
      return{html:card('В этот день',ev.map(e=>'<div class="row"><span class="num">'+e.year+'</span><div class="t">'+e.text+'</div></div>').join('')),reply:'События этого дня на экране.'};
    }};
  }
  if(/кто такой|кто такая|что такое|расскажи про|столица|население/.test(cmd)){
    const q=cmd.replace(/.*(кто такой|кто такая|что такое|расскажи про|столица|население)/,'').trim();
    if(!q)return{reply:'О чём рассказать?'};
    return{async:true,run:async()=>{
      const s=await wikiSummary(q);if(!s)return{reply:'Не нашла в Википедии.'};
      return{html:textCard(s.title,s.text),reply:'Рассказываю про '+s.title+'. Текст на экране.'};
    }};
  }

  // развлечения
  if(/анекдот/.test(cmd)){lastFun='joke';return{html:textCard('Анекдот 😄',pick(JOKES)),reply:'Слушай анекдот.'};}
  if(/факт о космосе/.test(cmd)){lastFun='space';return{html:textCard('Факт о космосе 🚀',pick(FACTS_SPACE)),reply:'Факт на экране.'};}
  if(/факт о животных/.test(cmd)){lastFun='animals';return{html:textCard('Факт о животных 🐾',pick(FACTS_ANIMALS)),reply:'Факт на экране.'};}
  if(/факт/.test(cmd)){lastFun='fact';return{html:textCard('Факт 🧠',pick(FACTS)),reply:'Факт на экране.'};}
  if(/^ещё|еще один|другой/.test(cmd)){
    if(lastFun==='joke')return{html:textCard('Анекдот 😄',pick(JOKES)),reply:'Ещё один.'};
    if(lastFun==='space')return{html:textCard('Факт о космосе 🚀',pick(FACTS_SPACE)),reply:'Ещё.'};
    if(lastFun==='animals')return{html:textCard('Факт о животных 🐾',pick(FACTS_ANIMALS)),reply:'Ещё.'};
    return{html:textCard('Факт 🧠',pick(FACTS)),reply:'Ещё.'};
  }
  if(/комплимент/.test(cmd))return{html:textCard('Комплимент 💙',pick(COMPLIMENTS)),reply:pick(COMPLIMENTS)};
  if(/совет/.test(cmd))return{html:textCard('Совет 💡',pick(ADVICE)),reply:'Совет на экране.'};
  if(/мотивируй/.test(cmd))return{html:textCard('Мотивация 🔥',pick(MOTIVATE)),reply:pick(MOTIVATE)};
  if(/монетк/.test(cmd)){const v=Math.random()<0.5?'Орёл':'Решка';return{html:card('Монетка 🪙','<div class="big">'+v+'</div>'),reply:v+'!'};}
  if(/кубик/.test(cmd)){const v=1+Math.floor(Math.random()*6);return{html:card('Кубик 🎲','<div class="big">'+v+'</div>'),reply:'Выпало '+v+'.'};}
  if(/камень.*ножницы|ножницы.*бумага/.test(cmd)){
    const hands=['камень','ножницы','бумага'];const me=pick(hands);
    let you=null;hands.forEach(h=>{if(cmd.indexOf(h)!==-1&&cmd.lastIndexOf(h)>cmd.indexOf('бумага')-999)you=h;});
    const m2=cmd.match(/(камень|ножницы|бумага)\s*$/);you=m2?m2[1]:null;
    if(!you)return{html:card('Игра ✊','<div class="sub">Скажи: камень ножницы бумага И твой выбор, например «…бумага»</div>'),reply:'Выбери: камень, ножницы или бумага.'};
    let res='Ничья!';if(me!==you){const win=(you==='камень'&&me==='ножницы')||(you==='ножницы'&&me==='бумага')||(you==='бумага'&&me==='камень');res=win?'Ты выиграл!':'Я выиграла!';}
    return{html:card('Игра ✊','<div class="big">'+you+' vs '+me+'</div><div class="sub">'+res+'</div>'),reply:'Я показываю '+me+'. '+res};
  }
  if(/загадай загадку|загадк/.test(cmd)){lastRiddle=pick(RIDDLES);return{html:textCard('Загадка 🤔',lastRiddle.q),reply:'Слушай: '+lastRiddle.q};}
  if(/^ответ/.test(cmd)&&lastRiddle)return{html:textCard('Ответ ✅',lastRiddle.a),reply:lastRiddle.a};
  if(/что посмотреть/.test(cmd)){const m=pick(MOVIES);return{html:textCard('Сегодня смотрим 🎬',m[0]+' — '+m[1]),reply:'Советую: '+m[0]+'. '+m[1]+'.'};}
  if(/что приготовить|что съесть/.test(cmd)){const d=pick(DISHES);return{html:textCard('Готовим 🍳',d[0]+' — '+d[1]),reply:'Приготовь: '+d[0]+'.'};}
  if(/идея подарка|что подарить/.test(cmd))return{html:textCard('Подарок 🎁',pick(GIFTS)),reply:'Идея: '+pick(GIFTS)+'.'};

  // браузер
  if(/найди фото/.test(cmd)){const q=cmd.replace(/.*найди фото/,'').trim()||'кот';return{async:true,run:async()=>{const imgs=await wikiImages(q);if(!imgs.length)return{reply:'Не нашла фото.'};return{html:imagesHtml(q,imgs),reply:'Фото на экране.'};}};}
  if(/^найди|поищи|поиск/.test(cmd)){const q=cmd.replace(/^(найди|поищи|поиск)/,'').trim();if(!q)return{reply:'Что найти?'};return{async:true,run:async()=>{const results=await searchAll(q,0);if(!results.length)return{reply:'Не нашла результатов.'};lastSearch={query:q,page:0,results};return{html:searchHtml(q,results),reply:'Нашла. Результаты на экране.'};}};}
  if(/покажи ещё/.test(cmd)){if(!lastSearch)return{reply:'Сначала найди.'};return{async:true,run:async()=>{const p=lastSearch.page+1;const results=await searchAll(lastSearch.query,p);if(!results.length)return{reply:'Больше нет.'};lastSearch.page=p;lastSearch.results=results;return{html:searchHtml(lastSearch.query,results),reply:'Следующая страница.'};}};}
  if(/открой сайт/.test(cmd)){const name=cmd.replace(/.*открой сайт/,'').trim().replace(/\s+/g,'');return{async:true,run:async()=>{let url=null;if(/\./.test(name))url='https://'+name;else{const r=await searchAll(name+' официальный сайт',0);if(r.length)url=r[0].url;}if(!url)return{reply:'Не нашла сайт.'};const text=await readPage(url);if(!text)return{reply:'Не смогла открыть.'};reader={title:name,pages:splitPages(text),idx:0};return{html:readerHtml(),reply:'Открыла в режиме чтения.'};}};}
  if(/^открой/.test(cmd)){const map={перв:1,втор:2,треть:3,четверт:4,пят:5,шест:6};let n=firstNum(cmd);if(!n){for(const k in map)if(cmd.indexOf(k)!==-1){n=map[k];break;}}if(!lastSearch||!n||!lastSearch.results[n-1])return{reply:'Сначала «найди …», потом «открой номер».'};const r=lastSearch.results[n-1];return{async:true,run:async()=>{const text=await readPage(r.url);if(!text)return{reply:'Не смогла открыть.'};reader={title:r.title,pages:splitPages(text),idx:0};return{html:readerHtml(),reply:'Текст на экране.'};}};}
  if(/^дальше|^далее/.test(cmd)){if(!reader)return{reply:'Сначала открой: «открой 1».'};if(reader.idx<reader.pages.length-1){reader.idx++;return{html:readerHtml(),reply:'Дальше.'};}return{reply:'Конец текста.'};}
  if(/назад к списку/.test(cmd)){if(!lastSearch)return{reply:'Списка нет.'};return{html:searchHtml(lastSearch.query,lastSearch.results),reply:'Список на экране.'};}
  if(/^назад/.test(cmd)){if(!reader)return{reply:'Нечего листать.'};if(reader.idx>0){reader.idx--;return{html:readerHtml(),reply:'Назад.'};}return{reply:'Это начало.'};}
  if(/^зачитай|прочитай вслух|озвучь/.test(cmd)){let t=null;if(reader)t=reader.pages[reader.idx];else if(lastSearch)t=lastSearch.results.map((r,i)=>(i+1)+'. '+r.title).join('. ');if(!t)return{reply:'Нечего зачитывать.'};return{speakOnly:t.slice(0,1000),reply:'Зачитываю.'};}
  if(/стоп чтение|хватит читать|замолчи/.test(cmd))return{stopSpeak:true,reply:'Остановилась.'};

  return{html:card('Не поняла','<div class="sub">Команда: «'+cmd+'». Скажи «помощь».</div>'),reply:'Я пока не знаю такую команду. Скажи «помощь».'};
}
function findList(cmd){for(const k in db.lists)if(cmd.indexOf(k)!==-1)return k;return null;}

function startPomoPhase(ms){
  pomo.endsAt=Date.now()+ms;
  pomo.t=setTimeout(()=>{
    if(!pomo)return;
    if(pomo.phase==='work'){const long=pomo.round>=4;pomo.phase='rest';startPomoPhase(long?15*60000:5*60000);send({html:pomoHtml(),speak:long?'Большой перерыв, 15 минут!':'Перерыв, 5 минут.'});}
    else{if(pomo.round>=4){pomo=null;send({html:card('Помодоро','<div class="sub">Цикл завершён! 🎉</div>'),speak:'Помодоро завершён!'});return;}pomo.round++;pomo.phase='work';startPomoPhase(25*60000);send({html:pomoHtml(),speak:'Отдых окончен, за работу!'});}
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
app.get('/debug', async (req, res) => {
  const out = { hasToken: !!GH_TOKEN, tokenStart: GH_TOKEN ? GH_TOKEN.slice(0, 12) : null, repo: GH_REPO };
  try {
    const r = await fetch('https://api.github.com/repos/' + GH_REPO + '/contents/data.json', { headers: { Authorization: 'Bearer ' + GH_TOKEN, 'User-Agent': 'alice', Accept: 'application/vnd.github+json' } });
    out.githubStatus = r.status;
  } catch (e) { out.githubError = e.message; }
  res.json(out);
});
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
