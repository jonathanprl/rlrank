var db = require('../db');
var swiftping = require('../helpers/swiftping');

module.exports = {
  getPosts
};

function getPosts(req, res)
{
  db.findWhere('blog', {}, {_id: 0}, function(err, docs) {
    if (err)
    {
      swiftping.logger('error', 'blog', 'DB Error: getPosts', err);
      return res.status(500).send('There was a server error.');
    }

    return res.send(docs);
  });
}
