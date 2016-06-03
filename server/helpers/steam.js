var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');
var rest = require('restler');
var cheerio = require('cheerio');

module.exports = {
  getProfile: getProfile
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getProfile(url, callback)
{
  if (!url)
  {
    return callback({code: 'missing_url',message: 'No URL entered'});
  }

  var isSteamId = false;

  var urlArray = url.split('/');

  if (urlArray[0] == 'http:' || urlArray[0] == 'https:')
  {
    if (urlArray[2] == 'steamcommunity.com' || urlArray[2] == 'www.steamcommunity.com')
    {
      if (urlArray[3] != 'id' && urlArray[3] != 'profiles')
      {
        if (urlArray[3] == 'profiles') isSteamId = true;
        return callback({code: 'invalid_url',message: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
      }
    }
    else
    {
      return callback({code: 'invalid_url',message: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
    }
  }
  else if (urlArray[0] == 'steamcommunity.com' || urlArray[0] == 'www.steamcommunity.com')
  {
    if (urlArray[1] != 'id' || urlArray[1] != 'profiles')
    {
      if (urlArray[1] == 'profiles') isSteamId = true;
      return callback({code: 'invalid_url',message: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
    }
  }
  else
  {
    return callback({code: 'invalid_url',message: 'URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>'});
  }

  profileId = url.replace(/\/$/, '').split('/').pop();

  if (isSteamId)
  {
    getSteamProfile(profileId, function(err, profile) {
      if (err)
      {
        return callback(err);
      }

      callback(null, profile);

    });
  }
  else
  {
    getSteamId(profileId, function(err, steamId) {
      if (err)
      {
        return callback(err);
      }

      getSteamProfile(steamId, function(err, profile) {
        if (err)
        {
          return callback(err);
        }

        callback(null, profile);

      });
    });
  }
}

function getSteamId(id, callback)
{
  rest.get('http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=386CE59F095593AC9CF2199578C90A40&&vanityurl=' + id)
    .on('complete', function(result)
    {
      //TODO: Error check
      callback(null, result.response.steamid);
    }
  );
}

function getSteamProfile(id, callback)
{
  rest.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=386CE59F095593AC9CF2199578C90A40&steamids=' + id)
    .on('complete', function(result)
    {
      //TODO: Error check
      callback(null, result.response.players[0]);
    }
  );
}
