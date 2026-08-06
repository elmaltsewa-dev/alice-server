const express = require('express');
const app = express();
app.use(express.json());

const clients = new Set();
let last = { text: 'Жду команду от Алисы...', time: '' };

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Панель Алисы</title>
<style>
  body { font-family: Arial, sans-serif; background: #f0f4f8; text-align: center; padding-top: 60px; }
  .box { display: inline-block; background: white; padding: 40px 60px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  h1 { color: #2c3e50; }
  #text { font-size: 26px; color: #34495e; margin-top: 10px; }
  #time { color: #95a5a6; margin-top: 10px; }
</style>
</head>
<body>
  <div class="box">
    <h1>Панель Алисы</h1>
    <div id="text">Жду команду от Алисы...</div>
    <div id="time"></div>
  </div>
  <script>
    var es = new EventSource('/events');
    es.onmessage = function (e) {
      var d = JSON.parse(e.data
);
      document.getElementById('text').textContent = d.text;
      document.getElementById('time').textContent = d.time;
    };
  </script>
</body>
</html>`);
});

app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('data: ' + JSON.stringify(last) + '\n\n');
  clients.add(res);
  req.on('close', function () { clients.delete(res); });
});

app.post
('/alice', (req, res) => {
  var body = req.body || {};
  var command = (body.request && body.request.command) || 'пустая команда';
  last = { text: 'Алиса получила: "' + command + '"', time: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' }) };
  clients.forEach(function (c) { c.write('data: ' + JSON.stringify(last) + '\n\n'); });
  res.json({
    version: '1.0',
    session: body.session || {},
    response: { text: 'Готово! Результат отправлен в браузер.', end_session: false }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Сервер запущен в облаке!');
});
