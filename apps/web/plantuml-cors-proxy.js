// NOTE: This script is used in development to work around the CORS issue with PlantUML map requests.

const httpProxy = require('http-proxy');

const enableCors = (req, res) => {
    if (req.headers['access-control-request-method']) {
        res.setHeader('access-control-allow-methods', req.headers['access-control-request-method']);
    }

    if (req.headers['access-control-request-headers']) {
        res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers']);
    }

    if (req.headers.origin) {
        res.setHeader('access-control-allow-origin', req.headers.origin);
        res.setHeader('access-control-allow-credentials', 'true');
    }
}

// Create your proxy server and set the target in the options.
// noinspection JSUnresolvedFunction
const corsProxy = httpProxy.createProxyServer({target: 'http://localhost:8080'}).listen(8081);

// Set header for CORS when we get response from the target server.
corsProxy.on('proxyRes', function (proxyRes, req, res) {
    enableCors(req, res);
});
