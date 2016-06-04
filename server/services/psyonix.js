var db = require('../db');
var https = require('http');
var Url = require('url');
var querystring = require('querystring');
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
    procData = 'GetPlayerSkillSteam';
  }
  else if (platform == 'psn')
  {
    procData = 'GetPlayerSkillPS4';
  }
  else if (platform == 'xbox')
  {
    procData = 'GetPlayerSkillXboxOne';
  }

  procData = {
    'Proc[]': procData,
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
            // xbox.getXuidFromGamertag(id,
            //   function(err, xuid)
            //   {
            //     if (err)
            //     {
            //       return callback(err);
            //     }
            //     resolve('Proc[]=GetPlayerSkillXboxOne&P' + index + 'P[]=' + xuid + '&');
            //   }
            // );
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
    function(playlist, i)
    {
      procData += 'Proc[]=GetSkillLeaderboard_v2&P' + i + 'P[]=' + playlist + '&';
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
  db.findOneWhere('config', {name: 'token'}, {}, function(err, doc)
  {
    var token = doc.value;

    if (err)
    {
      console.log('[PSYONIX] [ERROR] Couldn\'t get token from DB');
      return callback({'code': 'server_error', 'message': 'There was a server error. We have been notified.'});
    }

    var headers = {
      'SessionID': token,
      'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F',
      'Cache-Control': 'no-cache',
      'Environment': 'Prod',
      'User-Agent': 'UE3-TA,UE3Ver(10897)',
      'BuildID': '636774701'
    };

    var time = new Date();

    console.log(time.toTimeString() + ' [PSYONIX] Sending callProc to Psyonix [%s]', JSON.stringify(procData));

    restler.post(procUrl, {data: procData, headers: headers})
      .on('complete',
      function(data, res)
      {
        if (data.indexOf('SessionNotActive') > -1)
        {
          console.log('[PSYONIX] SessionNotActive - Token needs refreshing.');
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
    'PlayerName': '',
    'PlayerID': '1',
    'Platform': 'PS4',
    'BuildID': '636774701',
    'BuildRegion': '',
    'AuthCode': '',
    'AuthTicket': '',
    'IssuerID': '0'
  };

  var headers = {
    'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx',
    'Cache-Control': 'no-cache',
    'Environment': 'Prod',
    'User-Agent': 'UE3-TA,UE3Ver(10897)',
    'BuildID': '636774701'
  };

  restler.post('https://psyonix-rl.appspot.com/auth/', {data: data, headers: headers})
    .on('complete',
    function(data, res)
    {
      if (!data)
      {
        console.log('[PSYONIX] [ERROR] There was an error authing with Psyonix', data);
        return callback({'code': 'server_error', 'message': 'There was a server error. We have been notified.'});
      }

      console.log('[PSYONIX] Got new token from Psyonix', res.headers.sessionid);

      db.modify('config', {name: 'token'}, {$set: {value: res.headers.sessionid}},
        function(err, doc)
        {
          if (err)
          {
            console.log('[PSYONIX] [ERROR] There was an error saving token to DB', err);
            return callback({'code': 'server_error', 'message': 'There was a server error. We have been notified.'});
          }

          console.log('[PSYONIX] Saved token to DB', res.headers.sessionid);
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
