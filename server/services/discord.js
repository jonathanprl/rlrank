var Discord = require('discord.io');
var swiftping = require('../helpers/swiftping');
var profile = require('../controllers/profile');
var rank = require('../controllers/rank');
var config = require('../../config');

var moment = require('moment');

module.exports = {
  start
};

var playlists = {
  '0': 'Normal (All)',
  '1': '1v1 (Normal)',
  '2': '2v2 (Normal)',
  '3': '3v3 (Normal)',
  '4': '4v4 (Normal)',
  '10': '1v1',
  '11': '2v2',
  '12': '3v3 Solo',
  '13': '3v3 Team'
};

var validPlaylists = {
  '1v1': 10,
  '2v2': 11,
  '3v3': 12,
  '3v3team': 13,
  '3v3solo': 12,
  'normal': 0,
  'all': ''
};

var validPlatforms = {
  'steam': 'steam',
  'pc': 'steam',
  'xbox': 'xbox',
  'xboxone': 'xbox',
  'psn': 'psn',
  'ps4': 'psn'
};

var nameErrors = [
  'invalid_gamertag',
  'invalid_name',
  'invalid_id',
  'invalid_url',
  'not_found'
];

var tiers = {
  '0': 'Unranked',
  '1': 'Prospect I',
  '2': 'Prospect II',
  '3': 'Prospect III',
  '4': 'Prospect Elite',
  '5': 'Challenger I',
  '6': 'Challenger II',
  '7': 'Challenger III',
  '8': 'Challenger Elite',
  '9': 'Rising Star',
  '10': 'Shooting Star',
  '11': 'All-Star',
  '12': 'Superstar',
  '13': 'Champion',
  '14': 'Super Champion',
  '15': 'Grand Champion'
};

var romans = {
  '0': 'I',
  '1': 'II',
  '2': 'III',
  '3': 'IV',
  '4': 'V'
};

function start() {

  var bot = new Discord.Client({
    token: config.discord.token,
    autorun: true
  });

  bot.on('ready', function(a) {
    swiftping.logger('info', 'discord', bot.username + ' bot online! (' + bot.id + ')');
  });

  bot.on('message', function(user, userID, channelID, message, event) {
    if (message == '!rlrank help' || message == 'rlrank help')
    {
      swiftping.logger('info', 'discord', 'A help message was sent to ' + bot.username + ' bot.', {user: user, userID: userID, channelID: channelID, message: message, event: event});
      return showHelp();
    }

    if (message.split(' ')[0] != '!rlrank')
    {
      return false;
    }

    swiftping.logger('info', 'discord', 'A !rlrank message was sent to ' + bot.username + ' bot.', {user: user, userID: userID, channelID: channelID, message: message, event: event});

    var input = message.split(' ');
    input.splice(0, 1);

    showRanks();

    function showError(msg)
    {
      bot.sendMessage({
        to: channelID,
        message: msg
      });
    }

    function showHelp()
    {
      bot.sendMessage({
        to: channelID,
        message: '**Usage:** `!rlrank <username/id/url> <platform> <playlist?> <addtoname?>`\n' +
        '\n`<username/id/url>` - Steam Profile/Xbox/PSN name or url e.g. `KronoviRL`, `http://steamcommunity.com/id/<profile_name>` or `76561198076736523`\n' +
        '\n`<platform>` - Platform e.g. `steam`, `pc`, `ps4`, `psn` or `xbox`\n' +
        '\n`<playlist>` - *(Optional)* RL Playlist e.g. `1v1`, `2v2`, `3v3team`, `3v3solo` or `normal`\n' +
        '\n`<addtoname>` - *(Optional)* Add to your Discord name e.g `KronoviRL [Prospect Elite]`\n' +
        '\ne.g `!rlrank KronoviRL ps4 3v3solo`\n' +
        '\n**View your full ranks, stats and graphs any time at https://rocketleaguerank.com.**'
      });
    }

    function showRanks()
    {
      var addToName = false;
      if (input[input.length - 1].toLowerCase() == 'addtoname')
      {
        addToName = true;
        input.pop();
      }

      var lastWord = input.pop().toLowerCase();
      var playlist;
      var platform;

      if (lastWord in validPlatforms)
      {
        playlist = 'all';
        platform = lastWord;
      }
      else if (lastWord in validPlaylists)
      {
        playlist = lastWord;
        platform = input.pop().toLowerCase();
      }
      else
      {
        return showHelp();
      }

      if (!(playlist in validPlaylists))
      {
        return showError('The playlist you entered does not appear to be valid. :sweat: Enter either `1v1`, `2v2`, `3v3` (Solo), `3v3solo`, `3v3team`, `all` or leave it blank for all.\n\nExample: `!rlrank KronoviRL steam 2v2`');
      }

      if (!(platform in validPlatforms))
      {
        return showError('The platform you entered does not appear to be valid. :sweat: Enter either `steam`, `pc`, `xbox`, `xboxone`, `psn` or `ps4`.\n\nExample: `!rlrank KronoviRL steam 1v1`');
      }

      profile.getProfileByInput(input.join(' '), validPlatforms[platform], function(err, profile) {
        if (err)
        {
          if (nameErrors.indexOf(err.code) > -1)
          {
            showError('Hmmm... :confused: I couldn\'t locate a ' + platform + 'profile with the username (or Steam URL):\n\n**`' + input.join(' ') + '`**.\n\nI will get my developer to take a look, just in-case there was an issue on our end. :upside_down:');
          }

          return swiftping.logger('error', 'discord', 'Could not find/create player profile.', {input: input.join(' '), platform: platform, error: err});
        }

        rank.getPlayerRanksById(profile.rlrank_id, function(err, ranks) {
          if (err)
          {
            showError('I found a profile for ' + input.join(' ') + ', but for some reason I couldn\'t retrieve any ranks?? :worried:\n\n Either you have never played a ranked match, or there are issues on my end. My developer has been notified so please try again later!');
            return swiftping.logger('error', 'discord', 'Could not find player ranks.', {rlrank_id: profile.rlrank_id, platform: platform, error: err});
          }
          var lastUpdated;
          var highestRank = {
            mmr: -1000
          };

          var rankStrings = ranks.filter(function(rank) {
            return rank.playlist === validPlaylists[playlist] || (playlist == 'all' && rank.matches_played > 0);
          }).map(function(rank) {
            lastUpdated = rank.created_at;

            if (rank.mmr > highestRank.mmr)
            {
              highestRank.mmr = rank.mmr;
              highestRank.tier = rank.tier;
            }

            return '__**' + playlists[rank.playlist] + '**__ **-** ' + tiers[rank.tier] + ' **-** Division ' + romans[rank.division] + ' **-** MMR: ' + rank.mmr;
          });

          if (rankStrings.length == 0)
          {
            bot.sendMessage({
              to: channelID,
              message: 'Ummmm... **' + profile.display_name + '** does not appear to have played any ranked games in **' + playlists[validPlaylists[playlist]] + '** :confused:'
            });
          }
          else
          {
            bot.sendMessage({
              to: channelID,
              message: 'Ranks for **' + profile.display_name + '!**\n\n' +
              rankStrings.join('\n------------\n') +
              '\n\n**More details and stats:** https://rocketleaguerank.com/u/' + profile.rlrank_id + '\n'
            });

            if (addToName && highestRank.tier && highestRank.tier > 0)
            {
              bot.editNickname({serverID: channelID, userID: userID, nick: user + ' [' + tiers[highestRank.tier] + ']'}, function(err, response) {
                swiftping.logger('info', 'discord', 'A rank was added to a user\'s name.', {serverID: channelID, userID: userID, nick: user + ' [' + tiers[highestRank.tier] + ']', message: message});
              });
            }
          }

        });
      });
    }
  });

}
