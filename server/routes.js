var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;

var config = require('../config');

var rank = require('./controllers/rank');
var leaderboard = require('./controllers/leaderboard');
var stats = require('./controllers/stats');
var statistics = require('./controllers/statistics');
var status = require('./controllers/status');
var profile = require('./controllers/profile');
var blog = require('./controllers/blog');

var psyonix = require('./services/psyonix');
var cron = require('./services/cron');
var steam = require('./services/steam');
var amazon = require('./services/amazon');

var swiftping = require('./helpers/swiftping');
var sitemap = require('./helpers/sitemap');

passport.use(new SteamStrategy({
    returnURL: config.url + 'steam/return',
    realm: config.url,
    apiKey: config.steam.key
  },
  function(identifier, profile, done) {
    profile.identifier = identifier;
    return done(null, profile);
  }
));

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

  app.get('/steam/auth', passport.authenticate('steam'), function(req, res) {});
  app.get('/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), profile.steamOpenid);

  app.get('/api/profile/:input/:platform', profile.getProfile);
  app.get('/api/profileById/:id', profile.getProfileById);

  app.get('/api/rank/tiers', rank.getRankTiers);
  app.get('/api/rank/:id/historical', rank.getPlayerRanksHistorical);
  app.get('/api/rank/:id', rank.getPlayerRanks);

  app.get('/api/leaderboards', leaderboard.getLeaderboards);

  app.get('/api/stats/:id', stats.getPlayerStats);

  app.get('/api/statistics/tierThresholds', statistics.getTierThresholds);

  app.get('/api/status', status.getStatus);

  app.get('/api/population', status.getPopulation);
  app.get('/api/population/historical', status.getPopulationHistorical);

  app.get('/api/amazon/product/:code', amazon.getClient, amazon.getProduct);
  app.get('/api/amazon/redirect/:asin', amazon.getClient, amazon.getRedirectUrl);

  app.get('/api/blog/posts', blog.getPosts);

  app.get('/views/*', function(req, res)
  {
    res.render('../public/views/' + req.params[0]);
  });

  app.get('*', function(req, res)
  {
    res.render('index');
  });
};
