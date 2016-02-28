var db = require('../db');
var psyonix = require('./psyonix')

module.exports = {
  hourlyLeaderboards,
};

function hourlyLeaderboards()
{
  var playlists = [10, 11, 12, 13];

  playlists.forEach(
    function(playlist)
    {
      psyonix.getLeaderboard(playlist, function(err, results)
      {
        if (err)
        {
          console.log("Could not fetch leaderboard from Psyonix", err); // error
        }

        db.upsert('leaderboards', {playlist: playlist}, {$set: {leaderboard: results}},
          function(err, doc)
          {

          }
        );
      });
    }
  );
}
