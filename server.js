// SMART ASSISTANT CORE 1.2.2 — GENERATED DEPLOYMENT BUILD
// Source architecture: modular package SMART_ASSISTANT_CORE_1.2.2_REGRESSION_CANDIDATE
// This single file is generated only to make deployment to the existing GitHub/Render service simple.
// Do not add secrets here. GH_TOKEN / GH_REPO / PC_AGENT_TOKEN remain Render environment variables.

'use strict';
const __modules = Object.create(null);
const __cache = Object.create(null);
function __require(id) {
  if (__cache[id]) return __cache[id].exports;
  const factory = __modules[id];
  if (!factory) throw new Error('Bundled module not found: ' + id);
  const module = { exports: {} };
  __cache[id] = module;
  factory(module, module.exports, __require, require);
  return module.exports;
}

__modules["server.js"] = function(module, exports, __require, require) {
const express = require('express');
const { createApp } = __require("src/app.js");

const app = createApp();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[Smart Assistant Core] listening on ${port}`);
});

};

__modules["src/app.js"] = function(module, exports, __require, require) {
const express = require('express');
const { VERSION } = __require("src/config.js");
const { buildRequestContext } = __require("src/core/request-context.js");
const { ContextStore } = __require("src/core/context-store.js");
const { ToolRegistry } = __require("src/core/tool-registry.js");
const { route } = __require("src/core/router.js");
const { GitHubStorage } = __require("src/storage/github-storage.js");
const { panelHtml } = __require("src/ui/panel.js");
const { PcBridge } = __require("src/pc/bridge.js");

const timeTool = __require("src/tools/time.js");
const timerTool = __require("src/tools/timer.js");
const tasksTool = __require("src/tools/tasks.js");
const listsTool = __require("src/tools/lists.js");
const notesTool = __require("src/tools/notes.js");
const weatherTool = __require("src/tools/weather.js");
const calculatorTool = __require("src/tools/calculator.js");
const translateTool = __require("src/tools/translate.js");
const knowledgeTool = __require("src/tools/knowledge.js");
const entertainmentTool = __require("src/tools/entertainment.js");
const browserTool = __require("src/tools/browser.js");
const pcTool = __require("src/tools/pc.js");

function createApp() {
  const app = express();
  app.use(express.json({limit:'1mb'}));

  const context = new ContextStore();
  const storage = new GitHubStorage();
  const registry = new ToolRegistry();
  const pcBridge = new PcBridge();
  [
    timeTool,timerTool,tasksTool,listsTool,notesTool,weatherTool,
    calculatorTool,translateTool,knowledgeTool,entertainmentTool,browserTool,pcTool
  ].forEach(t=>registry.register(t));

  const clients = new Set();
  let lastView = null;

  function sendView(p) {
    lastView = p;
    const data='data: '+JSON.stringify(p)+'\n\n';
    for(const c of clients){try{c.write(data);}catch{}}
  }

  const runtime = { context, storage, registry, sendView, pcBridge };

  storage.load().then(()=>console.log('[storage] loaded')).catch(e=>console.error('[storage]',e.message));
  setInterval(()=>context.cleanup(),5*60*1000).unref();

  app.get('/health',(req,res)=>res.json({
    ok:true,
    version:VERSION,
    tools:registry.list().map(x=>x.name),
    pc:pcBridge.status()
  }));

  app.get('/alice',(req,res)=>res.json({status:'ok',text:'Smart Assistant Core работает',version:VERSION}));
  app.head('/alice',(req,res)=>res.status(200).end());

  app.get('/events',(req,res)=>{
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
    if(lastView)res.write('data: '+JSON.stringify(lastView)+'\n\n');
    clients.add(res);
    req.on('close',()=>clients.delete(res));
  });

  // Без вывода любых секретов.
  app.get('/debug',(req,res)=>res.json({
    ok:true,
    version:VERSION,
    storageConfigured:!!process.env.GH_TOKEN,
    repository:process.env.GH_REPO||'elmaltsewa-dev/alice-server',
    registeredTools:registry.list()
  }));

  app.post('/pc/heartbeat',(req,res)=>{
    if(!pcBridge.authorize(req))return res.status(401).json({ok:false});
    const b=req.body||{},machine=String(b.machine||'home-pc');
    pcBridge.heartbeat(machine,{hostname:b.hostname||'',user:b.user||'',version:b.version||''});
    res.json({ok:true,serverTime:Date.now()});
  });

  app.get('/pc/poll',(req,res)=>{
    if(!pcBridge.authorize(req))return res.status(401).json({ok:false});
    const machine=String(req.query.machine||'home-pc');
    pcBridge.heartbeat(machine,{});
    res.json({ok:true,job:pcBridge.poll(machine)});
  });

  app.post('/pc/result',(req,res)=>{
    if(!pcBridge.authorize(req))return res.status(401).json({ok:false});
    const b=req.body||{};
    pcBridge.complete(String(b.id||''),b.result||{ok:false,message:'Пустой результат'});
    res.json({ok:true});
  });

  app.post('/alice',async(req,res)=>{
    const body=req.body||{};
    const ctx=buildRequestContext(body);
    let out;
    try{
      out=await route(ctx,runtime);
    }catch(e){
      console.error('[alice]',e.stack||e.message);
      out={reply:'Произошла внутренняя ошибка. Я записала её в журнал сервера.'};
    }

    if(out&&(out.html||out.speakOnly||out.stopSpeak)){
      const view={};
      if(out.html)view.html=out.html;
      if(out.speakOnly)view.speak=out.speakOnly;
      if(out.stopSpeak)view.stopSpeak=true;
      sendView(view);
    }

    res.json({
      version:'1.0',
      session:body.session||{},
      response:{
        text:(out&&out.reply)||'Готово.',
        end_session:false
      }
    });
  });

  app.get('/',(req,res)=>res.send(panelHtml(VERSION)));

  return app;
}

module.exports={createApp};

};

__modules["src/config.js"] = function(module, exports, __require, require) {
module.exports = {
  VERSION: '1.2.8-heartbeat-telemetry',
  TZ: process.env.TZ_NAME || 'Europe/Moscow',
  GH_TOKEN: process.env.GH_TOKEN || '',
  GH_REPO: process.env.GH_REPO || 'elmaltsewa-dev/alice-server',
  STORAGE_FILE: process.env.STORAGE_FILE || 'data.json',
  SESSION_TTL_MS: 30 * 60 * 1000,
  USER_CONTEXT_TTL_MS: 24 * 60 * 60 * 1000,
  PC_AGENT_TOKEN: process.env.PC_AGENT_TOKEN || '',
  PC_AGENT_TTL_MS: 45 * 1000
};

};

__modules["src/core/context-store.js"] = function(module, exports, __require, require) {
const { SESSION_TTL_MS, USER_CONTEXT_TTL_MS } = __require("src/config.js");

class ContextStore {
  constructor() {
    this.sessions = new Map();
    this.users = new Map();
  }

  _touch(map, key, ttl, factory) {
    const now = Date.now();
    let item = map.get(key);
    if (!item || now - item.updatedAt > ttl) {
      item = { updatedAt: now, data: factory() };
      map.set(key, item);
    }
    item.updatedAt = now;
    return item.data;
  }

  session(id) {
    return this._touch(this.sessions, id, SESSION_TTL_MS, () => ({
      lastIntent: null,
      lastTool: null,
      lastResults: [],
      selectedIndex: null,
      pendingClarification: null,
      lastReferencedObject: null
    }));
  }

  user(id) {
    return this._touch(this.users, id, USER_CONTEXT_TTL_MS, () => ({
      lastIntent: null,
      lastTool: null,
      lastResults: [],
      lastReferencedObject: null
    }));
  }

  remember(ctx, patch) {
    const s = this.session(ctx.sessionId);
    const u = this.user(ctx.userId);
    Object.assign(s, patch || {});
    Object.assign(u, patch || {});
  }

  resolveOrdinal(text) {
    const map = {
      'перв': 1, 'втор': 2, 'трет': 3, 'четверт': 4, 'пят': 5,
      'шест': 6, 'седьм': 7, 'восьм': 8, 'девят': 9, 'десят': 10
    };
    const m = String(text || '').match(/\b(\d{1,2})\b/);
    if (m) return Number(m[1]);
    for (const [stem, n] of Object.entries(map)) {
      if (String(text || '').includes(stem)) return n;
    }
    return null;
  }

  resolveReference(ctx) {
    const s = this.session(ctx.sessionId);
    const u = this.user(ctx.userId);
    return s.lastReferencedObject || u.lastReferencedObject || null;
  }

  cleanup() {
    const now = Date.now();
    for (const [k, v] of this.sessions) if (now - v.updatedAt > SESSION_TTL_MS) this.sessions.delete(k);
    for (const [k, v] of this.users) if (now - v.updatedAt > USER_CONTEXT_TTL_MS) this.users.delete(k);
  }
}

module.exports = { ContextStore };

};

__modules["src/core/intent-engine.js"] = function(module, exports, __require, require) {
function includesAny(text, parts) {
  return parts.some(p => text.includes(p));
}

function detectIntent(ctx, contextStore) {
  const c = ctx.command;

  if (!c) return { name: 'EMPTY', confidence: 1 };

  if (/^(да|ага|подтверждаю|хорошо)$/.test(c)) return { name: 'CONFIRM_YES', confidence: 1 };
  if (/^(нет|не надо|отмена|отмени)$/.test(c)) return { name: 'CONFIRM_NO', confidence: 1 };

  if (/^(дальше|далее)$/.test(c)) return { name: 'CONTEXT_NEXT', confidence: .98 };
  if (/^(назад|предыдущий|предыдущая)$/.test(c)) return { name: 'CONTEXT_PREV', confidence: .98 };
  if (/^(перв|втор|трет|четверт|пят|шест|седьм|восьм|девят|\d+)/.test(c)) {
    return { name: 'CONTEXT_SELECT', confidence: .9, index: contextStore.resolveOrdinal(c) };
  }
  if (/^(открой|покажи|прочитай|зачитай)\s+(его|ее|её|это|этот|эту|тот|ту)$/.test(c)) {
    return { name: 'CONTEXT_ACT', confidence: .95 };
  }

  if (includesAny(c, ['не понимаю', 'что произошло', 'что случилось', 'помоги', 'что нажать', 'куда пропало', 'не могу открыть'])) {
    return { name: 'HELP_ME', confidence: .92 };
  }

  if (/привет|здравствуй|добрый (день|вечер|утро)/.test(c)) return { name: 'GREETING', confidence: .98 };
  if (/помощь|что ты умеешь/.test(c)) return { name: 'HELP', confidence: .98 };

  if (/который час|сколько времени|время сейчас|какое число|какая дата|день недели|неделя года|до нового года|время в мире|какое число будет через|сколько.*(прошло|до)/.test(c)) {
    return { name: 'TIME_DATE', confidence: .95 };
  }

  if (/таймер|напомни|напоминан|помодоро|секундомер|сколько осталось/.test(c)) {
    return { name: 'TIMER', confidence: .95 };
  }

  if (/задач|план на сегодня|важная|важные|очисти выполненные|выполни/.test(c)) {
    return { name: 'TASKS', confidence: .92 };
  }

  if (/создай список|добавь в |покажи все списки|вычеркни|очисти список|удали список|сколько позиций/.test(c)) {
    return { name: 'LISTS', confidence: .92 };
  }

  if (/заметк|^запиши|найди в заметках/.test(c)) {
    return { name: 'NOTES', confidence: .92 };
  }

  if (/погода|будет дождь|нужна куртка|уф|рассвет|закат|прогноз на неделю|фаз.*луны/.test(c)) {
    return { name: 'WEATHER', confidence: .98 };
  }

  if (/посчитай|процент|случайное число|дюйм|килограмм|километр/.test(c)) {
    return { name: 'CALCULATOR', confidence: .9 };
  }

  if (/переведи|как по-английски/.test(c)) {
    return { name: 'TRANSLATE', confidence: .9 };
  }

  if (/в этот день|кто такой|кто такая|что такое|расскажи про|столица|население/.test(c)) {
    return { name: 'KNOWLEDGE', confidence: .9 };
  }

  if (/анекдот|факт|комплимент|совет|мотивируй|монетк|кубик|камень.*ножницы|ножницы.*бумага|загадк|^ответ|^еще|^ещё|другой|что посмотреть|что приготовить|что съесть|идея подарка|что подарить/.test(c)) {
    return { name: 'ENTERTAINMENT', confidence: .88 };
  }

  if (/компьютер|пк|программ|окн|файл|документ|папк|загрузк|рабочий стол|браузер|хром|телеграм|word|ворд|excel|эксель/.test(c)) {
    return { name: 'PC', confidence: .82 };
  }

  if (/найди фото|^найди|^поищи|^поиск|покажи еще|покажи ещё|назад к списку|открой сайт|^открой|^зачитай|прочитай вслух|озвучь|стоп чтение|хватит читать|замолчи/.test(c)) {
    return { name: 'BROWSER', confidence: .86 };
  }

  return { name: 'UNKNOWN', confidence: .2 };
}

module.exports = { detectIntent };

};

__modules["src/core/request-context.js"] = function(module, exports, __require, require) {
function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,!?;:"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getUserId(body) {
  const s = body.session || {};
  return (s.user && s.user.user_id) ||
    (s.application && s.application.application_id) ||
    s.user_id ||
    'anonymous';
}

function getSessionId(body) {
  return (body.session && body.session.session_id) || 'no-session';
}

function indexEntities(body) {
  const entities = (((body || {}).request || {}).nlu || {}).entities || [];
  const out = { raw: entities, geo: [], datetime: [], number: [], fio: [] };
  for (const e of entities) {
    if (!e || !e.type) continue;
    if (e.type === 'YANDEX.GEO') out.geo.push(e.value || {});
    else if (e.type === 'YANDEX.DATETIME') out.datetime.push(e.value || {});
    else if (e.type === 'YANDEX.NUMBER') out.number.push(e.value);
    else if (e.type === 'YANDEX.FIO') out.fio.push(e.value || {});
  }
  return out;
}

function buildRequestContext(body) {
  const request = (body && body.request) || {};
  return {
    rawBody: body || {},
    userId: getUserId(body || {}),
    sessionId: getSessionId(body || {}),
    messageId: ((body || {}).session || {}).message_id || 0,
    isNewSession: !!(((body || {}).session || {}).new),
    command: normalizeText(request.command),
    originalUtterance: String(request.original_utterance || request.command || '').trim(),
    type: request.type || 'SimpleUtterance',
    entities: indexEntities(body || {}),
    intents: (((request.nlu || {}).intents) || {}),
    meta: (body && body.meta) || {}
  };
}

module.exports = { buildRequestContext, normalizeText };

};

__modules["src/core/router.js"] = function(module, exports, __require, require) {
const { detectIntent } = __require("src/core/intent-engine.js");

const MAP = {
  TIME_DATE:'time_date',
  TIMER:'timer',
  TASKS:'tasks',
  LISTS:'lists',
  NOTES:'notes',
  WEATHER:'weather',
  CALCULATOR:'calculator',
  TRANSLATE:'translate',
  KNOWLEDGE:'knowledge',
  ENTERTAINMENT:'entertainment',
  BROWSER:'browser',
  PC:'pc'
};

async function route(ctx, runtime) {
  const intent = detectIntent(ctx, runtime.context);
  runtime.context.remember(ctx,{lastIntent:intent.name});

  if(intent.name==='EMPTY')return{reply:'Я слушаю.'};
  if(intent.name==='GREETING')return{reply:'Привет. Я на связи.'};
  if(intent.name==='HELP')return{reply:'Можно говорить обычными словами: задачи, заметки, списки, погода, поиск, расчёты. Контур компьютера подключается отдельным модулем.'};

  if(intent.name==='HELP_ME'){
    runtime.context.remember(ctx,{pendingClarification:{type:'pc_help'}});
    return{reply:'Помогу. Скажи, что сейчас видишь на экране или что хотела сделать. Когда подключим Windows Agent, я смогу сама получить состояние окна.'};
  }

  if(intent.name==='CONTEXT_SELECT'){
    const s=runtime.context.session(ctx.sessionId), n=intent.index;
    if(!n||!s.lastResults[n-1])return{reply:'Сейчас нет такого результата.'};
    const obj=s.lastResults[n-1];
    runtime.context.remember(ctx,{selectedIndex:n,lastReferencedObject:obj});
    return{reply:'Выбрала '+n+': '+(obj.title||obj.name||'результат')+'. Что сделать дальше?'};
  }

  if(intent.name==='CONTEXT_ACT'){
    const obj=runtime.context.resolveReference(ctx);
    if(!obj)return{reply:'Не поняла, о чём речь. Назови объект.'};
    if(obj.url){
      const synthetic={...ctx,command:'открой '+(runtime.context.session(ctx.sessionId).selectedIndex||1)};
      return await runtime.registry.run('browser',{ctx:synthetic},runtime);
    }
    return{reply:'Помню объект, но для него пока нет такого действия.'};
  }

  if(intent.name==='CONTEXT_NEXT'||intent.name==='CONTEXT_PREV'){
    const obj=runtime.context.resolveReference(ctx);
    if(obj&&obj.type==='web'){
      obj.page += intent.name==='CONTEXT_NEXT'?1:-1;
      obj.page=Math.max(0,Math.min(obj.page,obj.pages.length-1));
      runtime.context.remember(ctx,{lastReferencedObject:obj});
      return{reply:obj.pages[obj.page].slice(0,950)};
    }
    return{reply:'Сейчас нечего листать.'};
  }

  if(intent.name==='CONFIRM_YES'||intent.name==='CONFIRM_NO'){
    const s=runtime.context.session(ctx.sessionId);
    if(!s.pendingClarification)return{reply:'Сейчас нечего подтверждать.'};
    s.pendingClarification=null;
    return{reply:intent.name==='CONFIRM_YES'?'Поняла.':'Хорошо, отменяю.'};
  }

  if(intent.name==='UNKNOWN'){
    return{reply:'Я поняла слова, но пока не уверена, что именно нужно сделать. Скажи цель обычной фразой — например: «найди документ», «запиши заметку» или «помоги с компьютером».'};
  }

  const toolName=MAP[intent.name];
  if(!toolName)return{reply:'Этот сценарий ещё не подключён.'};
  const result=await runtime.registry.run(toolName,{ctx,intent},runtime);
  runtime.context.remember(ctx,{lastTool:toolName,...(result.remember||{})});
  return result;
}

module.exports = { route };

};

__modules["src/core/safety.js"] = function(module, exports, __require, require) {
const RISK = {
  READ: 'read',
  CHANGE: 'change',
  DANGEROUS: 'dangerous'
};

function requiresConfirmation(risk) {
  return risk === RISK.DANGEROUS;
}

module.exports = { RISK, requiresConfirmation };

};

__modules["src/core/tool-registry.js"] = function(module, exports, __require, require) {
class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    if (!tool || !tool.name || typeof tool.run !== 'function') {
      throw new Error('Invalid tool registration');
    }
    if (this.tools.has(tool.name)) throw new Error(`Duplicate tool: ${tool.name}`);
    this.tools.set(tool.name, tool);
    return this;
  }

  has(name) { return this.tools.has(name); }
  get(name) { return this.tools.get(name); }

  async run(name, input, runtime) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return await tool.run(input || {}, runtime || {});
  }

  list() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description || '',
      risk: t.risk || 'read'
    }));
  }
}

module.exports = { ToolRegistry };

};

__modules["src/pc/bridge.js"] = function(module, exports, __require, require) {
const { PC_AGENT_TOKEN, PC_AGENT_TTL_MS } = __require("src/config.js");

class PcBridge {
  constructor() {
    this.agents = new Map();
    this.jobs = [];
    this.waiters = new Map();
  }

  configured() {
    return !!PC_AGENT_TOKEN;
  }

  authorize(req) {
    if (!PC_AGENT_TOKEN) return false;
    return String(req.headers.authorization || '') === 'Bearer ' + PC_AGENT_TOKEN;
  }

  heartbeat(machine, meta = {}) {
    const id = machine || 'home-pc';
    const prev = this.agents.get(id);
    this.agents.set(id, {
      lastSeen: Date.now(),
      meta: { ...((prev && prev.meta) || {}), ...(meta || {}) }
    });
  }

  online(machine = 'home-pc') {
    const a = this.agents.get(machine);
    return !!a && Date.now() - a.lastSeen <= PC_AGENT_TTL_MS;
  }

  status(machine = 'home-pc') {
    const a = this.agents.get(machine);
    return {
      configured: this.configured(),
      online: this.online(machine),
      lastSeen: a ? a.lastSeen : null,
      meta: a ? a.meta : null
    };
  }

  enqueue(action, args = {}, machine = 'home-pc') {
    const id = 'job_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    const job = { id, machine, action, args, createdAt: Date.now() };
    this.jobs.push(job);
    return job;
  }

  poll(machine = 'home-pc') {
    const i = this.jobs.findIndex(j => j.machine === machine);
    if (i < 0) return null;
    return this.jobs.splice(i, 1)[0];
  }

  waitResult(id, timeoutMs = 3000) {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this.waiters.delete(id);
        resolve(null);
      }, timeoutMs);
      this.waiters.set(id, result => {
        clearTimeout(timer);
        this.waiters.delete(id);
        resolve(result);
      });
    });
  }

  complete(id, result) {
    const done = this.waiters.get(id);
    if (done) done(result);
    return !!done;
  }

  async run(action, args = {}, machine = 'home-pc') {
    if (!this.configured()) return { ok:false, code:'NOT_CONFIGURED', message:'Windows Agent ещё не настроен.' };
    if (!this.online(machine)) return { ok:false, code:'OFFLINE', message:'Компьютер сейчас не на связи. Возможно, он выключен или спит.' };
    const job = this.enqueue(action, args, machine);
    const result = await this.waitResult(job.id, 3000);
    if (!result) return { ok:true, accepted:true, message:'Команду компьютеру передала.' };
    return result;
  }
}

module.exports = { PcBridge };

};

__modules["src/services/weather.js"] = function(module, exports, __require, require) {
const WMO = {
  0:'ясно',1:'в основном ясно',2:'переменная облачность',3:'пасмурно',
  45:'туман',48:'туман',51:'морось',53:'морось',55:'морось',
  61:'небольшой дождь',63:'дождь',65:'сильный дождь',
  71:'небольшой снег',73:'снег',75:'сильный снег',
  80:'ливень',81:'ливень',82:'сильный ливень',
  85:'снегопад',86:'снегопад',95:'гроза',96:'гроза',99:'гроза'
};

function wmo(c){ return WMO[c] || ('код ' + c); }
function isRain(c){ return (c>=51&&c<=67)||(c>=80&&c<=82)||(c>=95&&c<=99); }

async function geoCity(name) {
  try {
    const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(name) + '&count=1&language=ru&format=json');
    const j = await r.json();
    return j.results && j.results[0] ? j.results[0] : null;
  } catch (e) {
    console.error('[weather.geo]', e.message);
    return null;
  }
}

async function weatherFor(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
    '&longitude=' + lon +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max' +
    '&timezone=auto&forecast_days=7';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Weather HTTP ${r.status}`);
  return await r.json();
}

module.exports = { geoCity, weatherFor, wmo, isRain };

};

__modules["src/services/web.js"] = function(module, exports, __require, require) {
function decode(s){return String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&amp;/g,'&');}
function strip(s){return decode(String(s).replace(/<[^>]+>/g,''));}

async function ddgSearch(q,p){
  try{
    const r=await fetch('https://lite.duckduckgo.com/lite/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0'}});
    const h=await r.text();const out=[];const re=/<a[^>]+rel="nofollow"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(m[1].startsWith('http')&&t&&!m[1].includes('duckduckgo'))out.push({title:t,url:m[1]});}
    return out;
  }catch(e){console.error('[search.ddg]',e.message);return[];}
}

async function ddgHtmlSearch(q,p){
  try{
    const r=await fetch('https://html.duckduckgo.com/html/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0'}});
    const h=await r.text();const out=[];const re=/<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;while((m=re.exec(h))&&out.length<6){let href=m[1];if(href.includes('uddg=')){try{href=decodeURIComponent(href.split('uddg=')[1].split('&')[0]);}catch{}}
      const t=strip(m[2]).trim();if(href.startsWith('http')&&t)out.push({title:t,url:href});}
    return out;
  }catch(e){console.error('[search.ddgHtml]',e.message);return[];}
}

async function bingSearch(q){
  try{
    const r=await fetch('https://www.bing.com/search?q='+encodeURIComponent(q),{headers:{'User-Agent':'Mozilla/5.0','Accept-Language':'ru-RU,ru;q=0.9'}});
    const h=await r.text();const out=[];const re=/<li class="b_algo"[\s\S]*?<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(t&&!m[1].includes('bing.com')&&!m[1].includes('microsoft.com'))out.push({title:t,url:m[1]});}
    return out;
  }catch(e){console.error('[search.bing]',e.message);return[];}
}

async function searchAll(q,p=0){let r=await ddgSearch(q,p);if(!r.length)r=await ddgHtmlSearch(q,p);if(!r.length)r=await bingSearch(q);return r;}

async function readPage(url){
  try{new URL(url);}catch{return null;}
  try{
    const r=await fetch('https://r.jina.ai/'+url,{headers:{'User-Agent':'Mozilla/5.0'}});
    let t=await r.text();
    t=t.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[#>*`_]/g,'').replace(/\n{3,}/g,'\n\n');
    if(t.length>300)return t.slice(0,20000);
  }catch(e){console.error('[read.jina]',e.message);}
  try{
    const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});
    let h=await r.text();
    h=h.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'');
    const parts=h.match(/<(p|h1|h2|h3|li)[^>]*>([\s\S]*?)<\/(p|h1|h2|h3|li)>/gi)||[];
    return parts.map(strip).filter(x=>x.length>40).join('\n\n').slice(0,20000)||null;
  }catch(e){console.error('[read.direct]',e.message);return null;}
}

function splitPages(t){
  const pages=[];let cur='';
  String(t||'').split(/\n+/).forEach(p=>{if((cur+p).length>1200&&cur){pages.push(cur.trim());cur='';}cur+=p+'\n';});
  if(cur.trim())pages.push(cur.trim());
  return pages.length?pages:[String(t||'')];
}

async function wikiSummary(q){
  try{
    const s=await fetch('https://ru.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=1&format=json&origin=*');
    const a=await s.json();const title=a[1]&&a[1][0];if(!title)return null;
    const r=await fetch('https://ru.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(title));
    const j=await r.json();return j.extract?{title:j.title,text:j.extract}:null;
  }catch(e){console.error('[wiki]',e.message);return null;}
}

async function translate(t,dir){
  try{
    const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(t)+'&langpair='+dir);
    const j=await r.json();return j.responseData?j.responseData.translatedText:null;
  }catch(e){console.error('[translate]',e.message);return null;}
}


async function wikiImages(q){
  try{
    const r=await fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch='+encodeURIComponent('filetype:bitmap '+q)+'&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=480');
    const j=await r.json();const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];
    pages.sort((a,b)=>(a.index||0)-(b.index||0));
    return pages.map(p=>p.imageinfo&&p.imageinfo[0]?{thumb:p.imageinfo[0].thumburl}:null).filter(Boolean);
  }catch(e){console.error('[images]',e.message);return[];}
}
async function onThisDay(){
  try{
    const d=new Date(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
    const r=await fetch('https://ru.wikipedia.org/api/rest_v1/feed/onthisday/events/'+mm+'/'+dd);
    const j=await r.json();return (j.events||[]).filter(e=>e.text&&e.year).slice(0,5);
  }catch(e){console.error('[onThisDay]',e.message);return[];}
}
module.exports = { searchAll, readPage, splitPages, wikiSummary, translate, wikiImages, onThisDay };

};

__modules["src/storage/github-storage.js"] = function(module, exports, __require, require) {
const crypto = require('crypto');
const { GH_TOKEN, GH_REPO, STORAGE_FILE } = __require("src/config.js");

function userKey(userId) {
  return crypto.createHash('sha256').update(String(userId || 'anonymous')).digest('hex').slice(0, 24);
}

class GitHubStorage {
  constructor() {
    this.sha = null;
    this.state = { schemaVersion: 2, users: {}, legacy: null, migratedTo: null };
    this.saveTimer = null;
  }

  async load() {
    if (!GH_TOKEN) return this.state;
    try {
      const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${STORAGE_FILE}`, {
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          'User-Agent': 'alice-smart-assistant',
          Accept: 'application/vnd.github+json'
        }
      });
      if (r.status !== 200) return this.state;
      const j = await r.json();
      this.sha = j.sha;
      const parsed = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8'));

      if (parsed && parsed.schemaVersion === 2 && parsed.users) {
        this.state = parsed;
      } else {
        this.state = {
          schemaVersion: 2,
          users: {},
          legacy: {
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
            lists: parsed.lists && typeof parsed.lists === 'object' ? parsed.lists : {},
            notes: Array.isArray(parsed.notes) ? parsed.notes : [],
            city: parsed.city || 'Москва'
          },
          migratedTo: null
        };
      }
    } catch (e) {
      console.error('[storage.load]', e.message);
    }
    return this.state;
  }

  ensureUser(userId) {
    const key = userKey(userId);
    if (!this.state.users[key]) {
      let seed = { tasks: [], lists: {}, notes: [], city: 'Москва', profile: {} };
      if (this.state.legacy && !this.state.migratedTo) {
        seed = { ...seed, ...this.state.legacy };
        this.state.migratedTo = key;
      }
      this.state.users[key] = seed;
    }
    return this.state.users[key];
  }

  scheduleSave() {
    if (!GH_TOKEN) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save().catch(e => console.error('[storage.save]', e.message)), 1200);
  }

  async save() {
    if (!GH_TOKEN) return;
    const body = {
      message: 'smart-assistant data',
      content: Buffer.from(JSON.stringify(this.state, null, 2)).toString('base64')
    };
    if (this.sha) body.sha = this.sha;

    const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${STORAGE_FILE}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        'User-Agent': 'alice-smart-assistant',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json'
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) throw new Error(`GitHub storage HTTP ${r.status}`);
    const j = await r.json();
    if (j.content && j.content.sha) this.sha = j.content.sha;
  }
}

module.exports = { GitHubStorage, userKey };

};

__modules["src/tools/browser.js"] = function(module, exports, __require, require) {
const { searchAll, readPage, splitPages, wikiImages } = __require("src/services/web.js");
const { searchCard, textCard, card } = __require("src/ui/cards.js");

function imageCard(q,imgs){return card('Фото: '+q,'<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">'+imgs.map(x=>'<img src="'+x.thumb+'" style="max-width:100%;border-radius:8px">').join('')+'</div>');}

module.exports={
  name:'browser',description:'Поиск, изображения и чтение веб-страниц',risk:'read',
  async run(input,runtime){
    const ctx=input.ctx,c=ctx.command,s=runtime.context.session(ctx.sessionId);

    if(/найди фото/.test(c)){const q=c.replace(/.*найди фото/,'').trim()||'кот';const imgs=await wikiImages(q);return imgs.length?{reply:'Нашла фотографии.',html:imageCard(q,imgs)}:{reply:'Не нашла фото.'};}

    if(/^найди|^поищи|^поиск/.test(c)){
      const q=c.replace(/^(найди|поищи|поиск)/,'').trim();if(!q)return{reply:'Что найти?'};
      const results=await searchAll(q,0);if(!results.length)return{reply:'Не нашла результатов.'};
      runtime.context.remember(ctx,{lastIntent:'BROWSER',lastTool:'browser',lastResults:results,searchQuery:q,searchPage:0,selectedIndex:null});
      return{reply:'Нашла '+results.length+' результатов.',html:searchCard(q,results)};
    }

    if(/покажи еще|покажи ещё/.test(c)){
      if(!s.searchQuery)return{reply:'Сначала что-нибудь найди.'};
      const page=(s.searchPage||0)+1,results=await searchAll(s.searchQuery,page);if(!results.length)return{reply:'Больше результатов не нашла.'};
      runtime.context.remember(ctx,{lastResults:results,searchPage:page,selectedIndex:null});
      return{reply:'Показала следующую страницу.',html:searchCard(s.searchQuery,results)};
    }

    if(/открой сайт/.test(c)){
      const name=c.replace(/.*открой сайт/,'').trim().replace(/\s+/g,'');let url=null;
      if(name.includes('.'))url='https://'+name;else{const r=await searchAll(name+' официальный сайт',0);if(r.length)url=r[0].url;}
      if(!url)return{reply:'Не нашла сайт.'};
      const text=await readPage(url);if(!text)return{reply:'Не смогла прочитать сайт.'};
      const obj={type:'web',title:name,url,pages:splitPages(text),page:0};runtime.context.remember(ctx,{lastReferencedObject:obj});
      return{reply:'Открыла сайт в режиме чтения.',html:textCard(name,obj.pages[0])};
    }

    if(/^открой/.test(c)){
      const n=runtime.context.resolveOrdinal(c);if(!n||!s.lastResults[n-1])return{reply:'Назови номер результата, например: открой второй.'};
      const r=s.lastResults[n-1],text=await readPage(r.url);if(!text)return{reply:'Не смогла прочитать страницу.'};
      const obj={type:'web',title:r.title,url:r.url,pages:splitPages(text),page:0};runtime.context.remember(ctx,{lastReferencedObject:obj,selectedIndex:n});
      return{reply:'Открыла '+r.title+'.',html:textCard(r.title,obj.pages[0])};
    }

    if(/назад к списку/.test(c)){if(!s.lastResults.length)return{reply:'Списка нет.'};return{reply:'Вернулась к результатам.',html:searchCard(s.searchQuery||'поиск',s.lastResults)};}

    if(/^зачитай|прочитай вслух|озвучь/.test(c)){const obj=runtime.context.resolveReference(ctx);if(obj&&obj.type==='web')return{reply:'Зачитываю.',speakOnly:obj.pages[obj.page].slice(0,1000)};if(s.lastResults.length)return{reply:'Зачитываю результаты.',speakOnly:s.lastResults.map((x,i)=>(i+1)+'. '+x.title).join('. ')};return{reply:'Нечего зачитывать.'};}
    if(/стоп чтение|хватит читать|замолчи/.test(c))return{reply:'Остановилась.',stopSpeak:true};

    return{reply:'Скажи: найди …, затем открой второй.'};
  }
};

};

__modules["src/tools/calculator.js"] = function(module, exports, __require, require) {
function nums(s){return (String(s).match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>Number(x.replace(',','.')));}
function calcExpr(s){
  const t=String(s).replace(/плюс/g,'+').replace(/минус/g,'-').replace(/умножить/g,'*').replace(/разделить/g,'/').replace(/[хx×]/g,'*').replace(/:/g,'/').replace(/,/g,'.').replace(/[^0-9.+\-*/() ]/g,'');
  if(!t.trim()||!/\d/.test(t))return null;
  try{const v=Function('"use strict";return ('+t+')')();return typeof v==='number'&&isFinite(v)?Math.round(v*100)/100:null;}catch{return null;}
}
module.exports = {
  name:'calculator', description:'Калькулятор', risk:'read',
  async run(input){
    const c=input.ctx.command;
    if(/посчитай/.test(c)){const v=calcExpr(c.replace(/.*посчитай/,''));return{reply:v===null?'Не поняла выражение.':'Равно '+v+'.'};}
    if(/процент.*от/.test(c)){const n=nums(c);if(n.length>=2)return{reply:String(Math.round((n[0]*n[1]/100)*100)/100)};}
    if(/прибавь.*процент/.test(c)){const n=nums(c);if(n.length>=2){const v=n[1]*(1+n[0]/100);return{reply:String(Math.round(v*100)/100)};}}
    if(/раздели.*на.*человек/.test(c)){const n=nums(c);if(n.length>=2&&n[1])return{reply:'По '+Math.round(n[0]/n[1]*100)/100+' на каждого.'};}
    if(/случайное число/.test(c)){const n=nums(c),a=n[0]||1,b=n[1]||100;return{reply:'Выпало '+(a+Math.floor(Math.random()*(b-a+1)))+'.'};}
    if(/дюйм/.test(c)){const n=nums(c)[0]||1;return{reply:(n/2.54).toFixed(2)+' дюймов.'};}
    if(/килограмм/.test(c)){const n=nums(c)[0]||1;return{reply:(n*2.2046).toFixed(2)+' фунтов.'};}
    if(/километр/.test(c)){const n=nums(c)[0]||1;return{reply:(n*0.6214).toFixed(2)+' миль.'};}
    return{reply:'Скажи, например: посчитай 25 умножить на 4.'};
  }
};

};

__modules["src/tools/entertainment.js"] = function(module, exports, __require, require) {
const JOKES=[
'Программист ставит на ночь два стакана: один с водой — если захочет пить, второй пустой — если не захочет.',
'Почему программисты путают Хэллоуин и Рождество? Потому что OCT 31 равно DEC 25.',
'У программиста спрашивают: почему ты такой спокойный? У меня всё в try-catch.'
];
const FACTS=['Осьминоги имеют три сердца и голубую кровь.','Свет Солнца доходит до Земли примерно за восемь минут двадцать секунд.','На Венере день длиннее года.'];
const SPACE=['Космос практически бесшумен: звуку нужна среда для распространения.','На Венере день длиннее года.'];
const ANIMALS=['Сердце креветки находится в головогруди.','Тигры имеют полосатую кожу, а не только шерсть.'];
const COMPLIMENTS=['С тобой любая задача становится проще.','Ты из тех людей, кто доводит дело до конца.'];
const ADVICE=['Сделай сегодня одно маленькое дело, которое давно откладывал.','Прогуляйся пятнадцать минут без телефона.'];
const MOTIVATE=['Большие дела начинаются с маленьких шагов.','Ошибки — это данные для следующей попытки.'];
const MOVIES=[['Интерстеллар','космос, любовь и физика'],['Начало','сны внутри снов'],['Матрица','что реально?']];
const DISHES=[['Паста карбонара','около двадцати минут'],['Овощное рагу','около тридцати минут'],['Сырники','около двадцати пяти минут']];
const GIFTS=['Настольная игра','Термокружка','Книга','Фотоальбом'];
const RIDDLES=[{q:'Что можно увидеть с закрытыми глазами?',a:'Сон'},{q:'Чем больше из неё берёшь, тем больше она становится?',a:'Яма'}];
const states=new Map(),pick=a=>a[Math.floor(Math.random()*a.length)];
function st(k){if(!states.has(k))states.set(k,{last:'fact',riddle:null});return states.get(k);}
module.exports={
  name:'entertainment',description:'Развлечения',risk:'read',
  async run(input){
    const c=input.ctx.command,s=st(input.ctx.userId);
    if(/анекдот/.test(c)){s.last='joke';return{reply:pick(JOKES)};}
    if(/факт о космосе/.test(c)){s.last='space';return{reply:pick(SPACE)};}
    if(/факт о животных/.test(c)){s.last='animals';return{reply:pick(ANIMALS)};}
    if(/факт/.test(c)){s.last='fact';return{reply:pick(FACTS)};}
    if(/^еще|^ещё|другой/.test(c)){return{reply:pick(s.last==='joke'?JOKES:s.last==='space'?SPACE:s.last==='animals'?ANIMALS:FACTS)};}
    if(/комплимент/.test(c))return{reply:pick(COMPLIMENTS)};
    if(/совет/.test(c))return{reply:pick(ADVICE)};
    if(/мотивируй/.test(c))return{reply:pick(MOTIVATE)};
    if(/монетк/.test(c))return{reply:Math.random()<.5?'Орёл.':'Решка.'};
    if(/кубик/.test(c))return{reply:'Выпало '+(1+Math.floor(Math.random()*6))+'.'};

    if(/камень.*ножницы|ножницы.*бумага/.test(c)){
      const hands=['камень','ножницы','бумага'],me=pick(hands),m=c.match(/(камень|ножницы|бумага)\s*$/),you=m?m[1]:null;
      if(!you)return{reply:'Выбери: камень, ножницы или бумага.'};
      if(me===you)return{reply:'Я выбрала '+me+'. Ничья.'};
      const win=(you==='камень'&&me==='ножницы')||(you==='ножницы'&&me==='бумага')||(you==='бумага'&&me==='камень');
      return{reply:'Я выбрала '+me+'. '+(win?'Ты выиграла.':'Я выиграла.')};
    }
    if(/загадк/.test(c)){s.riddle=pick(RIDDLES);return{reply:s.riddle.q};}
    if(/^ответ/.test(c)&&s.riddle)return{reply:s.riddle.a};
    if(/что посмотреть/.test(c)){const x=pick(MOVIES);return{reply:'Советую '+x[0]+': '+x[1]+'.'};}
    if(/что приготовить|что съесть/.test(c)){const x=pick(DISHES);return{reply:'Можно приготовить '+x[0]+', '+x[1]+'.'};}
    if(/идея подарка|что подарить/.test(c))return{reply:'Идея: '+pick(GIFTS)+'.'};
    return{reply:'Могу рассказать анекдот, факт, загадку, предложить фильм, блюдо или подарок.'};
  }
};

};

__modules["src/tools/knowledge.js"] = function(module, exports, __require, require) {
const { wikiSummary, onThisDay } = __require("src/services/web.js");
module.exports={
  name:'knowledge',description:'Справочная информация',risk:'read',
  async run(input){
    const c=input.ctx.command;
    if(/в этот день/.test(c)){const ev=await onThisDay();return ev.length?{reply:ev.slice(0,3).map(x=>x.year+': '+x.text).join('. ')}:{reply:'Не нашла события этого дня.'};}
    const q=c.replace(/.*(кто такой|кто такая|что такое|расскажи про|столица|население)/,'').trim();
    if(!q)return{reply:'О чём рассказать?'};
    const s=await wikiSummary(q);
    return s?{reply:s.text.slice(0,950),remember:{lastReferencedObject:{type:'knowledge',title:s.title,text:s.text}}}:{reply:'Не нашла информацию.'};
  }
};

};

__modules["src/tools/lists.js"] = function(module, exports, __require, require) {
const { rows } = __require("src/ui/cards.js");
function findList(c, lists){for(const k of Object.keys(lists))if(c.includes(k))return k;return null;}
module.exports = {
  name:'lists', description:'Пользовательские списки', risk:'change',
  async run(input, runtime){
    const c=input.ctx.command,u=runtime.storage.ensureUser(input.ctx.userId),lists=u.lists;
    if(/создай список/.test(c)){const n=c.replace(/.*создай список/,'').trim();if(!n)return{reply:'Как назвать список?'};lists[n]=lists[n]||[];runtime.storage.scheduleSave();return{reply:'Список «'+n+'» создан.'};}
    if(/добавь в /.test(c)){
      const rest=c.replace(/.*добавь в /,'');let name=findList(rest,lists),items='';
      if(name)items=rest.slice(rest.indexOf(name)+name.length).replace(/^[:\s]+/,'');
      else if(rest.includes(':')){name=rest.split(':')[0].trim();items=rest.split(':').slice(1).join(':').trim();}
      if(!name)return{reply:'В какой список?'};if(!items)return{reply:'Что добавить?'};
      lists[name]=lists[name]||[];items.split(/,| и /).map(x=>x.trim()).filter(Boolean).forEach(x=>lists[name].push({text:x,done:false}));
      runtime.storage.scheduleSave();return{reply:'Добавила в список «'+name+'».'};
    }
    if(/покажи все списки/.test(c)){const flat=[];for(const [k,v] of Object.entries(lists)){flat.push('['+k+']');for(const x of v)flat.push((x.done?'✓ ':'')+x.text);}return{reply:Object.keys(lists).length?'Списки показала.':'Списков пока нет.',html:rows('Списки',flat)};}
    if(/вычеркни/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0),k=findList(c,lists);if(k&&n&&lists[k][n-1]){lists[k][n-1].done=true;runtime.storage.scheduleSave();return{reply:'Вычеркнула.'};}return{reply:'Не нашла позицию.'};}

    if(/удали \d+ из/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0),k=findList(c,lists);if(k&&n&&lists[k][n-1]){const x=lists[k].splice(n-1,1)[0];runtime.storage.scheduleSave();return{reply:'Удалила: '+x.text};}return{reply:'Не нашла позицию.'};}
    if(/зачитай /.test(c)){const k=findList(c,lists);if(k)return{reply:'Зачитываю.',speakOnly:k+': '+lists[k].map((x,i)=>(i+1)+'. '+x.text).join('. ')};}
    if(/покажи /.test(c)&&!/покажи все списки/.test(c)){const k=findList(c,lists);if(k)return{reply:'Список «'+k+'» показала.',html:rows(k,lists[k].map(x=>(x.done?'✓ ':'')+x.text))};}
    if(/очисти список/.test(c)){const k=findList(c,lists);if(k){lists[k]=[];runtime.storage.scheduleSave();return{reply:'Список очищен.'};}return{reply:'Какой список очистить?'};}
    if(/удали список/.test(c)){const k=c.replace(/.*удали список/,'').trim();if(lists[k]){delete lists[k];runtime.storage.scheduleSave();return{reply:'Список удалён.'};}return{reply:'Не нашла список.'};}
    if(/сколько позиций/.test(c)){const k=findList(c,lists);return{k,reply:k?'Осталось позиций: '+lists[k].filter(x=>!x.done).length+'.':'В каком списке?'};}
    return{reply:'Скажи: создай список…, добавь в список… или покажи все списки.'};
  }
};

};

__modules["src/tools/notes.js"] = function(module, exports, __require, require) {
const { rows } = __require("src/ui/cards.js");
module.exports = {
  name:'notes', description:'Заметки пользователя', risk:'change',
  async run(input, runtime){
    const c=input.ctx.command,u=runtime.storage.ensureUser(input.ctx.userId),notes=u.notes;
    if(/^запиши/.test(c)){const t=c.replace(/^запиши/,'').trim();if(!t)return{reply:'Что записать?'};notes.push(t);runtime.storage.scheduleSave();return{reply:'Записала.'};}
    if(/покажи заметки/.test(c))return{reply:notes.length?'Заметки показала.':'Заметок пока нет.',html:rows('Заметки',notes)};
    if(/найди в заметках/.test(c)){const q=c.replace(/.*найди в заметках/,'').trim();const f=notes.filter(x=>x.includes(q));return{reply:f.length?'Нашла '+f.length+'.':'Не нашла.',html:rows('Найдено',f)};}
    if(/зачитай заметки/.test(c))return{reply:notes.length?'Зачитываю.':'Заметок нет.',speakOnly:notes.join('. ')};
    if(/удали заметку/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&notes[n-1]){notes.splice(n-1,1);runtime.storage.scheduleSave();return{reply:'Удалила.'};}return{reply:'Не нашла заметку.'};}
    if(/очисти заметки/.test(c)){u.notes=[];runtime.storage.scheduleSave();return{reply:'Заметки очищены.'};}
    return{reply:'Скажи: запиши…, покажи заметки или найди в заметках…'};
  }
};

};

__modules["src/tools/pc.js"] = function(module, exports, __require, require) {
const APP_ALIASES = [
  ['google chrome','chrome'],['хром','chrome'],['chrome','chrome'],
  ['яндекс браузер','yandex'],['яндекс-браузер','yandex'],
  ['телеграм','telegram'],['telegram','telegram'],
  ['ворд','word'],['word','word'],
  ['эксель','excel'],['excel','excel'],
  ['блокнот','notepad'],['калькулятор','calculator'],
  ['проводник','explorer']
];

function appFrom(text) {
  for (const [phrase, app] of APP_ALIASES) if (text.includes(phrase)) return app;
  if (text.includes('браузер')) return 'browser';
  return null;
}

function resultReply(r, fallback) {
  if (!r) return { reply:'Не получила ответ от компьютера.' };
  // Windows Agent transport may run under legacy Windows PowerShell encodings.
  // Never use human-readable text returned by the agent in Alice responses.
  // The agent returns execution status/data; all Russian user-facing text is generated here on Render.
  if (r.ok === false) {
    const code = String(r.code || '');
    const errors = {
      APP_NOT_FOUND: 'Не нашла эту программу на компьютере.',
      NOT_FOUND: 'Ничего похожего не нашла.',
      NOT_ALLOWED: 'Эта команда компьютеру не разрешена.',
      FAILED: 'Не получилось выполнить команду на компьютере.'
    };
    return { reply: errors[code] || 'Не получилось выполнить команду на компьютере.' };
  }
  return { reply: fallback || 'Готово.' };
}

module.exports = {
  name:'pc', description:'Безопасное управление Windows через локальный агент', risk:'read',
  async run(input, runtime){
    const c=input.ctx.command, bridge=runtime.pcBridge;

    if(/статус компьютера|компьютер.*на связи|пк.*на связи/.test(c)){
      const s=bridge.status();
      if(!s.configured)return{reply:'Windows Agent ещё не настроен на сервере.'};
      return{reply:s.online?'Компьютер на связи.':'Компьютер сейчас не на связи.'};
    }

    if(/^(открой|запусти|включи)\s+/.test(c)){
      if(/загрузк/.test(c))return resultReply(await bridge.run('open_folder',{folder:'downloads'}),'Открыла загрузки.');
      if(/документ/.test(c))return resultReply(await bridge.run('open_folder',{folder:'documents'}),'Открыла документы.');
      if(/рабоч(ий|его)\s+стол/.test(c))return resultReply(await bridge.run('open_folder',{folder:'desktop'}),'Открыла рабочий стол.');
      const app=appFrom(c);
      if(app)return resultReply(await bridge.run('open_app',{app}),'Открыла программу.');
    }

    if(/последн.*(скачан|загруз)|что.*скачал|что.*загрузил/.test(c)){
      return resultReply(await bridge.run('recent_downloads',{limit:5}),'Показала последние загрузки.');
    }

    if(/^(найди|поищи)\s+(файл|документ|папку)/.test(c)){
      const q=c.replace(/^(найди|поищи)\s+(файл|документ|папку)\s*/,'').trim();
      if(!q)return{reply:'Скажи название файла или папки.'};
      return resultReply(await bridge.run('search_files',{query:q,limit:10}),'Поиск выполнила.');
    }

    if(/что сейчас открыто|какие окна открыты|покажи открытые окна/.test(c)){
      return resultReply(await bridge.run('list_windows',{}),'Показала открытые окна.');
    }

    if(/информация о компьютере|что с компьютером|состояние компьютера|почему компьютер тормозит/.test(c)){
      const s = bridge.status();
      if(!s.configured) return {reply:'Windows Agent ещё не настроен на сервере.'};
      if(!s.online) return {reply:'Компьютер сейчас не на связи.'};

      const d = (s.meta && s.meta.telemetry) || {};
      const parts = ['Компьютер на связи.'];

      if(Number.isFinite(Number(d.cpuLoadPercent))){
        parts.push('Процессор загружен примерно на '+Math.round(Number(d.cpuLoadPercent))+' процентов.');
      }

      if(Number.isFinite(Number(d.totalMemoryGB)) && Number.isFinite(Number(d.freeMemoryGB))){
        const total = Number(d.totalMemoryGB);
        const free = Number(d.freeMemoryGB);
        const used = Math.max(0,total-free);
        const pct = total>0 ? Math.round(used/total*100) : 0;
        parts.push('Оперативная память: занято '+used.toFixed(1)+' из '+total.toFixed(1)+' гигабайт, '+pct+' процентов.');
      }

      if(Number.isFinite(Number(d.diskTotalGB)) && Number.isFinite(Number(d.diskFreeGB))){
        parts.push('На диске C свободно '+Number(d.diskFreeGB).toFixed(1)+' из '+Number(d.diskTotalGB).toFixed(1)+' гигабайт.');
      }

      if(Number.isFinite(Number(d.uptimeHours))){
        parts.push('Windows работает без перезагрузки около '+Math.round(Number(d.uptimeHours))+' часов.');
      }

      if(s.meta && s.meta.version){
        parts.push('Агент версии '+s.meta.version+'.');
      }

      if(parts.length===1 || (parts.length===2 && s.meta && s.meta.version)){
        parts.push('Диагностический снимок ещё не получен. Подожди около двадцати секунд и повтори.');
      }

      return {reply:parts.join(' ')};
    }

    return{reply:'Команду для компьютера поняла не полностью. Скажи, например: «открой хром», «найди файл договор» или «что сейчас открыто».'};
  }
};

};

__modules["src/tools/tasks.js"] = function(module, exports, __require, require) {
const { rows } = __require("src/ui/cards.js");
module.exports = {
  name:'tasks', description:'Задачи пользователя', risk:'change',
  async run(input, runtime){
    const c=input.ctx.command, u=runtime.storage.ensureUser(input.ctx.userId), tasks=u.tasks;
    if(/добавь задачу/.test(c)){const t=c.replace(/.*добавь задачу/,'').trim();if(!t)return{reply:'Какую задачу добавить?'};tasks.push({text:t,done:false,star:false});runtime.storage.scheduleSave();return{reply:'Задача добавлена: '+t,html:rows('Задачи',tasks.map(x=>(x.done?'✓ ':'')+x.text))};}
    if(/покажи важные/.test(c)){const f=tasks.filter(x=>x.star);return{reply:f.length?'Важные задачи показала.':'Важных задач нет.',html:rows('Важные задачи',f.map(x=>x.text))};}
    if(/зачитай задачи/.test(c)){return{reply:tasks.length?'Зачитываю.':'Задач нет.',speakOnly:tasks.map((x,i)=>(i+1)+'. '+x.text).join('. ')};}
    if(/покажи задачи|план на сегодня/.test(c))return{reply:tasks.length?'Задачи показала.':'Задач пока нет.',html:rows('Задачи',tasks.map(x=>(x.done?'✓ ':'')+x.text))};
    if(/сколько задач/.test(c))return{reply:'Активных задач: '+tasks.filter(x=>!x.done).length+'.'};
    if(/выполни/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&tasks[n-1]){tasks[n-1].done=true;runtime.storage.scheduleSave();return{reply:'Готово: '+tasks[n-1].text};}return{reply:'Не нашла задачу. Назови её номер.'};}
    if(/удали задачу/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&tasks[n-1]){const t=tasks[n-1].text;tasks.splice(n-1,1);runtime.storage.scheduleSave();return{reply:'Удалила задачу: '+t};}return{reply:'Не нашла задачу.'};}
    if(/очисти выполненные/.test(c)){u.tasks=tasks.filter(x=>!x.done);runtime.storage.scheduleSave();return{reply:'Выполненные задачи удалены.'};}
    if(/важная/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&tasks[n-1]){tasks[n-1].star=!tasks[n-1].star;runtime.storage.scheduleSave();return{reply:'Отметку изменила.'};}return{reply:'Какую задачу отметить? Назови номер.'};}
    return{reply:'Скажи: добавь задачу…, покажи задачи или выполни задачу номер…'};
  }
};

};

__modules["src/tools/time.js"] = function(module, exports, __require, require) {
const { TZ } = __require("src/config.js");
const { card } = __require("src/ui/cards.js");

function now(){return new Date();}
function fmtClock(d){return d.toLocaleTimeString('ru-RU',{timeZone:TZ,hour:'2-digit',minute:'2-digit'});}
function fmtDate(d){return d.toLocaleDateString('ru-RU',{timeZone:TZ,day:'numeric',month:'long',year:'numeric'});}
function fmtDay(d){return d.toLocaleDateString('ru-RU',{timeZone:TZ,weekday:'long'});}
function isoWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil((((x-y)/86400000)+1)/7);}
function firstNum(s){const m=String(s).match(/(\d+)/);return m?Number(m[1]):null;}
function daysDiff(a,b){return Math.round((b-a)/86400000);}
const MONTHS={января:0,февраля:1,марта:2,апреля:3,мая:4,июня:5,июля:6,августа:7,сентября:8,октября:9,ноября:10,декабря:11};
function parseDateRu(s){
  const m=String(s).match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
  if(!m)return null;const d=Number(m[1]),mo=MONTHS[m[2]];let y=now().getFullYear();let dt=new Date(y,mo,d);const t=now();t.setHours(0,0,0,0);
  if(/до/.test(s)&&dt<t)dt=new Date(y+1,mo,d);if(/прошло/.test(s)&&dt>t)dt=new Date(y-1,mo,d);return dt;
}
module.exports = {
  name:'time_date',
  description:'Время и даты',
  risk:'read',
  async run(input){
    const c=input.ctx.command,d=now();
    if(/который час|сколько времени|время сейчас/.test(c))return{reply:'Сейчас '+fmtClock(d)+'.'};
    if(/какое число|какая дата/.test(c))return{reply:'Сегодня '+fmtDate(d)+'.'};
    if(/день недели/.test(c))return{reply:'Сегодня '+fmtDay(d)+'.'};
    if(/выходной/.test(c)){const w=d.getDay();return{reply:(w===0||w===6)?'Да, сегодня выходной.':'Нет, сегодня будний день.'};}
    if(/неделя года/.test(c))return{reply:'Сейчас '+isoWeek(d)+'-я неделя года.'};
    if(/время в мире/.test(c)){const z=[['Москва','Europe/Moscow'],['Нью-Йорк','America/New_York'],['Лондон','Europe/London'],['Токио','Asia/Tokyo'],['Дубай','Asia/Dubai']];return{reply:z.map(x=>x[0]+' '+d.toLocaleTimeString('ru-RU',{timeZone:x[1],hour:'2-digit',minute:'2-digit'})).join(', ')+'.'};}
    if(/до нового года/.test(c)){const n=daysDiff(d,new Date(d.getFullYear()+1,0,1));return{reply:'До Нового года '+n+' дней.'};}
    if(/какое число будет через/.test(c)){const n=firstNum(c);if(!n)return{reply:'Скажи, через сколько дней.'};const dt=new Date(Date.now()+n*86400000);return{reply:'Через '+n+' дней будет '+dt.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})+'.'};}
    if(/сколько/.test(c)&&/(прошло|до)/.test(c)){const dt=parseDateRu(c);if(!dt)return{reply:'Назови дату, например 15 августа.'};const n=/прошло/.test(c)?daysDiff(dt,d):daysDiff(d,dt);return{reply:(/прошло/.test(c)?'Прошло ':'Осталось ')+Math.abs(n)+' дней.'};}
    return{reply:'Сейчас '+fmtClock(d)+'.'};
  }
};

};

__modules["src/tools/timer.js"] = function(module, exports, __require, require) {
const states = new Map();
function state(key){if(!states.has(key))states.set(key,{timer:null,reminders:[],nextReminderId:1,pomo:null,stopwatch:null});return states.get(key);}
function parseDur(s){
  const m=String(s).match(/(\d+)\s*(секунд|сек|минут|мин|час|часа|часов)/);
  if(!m)return null;const n=Number(m[1]);if(m[2].startsWith('сек'))return n*1000;if(m[2].startsWith('мин'))return n*60000;return n*3600000;
}
function durationText(ms){const s=Math.max(0,Math.round(ms/1000));return Math.floor(s/60)+' минут '+(s%60)+' секунд';}
function startPomo(st,runtime){
  const ms=st.pomo.phase==='work'?25*60000:(st.pomo.round>=4?15*60000:5*60000);
  st.pomo.endsAt=Date.now()+ms;
  st.pomo.handle=setTimeout(()=>{
    if(!st.pomo)return;
    if(st.pomo.phase==='work'){
      st.pomo.phase='rest';
      runtime.sendView({speak:st.pomo.round>=4?'Большой перерыв, 15 минут.':'Перерыв, 5 минут.'});
      startPomo(st,runtime);
    }else{
      if(st.pomo.round>=4){st.pomo=null;runtime.sendView({speak:'Помодоро завершён.'});return;}
      st.pomo.round++;st.pomo.phase='work';runtime.sendView({speak:'Отдых окончен, за работу.'});startPomo(st,runtime);
    }
  },ms);
}
module.exports={
  name:'timer',description:'Таймеры, напоминания, помодоро и секундомер',risk:'change',
  async run(input,runtime){
    const c=input.ctx.command,st=state(input.ctx.userId);

    if(/останови таймер|стоп таймер/.test(c)){st.timer=null;return{reply:'Таймер остановлен.'};}
    if(/сколько осталось/.test(c)){if(!st.timer)return{reply:'Таймер не запущен.'};return{reply:'Осталось '+durationText(st.timer-Date.now())+'.'};}
    if(/^таймер|запусти таймер|таймер на/.test(c)){
      const ms=parseDur(c);if(!ms)return{reply:'Скажи, например: таймер на 5 минут.'};
      st.timer=Date.now()+ms;
      setTimeout(()=>{if(st.timer&&Date.now()>=st.timer){st.timer=null;runtime.sendView({speak:'Таймер завершён.'});}},ms);
      return{reply:'Таймер запущен.'};
    }

    if(/напомни/.test(c)){
      const ms=parseDur(c);if(!ms)return{reply:'Скажи, например: напомни через 10 минут позвонить.'};
      const text=c.replace(/.*напомни/,'').replace(/через\s*\d+\s*(секунд|сек|минут|мин|час[а-я]*)/,'').trim()||'Напоминание';
      const r={id:st.nextReminderId++,endsAt:Date.now()+ms,text};st.reminders.push(r);
      setTimeout(()=>{st.reminders=st.reminders.filter(x=>x.id!==r.id);runtime.sendView({speak:'Напоминаю: '+r.text});},ms);
      return{reply:'Хорошо, напомню. В браузерной панели напоминание сработает автоматически.'};
    }
    if(/покажи напоминания/.test(c)){if(!st.reminders.length)return{reply:'Напоминаний нет.'};return{reply:st.reminders.map((x,i)=>(i+1)+'. '+x.text).join('. ')};}
    if(/отмени напоминание/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&st.reminders[n-1]){const x=st.reminders.splice(n-1,1)[0];return{reply:'Отменила: '+x.text};}return{reply:'Не нашла такое напоминание.'};}

    if(/стоп помодоро|останови помодоро/.test(c)){if(st.pomo&&st.pomo.handle)clearTimeout(st.pomo.handle);st.pomo=null;return{reply:'Помодоро остановлен.'};}
    if(/помодоро/.test(c)){if(st.pomo&&st.pomo.handle)clearTimeout(st.pomo.handle);st.pomo={phase:'work',round:1};startPomo(st,runtime);return{reply:'Помодоро начат: 25 минут работы.'};}

    if(/секундомер/.test(c)){
      if(!st.stopwatch||!st.stopwatch.running){st.stopwatch={startAt:Date.now(),acc:st.stopwatch?st.stopwatch.acc||0:0,running:true};return{reply:'Секундомер запущен.'};}
      const ms=st.stopwatch.acc+(Date.now()-st.stopwatch.startAt);st.stopwatch={acc:ms,running:false};return{reply:'Время: '+durationText(ms)+'.'};
    }
    return{reply:'Скажи: таймер на 5 минут, напомни через 10 минут…, помодоро или секундомер.'};
  }
};

};

__modules["src/tools/translate.js"] = function(module, exports, __require, require) {
const { translate } = __require("src/services/web.js");
module.exports = {
  name:'translate', description:'Перевод текста', risk:'read',
  async run(input){
    const c=input.ctx.command;
    const t=c.replace(/.*?(переведи|как по-английски)/,'').trim();
    if(!t)return{reply:'Что перевести?'};
    const dir=/[а-яё]/.test(t)?'ru|en':'en|ru';
    const tr=await translate(t,dir);
    return{reply:tr||'Не смогла перевести.'};
  }
};

};

__modules["src/tools/weather.js"] = function(module, exports, __require, require) {
const { geoCity, weatherFor, wmo, isRain } = __require("src/services/weather.js");
const { card } = __require("src/ui/cards.js");
function moonPhase(){const syn=29.53058867,known=Date.UTC(2000,0,6,18,14),days=(Date.now()-known)/86400000,ph=((days%syn)+syn)%syn,i=Math.floor(ph/syn*8+0.5)%8;return ['новолуние','растущий серп','первая четверть','растущая луна','полнолуние','убывающая луна','последняя четверть','убывающий серп'][i];}
module.exports = {
  name:'weather', description:'Погода и связанные данные', risk:'read',
  async run(input, runtime){
    const ctx=input.ctx,c=ctx.command,u=runtime.storage.ensureUser(ctx.userId);
    if(/фаз.*луны/.test(c))return{reply:'Сейчас '+moonPhase()+'.'};
    let city=u.city||'Москва';
    const geo=ctx.entities.geo.find(x=>x.city);
    if(geo&&geo.city) city=geo.city;
    else {const m=c.match(/погода в\s+([а-яa-z\s-]+)$/i);if(m)city=m[1].trim();}
    const g=await geoCity(city);if(!g)return{reply:'Не нашла город '+city+'.'};
    if(geo||/погода в/.test(c)){u.city=g.name;runtime.storage.scheduleSave();}
    const w=await weatherFor(g.latitude,g.longitude);
    const cur=w.current;
    const html=card('Погода: '+g.name,`<div class="big">${Math.round(cur.temperature_2m)}°</div><div class="sub">${wmo(cur.weather_code)}, ощущается как ${Math.round(cur.apparent_temperature)}°</div>`);
    if(/будет дождь/.test(c))return{reply:(isRain(cur.weather_code)||isRain(w.daily.weather_code[0]))?'Да, вероятен дождь. Возьми зонт.':'Дождя не ожидается.',html};
    if(/нужна куртка/.test(c))return{reply:cur.temperature_2m<8?'Да, лучше куртку. Сейчас '+Math.round(cur.temperature_2m)+'°.':'Сейчас '+Math.round(cur.temperature_2m)+'°, тёплая куртка не обязательна.',html};
    if(/уф/.test(c))return{reply:'УФ-индекс сегодня: '+Math.round(w.daily.uv_index_max[0])+' из 11.',html};
    if(/рассвет/.test(c))return{reply:'Рассвет в '+w.daily.sunrise[0].slice(11,16)+'.'};
    if(/закат/.test(c))return{reply:'Закат в '+w.daily.sunset[0].slice(11,16)+'.'};
    if(/прогноз на неделю/.test(c)){const lines=w.daily.time.map((d,i)=>d+': '+Math.round(w.daily.temperature_2m_min[i])+'…'+Math.round(w.daily.temperature_2m_max[i])+'°, '+wmo(w.daily.weather_code[i]));return{reply:'Прогноз на неделю показала.',html:card('Неделя: '+g.name,'<div class="text">'+lines.join('<br>')+'</div>')};}
    return{reply:'В городе '+g.name+' сейчас '+Math.round(cur.temperature_2m)+'°, '+wmo(cur.weather_code)+'.',html};
  }
};

};

__modules["src/ui/cards.js"] = function(module, exports, __require, require) {
function esc(v){
  return String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function card(title, inner){return `<div class="card"><h1>${esc(title)}</h1>${inner}</div>`;}
function textCard(title, text){return card(title, `<div class="text">${esc(text).replace(/\n/g,'<br>')}</div>`);}
function rows(title, items){
  return card(title, items.map((x,i)=>`<div class="row"><span class="num">${i+1}</span><div class="t">${esc(x)}</div></div>`).join(''));
}
function searchCard(q, results){
  const body=results.map((r,i)=>{
    let dom='';try{dom=new URL(r.url).hostname;}catch{}
    return `<div class="row"><span class="num">${i+1}</span><div><div class="t">${esc(r.title)}</div><div class="d">${esc(dom)}</div></div></div>`;
  }).join('');
  return card(`Поиск: ${q}`, body + '<div class="hint">Можно сказать: «открой второй», «дальше», «назад»</div>');
}
module.exports = { esc, card, textCard, rows, searchCard };

};

__modules["src/ui/panel.js"] = function(module, exports, __require, require) {
function panelHtml(version){
return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Smart Assistant</title>
<style>
body{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;text-align:center;padding:30px}
.card{display:inline-block;background:#1e293b;padding:30px 50px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.4);max-width:900px;text-align:left}
h1{color:#7dd3fc;margin-top:0}.big{font-size:64px;color:#fbbf24;text-align:center}.sub{color:#94a3b8;font-size:18px}.row{display:flex;gap:12px;margin:10px 0}.num{background:#334155;border-radius:8px;padding:4px 10px;color:#7dd3fc}.t{font-size:20px}.d,.hint{color:#64748b}.text{font-size:20px;line-height:1.6}
</style></head><body><div id="box"><div class="card"><h1>Smart Assistant ${version}</h1><div class="sub">Жду команду…</div></div></div>
<script>
const box=document.getElementById('box');
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ru-RU';speechSynthesis.speak(u);}catch(e){}}
const es=new EventSource('/events');
es.onmessage=e=>{const d=JSON.parse(e.data);if(d.html)box.innerHTML=d.html;if(d.speak)speak(d.speak);if(d.stopSpeak){try{speechSynthesis.cancel()}catch(e){}}};
</script>
</body></html>`;
}
module.exports={panelHtml};

};

__require('server.js');
