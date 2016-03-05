var db = require('../db');
var https = require('http');
var Url = require('url');
var querystring = require('querystring');
var steam = require('../helpers/steam');
var restler = require('restler');

module.exports = {
  auth,
  getPlayerRanks,
  getPlayerStat,
  getServers,
  refreshToken,
  getLeaderboard,
  getPopulation
};

// LogoutUser

function isNumeric(n)
{
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function auth(req, res)
{
  db.findOneWhere('profiles', {input: req.body.input, platform: req.body.platform}, { _id: 0 },
    function(err, doc)
    {
      if (err || !doc)
      {
        if (err) console.log("[PROFILE] Error fetching profile from DB", err); // ERROR
        fetchNewProfile(req, res);
      }
      else
      {
        console.log("[PROFILE] Found profile in DB. %s (%s)", req.body.input, req.body.platform);
        return res.send({profile: doc});
      }
    }
  );
}

function fetchNewProfile(req, res)
{
  var input = req.body.input;
  var platform = req.body.platform;

  var url;

  console.log("[PROFILE] Fetching new profile..."); // INFO

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

      var profileData = {
        input: input,
        steam_url: steamProfile.url,
        steam_id: steamProfile.steamid,
        rlrank_id: steamProfile.steamid,
        username: steamProfile.personaname,
        platform: platform
      };

      console.log("[PROFILE] Got profile from Steam, saving to DB...", url);

      db.upsert('profiles', {input: input, platform: platform}, profileData,
        function(err, doc)
        {
          if (err)
          {
            console.log("[PROFILE] [ERROR] Could not save Steam profile to database", url); // ERROR
          }
        }
      );

      res.send({profile: profileData});
    });
  }
  else if (platform == 'psn' || platform == 'xbox')
  {
    console.log("[PROFILE] %s user [%s]", platform, input); // INFO

    if (/[A-Za-z0-9\-\_ ]$/g.test(input))
    {
      var profileData = {
        input: input,
        steam_url: null,
        steam_id: null,
        rlrank_id: input,
        username: input,
        platform: platform
      };

      db.upsert('profiles', {input: input, platform: platform}, profileData,
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
    return res.status(500).send({code: "invalid_platform", message: "Invalid platform."});
  }
}

// 1v1:10, 2v2:11, 3v3S:12, 3v3:13

function getPlayerRanks(id, platform, callback)
{
  var procData;

  if (platform === 'steam')
  {
    procData = {
      'Proc[]': 'GetPlayerSkillSteam',
      'P0P[]': id
    };
  }
  else if (platform == 'psn')
  {
    procData = {
      'Proc[]': 'GetPlayerSkillPS4',
      'P0P[]': id
    };
  }
  else if (platform == 'xbox')
  {
    procData = {
      'Proc[]': 'GetPlayerSkillXboxOne',
      'P0P[]': id
    };
  }

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseResults(data);
    callback(null, data);
  });
}

function getLeaderboard(playlist, callback)
{
  var procData = {
    'Proc[]': 'GetSkillLeaderboard_v2',
    'P0P[]': playlist
  };

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseResults(data);
    callback(null, data);
  });
}

function getPlayerStat(id, platform, stat, callback)
{
  var procData;

  if (platform == 'steam')
  {
    procData = 'Proc[]=GetLeaderboardValueForUser' + platform + '&P0P[]=' + id + '&P0P[]=' + stat;
  }
  else if (platform == 'psn')
  {
    procData = 'Proc[]=GetLeaderboardValueForUserPS4&P0P[]=' + id + '&P0P[]=' + stat;
  }
  else if (platform == 'xbox')
  {
    procData = 'Proc[]=GetLeaderboardValueForUserXboxOne&P0P[]=' + id + '&P0P[]=' + stat;
  }

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseResults(data);
    callback(null, data[0]);
  });
}

function getServers(callback)
{
  var procData = {
    'Proc[]': 'GetGameServerPingList'
  };

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseResults(data);
    callback(null, data);
  });
}

function getPopulation(callback)
{
  var procData = {
    'Proc[]': 'GetPopulationAllPlaylists'
  };

  callProc('https://psyonix-rl.appspot.com/Population/GetPopulation/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseResults(data);
    callback(null, data);
  });
}

function callProc(procUrl, procData, callback)
{
  db.findOne('config', {name: 'token'}, function(err, doc)
  {
    if (err)
    {
      return callback(err);
    }

    var headers = {
      'SessionID': doc.value,
      'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F'
    };

    restler.post(procUrl, {data: procData, headers: headers})
      .on('complete',
      function(data, res)
      {
        if (data.indexOf('SessionNotActive') > -1)
        {
          console.log("Refreshing Psyonix token...");
          refreshToken(function(err, token)
          {
            var headers = {
              'SessionID': token,
              'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F'
            };

            restler.post(procUrl, {data: procData, headers: headers})
              .on('complete',
              function(data, res)
              {
                callback(null, data);
              }
            );
          });
        }
        else
        {
          callback(null, data);
        }
      }
    );
  });
}

function refreshToken(callback)
{
  var data = {
    'PlayerName': 'Mugabe',
    'PlayerID': '76561198165509312',
    'Platform': 'Steam',
    'BuildID': '-178744029',
    'AuthCode': '14000000A4B53A687C70EB2EC0C43B0C01001001B71BD256180000000100000002000000A9139B6800000000D5BC160003000000B20000003200000004000000C0C43B0C0100100116DC0300A9139B680200840A000000001A1AD2569AC9ED560100E4780000000000006A055C199DB328C3BC31DAF59E003CEA2B96963401B23609FD98CDA9ACA25CD469EE0671C2AF59CA500DF7D40CDC18E3CF375BBB70A708D31B91767C7D27BA6731203FEE052E42EBDF9F14BE020B4751FF939A081A92E408200CA8B8085B3CF611F10333E87D68B649ABEC94879F5D006238D77774DB5647504C403E5C481ADD',
    'IssuerID': '0'
  };

  var headers = {
    'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx'
  };

  restler.post('https://psyonix-rl.appspot.com/auth/', {data: data, headers: headers})
    .on('complete',
    function(data, res)
    {
      if (!data)
      {
        console.log(err);
        return callback(true);
      }

      db.modify('config', {name: 'token'}, {$set: {value: res.headers.sessionid}},
        function(err, doc)
        {
          if (err)
          {
            return callback(true);
          }

          callback(null, res.headers.sessionid);
        }
      );
    }
  );
}

function parseResults(results)
{
  var parsedResults = [];

  var lines = results.split(/\r?\n/);

  lines.forEach(function(line)
  {
    var properties = line.split('&');

    var parsedLine = {};
    properties.forEach(function(property)
    {
      property = property.split('=');
      parsedLine[property[0]] = property[1];
    });

    if (properties.length > 1)
    {
      parsedResults.push(parsedLine);
    }
  });

  return parsedResults;
}
