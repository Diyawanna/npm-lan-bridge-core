const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server started on port 8080');

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log('Received message:', parsedMessage);

            switch (parsedMessage.type) {
                case 'text':
                    // Broadcast text message to all connected clients
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'text', payload: parsedMessage.payload }));
                        }
                    });
                    break;
                case 'image':
                case 'file':
                    // For image/file, save to a temporary location and then broadcast path or data
                    const fileName = `received_${Date.now()}_${parsedMessage.name}`;
                    const filePath = path.join(__dirname, 'uploads', fileName);

                    // Ensure uploads directory exists
                    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
                        fs.mkdirSync(path.join(__dirname, 'uploads'));
                    }

                    fs.writeFile(filePath, Buffer.from(parsedMessage.payload, 'base64'), (err) => {
                        if (err) {
                            console.error('Failed to save file:', err);
                            ws.send(JSON.stringify({ type: 'error', payload: 'Failed to save file' }));
                            return;
                        }
                        console.log(`File saved: ${filePath}`);
                        // Broadcast file info to all connected clients (excluding sender)
                        wss.clients.forEach(client => {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: parsedMessage.type, name: fileName, path: `/uploads/${fileName}` }));
                            }
                        });
                    });
                    break;
                default:
                    console.log('Unknown message type:', parsedMessage.type);
                    ws.send(JSON.stringify({ type: 'error', payload: 'Unknown message type' }));
            }
        } catch (e) {
            console.error('Failed to parse message or invalid message format:', e);
            ws.send(JSON.stringify({ type: 'error', payload: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});


