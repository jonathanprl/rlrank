var db = require('../db');
var swiftping = require('../helpers/swiftping');

module.exports = {
  getAlerts
};

function getAlerts(req, res)
{
  db.findWhere('alerts', {game: 'rl'}, {_id: 0}, function(err, docs) {
    if (err)
    {
      swiftping.logger('error', 'alerts', 'DB Error: getAlerts', err);
      return res.status(500).send('There was a server error.');
    }

    return swiftping.apiResponse('ok', res, docs);
  });
}
