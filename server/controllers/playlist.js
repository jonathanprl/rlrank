var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getPlaylists: getPlaylists
};

/**
 * Get playlists
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlaylists(req, res)
{
  psyonix.getPlaylists(req.body.token, function(err, result)
  {
    if (err)
    {
      return swiftping.apiResponse('err', res, err);
    }

    return swiftping.apiResponse('ok', res, result);
  });
}
