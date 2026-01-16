
function enhanceRequest(req) {
  req.body = {};

  req.params = {};

  req.query = {};
}

module.exports = { enhanceRequest };
