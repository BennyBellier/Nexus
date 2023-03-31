import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'dart:io';

class NexusSocket {
  late Socket socket;
  late String serverAddress;
  bool isConnected = false;

  NexusSocket({required this.serverAddress});

  Future<void> connect() async {
    try {
      socket = await Socket.connect(serverAddress, 2121);

      isConnected = true;
      socket.listen(
        (data) {
          final message = String.fromCharCodes(data).trim();
          print("Received message: $message");
          // traiter le message reçu ici
        },
        onError: (error) {
          print("Error while receiving data: $error");
        },
        onDone: () {
          print("Connection closed by server");
          socket.destroy();
        },
      );
    } on SocketException catch (e) {
      print('Failed to connect to $serverAddress with error: $e');
      isConnected = false;
    }
  }

  void disconnect() {
    socket.destroy();
    isConnected = false;
  }

  void send(String message) {
    socket.write(message);
  }
}
