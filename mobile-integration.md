# Mobile App Integration Guide for @diyawanna/lan-bridge

## Overview

This document outlines how mobile applications can integrate with the `@diyawanna/lan-bridge` WebSocket server to enable bi-directional communication with web applications on the same local network.

## Mobile App Architecture

### Connection Strategy

Mobile applications should connect to the WebSocket server using the network IP address of the host machine running the server. The connection URL format is:

```
ws://[HOST_IP]:8080
```

Where `[HOST_IP]` is the local network IP address of the machine running the LAN Bridge server.

### Message Protocol

The mobile app should send and receive messages in the following JSON format:

#### Text Messages
```json
{
  "type": "text",
  "payload": "Your message content here",
  "timestamp": 1640995200000
}
```

#### File/Image Messages
```json
{
  "type": "image", // or "file"
  "name": "filename.jpg",
  "payload": "base64_encoded_file_data",
  "timestamp": 1640995200000
}
```

## Platform-Specific Implementation

### React Native

For React Native applications, you can use the built-in WebSocket support:

```javascript
const ws = new WebSocket('ws://192.168.1.100:8080');

ws.onopen = () => {
  console.log('Connected to LAN Bridge');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle received message
};

// Send text message
const sendText = (text) => {
  ws.send(JSON.stringify({
    type: 'text',
    payload: text,
    timestamp: Date.now()
  }));
};
```

### Flutter

For Flutter applications, use the `web_socket_channel` package:

```dart
import 'package:web_socket_channel/web_socket_channel.dart';

final channel = WebSocketChannel.connect(
  Uri.parse('ws://192.168.1.100:8080'),
);

// Send message
channel.sink.add(jsonEncode({
  'type': 'text',
  'payload': 'Hello from Flutter',
  'timestamp': DateTime.now().millisecondsSinceEpoch,
}));

// Listen for messages
channel.stream.listen((message) {
  final data = jsonDecode(message);
  // Handle received message
});
```

### Native iOS (Swift)

```swift
import Foundation

class LANBridgeClient: NSObject, URLSessionWebSocketDelegate {
    private var webSocketTask: URLSessionWebSocketTask?
    private let urlSession = URLSession(configuration: .default)
    
    func connect() {
        let url = URL(string: "ws://192.168.1.100:8080")!
        webSocketTask = urlSession.webSocketTask(with: url)
        webSocketTask?.delegate = self
        webSocketTask?.resume()
        receiveMessage()
    }
    
    func sendText(_ text: String) {
        let message = [
            "type": "text",
            "payload": text,
            "timestamp": Int(Date().timeIntervalSince1970 * 1000)
        ]
        
        if let data = try? JSONSerialization.data(withJSONObject: message),
           let jsonString = String(data: data, encoding: .utf8) {
            webSocketTask?.send(.string(jsonString)) { error in
                if let error = error {
                    print("Send error: \\(error)")
                }
            }
        }
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    // Handle received message
                    print("Received: \\(text)")
                case .data(let data):
                    // Handle binary data if needed
                    break
                @unknown default:
                    break
                }
                self?.receiveMessage() // Continue listening
            case .failure(let error):
                print("Receive error: \\(error)")
            }
        }
    }
}
```

### Native Android (Kotlin)

```kotlin
import okhttp3.*
import okio.ByteString
import org.json.JSONObject

class LANBridgeClient : WebSocketListener() {
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient()
    
    fun connect() {
        val request = Request.Builder()
            .url("ws://192.168.1.100:8080")
            .build()
        webSocket = client.newWebSocket(request, this)
    }
    
    fun sendText(text: String) {
        val message = JSONObject().apply {
            put("type", "text")
            put("payload", text)
            put("timestamp", System.currentTimeMillis())
        }
        webSocket?.send(message.toString())
    }
    
    override fun onMessage(webSocket: WebSocket, text: String) {
        // Handle received message
        val message = JSONObject(text)
        // Process message based on type
    }
    
    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        // Handle connection failure
    }
}
```

## File Handling in Mobile Apps

### Image/File Selection and Encoding

Mobile apps need to convert selected files to base64 format before sending:

#### React Native Example
```javascript
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

const selectAndSendFile = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    
    const base64Data = await RNFS.readFile(result.uri, 'base64');
    
    ws.send(JSON.stringify({
      type: result.type.startsWith('image/') ? 'image' : 'file',
      name: result.name,
      payload: base64Data,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('File selection error:', err);
  }
};
```

## Network Discovery

Mobile apps should implement network discovery to automatically find the LAN Bridge server:

### IP Range Scanning
```javascript
const scanForServer = async () => {
  const baseIP = '192.168.1.'; // Adjust based on network
  const promises = [];
  
  for (let i = 1; i <= 254; i++) {
    const ip = baseIP + i;
    promises.push(testConnection(ip));
  }
  
  const results = await Promise.allSettled(promises);
  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

const testConnection = (ip) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${ip}:8080`);
    const timeout = setTimeout(() => {
      ws.close();
      reject();
    }, 1000);
    
    ws.onopen = () => {
      clearTimeout(timeout);
      ws.close();
      resolve(ip);
    };
    
    ws.onerror = () => {
      clearTimeout(timeout);
      reject();
    };
  });
};
```

## Security Considerations

### Local Network Only
- The LAN Bridge server should only accept connections from the local network
- Implement IP address validation to prevent external access
- Consider adding authentication tokens for additional security

### Data Validation
- Always validate incoming message format
- Implement file size limits
- Sanitize file names to prevent path traversal attacks

## Error Handling

Mobile apps should implement robust error handling:

```javascript
class MobileLANBridge {
  constructor(serverIP) {
    this.serverIP = serverIP;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://${this.serverIP}:8080`);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onerror = (error) => {
        reject(error);
      };
      
      this.ws.onclose = () => {
        this.attemptReconnect();
      };
    });
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(() => {
          // Will try again
        });
      }, 1000 * this.reconnectAttempts);
    }
  }
}
```

## Testing Mobile Integration

### Development Setup
1. Ensure your mobile device and development machine are on the same network
2. Start the LAN Bridge server on your development machine
3. Note the IP address shown in the terminal
4. Configure your mobile app to connect to that IP address
5. Test message exchange between web and mobile clients

### Debugging Tips
- Use network monitoring tools to verify WebSocket connections
- Implement comprehensive logging in mobile apps
- Test with different file types and sizes
- Verify behavior during network interruptions

