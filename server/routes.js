var rank = require('./controllers/rank');
var leaderboard = require('./controllers/leaderboard');
var stats = require('./controllers/stats');
var status = require('./controllers/status');

var psyonix = require('./services/psyonix');
var cron = require('./services/cron');

var swiftping = require('./helpers/swiftping');

module.exports = function(app)
{
  var socketio = require('./helpers/socketio')(app.io);

  app.get('/', function(req, res) {
      res.render('index');
  });

  app.get('/robots.txt', function(req, res)
  {
    res.set('Content-Type', 'text/plain');
    res.send('User-agent: *\nAllow: /');
  });

  app.post('/api/auth', swiftping.auth);

  app.get('/api/profile/:id', swiftping.getProfile);

  app.get('/api/rank/:id', rank.getPlayerRanks);

  app.get('/api/leaderboard/:playlist', leaderboard.getLeaderboard);

  app.get('/api/stats/:id/:stat', stats.getStat);
  app.get('/api/stats/:id', stats.getStats);

  app.get('/api/status', status.getStatus);

  app.get('/api/population', status.getPopulation);

  app.get('/views/*', function(req, res)
  {
    res.render('../public/views/' + req.params[0]);
  });

  app.get('*', function(req, res)
  {
    res.render('index');
  });
}
