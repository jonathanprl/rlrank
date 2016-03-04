module.exports = {
  apiResponse,
  MMRToSkillRating
}

function apiResponse(type, res, data)
{
  switch (type)
  {
    case 'ok':
      _ok(res, data);
    break;
    case 'error':
      _error(res, data);
    break;
  }
}

function MMRToSkillRating(mmr)
{
  return Math.ceil((mmr*20)+99.5);
}

/**
 * Sends a formatted OK response
 * @param {object} res - Express response
 * @param {object} data - Requested data
 */
function _ok(res, data)
{
  res.send({status: 'OK', results: data});
}

/**
 * Sends a formatted error response
 * @param {object} res - Express response
 * @param {object} err - Error object/string
 */
function _error(res, err)
{
  res.status(500).send({status: 'ERR', error: err});
}
