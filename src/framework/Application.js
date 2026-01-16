const http = require('http');
const { enhanceRequest } = require('./Request');
const { enhanceResponse } = require('./Response');

class Application {
  constructor() {
    this.routes = {
      GET: [],
      POST: [],
      PUT: [],
      PATCH: [],
      DELETE: []
    };
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  get(path, handler) {
    this.routes.GET.push({ path, handler });
  }

  post(path, handler) {
    this.routes.POST.push({ path, handler });
  }

  put(path, handler) {
    this.routes.PUT.push({ path, handler });
  }

  patch(path, handler) {
    this.routes.PATCH.push({ path, handler });
  }

  delete(path, handler) {
    this.routes.DELETE.push({ path, handler });
  }


  findRoute(method, url) {
    const routes = this.routes[method] || [];
    
    const [pathname] = url.split('?');
    
    for (const route of routes) {
      const params = this.matchPath(route.path, pathname);
      if (params !== null) {
        return { handler: route.handler, params };
      }
    }
    return null;
  }

  matchPath(routePath, actualPath) {
    const routeParts = routePath.split('/').filter(Boolean);
    const actualParts = actualPath.split('/').filter(Boolean);

    if (routeParts.length !== actualParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = actualParts[i];
      } else if (routeParts[i] !== actualParts[i]) {
        return null;
      }
    }

    return params;
  }

  parseQuery(url) {
    const [, queryString] = url.split('?');
    if (!queryString) return {};

    const query = {};
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    
    return query;
  }

  async executeMiddlewares(req, res, middlewares, finalHandler) {
    let index = 0;

    const next = async (error) => {
      if (error) {
        return this.handleError(error, req, res);
      }

      if (index >= middlewares.length) {
        if (finalHandler) {
          try {
            await finalHandler(req, res);
          } catch (err) {
            this.handleError(err, req, res);
          }
        }
        return;
      }

      const middleware = middlewares[index++];
      
      try {
        await middleware(req, res, next);
      } catch (err) {
        this.handleError(err, req, res);
      }
    };

    await next();
  }

  handleError(error, req, res) {
    console.error('Error:', error.message);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    if (!res.headersSent) {
      res.status(statusCode).json({ error: message });
    }
  }

  listen(port, callback) {
    const server = http.createServer(async (req, res) => {
      try {
        enhanceRequest(req);
        enhanceResponse(res);

        req.query = this.parseQuery(req.url);
        const route = this.findRoute(req.method, req.url);

        if (route) {
          req.params = route.params;
          
          await this.executeMiddlewares(req, res, this.middlewares, route.handler);
        } else {
          res.status(404).json({ error: 'Route not found' });
        }
      } catch (error) {
        this.handleError(error, req, res);
      }
    });

    server.listen(port, callback);
    return server;
  }
}

module.exports = Application;
