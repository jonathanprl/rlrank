module.exports = function(io)
{
  function useSocket(req, res, next)
  {
    req.io = io;
    next();
  };
}
