/* Minimal Next.js custom server for cPanel Node app */
const { createServer, request: httpRequest } = require('http');
const { request: httpsRequest } = require('https');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const monitorPingUrl = process.env.HOSTING_MONITOR_PING_URL;
const app = next({ dev });
const handle = app.getRequestHandler();

function logMonitorError(error) {
    if (process.env.NODE_ENV !== 'production') {
        const detail = error instanceof Error ? error.message : String(error);
        console.warn('[monitor] ping failed:', detail);
    }
}

function notifyHostingMonitor() {
    if (!monitorPingUrl) {
        return;
    }

    try {
        const target = new URL(monitorPingUrl);
        const client = target.protocol === 'https:' ? httpsRequest : httpRequest;
        const requestOptions = {
            method: 'GET',
            hostname: target.hostname,
            port: target.port || (target.protocol === 'https:' ? 443 : 80),
            path: `${target.pathname}${target.search}`,
            timeout: 2000,
            headers: {
                'User-Agent': 'alnoor-monitor/1.0',
            },
        };

        const pingRequest = client(requestOptions, (monitorResponse) => {
            monitorResponse.resume();
        });

        pingRequest.on('timeout', () => {
            pingRequest.destroy(new Error('Request timeout'));
        });
        pingRequest.on('error', logMonitorError);
        pingRequest.end();
    } catch (error) {
        logMonitorError(error);
    }
}

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);

        if (parsedUrl.pathname === '/__health') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            if (req.method === 'HEAD') {
                res.end();
            } else {
                res.end('ok');
            }
            notifyHostingMonitor();
            return;
        }

        handle(req, res, parsedUrl);
    });

    const port = process.env.PORT || 3000;
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Next.js ready on http://localhost:${port}`);
    });
});
