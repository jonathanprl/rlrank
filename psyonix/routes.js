var config = require('./config');
var psyonix = require('./psyonix');

module.exports = function(app)
{
  app.get('/api/auth', psyonix.refreshToken);
  app.post('/api/callProc', psyonix.callProc);
};
