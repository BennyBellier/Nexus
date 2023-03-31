import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';


void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp])
      .then((_) {
    runApp(const MyApp());
  });
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

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
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  late QRViewController qrController;
  late String ipAddress;
  late Socket socket;
  bool isConnected = false;

  @override
  void dispose() {
    qrController.dispose();
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    setState(() {
      qrController = controller;
    });

    controller.scannedDataStream.listen((scanData) async {
      if (socket != null) {
        controller.pauseCamera();
      }
      setState(() {
        ipAddress = scanData.code ?? "";
        connectToServer(ipAddress);
      });
    });
  }

  Future<void> connectToServer(String ipAddress) async {
    try {
      print('Connecting to $ipAddress');
      socket = await Socket.connect(ipAddress, 2121);
      print('Connected to $ipAddress');
      setState(() {
        isConnected = true;
      });
    } on SocketException catch (_) {
      setState(() {
        isConnected = false;
      });
    }
  }

  void _sendMessage() {
    if (isConnected) {
      socket.write('Hello from Flutter!');
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
          const SizedBox(height: 20),
          Expanded(
            flex: 1,
            child: Center(
              child: Text(
                isConnected ? 'Connected' : 'Not Connected',
                style: Theme.of(context).textTheme.headline6,
              ),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _sendMessage,
            child: const Text('Send Message'),
          ),
        ],
      ),
    );
  }
}
