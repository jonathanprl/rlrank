var psyonix = require('./services/psyonix');
var rank = require('./controllers/rank');
var leaderboard = require('./controllers/leaderboard');
var stats = require('./controllers/stats')

module.exports = function(app)
{
  app.get('/', function(req, res) {
      res.render('index');
  });

  app.post('/api/auth', psyonix.auth);
  // app.get('/api/ranks', rank.getRanks);
  app.get('/api/ranks/:id', rank.getPlayerRank);
  app.get('/api/leaderboards', leaderboard.getLeaderboards);
  app.get('/api/stats/:id', stats.getStats);


  app.get('/views/*', function(req, res)
  {
    res.render('../public/views/' + req.params[0]);
  });

  app.get('*', function(req, res)
  {
    res.render('index');
  });
}
