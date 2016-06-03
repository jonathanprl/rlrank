var db = require('../db');
var steam = require('../helpers/steam');
var xbox = require('../helpers/xbox');
var path = require('path');
var config = require('../../config');
var gcloud = require('gcloud')({
  projectId: 'rl-rank',
  keyFilename: path.normalize(__dirname + '/../keys/g.json')
});

module.exports = {
  auth,
  apiResponse,
  MMRToSkillRating,
  getProfile,
  decryptHash,
  encryptHash,
  logger
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

function auth(req, res)
{
  db.findOneWhere('profiles', {input: req.body.input, platform: req.body.platform}, { _id: 0, input: 0 },
    function(err, doc)
    {
      if (err)
      {
        return logger('critical', 'profile', 'Error fetching profile from DB', {input: req.body.input, platform: req.body.platform, mongoError: err});
      }

      if (!doc)
      {
        return fetchNewProfile(req, res);
      }

      logger('info', 'profile', 'Found profile in DB', {input: req.body.input, platform: req.body.platform});
      return res.send({profile: doc});
    }
  );
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

function fetchNewProfile(req, res)
{
  var input = req.body.input;
  var platform = req.body.platform;

  if (!input)
  {
    return res.status(500).send({code: 'invalid_input', message: 'Please enter your Steam, PSN or Xbox ID.'});
  }

  var url;

  logger('info', 'profile', 'Fetching new profile.', {input: input, platform: platform});

  if (platform == 'steam')
  {
    if (input[0] == 7 && isNumeric(input) && input.length == 17)
    {
      url = 'https://steamcommunity.com/profiles/' + input;
    }
    else if (input.indexOf('steamcommunity.com') > -1)
    {
      url = input;
    }
    else if (/[A-Za-z0-9\-\_]$/g.test(input))
    {
      url = 'https://steamcommunity.com/id/' + input;
    }
    else
    {
      logger('info', 'profile', 'Invalid Steam profile syntax.', {input: input});
      return res.status(500).send({code: 'invalid_steam', message: 'Invalid Steam profile. Please enter your Steam profile URL (e.g. https://steamcommunity.com/profiles/7621738123123), your Steam Profile ID (e.g. 7621738123123) or your Steam Custom URL name'});
    }

    steam.getProfile(url, function(err, steamProfile)
    {
      if (err)
      {
        return res.status(500).send(err);
      }

      var profileData = {
        input: input,
        rlrank_id: getUniqueId(),
        display_name: steamProfile.personaname,
        platform: platform,
        hash: encryptHash(steamProfile.steamid),
        modified_at: new Date()
      };

      saveProfile(profileData);
      res.send({profile: profileData});
    });
  }
  else if (platform == 'psn')
  {
    input = decodeURIComponent(input);

    if (/[A-Za-z0-9\-\_ ]$/g.test(input))
    {
      var profileData = {
        input: input,
        rlrank_id: getUniqueId(),
        display_name: input,
        platform: platform,
        hash: encryptHash(input),
        modified_at: new Date()
      };


      saveProfile(profileData);
      return res.send({profile: profileData});
    }
    else
    {
      logger('info', 'PSN', 'Invalid PSN format.', {input: input});
      return res.status(500).send({code: 'invalid_xboxpsn', message: 'Invalid ' + platform + ' username.'});
    }
  }
  else if (platform == 'xbox')
  {
    input = decodeURIComponent(input);

    if (/[A-Za-z0-9\-\_ ]$/g.test(input))
    {
      logger('info', 'xbox', 'Getting XUID from Gamertag', {gamertag: input});
      xbox.getXuidFromGamertag(input,
        function(err, xuid)
        {
          if (err)
          {
            if (err.code == '1')
            {
              logger('info', 'xbox', err.msg, err.data);
              return res.status(500).send({'code': 'not_found', 'message': 'Gamertag does not exist.'});
            }
            logger('error', 'xbox', err.msg, err.data);
            return res.status(500).send({'code': 'server_error', 'message': 'There was an issue with the Xbox service. Our developer has been notified.'});
          }

          logger('info', 'xbox', 'Found XUID for Gamertag', { gamertag: input, xuid: xuid });

          var profileData = {
            input: input,
            rlrank_id: getUniqueId(),
            display_name: input,
            platform: platform,
            hash: encryptHash(xuid),
            modified_at: new Date()
          };

          saveProfile(profileData);
          return res.send({profile: profileData});
        }
      );
    }
    else
    {
      logger('error', 'profile', 'Invalid user', {platform: platform, input: input});
      return res.status(500).send({code: 'invalid_xboxpsn', message: 'Invalid ' + platform + ' username.'});
    }
  }
  else
  {
    // Assume it's a steam id.
    if (input.length > 0 && input[0] == 7 && isNumeric(input) && input.length == 17)
    {
      var hash = encryptHash(input);

      db.findOneWhere('profiles', {hash: hash, platform: 'steam'}, {_id: 0, hash: 0},
        function(err, doc)
        {
          if (err || !doc)
          {
            req.body.platform = 'steam';
            return fetchNewProfile(req, res);
          }
          else
          {
            return res.send({profile: doc});
          }
        }
      );
    }
    else if (/[A-Za-z0-9\-\_ ]$/g.test(input))
    {
      db.findOneWhere('profiles', {hash: hash, platform: 'psn'}, {_id: 0, hash: 0},
        function(err, doc)
        {
          if (err || !doc)
          {
            req.body.platform = 'psn';
            return fetchNewProfile(req, res);
          }
          else
          {
            return res.send({profile: doc});
          }
        }
      );
    }
    else
    {
      return res.status(500).send({code: 'invalid_platform', message: 'Invalid platform.'});
    }
  }
}

function saveProfile(profileData)
{
  db.insert('profiles', profileData,
    function(err, doc)
    {
      if (err)
      {
        logger('critical', 'profile', 'Could not save profile to DB', {profileData: profileData, mongoError: err});
      }
    }
  );
  profileData.modified_at = String(profileData.modified_at);
  logger('info', 'profile', 'Saving profile to DB', {profileData: profileData});
}

function updateProfileName(profile, callback)
{
  var id = decryptHash(profile.hash);

  if (profile.platform == 'steam')
  {
    steam.getDetailsFromURL('https://steamcommunity.com/profiles/' + id, function(err, steamProfile)
    {
      if (err)
      {
        logger('error', 'STEAM', 'Could not get profile from Steam.');
        return res.status(500).send(err);
      }

      db.update('profiles', { hash: profile.hash }, { $set: { display_name: steamProfile.personaname, modified_at: new Date() } },
        function(err, doc)
        {
          if (err && err.ok != 1 && err.nModified != 1)
          {
            steamProfile.modified_at = String(steamProfile.modified_at);
            return logger('critical', 'PROFILE', 'Could not update Steam profile name in DB.', {oldProfileData: steamProfile, mongoError: err});
          }

          profile.display_name = steamProfile.personaname;
          return callback(profile);
        }
      );
    });

    if (profile.modified_at) profile.modified_at = String(profile.modified_at);
    logger('info', 'STEAM', 'Steam profile name outdated. Fetching new profile from Steam', {oldProfileData: profile});
  }
  else if (profile.platform == 'psn' || profile.platform == 'xbox')
  {
    return callback(profile);
  }
}

function getUniqueId()
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
  return new Buffer(s).toString('base64');
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
    metadata: metadata
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
