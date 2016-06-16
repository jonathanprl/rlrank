var db = require('../db');
var path = require('path');
var config = require('../../config');
var gcloud = require('gcloud')({
  projectId: 'rl-rank',
  keyFilename: path.normalize(__dirname + '/../keys/g.json')
});

module.exports = {
  apiResponse,
  MMRToSkillRating,
  getProfile,
  decryptHash,
  encryptHash,
  logger,
  generateUniqueId,
  isNumeric
};

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


function getProfile(req, res)
{
  db.findOneWhere('profiles', {rlrank_id: req.params.id}, { _id: 0, input: 0 },
    function(err, doc)
    {
      if (err || !doc)
      {
        db.findOneWhere('profiles', {hash: encryptHash(req.params.id)}, { _id: 0, input: 0 },
          function(err, doc)
          {

            if (err)
            {
              logger('critical', 'profile', 'Error fetching profile from DB', {paramsId: req.params.id, hash: encryptHash(req.params.id), mongoError: err});
              return apiResponse('error', res, {code: 'server_error', message: 'There was a server error. Devs have been notified.'});
            }

            if (!doc)
            {
              logger('info', 'profile', 'No profile found in DB', {paramsId: req.params.id, hash: encryptHash(req.params.id)});
              return apiResponse('error', res, {code: 'not_found', message: 'Profile not found.'});
            }

            outdateCheck(doc);
          }
        );
      }
      else
      {
        outdateCheck(doc);
      }

      function outdateCheck(profile)
      {
        var neverModified = false;
        if (profile.modified_at)
        {
          var now = new Date();

          var timeDiff = Math.abs(now.getTime() - profile.modified_at.getTime());
          var diffHours = Math.ceil(timeDiff / (1000 * 3600));
        }
        else
        {
          neverModified = true;
        }

        if (neverModified || diffHours > 11)
        {
          return updateProfileName(profile,
            function(profile)
            {
              return apiResponse('ok', res, profile);
            }
          );
        }

        return apiResponse('ok', res, profile);
      }
    }
  );
}

function generateUniqueId()
{
  var length = 8;
  var chars = '1234567890abcdefghkmnopqrstuvwxyABCDEFGHKLMNOPQRSTUVWXYZ';
  var result = '';

  for (var i = length; i > 0; --i)
  {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

function isNumeric(n)
{
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function encryptHash(s)
{
  return new Buffer(String(s)).toString('base64');
}

function decryptHash(s)
{
  return new Buffer(s, 'base64').toString('ascii');
}

function logger(level, subject, message, metadata)
{

  if (typeof metadata === 'undefined') metadata = {};

  var logging = gcloud.logging();

  var gcs = gcloud.storage();

  var logType = config.env == 'dev' ? 'rlrank_dev' : 'rlrank';

  logging.createSink('rlrank_log_sink', {
    destination: gcs.bucket('rlrank_log')
  }, function(err, sink) {});

  var applog = logging.log(logType);

  var entry = applog.entry({
    type: 'gce_instance',
    labels: {
      zone: 'global',
      instance_id: '3'
    }
  }, {
    message: '[' + subject.toUpperCase() + ']' + ' ' + message,
    metadata: JSON.stringify(metadata)
  });


  switch (level) {
  case 'debug':
    applog.debug(entry, function(err, apiResponse) {});
    break;
  case 'info':
    applog.info(entry, function(err, apiResponse) {});
    break;
  case 'alert':
    applog.alert(entry, function(err, apiResponse) {});
    break;
  case 'error':
    applog.error(entry, function(err, apiResponse) {});
    break;
  case 'critical':
    applog.critical(entry, function(err, apiResponse) {});
    break;
  case 'emergency':
    applog.emergency(entry, function(err, apiResponse) {});
    break;
  }

  console.log('[' + subject.toUpperCase() + ']' + ' ' + message);

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
