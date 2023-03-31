import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:nexus/utils.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp])
      .then((_) {
    runApp(const MainApp());
  });
}

class MainApp extends StatelessWidget {
  const MainApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nexus',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  late QRViewController qrController;
  String ipAddress = '';
  late Socket socket;
  bool isConnected = false;

  @override
  void dispose() {
    qrController.dispose();
    if (isConnected) {
      socket.destroy();
    }
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    qrController = controller;

    controller.scannedDataStream.listen((scanData) {
      setState(() {
        ipAddress = scanData.code ?? '';
      });
      if (ipAddress.isNotEmpty) {
        controller.pauseCamera();
        connectToServer(ipAddress);
      }
    });
  }

  void connectToServer(ip) async {
    try {
      socket = await Socket.connect(ip, 2121);
      isConnected = true;
      setState(() {});
      socket.listen(
        (data) {
          final message = utf8.decode(data).trim();
          print("Received message: $message");
        },
        onError: (error) {
          print("Error while receiving data: $error");
        },
        onDone: () {
          print("Connection closed by server");
          socket.destroy();
          isConnected = false;
          qrController.resumeCamera();
          ipAddress = '';
          setState(() {});
        },
      );
    } on SocketException catch (e) {
      print('Failed to connect to $ip with error: $e');
      isConnected = false;
      qrController.resumeCamera();
      ipAddress = '';
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nexus'),
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 5,
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Text(
            ipAddress.isNotEmpty
                ? 'Connecting to $ipAddress...'
                : 'Scan a QR code to connect to the server',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 20,
          ),
          Visibility(
            visible: isConnected,
            child: ElevatedButton(
              onPressed: () {
                socket.write('Hello, server!');
              },
              child: const Text('Send message to server'),
            ),
          ),
        ],
      ),
    );
  }
}
