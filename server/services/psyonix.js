var db = require('../db');
var https = require('http');
var Url = require('url');
var querystring = require('querystring');
var steam = require('../helpers/steam');
var xbox = require('../helpers/xbox');
var swiftping = require('../helpers/swiftping');
var restler = require('restler');

module.exports = {
  getPlayerRanks,
  getPlayersRanks,
  getPlayerStats,
  getPlayersStat,
  getServers,
  refreshToken,
  getLeaderboards,
  getPopulation
};

// LogoutUser

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
  else if (platform == 'psn')
  {
    procData = {
      'Proc[]': 'GetPlayerSkillPS4',
      'P0P[]': id
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
  else if (platform == 'xbox')
  {
    xbox.getXuidFromGamertag(id,
      function(err, xuid)
      {
        if (err)
        {
          return callback(err);
        }

        procData = {
          'Proc[]': 'GetPlayerSkillXboxOne',
          'P0P[]': xuid
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
    );
  }
}

function getPlayersRanks(profiles, callback)
{
  var procData = '';
  var promises = [];

  profiles.forEach(
    function(profile, index)
    {
      var id = new Buffer(profile.hash, 'base64').toString('ascii');

      if (profile.platform === 'steam')
      {
        procData += 'Proc[]=GetPlayerSkillSteam&P' + index + 'P[]=' + id + '&';
      }
      else if (profile.platform == 'psn')
      {
        procData += 'Proc[]=GetPlayerSkillPS4&P' + index + 'P[]=' + id + '&';
      }
      else if (profile.platform == 'xbox')
      {
        promises.push(new Promise(
          function (resolve, reject)
          {
            xbox.getXuidFromGamertag(id,
              function(err, xuid)
              {
                if (err)
                {
                  return callback(err);
                }
                resolve('Proc[]=GetPlayerSkillXboxOne&P' + index + 'P[]=' + xuid + '&');
              }
            );
          }
        ));
      };
    }
  );

  Promise.all(promises)
    .then(function(xboxProcs)
    {
      procData = procData + xboxProcs.join('');
      procData = procData.substring(0, procData.length - 1); // Remove trailing ampersand

      callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
      {
        if (err)
        {
          return callback(err);
        }

        var data = parseMultiResults(data);
        callback(null, data);
      });
    }
  );
}

function getLeaderboards(callback)
{
  var procData = '';

  [10, 11, 12, 13].forEach(
    function(playlist)
    {
      procData = 'Proc[]=GetSkillLeaderboard_v2&P0P[]=' + playlist + '&';
    }
  );

  procData = procData.substring(0, procData.length - 1); // Remove trailing ampersand

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    console.log(data);

    var data = parseMultiResults(data);
    callback(null, data);
  });
}

function getPlayerStats(id, platform, callback)
{
  var procData = '';

  var stats = ['Wins', 'Goals', 'MVPs', 'Saves', 'Shots', 'Assists'];

  stats.forEach(
    function(stat, index)
    {
      if (platform == 'steam')
      {
        procData += 'Proc[]=GetLeaderboardValueForUserSteam&P' + index + 'P[]=' + id + '&P' + index + 'P[]=' + stat + '&';
      }
      else if (platform == 'psn')
      {
        procData += 'Proc[]=GetLeaderboardValueForUserPS4&P' + index + 'P[]=' + id + '&P' + index + 'P[]=' + stat + '&';
      }
      else if (platform == 'xbox')
      {
        procData += 'Proc[]=GetLeaderboardValueForUserXboxOne&P' + index + 'P[]=' + id + '&P' + index + 'P[]=' + stat + '&';
      }
    }
  );

  procData = procData.substring(0, procData.length - 1); // Remove trailing ampersand

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseMultiResults(data);
    callback(null, data);
  });
}

function getPlayersStat(profiles, stat, callback)
{
  procData = '';

  profiles.forEach(
    function(profile, index)
    {
      var id = new Buffer(profile.hash, 'base64').toString('ascii');

      if (profile.platform == 'steam')
      {
        procData += 'Proc[]=GetLeaderboardValueForUserSteam&P' + index + 'P[]=' + id + '&P' + index + 'P[]=' + stat;
      }
      else if (profile.platform == 'psn')
      {
        procData += 'Proc[]=GetLeaderboardValueForUserPS4&P' + index + 'P[]=' + id + '&P' + index + 'P[]=' + stat;
      }
      else if (profile.platform == 'xbox')
      {
        procData += 'Proc[]=GetLeaderboardValueForUserXboxOne&P' + index + 'P[]=' + id + '&P' + index + 'P[]=' + stat;
      }

      if (index != profiles.length - 1)
      {
        procData += '&';
      }
    }
  );

  callProc('https://psyonix-rl.appspot.com/callproc105/', procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseMultiResults(data);
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

    console.log(data);

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
      console.log("[PSYONIX] [ERROR] Couldn't get token from DB");
      return callback({"code": "server_error", "message": "There was a server error. We have been notified."});
    }

    var headers = {
      'SessionID': doc.value,
      'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F'
    };

    console.log('[PSYONIX] Sending callProc to Psyonix [%s]', procUrl);

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
        else if (data.indexOf('403 Sorry...') > -1)
        {
          console.log('[PSYONIX] [ERROR] Psyonix is throttling requests...');
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
    'BuildID': '342373649',
    'AuthCode': '14000000A994D045DFFE86A2C0C43B0C0100100160BAEC56180000000100000002000000A9139B6800000000808F4A1A20000000B20000003200000004000000C0C43B0C0100100116DC0300A9139B680200840A000000009B0FE0561BBFFB560100E478000000000000195EDB479ABBEF71A594561560639FDE24DC64366A220989E4390D3E9336EA4E9A8291A95C1857DD8B09298F99626896E7AF531CF8F613DC7464CE8DE6BFE339C3FF1250A8ECD09E33795D37632D5FED18FBDE6911B29B63609F77020A9ABFBC9643E59306CE4FCDBE01B6C9CD4B32C232AA9796925B22DC47E62FED2BA141E5',
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
        console.log('[PSYONIX] [ERROR] There was an error authing with Psyonix', data);
        return callback({"code": "server_error", "message": "There was a server error. We have been notified."});
      }

      db.modify('config', {name: 'token'}, {$set: {value: res.headers.sessionid}},
        function(err, doc)
        {
          if (err)
          {
            console.log('[PSYONIX] [ERROR] There was an error saving token to DB', err);
            return callback({"code": "server_error", "message": "There was a server error. We have been notified."});
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

function parseMultiResults(results)
{
  var parsedResults = [];
  var groupedResults = [];

  var lines = results.split(/\r?\n/);

  var previousLine = null;
  lines.forEach(
    function(line, index)
    {
      var properties = line.split('&');

      var parsedLine = {};
      properties.forEach(
        function(property)
        {
          property = property.split('=');
          parsedLine[property[0]] = property[1];
        }
      );

      if (properties.length > 1)
      {
        groupedResults.push(parsedLine);
      }
      else if (properties[0] == '')
      {
        properties = [];
      }

      if (line == 'SQL ERROR:' || previousLine == 'SQL ERROR:')
      {
        previousLine = line;
      }
      else if ((line === '' && (previousLine === '' || index === 0) && index != lines.length - 1) || (properties.length == 1 && (previousLine == '' || index === 0)))
      {
        parsedResults.push([]);
        groupedResults = [];
        previousLine = line;
      }
      else if (line === '' && groupedResults.length > 0)
      {

        parsedResults.push(groupedResults);
        groupedResults = [];
        previousLine = line;
      }
      else
      {
        previousLine = line;
      }
    }
  );

  return parsedResults;
}
