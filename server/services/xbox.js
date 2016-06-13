var config = require('../../config.js');
var rest = require('restler');
var db = require('../db');
var swiftping = require('../helpers/swiftping');

module.exports = {
  getProfileByGamertag,
  getProfileByXuid,
  getXuidByGamertag
};

function getProfileByGamertag(gamertag, callback)
{
  db.findOneWhere('xboxProfiles', { Gamertag: gamertag.toLowerCase() }, {}, function(err, doc) {
    if (err)
    {
      swiftping.logger('critical', 'xbox', 'Error finding Xbox profile in DB.', err);
      return callback({code: 'server_error', msg: 'There was a problem fetching your Xbox profile. Devs have been notified!'});
    }

    if (doc)
    {
      swiftping.logger('info', 'xbox', 'Found Xbox profile in DB.', err);
      return callback(null, doc);
    }

    swiftping.logger('info', 'xbox', 'Xbox profile not found in DB. Fetching from xboxapi.com.', err);
    getXuidByGamertag(gamertag, function(err, xuid) {
      if (err) callback(err);
      getProfileByXuid(xuid, function(err, profile) {
        if (err) callback(err);
        profile.Gamertag = profile.Gamertag.toLowerCase();
        db.insert('xboxProfiles', profile, function(err, doc) {
          if (err)
          {
            swiftping.logger('error', 'xbox', 'Error saving Xbox profile to DB. Not critical, but should be investigated.', {profile: profile, mongoError: err});
          }
        });
        callback(null, profile);
      });
    });
  });
}

function getProfileByXuid(xuid, callback)
{
  rest.get(
    'https://xboxapi.com/v2/' + xuid + '/profile', {
      headers: {
        'X-AUTH': config.xboxapi.key,
        'Content-Type': 'application/json'
      }
    }).on('complete', function(profile) {
      if (profile.code)
      {
        swiftping.logger('critical', 'xbox', 'Xboxapi.com PROFILE error.');
        console.log(xuid, profile);
        return callback({code: 'server_error', msg: 'There was a problem fetching your Xbox profile. Devs have been notified!'});
      }

      callback(null, profile);

    }).on('error', function(err) {
      swiftping.logger('critical', 'xbox', 'Xboxapi.com PROFILE error.');
      console.log(xuid, err);
      return callback({code: 'server_error', msg: 'There was a problem fetching your Xbox profile. Devs have been notified!'});
    });
}

function getXuidByGamertag(gamertag, callback)
{
  rest.get(
    'https://xboxapi.com/v2/xuid/' + gamertag, {
      headers: {
        'X-AUTH': config.xboxapi.key,
        'Content-Type': 'application/json'
      }
    }).on('complete', function(xuid) {
      if (xuid.success === false)
      {
        swiftping.logger('info', 'xbox', 'Invalid Gamertag.');
        return callback({code: 'invalid_gamertag', msg: 'No Xbox profile could be found for that Gamertag.'});
      }

      callback(null, xuid);

    }).on('error', function(err) {
      swiftping.logger('critical', 'xbox', 'Xboxapi.com error.');
      console.log(gamertag, err);
      return callback({code: 'server_error', msg: 'There was a problem fetching your Xbox profile. Devs have been notified!'});
    });
}
