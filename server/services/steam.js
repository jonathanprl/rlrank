var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');
var rest = require('restler');
var cheerio = require('cheerio');
var config = require('../../config');

module.exports = {
  getSteamProfileByURL,
  getSteamProfileByName,
  getSteamProfileByID
};

/**
 * getSteamProfileByURL
 * @param {string} url - Steam Profile URL
 * @param {function} callback
 */
function getSteamProfileByURL(url, callback)
{
  if (!url)
  {
    return callback({code: 'missing_url', msg: 'No URL entered'});
  }

  var isSteamId = false;

  var urlArray = url.split('/');

  if (urlArray[0] == 'http:' || urlArray[0] == 'https:')
  {
    if (urlArray[2] == 'steamcommunity.com' || urlArray[2] == 'www.steamcommunity.com')
    {
      if (urlArray[3] == 'profiles') isSteamId = true;

      if (urlArray[3] != 'id' && urlArray[3] != 'profiles')
      {
        return callback({code: 'invalid_url', msg: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
      }
    }
    else
    {
      return callback({code: 'invalid_url', msg: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
    }
  }
  else if (urlArray[0] == 'steamcommunity.com' || urlArray[0] == 'www.steamcommunity.com')
  {
    if (urlArray[1] == 'profiles') isSteamId = true;

    if (urlArray[1] != 'id' || urlArray[1] != 'profiles')
    {
      return callback({code: 'invalid_url', msg: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
    }
  }
  else
  {
    return callback({code: 'invalid_url', msg: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
  }

  profileId = url.replace(/\/$/, '').split('/').pop();

  console.log('profileIDFromURL', profileId);

  if (isSteamId)
  {
    getSteamProfileByID(profileId, function(err, profile) {
      if (err)
      {
        return callback(err);
      }

      callback(null, profile);
    });
  }
  else
  {
    getSteamProfileByName(profileId, function(err, profile) {
      if (err)
      {
        return callback(err);
      }

      callback(null, profile);
    });
  }
}

/**
 * getSteamProfileByName
 * @param {string} id - Steam Profile Name ID
 * @param {function} callback
 */
function getSteamProfileByName(id, callback)
{
  rest.get('http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + config.steam.key + '&&vanityurl=' + id)
    .on('complete', function(result) {
      if (!result.response || !('steamid' in result.response))
      {
        swiftping.logger('debug', 'steam', 'getSteamProfileByName Steam profile could not be found from Steam API.', {id: id, profile: result});
        return callback({code: 'not_found', msg: 'Steam profile could not be found.'});
      }

      swiftping.logger('debug', 'steam', 'Steam profile found from Steam API', {id: id, profile: result});
      getSteamProfileByID(result.response.steamid, function(err, profile) {
        callback(null, profile);
      });
    }).on('error', function(err) {
      swiftping.logger('critical', 'steam', 'Steam API ResolveVanityURL ERROR.', {id: id, steamapiError: err});
      return callback({code: 'server_error', msg: 'There was a problem fetching your Steam profile. Devs have been notified!'});
    });
}

/**
 * getSteamProfileByID
 * @param {string} id - Steam Profile ID
 * @param {function} callback
 */
function getSteamProfileByID(id, callback)
{
  rest.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + config.steam.key + '&steamids=' + id)
    .on('complete', function(result) {
      if (!result.response || !result.response.players || result.response.players.length == 0)
      {
        swiftping.logger('debug', 'steam', 'getSteamProfileByID Steam profile could not be found from Steam API.', {id: id, profile: result});
        return callback({code: 'not_found', msg: 'Steam profile could not be found.'});
      }
      callback(null, result.response.players[0]);
    }).on('error', function(err) {
      swiftping.logger('critical', 'steam', 'Steam API GetPlayerSummaries ERROR.', {id: id, steamapiError: err});
      return callback({code: 'server_error', msg: 'There was a problem fetching your Steam profile. Devs have been notified!'});
    });
}
