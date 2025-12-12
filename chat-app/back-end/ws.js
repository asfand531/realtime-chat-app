import { WebSocketServer } from "ws";
import http from "http";

export function setupWebSocket(app) {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const cryptoID = () => crypto.randomUUID();
  let obj = {};

  wss.on("connection", (ws) => {
    console.log("WebSocket Connected");
    ws.onopen((e) => {
      console.log("WebSocket Open");
      console.log(e);
    });

    const id = cryptoID();
    obj[id] = {
      join: "Active",
    };
    ws.on("message", (msg) => {
      console.log("WSS recieved a message from client:", msg.toString());
    });
  });
  server.on("upgrade", function upgrade(request, socket, head) {
    socket.on("error", (err) => {
      console.error(err);
    });

    // This function is not defined on purpose. Implement it with your own logic.
    authenticate(request, function next(err, client) {
      if (err || !client) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      socket.removeListener("error", (err) => {
        console.error(err);
      });

      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit("connection", ws, request, client);
      });
    });
  });

  const authenticate = (req, socket) => {
    if (!req) return;
    console.log(req);
  };

  return server;
}
