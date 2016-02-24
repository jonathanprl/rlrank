var psyonix = require('./services/psyonix');

module.exports = function(app)
{
  // app.get('/', function(req, res) {
  //     res.render('index');
  // });

  app.post('/api/test', psyonix.auth);
  app.post('/api/test2', psyonix.getPlayerRanks);
  // app.get('/views/*', function(req, res)
  // {
  //   res.render('../public/views/' + req.params[0]);
  // });
  //
  // app.get('*', function(req, res)
  // {
  //   res.render('index');
  // });
}
