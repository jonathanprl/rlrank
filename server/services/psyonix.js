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
  getPlayerRatingSteam,
  getServers,
  refreshToken,
  getLeaderboard,
  getLeaderboardRatingsSteam,
  getLeaderboardRatingsPSN,
  getPopulation
};

// LogoutUser

function auth(req, res)
{
  if (req.body.url.indexOf('steamcommunity.com') === -1 && /[A-Za-z0-9\-\_]$/g.test(req.body.url))
  {
    console.log("PSN User... Skipping steam"); // INFO;

    return res.send({
      profile: {
        steam_url: null,
        steam_id: null,
        rlrank_id: req.body.url,
        username: req.body.url,
        platform: 'PSN'
      }
    });
  }
  else if (req.body.url.indexOf('steamcommunity.com') === -1 && !/[A-Za-z0-9\-\_]$/g.test(req.body.url))
  {
    return res.status(500).send({code: "invalid_psn", message: "Invalid PSN username."});
  }

  steam.getDetailsFromURL(req.body.url, function(err, steamProfile)
  {
    if (err)
    {
        return res.status(500).send(err);
    }

    res.send({
      profile: {
        steam_url: steamProfile.url,
        steam_id: steamProfile.steamid,
        rlrank_id: steamProfile.steamid,
        username: steamProfile.personaname,
        platform: 'Steam'
      }
    });
  });
}

// 1v1:10, 2v2:11, 3v3S:12, 3v3:13

function getPlayerRanks(id, platform, callback)
{
  var procData;

  if (platform === 'Steam')
  {
    procData = {
      'Proc[]': 'GetPlayerSkillSteam',
      'P0P[]': id
    };
  }
  else if (platform == 'PSN')
  {
    procData = {
      'Proc[]': 'GetPlayerSkillPS4',
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

  if (platform == 'Steam')
  {
    procData = 'Proc[]=GetLeaderboardValueForUser' + platform + '&P0P[]=' + id + '&P0P[]=' + stat;
  }
  else if (platform == 'PSN')
  {
    procData = 'Proc[]=GetLeaderboardValueForUserPS4&P0P[]=' + id + '&P0P[]=' + stat;
  }

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }


    console.log(procData);
    console.log(data);
    var data = parseResults(data);
    callback(null, data[0]);
  });
}

function getPlayerRatingSteam(id, leaderboardId, callback)
{
  var procData = 'Proc[]=GetSkillLeaderboardValueForUserSteam&P0P[]=' + id + '&P0P[]=' + leaderboardId;

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

function getPlayerRatingPSN(id, leaderboardId, callback)
{
  var procData = 'Proc[]=GetSkillLeaderboardValueForUserPSN&P0P[]=' + id + '&P0P[]=' + leaderboardId;

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

function getLeaderboardRatingsSteam(leaders, leaderboardId, callback)
{
  var procData = 'Proc[]=GetSkillLeaderboardRankForUsersSteam&P0P[]=' + leaderboardId;

  leaders.forEach(
    function(leader)
    {
      procData += '&P0P[]=' + leader;
    }
  );

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

function getLeaderboardRatingsPSN(leaders, leaderboardId, callback)
{
  var procData = 'Proc[]=GetSkillLeaderboardRankForUsersPSN&P0P[]=' + leaderboardId;

  leaders.forEach(
    function(leader)
    {
      procData += '&P0P[]=' + leader;
    }
  );

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
