var rank = require('./controllers/rank');
var leaderboard = require('./controllers/leaderboard');
var stats = require('./controllers/stats');
var statistics = require('./controllers/statistics');
var status = require('./controllers/status');

var psyonix = require('./services/psyonix');
var cron = require('./services/cron');

var swiftping = require('./helpers/swiftping');
var sitemap = require('./helpers/sitemap');

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

  app.get('/sitemap.xml', sitemap.generateSitemap);

  app.post('/api/auth', swiftping.auth);

  app.get('/api/profile/:id', swiftping.getProfile);

  app.get('/api/rank/:id', rank.getPlayerRanks);

  app.get('/api/leaderboard/:playlist', leaderboard.getLeaderboard);

  app.get('/api/stats/:id', stats.getPlayerStats);

  app.get('/api/statistics/tierThresholds', statistics.getTierThresholds);

  app.get('/api/status', status.getStatus);

  app.get('/api/population', status.getPopulation);
  app.get('/api/population/historical', status.getPopulationHistorical);

  app.get('/views/*', function(req, res)
  {
    res.render('../public/views/' + req.params[0]);
  });

  app.get('*', function(req, res)
  {
    res.render('index');
  });
};
