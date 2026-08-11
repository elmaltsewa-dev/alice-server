// SMART ASSISTANT UNIFIED CORE 2.1.0 — FOUNDATION HARDENING CANDIDATE
// Source lineage: 1.6.3 Station-safe -> 2.0/2.0.1 Unified Core -> 2.1 Foundation Hardening
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


__modules["src/core/capability-registry.js"] = function(module, exports, __require, require) {
const CAPABILITIES = [{"id":"dialog.context","title":"Диалог и контекст","executor":"core","risk":"read","examples":["повтори","что ты умеешь","открой его","вторую","отмена"],"implementation":"partial","legacyStatus":"working"},{"id":"pc.apps","title":"Программы","executor":"pc","risk":"change","examples":["открой блокнот","запусти ворд","какие программы открыты","переключись на блокнот"],"implementation":"partial","legacyStatus":"working"},{"id":"pc.windows","title":"Окна Windows","executor":"pc","risk":"change","examples":["какие окна открыты","что сейчас на экране","переключись на телеграм","предыдущее окно"],"implementation":"partial","legacyStatus":"working"},{"id":"browser.tabs","title":"Вкладки браузера","executor":"pc","risk":"change","examples":["какие вкладки открыты","открой вторую вкладку","следующая вкладка","открой новую вкладку"],"implementation":"partial","legacyStatus":"working"},{"id":"browser.navigation","title":"Навигация браузера","executor":"pc","risk":"change","examples":["назад","вперёд","обнови страницу","восстанови закрытую вкладку"],"implementation":"partial","legacyStatus":"working"},{"id":"browser.web","title":"Поиск и веб-страницы","executor":"browser","risk":"read","examples":["найди в интернете","открой сайт","прочитай страницу","открой второй результат"],"implementation":"partial","legacyStatus":"working"},{"id":"pc.ui.read","title":"Чтение интерфейса","executor":"pc","risk":"read","examples":["какие кнопки здесь есть","что здесь написано","что можно нажать","прочитай активное окно"],"implementation":"partial","legacyStatus":"working"},{"id":"pc.ui.action","title":"Подтверждённые действия интерфейса","executor":"pc","risk":"confirm","examples":["нажми ОК","выбери вкладку настройки","нажми назад"],"implementation":"partial","legacyStatus":"working"},{"id":"files.search","title":"Поиск файлов и папок","executor":"pc","risk":"read","examples":["найди файл договор","найди документ смета","последние загрузки"],"implementation":"partial","legacyStatus":"working"},{"id":"files.open","title":"Открытие файлов и папок","executor":"pc","risk":"change","examples":["открой загрузки","открой документы","открой второй файл"],"implementation":"partial","legacyStatus":"working"},{"id":"files.manage","title":"Копирование, перемещение, переименование, папки","executor":"pc","risk":"confirm","examples":["создай папку","переименуй файл","скопируй документ","перемести файл"],"implementation":"planned","legacyStatus":"guarded"},{"id":"files.delete","title":"Удаление и восстановление","executor":"pc","risk":"dangerous","examples":["удали файл","восстанови из корзины"],"implementation":"planned","legacyStatus":"guarded"},{"id":"documents.office","title":"Word / Excel / PDF / документы","executor":"pc-ui","risk":"confirm","examples":["открой документ","сохрани документ","распечатай","переключи лист"],"implementation":"planned","legacyStatus":"unified"},{"id":"archives","title":"ZIP/RAR и архивы","executor":"pc-ui","risk":"confirm","examples":["распакуй архив","покажи содержимое архива"],"implementation":"planned","legacyStatus":"unified"},{"id":"clipboard","title":"Буфер обмена","executor":"pc","risk":"private","examples":["что в буфере обмена","скопируй этот текст","очисти буфер"],"implementation":"partial","legacyStatus":"working","exampleStatus":{"скопируй этот текст":"planned"}},{"id":"audio","title":"Звук и медиа на ПК","executor":"pc","risk":"change","examples":["сделай громче","выключи звук","пауза","следующий трек"],"implementation":"partial","legacyStatus":"working"},{"id":"screen","title":"Экран и мониторы","executor":"pc","risk":"read","examples":["сколько мониторов","какое разрешение"],"implementation":"partial","legacyStatus":"working"},{"id":"keyboard","title":"Клавиатурные действия","executor":"pc","risk":"confirm","examples":["нажми escape","нажми control s","переключись на предыдущее окно"],"implementation":"planned","legacyStatus":"working"},{"id":"printer","title":"Принтер и печать","executor":"pc-ui","risk":"confirm","examples":["какой принтер выбран","открой очередь печати","распечатай документ"],"implementation":"planned","legacyStatus":"unified"},{"id":"devices","title":"USB, Bluetooth, камера, микрофон","executor":"pc-ui","risk":"read","examples":["какие usb устройства подключены","проверь микрофон","проверь камеру"],"implementation":"planned","legacyStatus":"unified"},{"id":"bluetooth","title":"Bluetooth","executor":"pc","risk":"change","examples":["открой bluetooth","открой настройки bluetooth"],"implementation":"partial","legacyStatus":"unified"},{"id":"vpn.app","title":"VPN-программа как приложение","executor":"pc-ui","risk":"confirm","examples":["открой outline","подключи outline","отключи outline"],"implementation":"partial","legacyStatus":"unified","exampleStatus":{"подключи outline":"planned","отключи outline":"planned"}},{"id":"telegram","title":"Telegram","executor":"pc-ui","risk":"confirm","examples":["открой телеграм","найди чат","отправь сообщение"],"implementation":"partial","legacyStatus":"unified","exampleStatus":{"найди чат":"planned","отправь сообщение":"planned"}},{"id":"mail.calendar","title":"Почта и календарь через интерфейс","executor":"browser-ui","risk":"confirm","examples":["открой почту","найди письмо","открой календарь","создай событие"],"implementation":"planned","legacyStatus":"unified"},{"id":"tasks","title":"Задачи","executor":"tasks","risk":"change","examples":["добавь задачу","что у меня на сегодня","отметь выполненной"],"implementation":"partial","legacyStatus":"working"},{"id":"lists","title":"Списки","executor":"lists","risk":"change","examples":["создай список","добавь в список","прочитай список"],"implementation":"partial","legacyStatus":"working"},{"id":"notes","title":"Заметки","executor":"notes","risk":"change","examples":["запиши заметку","найди в заметках","прочитай заметки"],"implementation":"partial","legacyStatus":"working"},{"id":"timers","title":"Таймеры, секундомер, Pomodoro","executor":"timer","risk":"change","examples":["поставь таймер","секундомер","помодоро"],"implementation":"partial","legacyStatus":"working"},{"id":"time.date","title":"Время и дата","executor":"time_date","risk":"read","examples":["который час","какое сегодня число","время в токио"],"implementation":"partial","legacyStatus":"working"},{"id":"weather","title":"Погода","executor":"weather","risk":"read","examples":["погода сегодня","будет дождь","прогноз на неделю"],"implementation":"partial","legacyStatus":"working"},{"id":"calculator","title":"Калькулятор и единицы","executor":"calculator","risk":"read","examples":["посчитай","сколько процентов","переведи километры в мили"],"implementation":"partial","legacyStatus":"working"},{"id":"translate","title":"Перевод","executor":"translate","risk":"read","examples":["переведи на английский","как по английски"],"implementation":"partial","legacyStatus":"working"},{"id":"knowledge","title":"Справочная информация","executor":"knowledge","risk":"read","examples":["что такое","кто такой","расскажи про"],"implementation":"partial","legacyStatus":"working"},{"id":"news","title":"Новости и актуальный поиск","executor":"external","risk":"read","examples":["последние новости","что нового"],"implementation":"external","legacyStatus":"source-needed"},{"id":"media.youtube","title":"YouTube и медиа в браузере","executor":"browser-ui","risk":"change","examples":["открой youtube","найди видео на youtube","включи полный экран youtube"],"implementation":"partial","legacyStatus":"unified"},{"id":"system.settings","title":"Системные разделы Windows","executor":"pc","risk":"change","examples":["открой диспетчер задач","открой параметры","открой устройства","открой автозагрузку"],"implementation":"partial","legacyStatus":"working"},{"id":"software.install","title":"Установка/удаление/обновление программ","executor":"pc-ui","risk":"dangerous","examples":["установи программу","удали программу","обнови программу"],"implementation":"blocked","legacyStatus":"guarded"},{"id":"security","title":"Безопасность Windows","executor":"pc-ui","risk":"read","examples":["открой безопасность windows","что означает предупреждение"],"implementation":"partial","legacyStatus":"unified","exampleStatus":{"что означает предупреждение":"planned"}},{"id":"help.mode","title":"Режим «Помоги мне»","executor":"pc-ui","risk":"read","examples":["помоги","я не понимаю что произошло","что мне нажать","куда всё пропало"],"implementation":"partial","legacyStatus":"working"},{"id":"history.undo","title":"История действий и отмена","executor":"core-pc","risk":"confirm","examples":["что ты только что сделала","отмени последнее","верни закрытую вкладку"],"implementation":"planned","legacyStatus":"unified"},{"id":"multi.step","title":"Многошаговые сценарии","executor":"planner","risk":"confirm","examples":["найди договор и открой его","открой загрузки и найди последний pdf"],"implementation":"planned","legacyStatus":"unified"},{"id":"pc.status","title":"Доступность компьютера","implementation":"implemented","executor":"pc","risk":"read","examples":["компьютер на связи","статус компьютера"]},{"id":"app.diagnostics","title":"Диагностика ошибок Windows и программ без сетевой/ресурсной диагностики","implementation":"planned","executor":"pc-ui","risk":"read","examples":["программа не запускается","файл не открывается","нет звука","принтер не печатает"]},{"id":"windows.info","title":"Информация о Windows и обновлениях","implementation":"planned","executor":"pc","risk":"read","examples":["какая версия windows","есть ли обновления windows"]},{"id":"storage.drives","title":"Диски, накопители и безопасное извлечение без проверки свободного места","implementation":"planned","executor":"pc","risk":"confirm","examples":["какие диски подключены","безопасно извлеки флешку"]},{"id":"phone.pc","title":"Телефон ↔ ПК","implementation":"planned","executor":"pc-ui","risk":"confirm","examples":["открой фотографии с телефона","найди файлы с телефона"]},{"id":"mouse","title":"Мышь и прокрутка","implementation":"planned","executor":"pc-ui","risk":"confirm","examples":["прокрути вниз","двойной клик","правый клик"]},{"id":"maps.routes","title":"Карты и маршруты","implementation":"planned","executor":"external-ui","risk":"read","examples":["открой карту","покажи маршрут"]},{"id":"games.steam","title":"Steam и запуск игр","implementation":"planned","executor":"pc","risk":"confirm","examples":["открой steam","запусти игру"]},{"id":"remote.report","title":"Удалённая помощь и технический отчёт","implementation":"planned","executor":"pc","risk":"read","examples":["сделай технический отчёт","что у меня произошло"]},{"id":"entertainment","title":"Развлечения","implementation":"partial","executor":"entertainment","risk":"read","examples":["расскажи анекдот","скажи факт","брось кубик"]}];
const MASTER_PLAN = [{"n":1,"title":"Базовый диалог","decision":"approved","implementation":"partial"},{"n":2,"title":"Состояние компьютера: только online/offline; CPU/RAM/disk/uptime/температуры/GPU/battery/processes исключены","decision":"approved_with_exclusions","implementation":"implemented"},{"n":3,"title":"Программы","decision":"approved","implementation":"partial"},{"n":4,"title":"Окна Windows","decision":"approved","implementation":"partial"},{"n":5,"title":"Вкладки браузера; «где у меня был YouTube?» исключено","decision":"approved_with_exclusions","implementation":"partial"},{"n":6,"title":"Браузер и интернет","decision":"approved","implementation":"partial"},{"n":7,"title":"Чтение интерфейса Windows","decision":"approved","implementation":"partial"},{"n":8,"title":"Управление интерфейсом","decision":"approved","implementation":"partial"},{"n":9,"title":"Режим «Помоги мне»","decision":"approved","implementation":"partial"},{"n":10,"title":"Ошибки Windows и программ без сетевой/free-space диагностики","decision":"approved_with_exclusions","implementation":"planned"},{"n":11,"title":"Файлы и папки","decision":"approved","implementation":"partial"},{"n":12,"title":"Документы / Word","decision":"approved","implementation":"planned"},{"n":13,"title":"Excel","decision":"approved","implementation":"planned"},{"n":14,"title":"PDF","decision":"approved","implementation":"planned"},{"n":15,"title":"Архивы","decision":"approved","implementation":"planned"},{"n":16,"title":"Буфер обмена","decision":"approved","implementation":"partial"},{"n":17,"title":"Экран","decision":"approved","implementation":"partial"},{"n":18,"title":"Мышь и клавиатура","decision":"approved","implementation":"planned"},{"n":19,"title":"Звук","decision":"approved","implementation":"partial"},{"n":20,"title":"Камера и микрофон","decision":"approved","implementation":"planned"},{"n":21,"title":"Принтер","decision":"approved","implementation":"planned"},{"n":22,"title":"Сеть","decision":"excluded","implementation":"excluded"},{"n":23,"title":"VPN как приложение / Outline","decision":"approved","implementation":"planned"},{"n":24,"title":"Windows: версия, настройки, обновления, служебные разделы","decision":"approved","implementation":"partial"},{"n":25,"title":"Автозагрузка","decision":"approved","implementation":"partial"},{"n":26,"title":"Процессы: list/heavy CPU/RAM исключены; hung-app close/PID/explain process остаются","decision":"approved_with_exclusions","implementation":"planned"},{"n":27,"title":"Диски и накопители: free-space диагностика исключена; остальные операции остаются","decision":"approved_with_exclusions","implementation":"planned"},{"n":28,"title":"USB и устройства","decision":"approved","implementation":"planned"},{"n":29,"title":"Bluetooth","decision":"approved","implementation":"partial"},{"n":30,"title":"Телефон ↔ ПК","decision":"approved","implementation":"planned"},{"n":31,"title":"Telegram","decision":"approved","implementation":"planned"},{"n":32,"title":"Почта","decision":"approved","implementation":"planned"},{"n":33,"title":"Календарь","decision":"approved","implementation":"planned"},{"n":34,"title":"Заметки","decision":"approved","implementation":"partial"},{"n":35,"title":"Задачи","decision":"approved","implementation":"partial"},{"n":36,"title":"Списки","decision":"approved","implementation":"partial"},{"n":37,"title":"Таймеры, секундомер, Pomodoro","decision":"approved","implementation":"partial"},{"n":38,"title":"Напоминания внутри помощника","decision":"approved","implementation":"partial"},{"n":39,"title":"Время и дата","decision":"approved","implementation":"partial"},{"n":40,"title":"Погода","decision":"approved","implementation":"partial"},{"n":41,"title":"Калькулятор","decision":"approved","implementation":"partial"},{"n":42,"title":"Конвертация единиц","decision":"approved","implementation":"partial"},{"n":43,"title":"Перевод","decision":"approved","implementation":"partial"},{"n":44,"title":"Справочная информация","decision":"approved","implementation":"partial"},{"n":45,"title":"Поиск в интернете","decision":"approved","implementation":"partial"},{"n":46,"title":"Новости","decision":"approved","implementation":"external"},{"n":47,"title":"Карты / маршруты","decision":"approved","implementation":"planned"},{"n":48,"title":"Медиа на ПК","decision":"approved","implementation":"partial"},{"n":49,"title":"YouTube","decision":"approved","implementation":"planned"},{"n":50,"title":"Игры / Steam","decision":"approved","implementation":"planned"},{"n":51,"title":"Установка программ","decision":"approved","implementation":"blocked"},{"n":52,"title":"Удаление программ","decision":"approved","implementation":"blocked"},{"n":53,"title":"Обновление программ","decision":"approved","implementation":"planned"},{"n":54,"title":"Безопасность Windows","decision":"approved","implementation":"partial"},{"n":55,"title":"Пароли и приватные данные","decision":"approved","implementation":"partial"},{"n":56,"title":"Удалённая помощь / технический отчёт","decision":"approved","implementation":"planned"},{"n":57,"title":"История действий помощника","decision":"approved","implementation":"planned"},{"n":58,"title":"Отмена / Undo","decision":"approved","implementation":"planned"},{"n":59,"title":"Сценарии из нескольких действий","decision":"approved","implementation":"planned"},{"n":60,"title":"Естественные команды","decision":"approved","implementation":"partial"},{"n":61,"title":"Ранее существующие функции / regression compatibility","decision":"approved","implementation":"partial"},{"n":62,"title":"Не включать: crypto, currencies, child mode, auto purchases/payments, arbitrary PowerShell, unsafe coordinate clicks, send without confirm","decision":"excluded_policy","implementation":"enforced_partial"}];

function norm(v){
  return String(v||'').toLowerCase().replace(/ё/g,'е').replace(/[.,!?;:"«»]/g,' ').replace(/\s+/g,' ').trim();
}
const EXACT = new Map();
for(const cap of CAPABILITIES){
  for(const example of (cap.examples||[])){
    const k=norm(example);
    if(!k || EXACT.has(k))continue;
    const explicit=cap.exampleStatus&&cap.exampleStatus[example];
    const actionStatus=explicit || (
      cap.implementation==='partial' || cap.implementation==='implemented'
        ? 'implemented'
        : cap.implementation
    );
    EXACT.set(k,{id:cap.id,actionStatus});
  }
}
class CapabilityRegistry {
  constructor(items) {
    this.items = Array.isArray(items) ? items.slice() : [];
    this.byIdMap=new Map(this.items.map(x=>[x.id,x]));
  }
  list() { return this.items.map(x=>({...x})); }
  masterPlan() { return MASTER_PLAN.map(x=>({...x})); }
  byId(id) { return this.byIdMap.get(id)||null; }
  summary() {
    const out={};
    for(const x of this.items) out[x.implementation]=(out[x.implementation]||0)+1;
    return out;
  }
  exact(command){
    const hit=EXACT.get(norm(command));
    if(!hit)return null;
    const capability=this.byId(hit.id);
    return capability?{capability,actionStatus:hit.actionStatus}:null;
  }
  match(command) {
    const c=norm(command);
    if(!c)return null;
    const exact=this.exact(c);
    if(exact)return {
      id:exact.capability.id,
      tool:exact.capability.executor,
      confidence:1,
      capability:exact.capability,
      exact:true,
      actionStatus:exact.actionStatus
    };
    const rules=[
      // Destructive/managed domains first so generic "file/app" patterns do not
      // accidentally execute a partial capability.
      ['software.install',/^(установи|удали|обнови|деинсталлируй)\s+(програм|прилож)/,'pc-ui',.999],
      ['files.delete',/удали\s+(файл|папк)|восстанови.*корзин/,'pc',.998],
      ['files.manage',/создай\s+папк|переименуй\s+(файл|папк)|скопируй\s+(файл|документ|папк)|перемести\s+(файл|документ|папк)/,'pc',.997],
      ['archives',/распакуй\s+архив|содержимое\s+архив|создай\s+архив|zip|rar/,'pc-ui',.995],
      ['mail.calendar',/найди\s+письмо|отправь\s+письмо|открой\s+почт|открой\s+календар|создай\s+событ/,'browser-ui',.994],
      ['telegram',/найди\s+чат|отправь\s+сообщение|открой\s+телеграм/,'pc-ui',.994],
      ['vpn.app',/(подключи|отключи|открой)\s+outline/,'pc-ui',.994],
      ['media.youtube',/(youtube|ютуб)/,'browser-ui',.994],
      ['printer',/очеред.*печат|какой\s+принтер|распечат|печать\s+документ/,'pc-ui',.993],
      ['devices',/(usb|юсб).*устройств|проверь\s+(микрофон|камер)|камер.*работ|микрофон.*работ/,'pc-ui',.992],
      ['bluetooth',/(bluetooth|блютуз)/,'pc',.992],
      ['storage.drives',/какие\s+диски\s+подключ|извлек.*флеш|флешк|накопител/,'pc',.991],
      ['phone.pc',/(телефон).*(фото|файл)|фотограф.*с\s+телефон|файл.*с\s+телефон/,'pc-ui',.991],
      ['games.steam',/(steam|стим|запусти\s+игр)/,'pc',.990],
      ['maps.routes',/(открой\s+карт|покажи\s+маршрут|построй\s+маршрут)/,'external-ui',.990],
      ['remote.report',/(техническ.*отчет|техническ.*отчёт|что\s+у\s+меня\s+произошло)/,'pc',.990],
      ['app.diagnostics',/(программ.*не\s+запуска|файл.*не\s+откры|нет\s+звука|принтер.*не\s+печат)/,'pc-ui',.989],
      ['windows.info',/(версия\s+windows|обновлен.*windows|обновлен.*виндовс)/,'pc',.989],
      ['history.undo',/(что\s+ты\s+только\s+что\s+сделал|отмени\s+последн|верни\s+закрытую\s+вкладк)/,'core-pc',.989],
      ['multi.step',/\s+и\s+(открой|найди|распечат|сохрани|переключ)/,'planner',.988],
      ['documents.office',/(сохрани\s+документ|переключи\s+лист|открой\s+(word|ворд|excel|эксель|pdf)|создай\s+(документ|таблиц))/,'pc-ui',.987],
      ['keyboard',/нажми\s+(escape|esc|enter|tab|control|ctrl|alt)|горяч.*клавиш/,'pc',.986],
      ['mouse',/(прокрути|двойной\s+клик|правый\s+клик|колесик|колёсик)/,'pc-ui',.986],
      ['security',/(безопасность\s+windows|защитник\s+windows|предупрежден.*безопас)/,'pc-ui',.985],

      ['browser.tabs',/вкладк|следующ(ая|ую)\s+вклад|предыдущ(ая|ую)\s+вклад/,'pc',.980],
      ['browser.navigation',/^(назад|вперед|обнови страницу|обновить страницу|восстанови закрытую вкладку)$/,'pc',.980],
      ['pc.windows',/окн(о|а|е|у)|предыдущее окно|следующее окно|переключись на/,'pc',.970],
      ['clipboard',/буфер обмена|что скопировано|очисти буфер|(?:^|\s)буфер(?:\s|$)/,'pc',.969],
      ['audio',/громк|громч|тиш|звук|без звука|пауза|следующий трек|предыдущий трек/,'pc',.968],
      ['system.settings',/диспетчер задач|параметры windows|панель управления|диспетчер устройств|автозагрузк/,'pc',.967],
      ['help.mode',/не понимаю|что произошло|что случилось|помоги|что мне нажать|что нажать|куда нажать|куда .*пропал|не могу открыть/,'pc',.966],
      ['pc.ui.read',/какие кнопки|что здесь написано|что можно нажать|прочитай (окно|активное окно)/,'pc',.965],
      ['tasks',/задач|что у меня на сегодня|отметь выполненной|очисти выполненные/,'tasks',.960],
      ['lists',/спис(ок|ка)|вычеркни/,'lists',.959],
      ['notes',/заметк|^запиши/,'notes',.958],
      ['timers',/таймер|секундомер|помодоро|напомни/,'timer',.957],
      ['time.date',/который час|сколько времени|какое .*число|какая дата|день недели|время в [а-яa-z-]+/,'time_date',.956],
      ['weather',/погода|будет дождь|прогноз|рассвет|закат|фаз.*луны|(?:^|\s)(уф|ультрафиолет)(?:\s|$)/,'weather',.955],
      ['calculator',/посчитай|процент|случайное число|дюйм|килограмм|километр/,'calculator',.950],
      ['translate',/переведи|как по[- ]английски/,'translate',.949],
      ['knowledge',/что такое|кто такой|кто такая|расскажи про|столица|население/,'knowledge',.948],
      ['entertainment',/анекдот|брось кубик|скажи факт|загадк|что посмотреть|что приготовить/,'entertainment',.947],
      ['pc.status',/(компьютер|пк).*(на связи)|статус компьютера|состояние компьютера/,'pc',.946],
      ['files.search',/(найди|поищи|последн).*(файл|документ|папк|загрузк)|последние загрузки/,'pc',.940],
      ['files.open',/^(открой|покажи)\s+(загрузки|документы|рабочий стол|второй файл|третий файл)/,'pc',.939],
      ['screen',/(сколько|какие).*(монитор)|разрешение\s+экрана|какое\s+разрешение/,'pc',.938],
      ['pc.apps',/^(открой|запусти)\s+[^/]+$/,'pc',.700],
      ['browser.web',/сайт|в интернете|поищи|поиск|прочитай страницу|https?:|www\./,'browser',.880]
    ];
    let best=null;
    for(const [id,re,tool,confidence] of rules){
      if(re.test(c) && (!best || confidence>best.confidence)){
        best={id,tool,confidence,capability:this.byId(id),exact:false};
      }
    }
    return best;
  }
}
module.exports={CapabilityRegistry,CAPABILITIES,MASTER_PLAN};
};



__modules["src/core/alice-protocol.js"] = function(module, exports, __require, require) {
const crypto = require("crypto");
const { YANDEX_SKILL_ID, YANDEX_ALLOWED_USER_HASH, ALICE_REQUEST_BUDGET_MS } = __require("src/config.js");

function validateAliceRequest(body){
  if(!body || typeof body!=='object')return 'EMPTY_BODY';
  if(String(body.version||'')!=='1.0')return 'BAD_VERSION';
  const request=body.request||{};
  const session=body.session||{};
  const allowed=new Set(['SimpleUtterance','ButtonPressed','Show.Pull']);
  if(!allowed.has(String(request.type||'')))return 'BAD_REQUEST_TYPE';
  if(!String(session.session_id||''))return 'NO_SESSION_ID';
  if(!String(session.skill_id||''))return 'NO_SKILL_ID';
  if(YANDEX_SKILL_ID && String(session.skill_id)!==YANDEX_SKILL_ID)return 'SKILL_ID_MISMATCH';
  return null;
}

function validateAliceUser(body){
  if(!YANDEX_ALLOWED_USER_HASH)return null;
  const raw=String(body&&body.session&&body.session.user&&body.session.user.user_id||'');
  if(!raw)return 'NO_AUTHORIZED_USER';
  const got=crypto.createHash('sha256').update(raw,'utf8').digest();
  let want;
  try{want=Buffer.from(String(YANDEX_ALLOWED_USER_HASH),'hex');}catch{return 'BAD_USER_ALLOWLIST';}
  if(want.length!==got.length)return 'BAD_USER_ALLOWLIST';
  return crypto.timingSafeEqual(got,want)?null:'USER_NOT_ALLOWED';
}

function isLaunchOnly(command){
  const c=String(command||'').trim().toLowerCase().replace(/ё/g,'е');
  if(!c)return true;
  return /^(запусти|открой|запустить|открыть)\s+(навык\s+)?(мой помощник|компьютерный помощник елены)$/.test(c);
}

function buildAliceResponse(out){
  const reply=String((out&&out.reply)||'Готово.').trim()||'Готово.';
  const voice=String((out&&(out.voiceText||out.speakOnly))||reply).trim()||reply;
  return {
    response:{
      text:reply.slice(0,1800),
      tts:voice.slice(0,2200),
      end_session:false
    },
    version:'1.0'
  };
}

async function runWithBudget(factory, elapsedMs=0){
  const remaining=Math.max(250,ALICE_REQUEST_BUDGET_MS-Number(elapsedMs||0));
  let timer=null;
  try{
    return await Promise.race([
      Promise.resolve().then(factory),
      new Promise(resolve=>{
        timer=setTimeout(()=>resolve({
          reply:'Команда заняла слишком много времени. Я не считаю действие выполненным. Попробуй ещё раз.',
          timeout:true
        }),remaining);
      })
    ]);
  } finally {
    if(timer)clearTimeout(timer);
  }
}

module.exports={validateAliceRequest,validateAliceUser,isLaunchOnly,buildAliceResponse,runWithBudget};
};


__modules["src/app.js"] = function(module, exports, __require, require) {
const express = require('express');
const { VERSION } = __require("src/config.js");
const { validateAliceRequest, validateAliceUser, isLaunchOnly, buildAliceResponse, runWithBudget } = __require("src/core/alice-protocol.js");
const { buildRequestContext } = __require("src/core/request-context.js");
const { ContextStore } = __require("src/core/context-store.js");
const { ToolRegistry } = __require("src/core/tool-registry.js");
const { route } = __require("src/core/router.js");
const { GitHubStorage } = __require("src/storage/github-storage.js");
const { panelHtml } = __require("src/ui/panel.js");
const { PcBridge } = __require("src/pc/bridge.js");
const { CapabilityRegistry } = __require("src/core/capability-registry.js");

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

  // Earliest possible request marker. It intentionally logs no body, token,
  // IP address or user content; it exists so transport failures can be
  // distinguished from JSON/protocol failures.
  app.use((req,res,next)=>{
    if(req.path==='/alice' && req.method==='POST'){
      console.log('[alice-in]',Date.now());
    }
    next();
  });

  app.use(express.json({limit:'1mb'}));
  app.use((err,req,res,next)=>{
    if(err && req.path==='/alice'){
      console.warn('[alice][reject]','json_parse_error');
      return res.status(400).json({ok:false,error:'invalid_json'});
    }
    next(err);
  });

  const context = new ContextStore();
  const storage = new GitHubStorage();
  const registry = new ToolRegistry();
  const pcBridge = new PcBridge();
  const capabilities = new CapabilityRegistry(__require("src/core/capability-registry.js").CAPABILITIES);
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

  const runtime = { context, storage, registry, sendView, pcBridge, capabilities };

  storage.load().then(()=>console.log('[storage] loaded')).catch(e=>console.error('[storage]',e.message));
  setInterval(()=>context.cleanup(),5*60*1000).unref();

  app.get('/health',(req,res)=>{
    const s=pcBridge.status();
    const safeMeta=s.meta ? {
      version:s.meta.version||null
    } : null;
    res.json({
      ok:true,
      version:VERSION,
      tools:registry.list().map(x=>x.name),
      unifiedCore:true,
      capabilities:{
        count:capabilities.list().length,
        summary:capabilities.summary()
      },
      storage:storage.securityStatus(),
      pc:{
        configured:s.configured,
        online:s.online,
        lastSeen:s.lastSeen,
        meta:safeMeta
      }
    });
  });

  app.get('/capabilities',(req,res)=>res.json({
    ok:true,
    version:VERSION,
    principle:'one_yandex_skill_one_server_one_windows_agent',
    capabilities:capabilities.list(),
    masterPlan:capabilities.masterPlan()
  }));

  app.get('/alice',(req,res)=>res.json({status:'ok',text:'Smart Assistant Core работает',version:VERSION}));
  app.head('/alice',(req,res)=>res.status(200).end());

  app.get('/events',(req,res)=>{
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
    if(lastView)res.write('data: '+JSON.stringify(lastView)+'\n\n');
    clients.add(res);
    req.on('close',()=>clients.delete(res));
  });

  app.post('/pc/heartbeat',(req,res)=>{
    if(!pcBridge.authorize(req))return res.status(401).json({ok:false});
    const b=req.body||{},machine=String(b.machine||'home-pc-v2');
    const meta={version:String(b.version||'')};
    pcBridge.heartbeat(machine,meta);
    res.json({ok:true,serverTime:Date.now()});
  });

  app.get('/pc/poll',async(req,res)=>{
    if(!pcBridge.authorize(req))return res.status(401).json({ok:false});
    const machine=String(req.query.machine||'home-pc-v2');
    pcBridge.heartbeat(machine,{});
    const job=await pcBridge.pollWait(machine,900);
    res.json({ok:true,job});
  });

  app.post('/pc/result',(req,res)=>{
    if(!pcBridge.authorize(req))return res.status(401).json({ok:false});
    const b=req.body||{};
    pcBridge.complete(String(b.id||''),b.result||{ok:false,message:'Пустой результат'});
    res.json({ok:true});
  });

  app.post('/alice',async(req,res)=>{
    const started=Date.now();
    const body=req.body||{};
    const request=body.request||{};
    const session=body.session||{};
    const traceId=String(session.session_id||'no-session').slice(0,12)+'-'+String(session.message_id??'x');

    const validation=validateAliceRequest(body);
    if(validation){
      console.warn('[alice][reject]',traceId,validation);
      return res.status(validation==='SKILL_ID_MISMATCH'?403:400).json({ok:false,error:'invalid_alice_request'});
    }

    // Yandex Dialogs health-check. Keep this path synchronous and minimal.
    if(String(request.original_utterance||'').trim().toLowerCase()==='ping'){
      const out={reply:'Мой помощник на связи.'};
      console.log('[alice]',traceId,'ping',Date.now()-started+'ms');
      return res.status(200).json(buildAliceResponse(out));
    }

    const userValidation=validateAliceUser(body);
    if(userValidation){
      console.warn('[alice][reject]',traceId,userValidation);
      return res.status(403).json({ok:false,error:'user_not_allowed'});
    }

    const ctx=buildRequestContext(body);

    // A plain launch gets an immediate answer. A direct first-turn command is NOT discarded.
    if(session.new===true && isLaunchOnly(ctx.command)){
      const out={reply:'Мой помощник на связи. Что сделать на компьютере?'};
      console.log('[alice]',traceId,'new-session',Date.now()-started+'ms');
      return res.status(200).json(buildAliceResponse(out));
    }

    let out;
    try{
      out=await runWithBudget(()=>route(ctx,runtime),Date.now()-started);
    }catch(e){
      console.error('[alice]',traceId,e.stack||e.message);
      out={reply:'Произошла внутренняя ошибка. Попробуй ещё раз.'};
    }

    if(out&&(out.html||out.speakOnly||out.voiceText||out.stopSpeak)){
      const view={};
      if(out.html)view.html=out.html;
      if(out.speakOnly)view.speak=out.speakOnly;
      else if(out.voiceText)view.speak=out.voiceText;
      if(out.stopSpeak)view.stopSpeak=true;
      sendView(view);
    }

    const traceIntent=context.session(ctx.sessionId).lastIntent||'handled';
    console.log('[alice]',traceId,traceIntent,Date.now()-started+'ms',
      out&&out.timeout?'deadline':'');

    return res.status(200).json(buildAliceResponse(out));
  });

  app.get('/',(req,res)=>res.send(panelHtml(VERSION)));

  return app;
}

module.exports={createApp};

};

__modules["src/config.js"] = function(module, exports, __require, require) {
module.exports = {
  VERSION: '2.1.0-foundation-hardening-candidate',
  TZ: process.env.TZ_NAME || 'Europe/Moscow',
  GH_TOKEN: process.env.GH_TOKEN || '',
  GH_REPO: process.env.GH_REPO || 'elmaltsewa-dev/alice-server',
  STORAGE_FILE: process.env.STORAGE_FILE || 'data.json',
  SESSION_TTL_MS: 30 * 60 * 1000,
  USER_CONTEXT_TTL_MS: 24 * 60 * 60 * 1000,
  PC_AGENT_TOKEN: process.env.PC_AGENT_TOKEN || '',
  PC_AGENT_TTL_MS: 45 * 1000,
  DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY || '',
  YANDEX_SKILL_ID: process.env.YANDEX_SKILL_ID || 'c2f72b52-4634-45c1-b74f-e7a533e0aaab',
  YANDEX_ALLOWED_USER_HASH: process.env.YANDEX_ALLOWED_USER_HASH || 'a3de64fdc2eb15c76e9eb12175fcfcac143e133cab342a30abac2aaae6943eab',
  ALICE_REQUEST_BUDGET_MS: Number(process.env.ALICE_REQUEST_BUDGET_MS || 3300),
  EXTERNAL_FETCH_TIMEOUT_MS: Number(process.env.EXTERNAL_FETCH_TIMEOUT_MS || 1300)
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
      pendingStack: [],
      lastReferencedObject: null,
      lastUserCommand: null,
      actionHistory: []
    }));
  }

  user(id) {
    return this._touch(this.users, id, USER_CONTEXT_TTL_MS, () => ({
      lastIntent: null,
      lastTool: null,
      lastResults: [],
      lastReferencedObject: null,
      lastUserCommand: null,
      actionHistory: []
    }));
  }

  remember(ctx, patch) {
    const s = this.session(ctx.sessionId);
    const u = this.user(ctx.userId);
    const p = { ...(patch || {}) };

    // Pending clarification is session-scoped. Never leak it into the user
    // context, otherwise a new Alice session can inherit a stale confirmation.
    if (Object.prototype.hasOwnProperty.call(p, 'pendingClarification')) {
      const nextPending = p.pendingClarification;
      delete p.pendingClarification;
      this.setPending(ctx, nextPending);
    }

    Object.assign(s, p);

    // Persist only cross-session conversational references. Window/tab/file
    // enumerations and confirmation state belong to one live session.
    const sessionOnly = new Set([
      'pendingStack','selectedIndex','lastPcWindows','lastBrowserTabs',
      'lastFileResults','lastAppCandidates','lastPcContext'
    ]);
    const userPatch = {};
    for (const [k, v] of Object.entries(p)) {
      if (!sessionOnly.has(k)) userPatch[k] = v;
    }
    Object.assign(u, userPatch);
  }

  resolveOrdinal(text) {
    const map = {
      'перв': 1, 'один': 1, 'одну': 1,
      'втор': 2, 'два': 2, 'две': 2,
      'трет': 3, 'три': 3,
      'четверт': 4, 'четыр': 4,
      'пят': 5, 'шест': 6, 'седьм': 7, 'восьм': 8, 'девят': 9, 'десят': 10
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

  setPending(ctx, pending) {
    const s=this.session(ctx.sessionId);
    if(!Array.isArray(s.pendingStack))s.pendingStack=[];

    if(!pending){
      s.pendingClarification=null;
      s.pendingStack=[];
      return null;
    }

    // Preserve the previous live clarification only when a genuinely nested
    // clarification is created.
    if(s.pendingClarification){
      s.pendingStack.push(s.pendingClarification);
      if(s.pendingStack.length>5)s.pendingStack.splice(0,s.pendingStack.length-5);
    }

    s.pendingClarification={...pending,createdAt:Number(pending.createdAt||Date.now())};
    return s.pendingClarification;
  }

  peekPending(ctx) {
    const s=this.session(ctx.sessionId);
    return s.pendingClarification||null;
  }

  clearPending(ctx, restorePrevious=true) {
    const s=this.session(ctx.sessionId);
    const current=s.pendingClarification||null;
    s.pendingClarification=(restorePrevious && Array.isArray(s.pendingStack) && s.pendingStack.length)
      ? s.pendingStack.pop()
      : null;
    if(!restorePrevious && Array.isArray(s.pendingStack))s.pendingStack=[];
    return current;
  }

  clearAllPending(ctx) {
    return this.clearPending(ctx,false);
  }

  recordAction(ctx, action) {
    const s=this.session(ctx.sessionId);
    if(!Array.isArray(s.actionHistory))s.actionHistory=[];
    s.actionHistory.push({...action,at:Date.now()});
    if(s.actionHistory.length>20)s.actionHistory.splice(0,s.actionHistory.length-20);
  }

  lastAction(ctx) {
    const s=this.session(ctx.sessionId);
    return Array.isArray(s.actionHistory)&&s.actionHistory.length?s.actionHistory[s.actionHistory.length-1]:null;
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
  if (/^(повтори|повтори еще раз|повтори ещё раз)$/.test(c)) return { name: 'REPEAT', confidence: 1 };

  if (/^(нажми|кликни|щёлкни|щелкни|выбери)\s+/.test(c)) {
    return { name: 'PC', confidence: .99 };
  }

  if (/^(дальше|далее)$/.test(c)) return { name: 'CONTEXT_NEXT', confidence: .98 };
  if (/^(назад|предыдущий|предыдущая)$/.test(c)) return { name: 'CONTEXT_PREV', confidence: .98 };
  if (/^(перв|втор|трет|четверт|пят|шест|седьм|восьм|девят|\d+)/.test(c)) {
    return { name: 'CONTEXT_SELECT', confidence: .9, index: contextStore.resolveOrdinal(c) };
  }
  if (/^(открой|покажи|прочитай|зачитай)\s+(его|ее|её|это|этот|эту|тот|ту)$/.test(c)) {
    return { name: 'CONTEXT_ACT', confidence: .95 };
  }

  if (includesAny(c, ['не понимаю', 'что произошло', 'что случилось', 'помоги', 'что нажать', 'что мне нажать', 'куда нажать', 'что здесь нажать', 'куда пропало', 'куда все пропало', 'не могу открыть'])) {
    return { name: 'HELP_ME', confidence: .92 };
  }

  if (/привет|здравствуй|добрый (день|вечер|утро)/.test(c)) return { name: 'GREETING', confidence: .98 };
  if (/помощь|что ты умеешь/.test(c)) return { name: 'HELP', confidence: .98 };

  if (/который час|сколько времени|время сейчас|какое( сегодня)? число|какая дата|день недели|неделя года|до нового года|время в мире|время в [а-яa-z-]+|какое число будет через|сколько.*(прошло|до)/.test(c)) {
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

  if (/погода|будет дождь|нужна куртка|(?:^|\s)(уф|ультрафиолет)(?:\s|$)|рассвет|закат|прогноз на неделю|фаз.*луны/.test(c)) {
    return { name: 'WEATHER', confidence: .98 };
  }

  if (/посчитай|процент|случайное число|дюйм|килограмм|километр/.test(c)) {
    return { name: 'CALCULATOR', confidence: .9 };
  }

  if (/переведи|как по[- ]английски/.test(c)) {
    return { name: 'TRANSLATE', confidence: .9 };
  }

  if (/в этот день|кто такой|кто такая|что такое|расскажи про|столица|население/.test(c)) {
    return { name: 'KNOWLEDGE', confidence: .9 };
  }

  if (/анекдот|факт|комплимент|совет|мотивируй|монетк|кубик|камень.*ножницы|ножницы.*бумага|загадк|^ответ|^еще|^ещё|другой|что посмотреть|что приготовить|что съесть|идея подарка|что подарить/.test(c)) {
    return { name: 'ENTERTAINMENT', confidence: .88 };
  }

  if (/компьютер|пк|программ|окн|вкладк|файл|документ|папк|загрузк|рабочий стол|браузер|хром|телеграм|word|ворд|excel|эксель|буфер обмена|громк|громч|тиш|звук|монитор|диспетчер задач|панель управления|bluetooth|блютуз|автозагрузк|безопасность windows|что сейчас на экране|где я сейчас|в какой программе|кнопк|ссылк|элемент|что написано|что здесь можно/.test(c)) {
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
const { classifyCommand } = __require("src/core/safety.js");

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
  let intent = detectIntent(ctx, runtime.context);
  const capMatch=runtime.capabilities&&runtime.capabilities.match(ctx.command);
  if(capMatch){
    const executor=String(capMatch.tool||'');
    const reverse={
      pc:'PC','pc-ui':'PC','core-pc':'PC',
      browser:'BROWSER','browser-ui':'PC',
      tasks:'TASKS',lists:'LISTS',notes:'NOTES',timer:'TIMER',
      weather:'WEATHER',calculator:'CALCULATOR',translate:'TRANSLATE',
      knowledge:'KNOWLEDGE',entertainment:'ENTERTAINMENT'
    };
    const desired=reverse[executor];
    const cap=capMatch.capability||{};
    if(cap.id==='help.mode'){
      intent={name:'HELP_ME',confidence:capMatch.confidence,capabilityId:cap.id};
    }else if(desired && (capMatch.exact || intent.name==='UNKNOWN' ||
      capMatch.confidence>Number(intent.confidence||0) ||
      (intent.name==='CONTEXT_PREV' && cap.id==='browser.navigation'))){
      intent={name:desired,confidence:capMatch.confidence,capabilityId:cap.id};
    }
  }

  if(!['CONFIRM_YES','CONFIRM_NO','REPEAT'].includes(intent.name) && ctx.command){
    runtime.context.remember(ctx,{lastUserCommand:ctx.command});
  }
  runtime.context.remember(ctx,{lastIntent:intent.name,lastCapability:intent.capabilityId||(capMatch&&capMatch.id)||null});

  if(intent.name==='EMPTY')return{reply:'Я слушаю.'};
  if(intent.name==='GREETING')return{reply:'Привет. Я на связи.'};
  if(intent.name==='HELP'){
    return{reply:'Говори обычными словами. Я умею работать с программами, окнами и вкладками, файлами, интерфейсом Windows, браузером, заметками, задачами, списками, погодой, расчётами и другими подключёнными функциями. Если команда неоднозначна, я уточню.'};
  }

  if(intent.name==='REPEAT'){
    const s=runtime.context.session(ctx.sessionId);
    const last=String(s.lastUserCommand||'').trim();
    if(!last)return{reply:'Пока нечего повторять.'};
    return await route({...ctx,command:last,isRepeat:true},runtime);
  }

  if(intent.name==='HELP_ME'){
    const result=await runtime.registry.run('pc',{ctx,intent},runtime);
    runtime.context.remember(ctx,{lastTool:'pc',...(result.remember||{})});
    return result;
  }

  if(intent.name==='CONTEXT_SELECT'){
    const s=runtime.context.session(ctx.sessionId), n=intent.index;

    if(s.pendingClarification && s.pendingClarification.type==='file_select'){
      const items=Array.isArray(s.lastFileResults)?s.lastFileResults:[];
      if(!n||!items[n-1])return{reply:'Такого файла в последнем списке нет.'};
      const item=items[n-1];
      runtime.context.clearAllPending(ctx);
      const r=await runtime.pcBridge.run('open_path',{path:item.path});
      if(!r||r.ok===false)return{reply:'Не получилось открыть «'+String(item.name||'файл')+'».'};
      runtime.context.remember(ctx,{lastReferencedObject:{type:'file',...item}});
      return{reply:'Открыла «'+String(item.name||'файл')+'».'};
    }

    if(s.pendingClarification && s.pendingClarification.type==='window_select'){
      const items=Array.isArray(s.lastPcWindows)?s.lastPcWindows:[];
      if(!n||!items[n-1])return{reply:'Такого окна в последнем списке нет.'};
      const item=items[n-1];
      runtime.context.clearAllPending(ctx);
      const r=await runtime.pcBridge.run('switch_window',{processId:item.processId});
      if(!r||r.ok===false)return{reply:'Не получилось переключиться на это окно.'};
      return{reply:'Переключилась на «'+String(item.title||item.process||'окно')+'».'};
    }

    if(s.pendingClarification && s.pendingClarification.type==='app_select'){
      const items=Array.isArray(s.lastAppCandidates)?s.lastAppCandidates:[];
      if(!n||!items[n-1])return{reply:'Такой программы в последнем списке нет.'};
      const item=items[n-1];
      runtime.context.clearAllPending(ctx);
      // Shortcut path is under Start Menu and can be launched as a path only by the agent's generic resolver.
      const r=await runtime.pcBridge.run('open_app_generic',{query:item.name});
      if(!r||r.ok===false)return{reply:'Не получилось открыть «'+String(item.name||'программу')+'».'};
      return{reply:'Открыла «'+String(item.name||'программу')+'».'};
    }

    if(s.pendingClarification && s.pendingClarification.type==='browser_tab_select'){
      const tabs=Array.isArray(s.lastBrowserTabs)?s.lastBrowserTabs:[];
      if(!n || !tabs[n-1]){
        return{reply:'Такой вкладки в последнем списке нет. Назови номер от одного до '+Math.max(1,tabs.length)+'.'};
      }

      const tab=tabs[n-1];
      const pending=s.pendingClarification;
      runtime.context.clearAllPending(ctx);

      const r=await runtime.pcBridge.run('activate_browser_tab',{
        index:n,
        name:tab.name||'',
        expectedProcessId:pending.expectedProcessId||0
      });

      if(!r)return{reply:'Не получила ответ от браузера. Ничего не переключаю повторно.'};
      if(r.ok===false){
        if(r.code==='WINDOW_CHANGED')return{reply:'Активное окно изменилось. Сначала снова спроси, какие вкладки открыты.'};
        if(r.code==='NOT_FOUND')return{reply:'Эта вкладка уже не найдена. Сначала снова спроси список вкладок.'};
        return{reply:'Не получилось переключиться на эту вкладку.'};
      }

      runtime.context.remember(ctx,{lastPcContext:(r.data&&r.data.window)||null});
      return{reply:'Открыла вкладку '+n+': «'+String(tab.name||'без названия')+'».'};
    }

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
    if(obj.type==='file' && obj.path){
      const r=await runtime.pcBridge.run('open_path',{path:obj.path});
      return{reply:r&&r.ok!==false?'Открыла «'+String(obj.name||'файл')+'».':'Не получилось открыть этот файл.'};
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
    const pending=runtime.context.peekPending(ctx);
    if(!pending)return{reply:'Сейчас нечего подтверждать.'};
    runtime.context.clearPending(ctx);

    if(pending.createdAt && Date.now()-pending.createdAt>45000){
      runtime.context.clearAllPending(ctx);
      return{reply:'Подтверждение уже устарело. Повтори исходную команду.'};
    }

    if(intent.name==='CONFIRM_NO'){
      runtime.context.clearAllPending(ctx);
      return{reply:pending.type==='pc_ui_action'?'Хорошо, не нажимаю.':'Хорошо, отменяю.'};
    }

    if(pending.type==='destructive_command'){
      return await route({...ctx,command:pending.command,confirmedDangerous:true},runtime);
    }

    if(pending.type==='pc_ui_action'){
      const r=await runtime.pcBridge.run('invoke_ui',pending.args||{});
      if(!r)return{reply:'Не получила ответ от компьютера. Ничего повторно не нажимаю.'};
      if(r.ok===false){
        const code=String(r.code||'');
        const errors={
          WINDOW_CHANGED:'Окно уже изменилось, поэтому ничего не нажала. Повтори команду в нужном окне.',
          NOT_FOUND:'Элемент уже не найден. Ничего не нажала.',
          AMBIGUOUS:'На экране несколько одинаковых элементов. Ничего не нажала.',
          NOT_SUPPORTED:'Этот элемент пока нельзя безопасно нажать через Windows Automation.',
          BLOCKED:'Это действие заблокировано из соображений безопасности.',
          BLOCKED_CONTEXT:'Контекст окна изменился и теперь похож на удаление, установку, отправку или другое опасное действие. Ничего не нажала.',
          RESULT_TIMEOUT:'Команду передала, но компьютер не успел подтвердить результат. Я не считаю нажатие выполненным.',
          FAILED:'Не получилось выполнить нажатие. Ничего повторно не нажимаю.'
        };
        return{reply:errors[code]||'Не получилось выполнить нажатие. Ничего повторно не нажимаю.'};
      }
      runtime.context.recordAction(ctx,{type:'pc_ui_action',label:pending.label,args:pending.args});
      return{reply:'Готово. Нажала «'+String(pending.label||'элемент')+'».'};
    }

    return{reply:'Поняла.'};
  }

  const safety=classifyCommand(ctx.command);
  if(safety.requiresConfirmation && !ctx.confirmedDangerous){
    runtime.context.setPending(ctx,{
      type:'destructive_command',
      command:ctx.command,
      reason:safety.reason
    });
    return{reply:'Это действие удалит или очистит данные. Подтвердить выполнение?'};
  }

  if(capMatch && capMatch.capability){
    const impl=String(capMatch.actionStatus||capMatch.capability.implementation||'');
    if(impl==='planned'){
      return{reply:'Эта возможность есть в утверждённом плане, но исполнитель для неё ещё не подключён.'};
    }
    if(impl==='blocked'){
      return{reply:'Эта операция предусмотрена, но пока заблокирована до завершения усиленной проверки безопасности.'};
    }
    if(impl==='external'){
      return{reply:'Для этой возможности нужен отдельный актуальный источник данных. Сейчас он ещё не подключён.'};
    }
  }

  if(intent.name==='UNKNOWN'){
    return{reply:'Не уверена, какое действие ты имеешь в виду. Скажи цель обычной фразой. Например: «открой Телеграм», «какие вкладки открыты», «найди документ», «что здесь можно нажать» или «помоги».'};
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
  CONFIRM: 'confirm',
  DANGEROUS: 'dangerous'
};

function normalize(v){return String(v||'').toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();}

function classifyCommand(command){
  const c=normalize(command);
  const destructive=[
    /удали задачу/,
    /очисти выполненные/,
    /удали\s+\d+\s+из/,
    /очисти список/,
    /удали список/,
    /удали заметку/,
    /очисти заметки/,
    /очисти буфер обмена/
  ];
  if(destructive.some(re=>re.test(c))){
    return {risk:RISK.DANGEROUS,requiresConfirmation:true,reason:'destructive_user_data'};
  }
  return {risk:RISK.CHANGE,requiresConfirmation:false,reason:null};
}

function dangerousUiContext(target, window, labels){
  const text=[
    target&&target.name,
    window&&window.title,
    ...(Array.isArray(labels)?labels:[])
  ].filter(Boolean).join(' ').toLowerCase().replace(/ё/g,'е');

  const risky=/удал|delete|remove|стер|format|формат|сброс|reset|factory|деинстал|uninstall|оплат|платеж|купить|purchase|pay|заказать|отправить|send|publish|опубликов|перезагруз|restart|выключ|shutdown|установ|install|очистк.*диск|безвозврат/;
  return risky.test(text);
}

function requiresConfirmation(risk) {
  return risk === RISK.DANGEROUS || risk === RISK.CONFIRM;
}

module.exports = { RISK, requiresConfirmation, classifyCommand, dangerousUiContext };

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
    const risk=String(tool.risk||'read');
    const ctx=(input&&input.ctx)||{};
    if(risk==='dangerous' && !ctx.confirmedDangerous){
      return {reply:'Это опасное действие требует отдельного подтверждения.',policyBlocked:true};
    }
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
const crypto = require("crypto");
const { PC_AGENT_TOKEN, PC_AGENT_TTL_MS } = __require("src/config.js");

class PcBridge {
  constructor() {
    this.agents = new Map();
    this.jobs = [];
    this.waiters = new Map();
    this.pollWaiters = new Map();
  }

  configured() { return !!PC_AGENT_TOKEN; }

  authorize(req) {
    if (!PC_AGENT_TOKEN) return false;
    const got=Buffer.from(String(req.headers.authorization||''),'utf8');
    const want=Buffer.from('Bearer '+PC_AGENT_TOKEN,'utf8');
    if(got.length!==want.length)return false;
    return crypto.timingSafeEqual(got,want);
  }

  heartbeat(machine, meta = {}) {
    const id = machine || 'home-pc';
    const prev = this.agents.get(id);
    this.agents.set(id, {
      lastSeen: Date.now(),
      meta: { ...((prev && prev.meta) || {}), ...(meta || {}) }
    });
  }

  online(machine = 'home-pc-v2') {
    const a = this.agents.get(machine);
    return !!a && Date.now() - a.lastSeen <= PC_AGENT_TTL_MS;
  }

  status(machine = 'home-pc-v2') {
    const a = this.agents.get(machine);
    return {
      configured: this.configured(),
      online: this.online(machine),
      lastSeen: a ? a.lastSeen : null,
      meta: a ? a.meta : null
    };
  }

  enqueue(action, args = {}, machine = 'home-pc-v2') {
    const id = 'job_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    const job = { id, machine, action, args, createdAt: Date.now() };
    const waiting=this.pollWaiters.get(machine);
    if(waiting){
      this.pollWaiters.delete(machine);
      waiting(job);
    }else{
      this.jobs.push(job);
    }
    return job;
  }

  poll(machine = 'home-pc-v2') {
    const now=Date.now();
    this.jobs=this.jobs.filter(j=>now-j.createdAt<=10000);
    const i = this.jobs.findIndex(j => j.machine === machine);
    if (i < 0) return null;
    return this.jobs.splice(i, 1)[0];
  }

  pollWait(machine='home-pc-v2', timeoutMs=900){
    const immediate=this.poll(machine);
    if(immediate)return Promise.resolve(immediate);
    return new Promise(resolve=>{
      let done=false;
      const finish=job=>{
        if(done)return;
        done=true;
        clearTimeout(timer);
        if(this.pollWaiters.get(machine)===finish)this.pollWaiters.delete(machine);
        resolve(job||null);
      };
      const timer=setTimeout(()=>finish(null),timeoutMs);
      const previous=this.pollWaiters.get(machine);
      if(previous){
        this.pollWaiters.delete(machine);
        try{previous(null);}catch{}
      }
      this.pollWaiters.set(machine,finish);
    });
  }

  waitResult(id, timeoutMs = 2800) {
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

  async run(action, args = {}, machine = 'home-pc-v2') {
    if (!this.configured()) return { ok:false, code:'NOT_CONFIGURED', state:'rejected' };
    if (!this.online(machine)) return { ok:false, code:'OFFLINE', state:'rejected' };
    const job = this.enqueue(action, args, machine);
    const result = await this.waitResult(job.id, 2800);
    if (!result) {
      return {
        ok:false,
        code:'RESULT_TIMEOUT',
        state:'timeout_unknown',
        accepted:true,
        message:'Agent did not confirm completion before deadline.'
      };
    }
    return { ...result, state:result.ok===false?'completed_error':'completed_ok' };
  }
}

module.exports = { PcBridge };

};


__modules["src/core/http.js"] = function(module, exports, __require, require) {
const { EXTERNAL_FETCH_TIMEOUT_MS } = __require("src/config.js");

async function fetchWithTimeout(url, options={}, timeoutMs=EXTERNAL_FETCH_TIMEOUT_MS){
  const controller=new AbortController();
  const parentSignal=options&&options.signal;
  let parentAbort=null;
  if(parentSignal){
    if(parentSignal.aborted)controller.abort();
    else{
      parentAbort=()=>controller.abort();
      parentSignal.addEventListener('abort',parentAbort,{once:true});
    }
  }
  const timer=setTimeout(()=>controller.abort(),Math.max(250,Number(timeoutMs)||EXTERNAL_FETCH_TIMEOUT_MS));
  try{
    return await globalThis.fetch(url,{...(options||{}),signal:controller.signal});
  } finally {
    clearTimeout(timer);
    if(parentSignal&&parentAbort)parentSignal.removeEventListener('abort',parentAbort);
  }
}

module.exports={fetchWithTimeout};
};


__modules["src/services/weather.js"] = function(module, exports, __require, require) {const { fetchWithTimeout } = __require("src/core/http.js");

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
    const r = await fetchWithTimeout('https://geocoding-api.open-meteo.com/v1/search?name=' +
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
  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`Weather HTTP ${r.status}`);
  return await r.json();
}

module.exports = { geoCity, weatherFor, wmo, isRain };

};

__modules["src/services/web.js"] = function(module, exports, __require, require) {const { fetchWithTimeout } = __require("src/core/http.js");

function decode(s){return String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&amp;/g,'&');}
function strip(s){return decode(String(s).replace(/<[^>]+>/g,''));}

function isSafePublicUrl(raw){
  let u;
  try{u=new URL(raw);}catch{return false;}
  if(!['http:','https:'].includes(u.protocol))return false;
  const h=String(u.hostname||'').toLowerCase().replace(/^\[|\]$/g,'');
  if(!h || h==='localhost' || h.endsWith('.localhost') || h.endsWith('.local'))return false;

  // Reject private/link-local IP literals. Hostname DNS rebinding is outside
  // this lightweight reader's trust model, so the direct fallback remains
  // read-only and tightly timed.
  if(/^(\d{1,3}\.){3}\d{1,3}$/.test(h)){
    const p=h.split('.').map(Number);
    if(p.some(x=>x<0||x>255))return false;
    if(p[0]===10 || p[0]===127 || p[0]===0)return false;
    if(p[0]===169&&p[1]===254)return false;
    if(p[0]===172&&p[1]>=16&&p[1]<=31)return false;
    if(p[0]===192&&p[1]===168)return false;
    if(p[0]===100&&p[1]>=64&&p[1]<=127)return false;
  }
  if(h==='::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80:'))return false;
  return true;
}

async function ddgSearch(q,p){
  try{
    const r=await fetchWithTimeout('https://lite.duckduckgo.com/lite/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0'}});
    const h=await r.text();const out=[];const re=/<a[^>]+rel="nofollow"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(m[1].startsWith('http')&&t&&!m[1].includes('duckduckgo'))out.push({title:t,url:m[1]});}
    return out;
  }catch(e){console.error('[search.ddg]',e.message);return[];}
}

async function ddgHtmlSearch(q,p){
  try{
    const r=await fetchWithTimeout('https://html.duckduckgo.com/html/?q='+encodeURIComponent(q)+(p?'&s='+(p*10):''),{headers:{'User-Agent':'Mozilla/5.0'}});
    const h=await r.text();const out=[];const re=/<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;while((m=re.exec(h))&&out.length<6){let href=m[1];if(href.includes('uddg=')){try{href=decodeURIComponent(href.split('uddg=')[1].split('&')[0]);}catch{}}
      const t=strip(m[2]).trim();if(href.startsWith('http')&&t)out.push({title:t,url:href});}
    return out;
  }catch(e){console.error('[search.ddgHtml]',e.message);return[];}
}

async function bingSearch(q){
  try{
    const r=await fetchWithTimeout('https://www.bing.com/search?q='+encodeURIComponent(q),{headers:{'User-Agent':'Mozilla/5.0','Accept-Language':'ru-RU,ru;q=0.9'}});
    const h=await r.text();const out=[];const re=/<li class="b_algo"[\s\S]*?<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;while((m=re.exec(h))&&out.length<6){const t=strip(m[2]).trim();if(t&&!m[1].includes('bing.com')&&!m[1].includes('microsoft.com'))out.push({title:t,url:m[1]});}
    return out;
  }catch(e){console.error('[search.bing]',e.message);return[];}
}

async function searchAll(q,p=0){
  const all=await Promise.all([ddgSearch(q,p),ddgHtmlSearch(q,p),bingSearch(q)]);
  for(const r of all)if(Array.isArray(r)&&r.length)return r;
  return [];
}

async function readPage(url){
  if(!isSafePublicUrl(url))return null;
  try{
    const r=await fetchWithTimeout('https://r.jina.ai/'+url,{headers:{'User-Agent':'Mozilla/5.0'}});
    let t=await r.text();
    t=t.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[#>*`_]/g,'').replace(/\n{3,}/g,'\n\n');
    if(t.length>300)return t.slice(0,20000);
  }catch(e){console.error('[read.jina]',e.message);}
  try{
    const r=await fetchWithTimeout(url,{headers:{'User-Agent':'Mozilla/5.0'}});
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
    const s=await fetchWithTimeout('https://ru.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=1&format=json&origin=*');
    const a=await s.json();const title=a[1]&&a[1][0];if(!title)return null;
    const r=await fetchWithTimeout('https://ru.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(title));
    const j=await r.json();return j.extract?{title:j.title,text:j.extract}:null;
  }catch(e){console.error('[wiki]',e.message);return null;}
}

async function translate(t,dir){
  try{
    const r=await fetchWithTimeout('https://api.mymemory.translated.net/get?q='+encodeURIComponent(t)+'&langpair='+dir);
    const j=await r.json();return j.responseData?j.responseData.translatedText:null;
  }catch(e){console.error('[translate]',e.message);return null;}
}


async function wikiImages(q){
  try{
    const r=await fetchWithTimeout('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch='+encodeURIComponent('filetype:bitmap '+q)+'&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=480');
    const j=await r.json();const pages=j.query&&j.query.pages?Object.values(j.query.pages):[];
    pages.sort((a,b)=>(a.index||0)-(b.index||0));
    return pages.map(p=>p.imageinfo&&p.imageinfo[0]?{thumb:p.imageinfo[0].thumburl}:null).filter(Boolean);
  }catch(e){console.error('[images]',e.message);return[];}
}
async function onThisDay(){
  try{
    const d=new Date(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
    const r=await fetchWithTimeout('https://ru.wikipedia.org/api/rest_v1/feed/onthisday/events/'+mm+'/'+dd);
    const j=await r.json();return (j.events||[]).filter(e=>e.text&&e.year).slice(0,5);
  }catch(e){console.error('[onThisDay]',e.message);return[];}
}
module.exports = { searchAll, readPage, splitPages, wikiSummary, translate, wikiImages, onThisDay };

};

__modules["src/storage/github-storage.js"] = function(module, exports, __require, require) {
const { fetchWithTimeout } = __require("src/core/http.js");
const crypto = require('crypto');
const {
  GH_TOKEN, GH_REPO, STORAGE_FILE, DATA_ENCRYPTION_KEY, PC_AGENT_TOKEN
} = __require("src/config.js");

const AAD=Buffer.from('smart-assistant-storage-v3','utf8');

function userKey(userId) {
  return crypto.createHash('sha256').update(String(userId || 'anonymous')).digest('hex').slice(0, 24);
}

function storageSecret(){
  return String(DATA_ENCRYPTION_KEY||PC_AGENT_TOKEN||'');
}

function deriveKey(){
  const secret=storageSecret();
  if(!secret)return null;
  return crypto.createHash('sha256')
    .update('storage-v3\0'+secret+'\0'+String(GH_REPO||''))
    .digest();
}

function encryptState(state){
  const key=deriveKey();
  if(!key)throw new Error('STORAGE_ENCRYPTION_KEY_MISSING');
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(AAD);
  const plaintext=Buffer.from(JSON.stringify(state),'utf8');
  const data=Buffer.concat([cipher.update(plaintext),cipher.final()]);
  const tag=cipher.getAuthTag();
  return {
    schemaVersion:3,
    encrypted:true,
    alg:'aes-256-gcm',
    iv:iv.toString('base64'),
    tag:tag.toString('base64'),
    data:data.toString('base64')
  };
}

function decryptState(envelope){
  const key=deriveKey();
  if(!key)throw new Error('STORAGE_ENCRYPTION_KEY_MISSING');
  if(!envelope || envelope.schemaVersion!==3 || envelope.encrypted!==true ||
     envelope.alg!=='aes-256-gcm')throw new Error('BAD_STORAGE_ENVELOPE');
  const decipher=crypto.createDecipheriv(
    'aes-256-gcm',key,Buffer.from(String(envelope.iv||''),'base64')
  );
  decipher.setAAD(AAD);
  decipher.setAuthTag(Buffer.from(String(envelope.tag||''),'base64'));
  const plain=Buffer.concat([
    decipher.update(Buffer.from(String(envelope.data||''),'base64')),
    decipher.final()
  ]).toString('utf8');
  return JSON.parse(plain);
}

function normalizeState(parsed){
  if(parsed && parsed.schemaVersion===2 && parsed.users){
    return parsed;
  }
  return {
    schemaVersion:2,
    users:{},
    legacy:{
      tasks:Array.isArray(parsed&&parsed.tasks)?parsed.tasks:[],
      lists:parsed&&parsed.lists&&typeof parsed.lists==='object'?parsed.lists:{},
      notes:Array.isArray(parsed&&parsed.notes)?parsed.notes:[],
      city:(parsed&&parsed.city)||'Москва'
    },
    migratedTo:null
  };
}

class GitHubStorage {
  constructor() {
    this.sha = null;
    this.state = { schemaVersion:2, users:{}, legacy:null, migratedTo:null };
    this.saveTimer = null;
    this.needsEncryptionMigration=false;
    this.encryptionReady=!!deriveKey();
  }

  async load() {
    if (!GH_TOKEN) return this.state;
    try {
      const r = await fetchWithTimeout(`https://api.github.com/repos/${GH_REPO}/contents/${STORAGE_FILE}`, {
        headers: {
          Authorization:`Bearer ${GH_TOKEN}`,
          'User-Agent':'alice-smart-assistant',
          Accept:'application/vnd.github+json'
        }
      },5000);
      if (r.status !== 200) return this.state;
      const j=await r.json();
      this.sha=j.sha;
      const file=JSON.parse(Buffer.from(j.content,'base64').toString('utf8'));

      if(file && file.schemaVersion===3 && file.encrypted===true){
        this.state=normalizeState(decryptState(file));
      }else{
        // Backward-compatible one-way migration from the legacy plaintext file.
        // Future saves are encrypted; this cannot erase old Git history.
        this.state=normalizeState(file||{});
        this.needsEncryptionMigration=true;
        if(this.encryptionReady){
          setTimeout(()=>this.save().catch(e=>console.error('[storage.migrate]',e.message)),500).unref?.();
        }else{
          console.warn('[storage] plaintext legacy loaded but encrypted persistence is disabled: no encryption key');
        }
      }
    } catch (e) {
      // Do not log decrypted content or secret-derived material.
      console.error('[storage.load]', String(e&&e.message||'storage_error'));
    }
    return this.state;
  }

  ensureUser(userId) {
    const key=userKey(userId);
    if(!this.state.users[key]){
      let seed={tasks:[],lists:{},notes:[],city:'Москва',profile:{}};
      if(this.state.legacy && !this.state.migratedTo){
        seed={...seed,...this.state.legacy};
        this.state.migratedTo=key;
      }
      this.state.users[key]=seed;
    }
    return this.state.users[key];
  }

  scheduleSave() {
    if(!GH_TOKEN || !this.encryptionReady)return;
    clearTimeout(this.saveTimer);
    this.saveTimer=setTimeout(
      ()=>this.save().catch(e=>console.error('[storage.save]',String(e&&e.message||'storage_error'))),
      1200
    );
  }

  async save() {
    if(!GH_TOKEN)return;
    if(!this.encryptionReady)throw new Error('STORAGE_ENCRYPTION_KEY_MISSING');

    const envelope=encryptState(this.state);
    const body={
      message:'smart-assistant encrypted data',
      content:Buffer.from(JSON.stringify(envelope,null,2),'utf8').toString('base64')
    };
    if(this.sha)body.sha=this.sha;

    const r=await fetchWithTimeout(`https://api.github.com/repos/${GH_REPO}/contents/${STORAGE_FILE}`,{
      method:'PUT',
      headers:{
        Authorization:`Bearer ${GH_TOKEN}`,
        'User-Agent':'alice-smart-assistant',
        'Content-Type':'application/json',
        Accept:'application/vnd.github+json'
      },
      body:JSON.stringify(body)
    },5000);
    if(!r.ok)throw new Error(`GitHub storage HTTP ${r.status}`);
    const j=await r.json();
    if(j.content&&j.content.sha)this.sha=j.content.sha;
    this.needsEncryptionMigration=false;
  }

  securityStatus(){
    return {
      encryptedPersistence:this.encryptionReady,
      format:'aes-256-gcm-v3'
    };
  }
}

module.exports={GitHubStorage,userKey,encryptState,decryptState};

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
      const q=c.replace(/^(найди|поищи|поиск)/,'').replace(/^в интернете\s*/,'').trim();if(!q)return{reply:'Что найти в интернете?'};
      const results=await searchAll(q,0);if(!results.length)return{reply:'Не нашла результатов.'};
      runtime.context.remember(ctx,{lastIntent:'BROWSER',lastTool:'browser',lastResults:results,searchQuery:q,searchPage:0,selectedIndex:null});
      return{reply:'Нашла '+results.length+' результатов.',voiceText:'Нашла '+results.length+' результатов. '+results.slice(0,3).map((x,i)=>(i+1)+'. '+x.title).join('. ')+'.',html:searchCard(q,results)};
    }

    if(/покажи еще|покажи ещё/.test(c)){
      if(!s.searchQuery)return{reply:'Сначала что-нибудь найди.'};
      const page=(s.searchPage||0)+1,results=await searchAll(s.searchQuery,page);if(!results.length)return{reply:'Больше результатов не нашла.'};
      runtime.context.remember(ctx,{lastResults:results,searchPage:page,selectedIndex:null});
      return{reply:'Показала следующую страницу.',voiceText:results.slice(0,3).map((x,i)=>(i+1)+'. '+x.title).join('. ')+'.',html:searchCard(s.searchQuery,results)};
    }

    if(/открой сайт/.test(c)){
      const name=c.replace(/.*открой сайт/,'').trim().replace(/\s+/g,'');if(!name)return{reply:'Какой сайт открыть?'};let url=null;
      if(name.includes('.'))url='https://'+name;else{const r=await searchAll(name+' официальный сайт',0);if(r.length)url=r[0].url;}
      if(!url)return{reply:'Не нашла сайт.'};
      const text=await readPage(url);if(!text)return{reply:'Не смогла прочитать сайт.'};
      const obj={type:'web',title:name,url,pages:splitPages(text),page:0};runtime.context.remember(ctx,{lastReferencedObject:obj});
      return{reply:'Открыла сайт в режиме чтения.',voiceText:obj.pages[0].slice(0,900),html:textCard(name,obj.pages[0])};
    }

    if(/^открой/.test(c)){
      const n=runtime.context.resolveOrdinal(c);if(!n||!s.lastResults[n-1])return{reply:'Назови номер результата, например: открой второй.'};
      const r=s.lastResults[n-1],text=await readPage(r.url);if(!text)return{reply:'Не смогла прочитать страницу.'};
      const obj={type:'web',title:r.title,url:r.url,pages:splitPages(text),page:0};runtime.context.remember(ctx,{lastReferencedObject:obj,selectedIndex:n});
      return{reply:'Открыла '+r.title+'.',voiceText:obj.pages[0].slice(0,900),html:textCard(r.title,obj.pages[0])};
    }

    if(/назад к списку/.test(c)){if(!s.lastResults.length)return{reply:'Списка нет.'};return{reply:'Вернулась к результатам.',voiceText:s.lastResults.slice(0,3).map((x,i)=>(i+1)+'. '+x.title).join('. ')+'.',html:searchCard(s.searchQuery||'поиск',s.lastResults)};}

    if(/^зачитай|прочитай вслух|озвучь|прочитай страницу/.test(c)){const obj=runtime.context.resolveReference(ctx);if(obj&&obj.type==='web')return{reply:'Зачитываю.',speakOnly:obj.pages[obj.page].slice(0,1000)};if(s.lastResults.length)return{reply:'Зачитываю результаты.',speakOnly:s.lastResults.map((x,i)=>(i+1)+'. '+x.title).join('. ')};return{reply:'Нечего зачитывать.'};}
    if(/стоп чтение|хватит читать|замолчи/.test(c))return{reply:'Остановилась.',stopSpeak:true};

    return{reply:'Скажи: найди …, затем открой второй.'};
  }
};

};

__modules["src/tools/calculator.js"] = function(module, exports, __require, require) {
function nums(s){return (String(s).match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>Number(x.replace(',','.')));}
function calcExpr(s){
  const t=String(s)
    .replace(/плюс/g,'+').replace(/минус/g,'-')
    .replace(/умножить/g,'*').replace(/разделить/g,'/')
    .replace(/[хx×]/g,'*').replace(/:/g,'/').replace(/,/g,'.')
    .replace(/[^0-9.+\-*/() ]/g,'');
  if(!t.trim()||!/\d/.test(t))return null;

  const tokens=t.match(/\d+(?:\.\d+)?|[()+\-*/]/g)||[];
  if(!tokens.length)return null;
  let i=0;

  function factor(){
    const tok=tokens[i];
    if(tok==='+'||tok==='-'){
      i++;const v=factor();return v===null?null:(tok==='-'?-v:v);
    }
    if(tok==='('){
      i++;const v=expr();if(tokens[i]!==')')return null;i++;return v;
    }
    if(tok&&/^\d+(?:\.\d+)?$/.test(tok)){i++;return Number(tok);}
    return null;
  }
  function term(){
    let v=factor();if(v===null)return null;
    while(tokens[i]==='*'||tokens[i]==='/'){
      const op=tokens[i++],r=factor();if(r===null)return null;
      if(op==='/'&&r===0)return null;
      v=op==='*'?v*r:v/r;
      if(!Number.isFinite(v))return null;
    }
    return v;
  }
  function expr(){
    let v=term();if(v===null)return null;
    while(tokens[i]==='+'||tokens[i]==='-'){
      const op=tokens[i++],r=term();if(r===null)return null;
      v=op==='+'?v+r:v-r;
      if(!Number.isFinite(v))return null;
    }
    return v;
  }

  const v=expr();
  if(v===null||i!==tokens.length||!Number.isFinite(v))return null;
  return Math.round(v*100)/100;
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
    if(/покажи все списки/.test(c)){const flat=[];for(const [k,v] of Object.entries(lists)){flat.push('['+k+']');for(const x of v)flat.push((x.done?'✓ ':'')+x.text);}const names=Object.keys(lists);return{reply:names.length?'У тебя '+names.length+' списков.':'Списков пока нет.',voiceText:names.length?'Списки: '+names.join(', ')+'.':'Списков пока нет.',html:rows('Списки',flat)};}
    if(/вычеркни/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0),k=findList(c,lists);if(k&&n&&lists[k][n-1]){lists[k][n-1].done=true;runtime.storage.scheduleSave();return{reply:'Вычеркнула.'};}return{reply:'Не нашла позицию.'};}

    if(/удали \d+ из/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0),k=findList(c,lists);if(k&&n&&lists[k][n-1]){const x=lists[k].splice(n-1,1)[0];runtime.storage.scheduleSave();return{reply:'Удалила: '+x.text};}return{reply:'Не нашла позицию.'};}
    if(/зачитай /.test(c)){const k=findList(c,lists);if(k)return{reply:'Зачитываю.',speakOnly:k+': '+lists[k].map((x,i)=>(i+1)+'. '+x.text).join('. ')};}
    if(/покажи /.test(c)&&!/покажи все списки/.test(c)){const k=findList(c,lists);if(k){const v=lists[k].slice(0,8).map((x,i)=>(i+1)+'. '+x.text).join('. ');return{reply:'В списке «'+k+'» '+lists[k].length+' позиций.',voiceText:lists[k].length?'Список «'+k+'»: '+v+'.':'Список «'+k+'» пуст.',html:rows(k,lists[k].map(x=>(x.done?'✓ ':'')+x.text))};}}
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
    if(/покажи заметки/.test(c)){const v=notes.slice(0,8).map((x,i)=>(i+1)+'. '+x).join('. ');return{reply:notes.length?'У тебя '+notes.length+' заметок.':'Заметок пока нет.',voiceText:notes.length?'У тебя '+notes.length+' заметок. '+v+'.':'Заметок пока нет.',html:rows('Заметки',notes)};}
    if(/найди в заметках/.test(c)){const q=c.replace(/.*найди в заметках/,'').trim();const f=notes.filter(x=>x.includes(q));const v=f.slice(0,6).map((x,i)=>(i+1)+'. '+x).join('. ');return{reply:f.length?'Нашла '+f.length+'.':'Не нашла.',voiceText:f.length?'Нашла '+f.length+'. '+v+'.':'Не нашла.',html:rows('Найдено',f)};}
    if(/зачитай заметки|прочитай заметки/.test(c)){const v=notes.join('. ');return{reply:notes.length?'Зачитываю.':'Заметок нет.',voiceText:v,speakOnly:v};}
    if(/удали заметку/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&notes[n-1]){notes.splice(n-1,1);runtime.storage.scheduleSave();return{reply:'Удалила.'};}return{reply:'Не нашла заметку.'};}
    if(/очисти заметки/.test(c)){u.notes=[];runtime.storage.scheduleSave();return{reply:'Заметки очищены.'};}
    return{reply:'Скажи: запиши…, покажи заметки или найди в заметках…'};
  }
};

};

__modules["src/tools/pc.js"] = function(module, exports, __require, require) {
const { dangerousUiContext } = __require("src/core/safety.js");
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
      FAILED: 'Не получилось выполнить команду на компьютере.',
      WINDOW_CHANGED: 'Окно уже изменилось. Ничего не нажала.',
      AMBIGUOUS: 'Нашла несколько одинаковых элементов. Ничего не нажала.',
      NOT_SUPPORTED: 'Этот элемент пока нельзя безопасно нажать.',
      BLOCKED: 'Это действие пока заблокировано из соображений безопасности.',
      BLOCKED_CONTEXT: 'Контекст окна изменился и теперь похож на опасное действие. Ничего не нажала.',
      NOT_BROWSER: 'Сейчас активно не окно браузера.',
      RESULT_TIMEOUT: 'Команду компьютеру передала, но он не успел подтвердить результат. Я не считаю действие выполненным.',
      OFFLINE: 'Компьютер сейчас не на связи.',
      NOT_CONFIGURED: 'Windows Agent ещё не настроен.'
    };
    return { reply: errors[code] || 'Не получилось выполнить команду на компьютере.' };
  }
  return { reply: fallback || 'Готово.' };
}


function cleanWindowText(v){
  return String(v||'').replace(/\s+/g,' ').trim().slice(0,140);
}

function appLabel(process){
  const p=String(process||'').toLowerCase();
  const map={
    chrome:'Google Chrome',
    browser:'Яндекс Браузер',
    msedge:'Microsoft Edge',
    explorer:'Проводник',
    telegram:'Telegram',
    winword:'Microsoft Word',
    excel:'Microsoft Excel',
    notepad:'Блокнот',
    outline:'Outline',
    acrobat:'Adobe Acrobat',
    capcut:'CapCut',
    steam:'Steam'
  };
  return map[p]||cleanWindowText(process)||'программа';
}

function describeActiveWindow(data){
  const title=cleanWindowText(data&&data.title);
  const app=appLabel(data&&data.process);
  if(title) return app+': «'+title+'»';
  return app;
}

function helpForActive(data){
  const p=String(data&&data.process||'').toLowerCase();
  const where=describeActiveWindow(data);

  if(p==='explorer'){
    return 'Сейчас активно окно '+where+'. Это Проводник. Скажи, что хотела найти или открыть, например: «найди файл договор» или «открой загрузки».';
  }
  if(p==='chrome'||p==='browser'||p==='msedge'){
    return 'Сейчас активно окно '+where+'. Это браузер. Скажи, что именно не получается на странице. Я уже понимаю, в какой программе ты находишься; чтение кнопок и содержимого страницы подключим следующим слоем.';
  }
  if(p==='winword'){
    return 'Сейчас активно окно '+where+'. Это Microsoft Word. Скажи, что хотела сделать с документом — открыть, найти или разобраться, куда пропало нужное окно.';
  }
  if(p==='excel'){
    return 'Сейчас активно окно '+where+'. Это Microsoft Excel. Скажи, что именно хотела сделать с таблицей.';
  }
  if(p==='telegram'){
    return 'Сейчас активно окно '+where+'. Это Telegram. Скажи, что именно не получается.';
  }
  if(p==='outline'){
    return 'Сейчас активно окно '+where+'. Это Outline. Если проблема связана с подключением, опиши, что видишь или что перестало работать.';
  }

  return 'Сейчас активно окно '+where+'. Я уже определила программу и заголовок окна. Скажи, что хотела сделать или что кажется неправильным.';
}

function uiType(v){
  return String(v||'').replace(/^ControlType\./,'');
}

function uniqueNamed(items, typeNames){
  const allowed=new Set(typeNames||[]);
  const seen=new Set();
  const out=[];
  for(const x of (Array.isArray(items)?items:[])){
    const name=cleanWindowText(x&&x.name);
    const type=uiType(x&&x.type);
    if(!name || (allowed.size && !allowed.has(type))) continue;
    const key=(type+'|'+name).toLowerCase();
    if(seen.has(key)) continue;
    seen.add(key);
    out.push({name,type,enabled:x.enabled!==false});
  }
  return out;
}


function normalizeUiQuery(v){
  return String(v||'')
    .replace(/^(нажми|кликни|щёлкни|щелкни|выбери)\s+/,'')
    .replace(/^(на\s+)?(кнопку|кнопка|ссылку|ссылка|вкладку|вкладка|пункт)\s+/,'')
    .replace(/[«»"]/g,'')
    .trim()
    .slice(0,100);
}

function blockedUiActionLabel(v){
  const s=String(v||'').toLowerCase();
  return /удал|delete|remove|стер|format|формат|сброс|reset|factory|деинстал|uninstall|оплат|платеж|платёж|купить|purchase|pay|заказать|отправить|send|publish|опубликов|перезагруз|restart|выключ|shutdown|установить|install/.test(s);
}

function summarizeUiSnapshot(data, mode='help'){
  if(!data) return 'Не получила данные активного окна.';
  const win=data.window||data;
  const where=describeActiveWindow(win);
  const elements=Array.isArray(data.elements)?data.elements:[];

  const actions=uniqueNamed(elements,[
    'Button','Hyperlink','MenuItem','TabItem','CheckBox','RadioButton',
    'ComboBox','ListItem','TreeItem','SplitButton'
  ]).filter(x=>x.enabled).slice(0,8);

  const labels=uniqueNamed(elements,['Text','StatusBar']).slice(0,6);

  if(mode==='actions'){
    if(!actions.length){
      return 'Сейчас активно окно '+where+'. Доступных именованных кнопок, ссылок или пунктов меню через Windows Automation не нашла.';
    }
    return 'Сейчас активно окно '+where+'. Вижу доступные элементы: '+actions.map(x=>x.name).join(', ')+'.';
  }

  if(mode==='text'){
    if(!labels.length){
      return 'Сейчас активно окно '+where+'. Отдельных текстовых подписей через Windows Automation не получила.';
    }
    return 'Сейчас активно окно '+where+'. Вижу текст: '+labels.map(x=>'«'+x.name+'»').join(', ')+'.';
  }

  const parts=['Сейчас активно окно '+where+'.'];
  if(labels.length){
    parts.push('На экране вижу: '+labels.slice(0,3).map(x=>'«'+x.name+'»').join(', ')+'.');
  }
  if(actions.length){
    parts.push('Из доступных элементов вижу: '+actions.slice(0,6).map(x=>x.name).join(', ')+'.');
  }
  if(!labels.length && !actions.length){
    parts.push('Windows Automation не отдала именованные элементы этого окна.');
  }else{
    parts.push('Скажи, чего именно хочешь добиться, и я подскажу безопасный следующий шаг.');
  }
  return parts.join(' ');
}


function cleanTabTarget(c){
  let s=String(c||'').trim();
  s=s
    .replace(/^(открой|переключись|переключи|перейди|выбери)\s+/,'')
    .replace(/^на\s+/,'')
    .replace(/^(вкладку|вкладка)\s*/,'')
    .replace(/\s+(вкладку|вкладка)$/,'')
    .replace(/^(номер|№)\s*/,'')
    .replace(/[«»"]/g,'')
    .trim();
  return s.slice(0,120);
}

function tabListReply(tabs){
  const shown=tabs.slice(0,6);
  const text=shown.map((t,i)=>(i+1)+'. '+cleanWindowText(t.name||'без названия')).join('. ');
  const more=tabs.length>6?' Ещё '+(tabs.length-6)+'.':'';
  return 'В браузере открыто '+tabs.length+' вкладок. '+text+'.'+more+' Какую открыть? Можно сказать, например, «вторую» или название вкладки.';
}


function stripOpenVerb(c){
  return String(c||'')
    .replace(/^(открой|запусти|включи|переключись на)\s+/,'')
    .replace(/[«»"]/g,'').trim().slice(0,120);
}
function shortList(items, max=6){
  return (Array.isArray(items)?items:[]).slice(0,max);
}
function systemTargetFromCommand(c){
  const rules=[
    ['taskmgr',/диспетчер задач/],['settings',/(параметры windows|настройки windows|открой параметры)$/],
    ['control',/панель управления/],['devices',/диспетчер устройств|^открой устройства$/],
    ['bluetooth',/bluetooth|блютуз/],['sound',/(настройки звука|параметры звука)/],
    ['display',/(настройки экрана|параметры экрана)/],['startup',/автозагрузк/],
    ['printers',/(принтеры|принтер)/],['apps',/(установленные программы|приложения windows)/],
    ['security',/(безопасность windows|защитник windows)/]
  ];
  for(const [id,re] of rules)if(re.test(c))return id;
  return null;
}

module.exports = {
  name:'pc', description:'Безопасное управление Windows через локальный агент', risk:'read',
  async run(input, runtime){
    const c=input.ctx.command, bridge=runtime.pcBridge;

    if(input.intent && input.intent.name==='HELP_ME'){
      const r=await bridge.run('inspect_ui',{maxNodes:180,maxElements:50,timeBudgetMs:1400});
      if(r && r.ok!==false && r.data){
        return {
          reply:summarizeUiSnapshot(r.data,'help'),
          remember:{lastPcContext:r.data.window||null}
        };
      }

      const w=await bridge.run('active_window',{});
      if(w && w.ok!==false && w.data){
        return {reply:helpForActive(w.data),remember:{lastPcContext:w.data}};
      }

      return {reply:'Компьютер на связи, но я не успела прочитать активное окно. Скажи, что хотела сделать.'};
    }

    // YouTube is controlled through the active PC browser.
    if(/^(открой|запусти)\s+(youtube|ютуб)/.test(c)){
      return resultReply(await bridge.run('open_url',{url:'https://www.youtube.com'}),'Открыла YouTube.');
    }
    if(/найди видео.*(youtube|ютуб)|найди.*на (youtube|ютуб)/.test(c)){
      let q=c.replace(/найди видео/,'').replace(/найди/,'').replace(/на\s+(youtube|ютуб).*/,'').replace(/(youtube|ютуб)/g,'').trim();
      if(!q)return{reply:'Что найти на YouTube?'};
      const url='https://www.youtube.com/results?search_query='+encodeURIComponent(q);
      return resultReply(await bridge.run('open_url',{url}),'Открыла результаты поиска YouTube.');
    }
    if(/полный экран.*(youtube|ютуб)|(youtube|ютуб).*полный экран/.test(c)){
      return resultReply(await bridge.run('browser_hotkey',{command:'youtube_fullscreen'}),'Переключила полноэкранный режим YouTube.');
    }

    // Unified Core 2.0: common system shortcuts.
    const sysTarget=systemTargetFromCommand(c);
    if(sysTarget){
      const r=await bridge.run('open_system_target',{target:sysTarget});
      return{reply:r&&r.ok!==false?'Открыла нужный раздел Windows.':'Не получилось открыть этот раздел Windows.'};
    }

    // Audio/media.
    if(/сделай громче|увеличь громкость|громче/.test(c)){
      const r=await bridge.run('media_key',{key:'volume_up'});
      return{reply:r&&r.ok!==false?'Сделала громче.':'Не получилось изменить громкость.'};
    }
    if(/сделай тише|уменьши громкость|тише/.test(c)){
      const r=await bridge.run('media_key',{key:'volume_down'});
      return{reply:r&&r.ok!==false?'Сделала тише.':'Не получилось изменить громкость.'};
    }
    if(/выключи звук|без звука|mute|включи звук обратно/.test(c)){
      const r=await bridge.run('media_key',{key:'mute'});
      return{reply:r&&r.ok!==false?'Переключила звук.':'Не получилось переключить звук.'};
    }
    if(/пауза|продолжи воспроизведение|play pause|воспроизведение/.test(c)){
      const r=await bridge.run('media_key',{key:'play_pause'});
      return{reply:r&&r.ok!==false?'Готово.':'Не получилось управлять воспроизведением.'};
    }
    if(/следующий трек/.test(c)){
      const r=await bridge.run('media_key',{key:'next'});
      return{reply:r&&r.ok!==false?'Переключила на следующий трек.':'Не получилось переключить трек.'};
    }
    if(/предыдущий трек/.test(c)){
      const r=await bridge.run('media_key',{key:'previous'});
      return{reply:r&&r.ok!==false?'Переключила на предыдущий трек.':'Не получилось переключить трек.'};
    }

    // Clipboard is read only on an explicit phrase.
    if(/что (сейчас )?(в|лежит в) буфере обмена|что скопировано/.test(c)){
      const r=await bridge.run('clipboard_get',{});
      if(!r||r.ok===false)return{reply:'Не получилось прочитать буфер обмена.'};
      const t=String(r.data&&r.data.text||'').trim();
      return{reply:t?'В буфере обмена: '+t:'Буфер обмена пуст.'};
    }
    if(/очисти буфер обмена/.test(c)){
      const r=await bridge.run('clipboard_clear',{});
      return{reply:r&&r.ok!==false?'Буфер обмена очищен.':'Не получилось очистить буфер обмена.'};
    }

    // Screen readout.
    if(/сколько мониторов|какие мониторы|разрешение экрана|какое разрешение/.test(c)){
      const r=await bridge.run('screen_info',{});
      const screens=Array.isArray(r&&r.data&&r.data.screens)?r.data.screens:[];
      if(!screens.length)return{reply:'Не получилось получить данные мониторов.'};
      const desc=screens.map(x=>'монитор '+x.index+': '+x.width+' на '+x.height+(x.primary?' основной':'')).join('; ');
      return{reply:'Подключено '+screens.length+'. '+desc+'.'};
    }

    // Window switching.
    if(/предыдущее окно|переключись на предыдущее окно|верни меня в предыдущее окно/.test(c)){
      const r=await bridge.run('switch_window',{mode:'previous'});
      return{reply:r&&r.ok!==false?'Переключилась на предыдущее окно.':'Не получилось переключить окно.'};
    }
    if(/^(переключись на|перейди в|открой окно)\s+/.test(c)){
      const q=c.replace(/^(переключись на|перейди в|открой окно)\s+/,'').trim();
      const r=await bridge.run('switch_window',{query:q});
      if(!r)return{reply:'Не получила ответ от компьютера.'};
      if(r.ok===false && r.code==='AMBIGUOUS'){
        const wins=Array.isArray(r.data&&r.data.candidates)?r.data.candidates:[];
        runtime.context.remember(input.ctx,{lastPcWindows:wins,pendingClarification:{type:'window_select'}});
        const names=shortList(wins).map((x,i)=>(i+1)+'. '+String(x.title||x.process)).join('. ');
        return{reply:'Нашла несколько окон. '+names+'. Какое открыть?'};
      }
      if(r.ok===false)return{reply:'Такое окно не нашла.'};
      return{reply:'Переключилась на нужное окно.'};
    }

    // Structured file search with conversational selection.
    if(/^(найди|поищи)\s+(файл|документ|папку)\s+/.test(c)){
      const q=c.replace(/^(найди|поищи)\s+(файл|документ|папку)\s+/,'').trim();
      const r=await bridge.run('search_files_v2',{query:q});
      const items=Array.isArray(r&&r.data&&r.data.items)?r.data.items:[];
      if(!items.length)return{reply:'Ничего похожего не нашла.'};
      runtime.context.remember(input.ctx,{
        lastFileResults:items,
        lastResults:items.map(x=>({type:'file',name:x.name,path:x.path})),
        pendingClarification:{type:'file_select'}
      });
      const names=shortList(items).map((x,i)=>(i+1)+'. '+x.name).join('. ');
      return{reply:'Нашла '+items.length+'. '+names+'. Какой открыть?'};
    }

    // Direct browser navigation commands are semantic hotkeys, not UI clicks.
    if(/^(назад|вперед|вперёд)$/.test(c)){
      const r=await bridge.run('browser_hotkey',{command:/назад/.test(c)?'back':'forward'});
      return resultReply(r,/назад/.test(c)?'Вернулась на предыдущую страницу.':'Перешла вперёд.');
    }
    if(/^(обнови страницу|обновить страницу)$/.test(c)){
      return resultReply(await bridge.run('browser_hotkey',{command:'refresh'}),'Обновила страницу.');
    }
    if(/восстанови закрытую вкладку/.test(c)){
      return resultReply(await bridge.run('browser_hotkey',{command:'restore_tab'}),'Восстановила закрытую вкладку.');
    }

    // Ordinal selection of the last file-search result.
    if(/^открой\s+.*файл/.test(c)){
      const n=runtime.context.resolveOrdinal(c);
      const s=runtime.context.session(input.ctx.sessionId);
      const items=Array.isArray(s.lastFileResults)?s.lastFileResults:[];
      if(n && items[n-1]){
        const item=items[n-1];
        const r=await bridge.run('open_path',{path:item.path});
        if(r&&r.ok!==false){
          runtime.context.remember(input.ctx,{lastReferencedObject:{type:'file',...item}});
          return{reply:'Открыла «'+String(item.name||'файл')+'».'};
        }
        return resultReply(r,'Открыла файл.');
      }
    }

    // Browser tab context is separate from Windows windows.
    if(/^(какие|покажи|перечисли).*(вкладк)|какие вкладки открыты|что за вкладки открыты/.test(c)){
      const r=await bridge.run('list_browser_tabs',{});
      if(!r)return{reply:'Не успела получить список вкладок браузера.'};
      if(r.ok===false){
        if(r.code==='NOT_BROWSER')return{reply:'Сейчас активно не окно браузера. Сначала открой браузер или переключись на него.'};
        return{reply:'Не получилось прочитать вкладки браузера.'};
      }

      const tabs=Array.isArray(r.data&&r.data.tabs)?r.data.tabs:[];
      if(!tabs.length)return{reply:'В активном браузере вкладок не нашла.'};

      runtime.context.remember(input.ctx,{
        lastBrowserTabs:tabs,
        pendingClarification:{
          type:'browser_tab_select',
          expectedProcessId:(r.data&&r.data.window&&r.data.window.processId)||0
        }
      });
      return{reply:tabListReply(tabs)};
    }

    if(/^(открой|создай)\s+нов(ую|ая)\s+вкладк/.test(c)){
      const r=await bridge.run('activate_browser_tab',{direction:'new'});
      if(!r)return{reply:'Не получила ответ от браузера.'};
      if(r.ok===false)return{reply:r.code==='NOT_BROWSER'?'Сейчас активно не окно браузера.':'Не получилось открыть новую вкладку.'};
      return{reply:'Открыла новую вкладку.'};
    }

    if(/^(открой|переключись|переключи|перейди|выбери)\s+(на\s+)?(следующую|следующая)\s+вкладк/.test(c)){
      const r=await bridge.run('activate_browser_tab',{direction:'next'});
      if(!r)return{reply:'Не получила ответ от браузера.'};
      if(r.ok===false)return{reply:r.code==='NOT_BROWSER'?'Сейчас активно не окно браузера.':'Не получилось перейти на следующую вкладку.'};
      return{reply:'Перешла на следующую вкладку.'};
    }

    if(/^(открой|переключись|переключи|перейди|выбери)\s+(на\s+)?(предыдущую|предыдущая)\s+вкладк/.test(c)){
      const r=await bridge.run('activate_browser_tab',{direction:'previous'});
      if(!r)return{reply:'Не получила ответ от браузера.'};
      if(r.ok===false)return{reply:r.code==='NOT_BROWSER'?'Сейчас активно не окно браузера.':'Не получилось перейти на предыдущую вкладку.'};
      return{reply:'Перешла на предыдущую вкладку.'};
    }

    if(/^(открой|переключись|переключи|перейди|выбери).*вкладк/.test(c)){
      const ordinal=runtime.context.resolveOrdinal(c);
      const target=cleanTabTarget(c);

      // "Открой вкладку" alone is ambiguous: existing tab vs new tab.
      if(!ordinal && (!target || /^(вкладку|вкладка)$/.test(target))){
        const r=await bridge.run('list_browser_tabs',{});
        if(!r)return{reply:'Не успела получить список вкладок браузера.'};
        if(r.ok===false){
          if(r.code==='NOT_BROWSER')return{reply:'Сейчас активно не окно браузера.'};
          return{reply:'Не получилось прочитать вкладки браузера.'};
        }
        const tabs=Array.isArray(r.data&&r.data.tabs)?r.data.tabs:[];
        if(!tabs.length)return{reply:'Открытых вкладок не нашла. Если нужна новая, скажи «открой новую вкладку».'};

        runtime.context.remember(input.ctx,{
          lastBrowserTabs:tabs,
          pendingClarification:{
            type:'browser_tab_select',
            expectedProcessId:(r.data&&r.data.window&&r.data.window.processId)||0
          }
        });
        return{reply:tabListReply(tabs)};
      }

      const args={};
      if(ordinal)args.index=ordinal;
      else args.name=target;

      const r=await bridge.run('activate_browser_tab',args);
      if(!r)return{reply:'Не получила ответ от браузера. Ничего повторно не переключаю.'};
      if(r.ok===false){
        if(r.code==='NOT_BROWSER')return{reply:'Сейчас активно не окно браузера.'};
        if(r.code==='NOT_FOUND')return{reply:'Такую вкладку не нашла. Скажи «какие вкладки открыты», и я перечислю их.'};
        if(r.code==='AMBIGUOUS'){
          const names=Array.isArray(r.data&&r.data.candidates)?r.data.candidates.slice(0,5):[];
          return{reply:'Нашла несколько похожих вкладок'+(names.length?': '+names.join(', '):'')+'. Уточни название или номер.'};
        }
        return{reply:'Не получилось переключиться на вкладку.'};
      }

      const selected=(r.data&&r.data.selectedName)||target||(ordinal?String(ordinal):'');
      return{reply:'Открыла вкладку «'+cleanWindowText(selected)+'».'};
    }

    if(/^(нажми|кликни|щёлкни|щелкни|выбери)\s+/.test(c)){
      const query=normalizeUiQuery(c);
      if(!query)return{reply:'Скажи название кнопки или элемента.'};

      if(blockedUiActionLabel(query)){
        return{reply:'Такое действие я пока не выполняю автоматически. Могу только показать, где находится этот элемент.'};
      }

      const r=await bridge.run('resolve_ui_target',{query,maxNodes:220,timeBudgetMs:1500});
      if(!r)return{reply:'Не успела найти этот элемент. Ничего не нажимаю.'};
      if(r.ok===false){
        if(r.code==='NOT_FOUND')return{reply:'Не нашла на активном окне элемент «'+query+'». Ничего не нажимаю.'};
        if(r.code==='AMBIGUOUS'){
          const names=Array.isArray(r.data&&r.data.candidates)?r.data.candidates.slice(0,4).map(x=>x.name):[];
          return{reply:'Нашла несколько подходящих элементов'+(names.length?': '+names.join(', '):'')+'. Уточни название. Ничего не нажимаю.'};
        }
        return{reply:'Не получилось безопасно определить нужный элемент. Ничего не нажимаю.'};
      }

      const target=r.data&&r.data.target;
      const win=r.data&&r.data.window;
      if(!target||!win)return{reply:'Не получила точные данные элемента. Ничего не нажимаю.'};

      if(blockedUiActionLabel(target.name)){
        return{reply:'Элемент «'+target.name+'» относится к действию, которое я пока не выполняю автоматически.'};
      }

      const contextLabels=Array.isArray(r.data&&r.data.contextLabels)?r.data.contextLabels:[];
      if(dangerousUiContext(target,win,contextLabels)){
        return{reply:'В этом окне обнаружен контекст удаления, установки, платежа, отправки или другого опасного действия. Я не нажимаю «'+target.name+'» автоматически.'};
      }

      runtime.context.setPending(input.ctx,{
        type:'pc_ui_action',
        label:target.name,
        args:{
          name:target.name,
          type:target.type,
          automationId:target.automationId||'',
          expectedProcessId:win.processId,
          expectedWindowTitle:win.title||''
        }
      });

      return{reply:'Нашла '+(target.type==='Button'?'кнопку':target.type==='TabItem'?'вкладку':'элемент')+
        ' «'+target.name+'» в активном окне. Нажать?'};
    }

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

    if(/последн.*(скачан|загруз)|что.*скачал|что.*загрузил|последние загрузки/.test(c)){
      const r=await bridge.run('recent_downloads',{limit:5});
      if(!r||r.ok===false)return resultReply(r,'Не получилось получить последние загрузки.');
      const items=Array.isArray(r.data&&r.data.items)?r.data.items:[];
      if(!items.length)return{reply:'В папке загрузок ничего не нашла.'};
      runtime.context.remember(input.ctx,{
        lastFileResults:items,
        lastResults:items.map(x=>({type:'file',name:x.name,path:x.path})),
        pendingClarification:{type:'file_select'}
      });
      return{reply:'Последние загрузки: '+items.map((x,i)=>(i+1)+'. '+x.name).join('. ')+'. Какую открыть?'};
    }

    if(/^(найди|поищи)\s+(файл|документ|папку)/.test(c)){
      const q=c.replace(/^(найди|поищи)\s+(файл|документ|папку)\s*/,'').trim();
      if(!q)return{reply:'Скажи название файла или папки.'};
      return resultReply(await bridge.run('search_files',{query:q,limit:10}),'Поиск выполнила.');
    }

    if(/какие кнопки|какие ссылки|что здесь можно нажать|что можно нажать|какие элементы/.test(c)){
      const r=await bridge.run('inspect_ui',{maxNodes:180,maxElements:50,timeBudgetMs:1400});
      if(!r || !r.data) return {reply:'Не успела прочитать элементы активного окна.'};
      return {reply:summarizeUiSnapshot(r.data,'actions'),remember:{lastPcContext:r.data.window||null}};
    }

    if(/что написано в этом окне|что здесь написано|прочитай это окно|прочитай окно/.test(c)){
      const r=await bridge.run('inspect_ui',{maxNodes:180,maxElements:50,timeBudgetMs:1400});
      if(!r || !r.data) return {reply:'Не успела прочитать текст активного окна.'};
      return {reply:summarizeUiSnapshot(r.data,'text'),remember:{lastPcContext:r.data.window||null}};
    }

    if(/что сейчас на экране|какое окно сейчас активно|какое окно открыто сейчас|где я сейчас|в какой программе я сейчас/.test(c)){
      const r=await bridge.run('active_window',{});
      if(!r) return {reply:'Не успела получить активное окно.'};
      if(r.ok===false) return {reply:'Активное окно определить не удалось.'};
      if(r.data){
        return {reply:'Сейчас активно окно '+describeActiveWindow(r.data)+'.',remember:{lastPcContext:r.data}};
      }
      return {reply:'Активное окно определить не удалось.'};
    }

    if(/что сейчас открыто|какие окна открыты|покажи открытые окна|какие программы открыты/.test(c)){
      const r=await bridge.run('list_windows',{});
      if(!r) return {reply:'Не успела получить список окон.'};
      if(r.ok===false) return resultReply(r,'Не получилось получить список окон.');
      const wins=Array.isArray(r.data&&r.data.windows)?r.data.windows:[];
      if(!wins.length) return {reply:'Открытых обычных окон сейчас не нашла.'};
      const first=wins.slice(0,5).map((w,i)=>(i+1)+'. '+describeActiveWindow(w));
      const more=wins.length>5?' Ещё открыто '+(wins.length-5)+'.':'';
      return {
        reply:'Сейчас открыто '+wins.length+' окон. '+first.join('. ')+'.'+more,
        remember:{
          lastPcWindows:wins,
          lastPcContext:wins[0]||null,
          pendingClarification:{type:'window_select'}
        }
      };
    }

    if(/информация о компьютере|что с компьютером|состояние компьютера/.test(c)){
      const s=bridge.status();
      return{reply:s.online?'Компьютер на связи.':'Компьютер сейчас не на связи.'};
    }

    if(/почему компьютер тормозит|что грузит память|что занимает процессор|мало ли места на диске/.test(c)){
      return{reply:'Этот диагностический блок отключён в текущей конфигурации помощника.'};
    }

    // Generic application launcher. It searches Start Menu/App Paths instead of a fixed list.
    if(/^(открой|запусти)\s+/.test(c) &&
       !/^(открой|запусти)\s+(сайт|страниц|файл|документ|папк)/.test(c) &&
       !/^(открой|запусти).*вкладк/.test(c)){
      const q=stripOpenVerb(c);
      const r=await bridge.run('open_app_generic',{query:q});
      if(!r)return{reply:'Не получила ответ от компьютера.'};
      if(r.ok===false && r.code==='AMBIGUOUS'){
        const items=Array.isArray(r.data&&r.data.candidates)?r.data.candidates:[];
        runtime.context.remember(input.ctx,{lastAppCandidates:items,pendingClarification:{type:'app_select'}});
        const names=shortList(items).map((x,i)=>(i+1)+'. '+x.name).join('. ');
        return{reply:'Нашла несколько программ. '+names+'. Какую открыть?'};
      }
      if(r.ok===false)return{reply:'Не нашла такую установленную программу.'};
      return{reply:'Открыла «'+String(r.data&&r.data.name||q)+'».'};
    }

    return{reply:'Команду для компьютера поняла не полностью. Скажи, например: «открой хром», «какие вкладки открыты», «открой вторую вкладку», «что сейчас на экране», «нажми Назад», «какие окна открыты», «найди файл договор» или просто «помоги».'};
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
    if(/покажи важные/.test(c)){const f=tasks.filter(x=>x.star);return{reply:f.length?'Важных задач: '+f.length+'.':'Важных задач нет.',voiceText:f.length?f.slice(0,6).map((x,i)=>(i+1)+'. '+x.text).join('. '):'Важных задач нет.',html:rows('Важные задачи',f.map(x=>x.text))};}
    if(/зачитай задачи/.test(c)){return{reply:tasks.length?'Зачитываю.':'Задач нет.',speakOnly:tasks.map((x,i)=>(i+1)+'. '+x.text).join('. ')};}
    if(/покажи задачи|план на сегодня|что у меня на сегодня/.test(c)){const v=tasks.slice(0,6).map((x,i)=>(i+1)+'. '+(x.done?'выполнено, ':'')+x.text).join('. ');return{reply:tasks.length?'У тебя '+tasks.length+' задач.':'Задач пока нет.',voiceText:tasks.length?'У тебя '+tasks.length+' задач. '+v+'.':'Задач пока нет.',html:rows('Задачи',tasks.map(x=>(x.done?'✓ ':'')+x.text))};}
    if(/сколько задач/.test(c))return{reply:'Активных задач: '+tasks.filter(x=>!x.done).length+'.'};
    if(/выполни|отметь выполненной/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&tasks[n-1]){tasks[n-1].done=true;runtime.storage.scheduleSave();return{reply:'Готово: '+tasks[n-1].text};}return{reply:'Какую задачу отметить выполненной? Назови номер.'};}
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
    if(/какое( сегодня)? число|какая дата/.test(c))return{reply:'Сегодня '+fmtDate(d)+'.'};
    if(/день недели/.test(c))return{reply:'Сегодня '+fmtDay(d)+'.'};
    if(/выходной/.test(c)){const w=d.getDay();return{reply:(w===0||w===6)?'Да, сегодня выходной.':'Нет, сегодня будний день.'};}
    if(/неделя года/.test(c))return{reply:'Сейчас '+isoWeek(d)+'-я неделя года.'};
    if(/время в мире/.test(c)){const z=[['Москва','Europe/Moscow'],['Нью-Йорк','America/New_York'],['Лондон','Europe/London'],['Токио','Asia/Tokyo'],['Дубай','Asia/Dubai']];return{reply:z.map(x=>x[0]+' '+d.toLocaleTimeString('ru-RU',{timeZone:x[1],hour:'2-digit',minute:'2-digit'})).join(', ')+'.'};}
    const zm=c.match(/время в\s+([а-яa-z-]+)/i);
    if(zm){
      const key=zm[1].toLowerCase();
      const zones={
        'москве':['Москве','Europe/Moscow'],'москва':['Москве','Europe/Moscow'],
        'токио':['Токио','Asia/Tokyo'],'лондоне':['Лондоне','Europe/London'],'лондон':['Лондоне','Europe/London'],
        'дубае':['Дубае','Asia/Dubai'],'дубай':['Дубае','Asia/Dubai'],
        'риге':['Риге','Europe/Riga'],'рига':['Риге','Europe/Riga'],
        'нью-йорке':['Нью-Йорке','America/New_York'],'нью-йорк':['Нью-Йорке','America/New_York']
      };
      const z=zones[key];
      if(z)return{reply:'В '+z[0]+' сейчас '+d.toLocaleTimeString('ru-RU',{timeZone:z[1],hour:'2-digit',minute:'2-digit'})+'.'};
      return{reply:'Для этого города часовой пояс пока не настроен.'};
    }
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
      const r={id:st.nextReminderId++,endsAt:Date.now()+ms,text,handle:null};st.reminders.push(r);
      r.handle=setTimeout(()=>{st.reminders=st.reminders.filter(x=>x.id!==r.id);runtime.sendView({speak:'Напоминаю: '+r.text});},ms);
      return{reply:'Хорошо. Напоминание сохранено внутри помощника. Автоматическая озвучка на Станции этим механизмом не гарантируется.'};
    }
    if(/покажи напоминания/.test(c)){if(!st.reminders.length)return{reply:'Напоминаний нет.'};return{reply:st.reminders.map((x,i)=>(i+1)+'. '+x.text).join('. ')};}
    if(/отмени напоминание/.test(c)){const n=Number((c.match(/\d+/)||[])[0]||0);if(n&&st.reminders[n-1]){const x=st.reminders.splice(n-1,1)[0];if(x.handle)clearTimeout(x.handle);return{reply:'Отменила: '+x.text};}return{reply:'Не нашла такое напоминание.'};}

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
    const t=c.replace(/.*?(переведи|как по[- ]английски)/,'').replace(/^на английский\s*/,'').trim();
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
    if(/(?:^|\s)(уф|ультрафиолет)(?:\s|$)/.test(c))return{reply:'УФ-индекс сегодня: '+Math.round(w.daily.uv_index_max[0])+' из 11.',html};
    if(/рассвет/.test(c))return{reply:'Рассвет в '+w.daily.sunrise[0].slice(11,16)+'.'};
    if(/закат/.test(c))return{reply:'Закат в '+w.daily.sunset[0].slice(11,16)+'.'};
    if(/прогноз на неделю/.test(c)){const lines=w.daily.time.map((d,i)=>d+': '+Math.round(w.daily.temperature_2m_min[i])+'…'+Math.round(w.daily.temperature_2m_max[i])+'°, '+wmo(w.daily.weather_code[i]));return{reply:'Прогноз на неделю готов.',voiceText:'Прогноз для '+g.name+'. '+lines.join('. ')+'.',html:card('Неделя: '+g.name,'<div class="text">'+lines.join('<br>')+'</div>')};}
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
