var db = require('../db');
var steam = require('../helpers/steam');

module.exports = {
  auth,
  apiResponse,
  MMRToSkillRating,
  getProfile
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

function rankDifferences(oldPlaylists, newPlaylists)
{
  var playlists = [];

  oldPlaylists.forEach(
    function(oldPlaylist)
    {
      newPlaylists.forEach(
        function(newPlaylist)
        {
          if (oldPlaylist.playlist == newPlaylist.playlist)
          {
            playlists[newPlaylist.playlist] = oldPlaylist.mmr - newPlaylist.mmr
          }
        }
      );
    }
  );

  return playlists;
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
        return console.log("[PROFILE] Error fetching profile from DB", err); // ERROR
      }

      if (!doc)
      {
        return fetchNewProfile(req, res)
      }

      console.log("[PROFILE] Found profile in DB. %s (%s)", req.body.input, req.body.platform);
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
        console.log("[PROFILE] Error fetching profile from DB", err || 'No record'); // ERROR
        return apiResponse('error', res, {code: 'not_found', message: 'Profile not found.'});
      }

      return apiResponse('ok', res, doc);
    }
  );
}

function fetchNewProfile(req, res)
{
  var input = req.body.input;
  var platform = req.body.platform;

  var url;

  console.log("[PROFILE] Fetching new profile... Input:", input); // INFO

  if (platform == 'steam')
  {
    console.log("[PROFILE] Steam User", input); // INFO;

    if (input[0] == 7 && isNumeric(input) && input.length == 17)
    {
      var url = 'https://steamcommunity.com/profiles/' + input;
    }
    else if (input.indexOf('steamcommunity.com') > -1)
    {
      var url = input;
    }
    else if (/[A-Za-z0-9\-\_]$/g.test(input))
    {
      var url = 'https://steamcommunity.com/id/' + input;
    }
    else
    {
      console.log("[PROFILE] [ERROR] Invalid Steam User [%s]", input); // ERROR
      return res.status(500).send({code: "invalid_steam", message: "Invalid Steam profile. Please enter your Steam profile URL (e.g. https://steamcommunity.com/profiles/7621738123123), your Steam Profile ID (e.g. 7621738123123) or your Steam Custom URL name"});
    }

    steam.getDetailsFromURL(url, function(err, steamProfile)
    {
      if (err)
      {
          return res.status(500).send(err);
      }

      console.log(steamProfile);

      var profileData = {
        input: input,
        rlrank_id: getUniqueId(),
        display_name: steamProfile.personaname,
        platform: platform,
        hash: new Buffer(steamProfile.steamid).toString('base64')
      };

      console.log("[PROFILE] Got profile from Steam, saving to DB...", input);

      db.insert('profiles', profileData,
        function(err, doc)
        {
          if (err)
          {
            console.log("[PROFILE] [ERROR] Could not save Steam profile to database", input); // ERROR
          }
        }
      );

      res.send({profile: profileData});
    });
  }
  else if (platform == 'psn' || platform == 'xbox')
  {
    console.log("[PROFILE] %s user [%s]", platform, input); // INFO

    input = decodeURIComponent(input);

    if (/[A-Za-z0-9\-\_ ]$/g.test(input))
    {
      var profileData = {
        input: input,
        rlrank_id: getUniqueId(),
        display_name: input,
        platform: platform,
        hash: new Buffer(input).toString('base64')
      };

      db.insert('profiles', profileData,
        function(err, doc)
        {
          if (err)
          {
            console.log("[PROFILE] [ERROR] Could not save %s profile to database [%s]", platform, input); // ERROR
          }
        }
      );

      return res.send({profile: profileData});
    }
    else
    {
      console.log("[PROFILE] [ERROR] Invalid %s user [%s]", platform, input); // ERROR
      return res.status(500).send({code: "invalid_xboxpsn", message: "Invalid " + platform + " username."});
    }
  }
  else
  {
    // Assume it's a steam id.
    if (input[0] == 7 && isNumeric(input) && input.length == 17)
    {
      var hash = new Buffer(input).toString('base64');

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
      return res.status(500).send({code: "invalid_platform", message: "Invalid platform."});
    }
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
  return !isNaN(parseFloat(n)) && isFinite(n)
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
