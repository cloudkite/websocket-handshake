export default {
  async fetch(request, _env, _ctx): Promise<Response> {
    const url = new URL(request.url);

    // Serve HTML client for testing
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_CONTENT, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // WebSocket endpoint
    if (url.pathname === "/ws") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      server.accept();

      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: { "X-Hello": "testing" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket Handshake Bug Reproduction</title>
</head>
<body>
    <div class="container">
        <h1>WebSocket Handshake Bug Reproduction</h1>
        <div>
            <button onclick="connect()">Connect</button>
        </div>
    </div>

    <script>
        function connect() {
            const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            let ws = new WebSocket(protocol + '//' + location.host + '/ws');
        }
    </script>
</body>
</html>
`;
