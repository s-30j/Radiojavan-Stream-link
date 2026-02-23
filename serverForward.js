#!/usr/bin/env node
"use strict";

// apt install certbot
// sudo certbot certonly --standalone --preferred-challenges http -d radio3.sr-api.ir

const crypto = require("crypto");
const fs = require("fs");
const net = require("net");
const tls = require("tls");

const LISTEN_HOST = "0.0.0.0";
const LISTEN_PORT = parseInt("5555", 10);
const REMOTE_HOST = "51.254.225.31";
const REMOTE_PORT = parseInt("443", 10);


const SSL_KEY = "/etc/letsencrypt/live/radio3.sr-api.ir/privkey.pem";
const SSL_CERT = "/etc/letsencrypt/live/radio3.sr-api.ir/fullchain.pem";
const SSL_CA = "";

const REMOTE_TLS = 1;
const REMOTE_REJECT_UNAUTHORIZED = 0;

const REMOTE_SNI = "radio3.sr-api.ir";

function createUpstreamSocket(onConnect, clientAddr) {
  if (REMOTE_TLS) {
    const remoteSocket = tls.connect(
      {
        host: REMOTE_HOST,
        port: REMOTE_PORT,
        servername: REMOTE_SNI,
        rejectUnauthorized: REMOTE_REJECT_UNAUTHORIZED,
        checkServerIdentity: REMOTE_REJECT_UNAUTHORIZED
          ? undefined
          : () => undefined,
        ALPNProtocols: ["http/1.1"],
      },
      onConnect
    );

    remoteSocket.on("error", (err) => {
      console.error(
        `[${clientAddr}] Error Tls ${REMOTE_HOST}:${REMOTE_PORT}`,
        err.message
      );
    });

    return remoteSocket;
  }

  return net.createConnection(
    {
      host: REMOTE_HOST,
      port: REMOTE_PORT,
      highWaterMark: 64 * 1024,
    },
    onConnect
  );
}

function wireSockets(clientSocket, remoteSocket, clientAddr) {
  clientSocket.setNoDelay(true);
  remoteSocket.setNoDelay(true);

  clientSocket.pipe(remoteSocket, { end: true });
  remoteSocket.pipe(clientSocket, { end: true });

  remoteSocket.on("error", (err) => {
    console.error(
      `[${clientAddr}] connect error ${REMOTE_HOST}:${REMOTE_PORT}`,
      err.message
    );
    try {
      clientSocket.destroy();
    } catch (_) {}
  });

  clientSocket.on("error", (err) => {
    console.error(`[${clientAddr}] client error:`, err.message);
    try {
      remoteSocket.destroy();
    } catch (_) {}
  });

  clientSocket.on("close", () => {
    try {
      remoteSocket.destroy();
    } catch (_) {}
  });

  remoteSocket.on("close", () => {
    try {
      clientSocket.destroy();
    } catch (_) {}
  });
}

function startPlainTcpForwarder() {
  const server = net.createServer((clientSocket) => {
    const clientAddr = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`;

    const remoteSocket = createUpstreamSocket(() => {
      wireSockets(clientSocket, remoteSocket, clientAddr);
    }, clientAddr);
  });

  server.on("error", (err) => {
    console.error("setup server fail TCP:", err.message);
    process.exit(1);
  });

  server.listen(
    {
      host: LISTEN_HOST,
      port: LISTEN_PORT,
      backlog: 511,
    },
    () => {
      console.log(
        `port Forwarding Actived: ${LISTEN_HOST}:${LISTEN_PORT} → ${REMOTE_HOST}:${REMOTE_PORT} (upstream TLS=${REMOTE_TLS ? "on" : "off"})`
      );
    }
  );
}

function startHttpsForwarder() {
  let tlsOptions;
  try {
    tlsOptions = {
      key: fs.readFileSync(SSL_KEY),
      cert: fs.readFileSync(SSL_CERT),
      ca: SSL_CA ? fs.readFileSync(SSL_CA) : undefined,
      requestCert: false,
      ALPNProtocols: ["http/1.1"],
      secureOptions:
        typeof (crypto.constants && crypto.constants.SSL_OP_NO_RENEGOTIATION) ===
        "number"
          ? crypto.constants.SSL_OP_NO_RENEGOTIATION
          : 0x40000000,
    };
  } catch (err) {
    console.error("Error While Read SSL:", err.message);
    process.exit(1);
  }

  const server = tls.createServer(tlsOptions, (clientSocket) => {
    const clientAddr = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`;

    const remoteSocket = createUpstreamSocket(() => {
      wireSockets(clientSocket, remoteSocket, clientAddr);
    }, clientAddr);
  });

  server.on("error", (err) => {
    console.error("Setup server Fail HTTPS:", err.message);
    process.exit(1);
  });

  server.listen(
    {
      host: LISTEN_HOST,
      port: LISTEN_PORT,
      backlog: 511,
    },
    () => {
      console.log(
        `Port Forward HTTPS activited: ${LISTEN_HOST}:${LISTEN_PORT} → ${REMOTE_HOST}:${REMOTE_PORT} (upstream TLS=${REMOTE_TLS ? "on" : "off"})`
      );
    }
  );
}

if (SSL_KEY && SSL_CERT) {
  startHttpsForwarder();
} else {
  startPlainTcpForwarder();
}
