function bodyParser() {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch (error) {
          const err = new Error('Invalid JSON');
          err.statusCode = 400;
          return next(err);
        }
      }
      next();
    });

    req.on('error', (error) => {
      next(error);
    });
  };
}

module.exports = bodyParser;
