import { WebContents } from 'electron';
import net from 'net';
import log from 'electron-log';
import { TCPServer, getLocalIP } from '../main/tcp';

jest.mock('electron', () => ({
  ipcMain: {
    on: jest.fn(),
  },
}));

describe('getLocalIP', () => {
  it('should return the local IPv4 address', () => {
    const ip = getLocalIP();
    expect(ip).toMatch(/^\d+\.\d+\.\d+\.\d+$/); // Test if the IP address has the correct format
    expect(ip).not.toBe(''); // Test if the IP address is not an empty string
  });
});

describe('TCPServer Running', () => {
  let webContents: WebContents;
  let server: TCPServer;
  const PORT = 3000;
  const IP_ADDRESS = getLocalIP();

  beforeEach(async () => {
    webContents = {} as WebContents;
    const sendMock = jest.fn();
    webContents.send = sendMock;

    server = new TCPServer(PORT, webContents);

    // Wait for the server to start accepting connections
    await new Promise((resolve) => {
      server.getSocket().on('listening', () => {
        resolve(undefined);
      });
    });
  });

  afterEach(async () => {
    await server.stop();
    jest.resetAllMocks();
  });

  it('should start server', () => {
    expect(server).toBeDefined();
  });

  it('should accept connections and increment clientCounter', async () => {
    const clientSocket = net.createConnection({ host: IP_ADDRESS, port: PORT });

    await new Promise((resolve) => {
      clientSocket.on('connect', () => {
        resolve(undefined);
      });
    });

    expect(server.getClientsCounter()).toEqual(1);

    const clientSocket2 = net.createConnection({
      host: IP_ADDRESS,
      port: PORT,
    });

    await new Promise((resolve) => {
      clientSocket2.on('connect', () => {
        resolve(undefined);
      });
    });

    expect(server.getClientsCounter()).toEqual(2);
    clientSocket.end();
    clientSocket2.end();
  });

  it('should detect client disconnection and decrement clientCounter', async () => {
    const clientSocket = net.createConnection({ host: IP_ADDRESS, port: PORT });
    await new Promise((resolve) => {
      clientSocket.on('connect', () => {
        resolve(undefined);
      });
    });

    expect(server.getClientsCounter()).toEqual(1);

    clientSocket.end();

    await new Promise((resolve) => {
      clientSocket.on('end', () => {
        resolve(undefined);
      });
    });

    expect(server.getClientsCounter()).toEqual(0);
  });

  it('should handle received data and send it back to the client', async () => {
    const clientSocket = net.createConnection({ host: IP_ADDRESS, port: PORT });
    let connectPromise = await new Promise((resolve, reject) => {
      clientSocket.on('connect', () => {
        resolve('Connected');
      });

      clientSocket.on('error', (err) => {
        reject(err);
      });
    });

    expect(connectPromise).toEqual('Connected');

    const sentData = 'Hello';
    const expectedResponse = sentData;

    clientSocket.write(sentData);

    connectPromise = await new Promise((resolve) => {
      clientSocket.on('data', (data) => {
        resolve(data.toString());
      });
    });

    expect(connectPromise).toEqual(expectedResponse);
    clientSocket.end();
  });
});

describe('TCPServer Stop', () => {
  const PORT = 3001;
  const webContents = {} as WebContents;
  const server = new TCPServer(PORT, webContents);

  it('should stop server and log "Server Stop"', async () => {
    const logSpy = jest.spyOn(log, 'info').mockImplementation();

    server.stop();

    await new Promise((resolve) => {
      server.getSocket().on('close', () => {
        resolve(undefined);
      });
    });

    expect(server.getClientsCounter()).toEqual(0);
    expect(logSpy).toHaveBeenCalledWith('Server stopped');

    logSpy.mockRestore();
  });
});
