module.exports = function(io)
{
  var socketio = {};

  socketio.transport = function(req, res, next)
  {
    req.io = io;
    next();
  };

  return socketio;
};
