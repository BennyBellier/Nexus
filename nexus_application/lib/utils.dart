import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'dart:io';

class QRCodeScannerScreen extends StatefulWidget {
  @override
  _QRCodeScannerScreenState createState() => _QRCodeScannerScreenState();
}

class _QRCodeScannerScreenState extends State<QRCodeScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  late QRViewController controller;
  String? serverAddress = '';

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Scan Qr code'),
        ),
        body: Stack(
          children: [
            QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
            ),
            const Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Scan the QR code to connect to the server',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                  ),
                ))
          ],
        ));
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      setState(() {
        serverAddress = scanData.code;
      });
      controller.pauseCamera();
    });
  }
}

Socket? socket;

void createConnection(String ip, int port) {
  Socket.connect(ip, port).then((s) {
    socket = s;
    socket?.listen((data) {
      String message = String.fromCharCodes(data).trim();
      print('Received message: $message');
    },
    onError: (error) {
      print('Error: $error');
      socket?.destroy();
    },
    onDone: () {
      print('Connection closed');
      socket?.destroy();
    },
    );
  }).catchError((error) {
    print('Error: $error');
  });
}

void checkConnection() {
  if (socket == null)
    return;

  socket?.write('Hello, server!');
  socket?.done.then((_) {
    print('Connection is alive');
  }).catchError((error) {
    print('Connection is lost: $error');
    socket?.destroy();
  });
}

void sendMessage(String message) {
  if (socket == null)
    return;

  socket?.write(message);
}

@override
void dispose() {
  socket?.destroy();
  // super.dispose();
}
