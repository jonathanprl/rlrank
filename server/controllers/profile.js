var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');
var steam = require('../services/steam');
var xbox = require('../services/xbox');

module.exports = {
  getProfile,
  getProfileById,
  getProfileByInput,
  steamOpenid
};

/**
 * getProfile
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getProfile(req, res) {
  if (!req.params.input)
  {
    swiftping.logger('debug', 'profile', 'No input entered.', {input: req.params.input, platform: req.params.platform});
    return res.status(500).send({code: 'invalid_input', msg: 'Please enter your Steam, PSN or Xbox ID.'});
  }

  var input = decodeURIComponent(req.params.input);

  getProfileByInput(input, req.params.platform, function(err, profile) {
    if (err)
    {
      return res.status(500).send(err);
    }

    res.send(profile);
  });
}

function getProfileByInput(input, platform, callback)
{
  getGameProfile(input, platform, function(err, hash, gameProfile) {
    if (err)
    {
      return callback(err);
    }

    // TODO: Sanitize mongo query
    db.findOneWhere('profiles', {hash: hash}, { _id: 0, input: 0 }, function(err, doc) {
      if (err)
      {
        swiftping.logger('critical', 'profile_by_input', 'Error fetching profile_by_input from DB', {input: input, platform: platform, gameProfile: gameProfile, mongoError: err});
        return callback({code: 'server_error', msg: 'Something went wrong. Devs have been notified!'});
      }

      if (doc)
      {
        return callback(null, doc);
      }

      swiftping.logger('info', 'profile_by_input', 'Profile with matching hash not found. Creating new profile.', {input: input, platform: platform, gameProfile: gameProfile});
      createNewProfile(input, platform, hash, gameProfile, function(err, profile) {
        if (err)
        {
          return callback(err);
        }
        return callback(null, profile);
      });
    });
  });
}

/**
 * getProfileById
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getProfileById(req, res) {
  if (!req.params.id)
  {
    swiftping.logger('debug', 'profile_by_id', 'No ID in params.', { id: req.params.id });
    return res.status(500).send({code: 'invalid_id', msg: 'No ID in params.'});
  }

  swiftping.logger('info', 'profile_by_id', 'Looking up ID in DB.', { id: req.params.id });

  // TODO: Sanitize mongo query
  db.findOneWhere('profiles', {rlrank_id: req.params.id}, { _id: 0, input: 0 }, function(err, doc) {
    if (err)
    {
      swiftping.logger('critical', 'profile_by_id', 'Error fetching profile from DB', { id: req.params.id, mongoError: err });
      return res.status(500).send({code: 'server_error', msg: 'Something went wrong. Devs have been notified!'});
    }

    if (doc)
    {
      res.send(doc);

      doc.modified_at = String(doc.modified_at);
      return swiftping.logger('info', 'profile_by_id', 'Found profile with matching ID.', { id: req.params.id, profile: doc });
    }

    swiftping.logger('info', 'profile_by_id', 'Profile with matching ID not found.', { id: req.params.id });
    return res.status(404).send({code: 'not_found', msg: 'Profile with matching ID not found.'});
  });
}

function getGameProfile(input, platform, callback) {
  switch (platform)
  {
    case 'steam':
      getSteamProfile(input, function(err, steamProfile) {
        if (err) return callback(err);
        swiftping.logger('info', 'game_profile', 'Found Steam profile.', {input: input, platform: platform, gameProfile: steamProfile});
        var hash = swiftping.encryptHash(steamProfile.steamid);
        return callback(null, hash, steamProfile);
      });
      break;
    case 'xbox':
      getXboxProfile(input, function(err, xboxProfile) {
        if (err) return callback(err);
        swiftping.logger('info', 'game_profile', 'Found Xbox profile.', {input: input, platform: platform, gameProfile: xboxProfile});
        var hash = swiftping.encryptHash(xboxProfile.id);
        return callback(null, hash, xboxProfile);
      });
      break;
    case 'psn':
      getPSNProfile(input, function(err, id) {
        if (err) return callback(err);
        swiftping.logger('info', 'game_profile', 'Found PSN profile.', {input: input, platform: platform, gameProfile: id});
        var hash = swiftping.encryptHash(id);
        return callback(null, hash, null);
      });
      break;
    default:
      swiftping.logger('error', 'profile', 'User passed through invalid platform. Investigate.', {input: input, platform: platform});
      return callback({code: 'invalid_platform', msg: 'Invalid platform.'});
      break;
  }
}

function getSteamProfile(input, callback) {
  if (input[0] == 7 && swiftping.isNumeric(input) && input.length == 17)
  {
    steam.getSteamProfileByID(input, function(err, profile) {
      if (err) return callback({code: 'invalid_id', msg: 'Invalid Steam profile ID. Use the numbers/text after "/id/" or "/profiles/" in your steamcommunity.com URL, or just input the entire URL.'});
      return callback(null, profile);
    });
  }
  else if (input.indexOf('steamcommunity.com') > -1)
  {
    steam.getSteamProfileByURL(input, function(err, profile) {
      if (err) return callback(err);
      return callback(null, profile);
    });
  }
  else if (/[A-Za-z0-9\-\_]$/g.test(input))
  {
    steam.getSteamProfileByName(input, function(err, profile) {
      if (err) return callback({code: 'invalid_name', msg: 'Invalid Steam profile name. Use the numbers/text after "/id/" or "/profiles/" in your steamcommunity.com URL, or just input the entire URL.'});
      return callback(null, profile);
    });
  }
  else
  {
    swiftping.logger('info', 'profile', 'Invalid Steam profile syntax.', {input: input});
    return callback({code: 'invalid_syntax', msg: 'Invalid Steam profile. Use the numbers/text after "/id/" or "/profiles/" in your steamcommunity.com URL, or just input the entire URL.'});
  }
}

function getXboxProfile(input, callback) {
  xbox.getProfileByGamertag(input, function(err, profile) {
    return callback(err, profile);
  });
}

function getPSNProfile(input, callback) {
  if (/[A-Za-z0-9\-\_ ]$/g.test(input))
  {
    return callback(null, input);
  }

  swiftping.logger('debug', 'profile', 'Invalid PSN syntax.', {input: input});
  return callback({code: 'invalid_psn', msg: 'Invalid PSN format. Double check you have entered it correctly.'});
}

function createNewProfile(input, platform, hash, gameProfile, callback)
{
  var displayName = input;

  if (platform == 'steam')
  {
    displayName = gameProfile.personaname;
  }

  if (platform == 'xbox')
  {
    displayName = gameProfile.GameDisplayName;
  }

  var profile = {
    input: input,
    rlrank_id: swiftping.generateUniqueId(),
    display_name: displayName,
    platform: platform,
    hash: hash,
    modified_at: new Date()
  };

  db.insert('profiles', profile, function(err, doc) {
    if (err)
    {
      callback({code: 'server_error', msg: 'Something went wrong. Devs have been notified!'});

      profile.modified_at = String(profile.modified_at);
      return swiftping.logger('critical', 'profile', 'Error saving profile to DB', {profile: profile, mongoError: err});
    }

    return callback(null, profile);
  });
}

function steamOpenid(req, res)
{
  swiftping.logger('info', 'steam', 'Login via OpenID', {user: req.user});
  getProfileByInput(req.user._json.steamid, 'steam', function(err, profile) {
    if (err)
    {
      res.redirect('/');
    }

    res.set('Content-Type', 'text/html').send('<script type="text/javascript">window.opener.location.href = "/u/' + profile.rlrank_id + '";window.close();</script>');
  });
}
