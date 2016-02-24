var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getPlayerRanks: getPlayerRanks
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerRanks(req, res)
{
  // db.find('sheets', function(docs)
  // {
  //   swiftping.apiResponse('ok', res, docs);
  // },
  // function(err)
  // {
  //   swiftping.apiResponse('error', res, err);
  // });

  psyonix.getPlayerRanks(req.params.id, req.body.token, function(err, result)
  {
    if (err)
    {
      if (err == 'SessionNotActive')
      {

      }
      
      return swiftping.apiResponse('error', res, err);
    }

    swiftping.apiResponse('ok', res, result);
  });
}
