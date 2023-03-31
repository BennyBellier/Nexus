import { networkInterfaces } from 'os';
import net, { Server, Socket } from 'net';


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

  constructor(port: number) {
    this.server = net.createServer(this.handleConnection.bind(this));
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }

  private handleConnection(socket: Socket): void {
    console.log(
      `Client connected: ${socket.remoteAddress}:${socket.remotePort}`
    );

    socket.on('data', (data: Buffer) => {
      console.log(`Received data: ${data.toString()}`);
      // Handle received data
      socket.write(data);
    });

    socket.on('close', () => {
      console.log(
        `Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`
      );
    });

    socket.on('error', (error: Error) => {
      console.error(`Socket error: ${error}`);
    });
  }

  public stop(): void {
    this.server.close(() => {
      console.log('Server stopped');
    });
  }
}
