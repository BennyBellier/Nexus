import { WebContents } from 'electron';
import { networkInterfaces } from 'os';
import net, { Server, Socket } from 'net';
import log from 'electron-log';

const nets = networkInterfaces();
export const results = Object.create(null); // Or just '{}', an empty object

export function getLocalIP(): string {
  let ip = '';
  Object.keys(nets).forEach((name) => {
    nets[name]?.forEach((n) => {
      if (n.family === 'IPv4' && !n.internal) {
        ip = n.address;
      }
    });
  });
  return ip;
}

export class TCPServer {
  private server: Server;

  private webContents: WebContents;

  private clientCounter = 0;

  constructor(port: number, webContents: WebContents) {
    this.webContents = webContents;
    this.server = net.createServer(this.handleConnection.bind(this));
    this.server.listen(port, () => {
      log.info(`Server listening on port ${port}`);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private handleConnection(socket: Socket): void {
    log.info(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
    this.clientCounter += 1;
    this.webContents.send('tcp:clients', this.clientCounter);

    socket.on('data', (data: Buffer) => {
      log.debug(`Received data: ${data.toString()}`);
      switch (data.toString()) {
        case 'TimerStop':
          socket.write('handleStop');
          break;

        case 'Hello':
          socket.write(data.toString());
          break;

        default:
          socket.write('error command not found');
          break;
      }
    });

    socket.on('close', () => {
      log.info(
        `Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`
      );
      this.clientCounter -= 1;
      this.webContents.send('tcp:clients', this.clientCounter);
    });

    socket.on('error', (error: Error) => {
      log.error(`Socket error: ${error}`);
    });
  }

  public stop(): void {
    this.server.close(() => {
      log.info('Server stopped');
    });
  }

  public getSocket() {
    return this.server;
  }

  public getClientsCounter() {
    return this.clientCounter;
  }
}
