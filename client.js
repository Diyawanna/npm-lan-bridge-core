class LANBridge {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.isConnected = false;
        this.messageHandlers = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.serverUrl);

                this.ws.onopen = () => {
                    console.log('Connected to LAN Bridge server');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (e) {
                        console.error('Failed to parse message:', e);
                    }
                };

                this.ws.onclose = () => {
                    console.log('Disconnected from LAN Bridge server');
                    this.isConnected = false;
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect().catch(() => {
                    // Reconnection failed, will try again
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    sendText(text) {
        if (!this.isConnected) {
            console.error('Not connected to server');
            return false;
        }

        const message = {
            type: 'text',
            payload: text,
            timestamp: Date.now()
        };

        this.ws.send(JSON.stringify(message));
        return true;
    }

    sendFile(file) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Not connected to server'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result.split(',')[1]; // Remove data:type;base64, prefix
                const message = {
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    name: file.name,
                    payload: base64Data,
                    timestamp: Date.now()
                };

                this.ws.send(JSON.stringify(message));
                resolve();
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    }

    onMessage(type, handler) {
        if (!this.messageHandlers[type]) {
            this.messageHandlers[type] = [];
        }
        this.messageHandlers[type].push(handler);
    }

    handleMessage(message) {
        const handlers = this.messageHandlers[message.type];
        if (handlers) {
            handlers.forEach(handler => handler(message));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LANBridge;
} else if (typeof window !== 'undefined') {
    window.LANBridge = LANBridge;
}

