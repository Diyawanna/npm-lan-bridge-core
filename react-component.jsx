import React, { useState, useEffect, useRef } from 'react';

const LANBridgeComponent = ({ serverUrl = 'ws://localhost:8080' }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [textInput, setTextInput] = useState('');
    const bridgeRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Import the LANBridge client
        const script = document.createElement('script');
        script.src = '/client.js'; // Assuming client.js is served from public folder
        script.onload = () => {
            bridgeRef.current = new window.LANBridge(serverUrl);
            
            // Set up message handlers
            bridgeRef.current.onMessage('text', (message) => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'text',
                    content: message.payload,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            });

            bridgeRef.current.onMessage('image', (message) => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'image',
                    content: message.name,
                    path: message.path,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            });

            bridgeRef.current.onMessage('file', (message) => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'file',
                    content: message.name,
                    path: message.path,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            });

            // Connect to server
            bridgeRef.current.connect()
                .then(() => setIsConnected(true))
                .catch(err => console.error('Connection failed:', err));
        };
        document.head.appendChild(script);

        return () => {
            if (bridgeRef.current) {
                bridgeRef.current.disconnect();
            }
            document.head.removeChild(script);
        };
    }, [serverUrl]);

    const sendText = () => {
        if (textInput.trim() && bridgeRef.current) {
            bridgeRef.current.sendText(textInput);
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'text',
                content: textInput,
                timestamp: new Date().toLocaleTimeString(),
                sent: true
            }]);
            setTextInput('');
        }
    };

    const sendFile = (event) => {
        const file = event.target.files[0];
        if (file && bridgeRef.current) {
            bridgeRef.current.sendFile(file)
                .then(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        type: file.type.startsWith('image/') ? 'image' : 'file',
                        content: file.name,
                        timestamp: new Date().toLocaleTimeString(),
                        sent: true
                    }]);
                })
                .catch(err => console.error('File send failed:', err));
        }
        event.target.value = ''; // Reset file input
    };

    return (
        <div className="lan-bridge-core-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div className="connection-status" style={{ 
                padding: '10px', 
                borderRadius: '5px', 
                marginBottom: '20px',
                backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
                color: isConnected ? '#155724' : '#721c24'
            }}>
                Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>

            <div className="input-section" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter text message..."
                        style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        onKeyPress={(e) => e.key === 'Enter' && sendText()}
                    />
                    <button 
                        onClick={sendText}
                        disabled={!isConnected}
                        style={{ 
                            padding: '10px 20px', 
                            borderRadius: '5px', 
                            border: 'none', 
                            backgroundColor: '#007bff', 
                            color: 'white',
                            cursor: isConnected ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Send Text
                    </button>
                </div>
                
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={sendFile}
                        style={{ display: 'none' }}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!isConnected}
                        style={{ 
                            padding: '10px 20px', 
                            borderRadius: '5px', 
                            border: 'none', 
                            backgroundColor: '#28a745', 
                            color: 'white',
                            cursor: isConnected ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Send File/Image
                    </button>
                </div>
            </div>

            <div className="messages-section">
                <h3>Messages</h3>
                <div style={{ 
                    height: '400px', 
                    overflowY: 'auto', 
                    border: '1px solid #ccc', 
                    borderRadius: '5px', 
                    padding: '10px' 
                }}>
                    {messages.map(message => (
                        <div 
                            key={message.id} 
                            style={{ 
                                marginBottom: '10px', 
                                padding: '10px', 
                                borderRadius: '5px',
                                backgroundColor: message.sent ? '#e3f2fd' : '#f5f5f5',
                                textAlign: message.sent ? 'right' : 'left'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
                                {message.sent ? 'Sent' : 'Received'} - {message.timestamp}
                            </div>
                            <div style={{ marginTop: '5px' }}>
                                {message.type === 'text' && <span>{message.content}</span>}
                                {message.type === 'image' && (
                                    <div>
                                        <span>Image: {message.content}</span>
                                        {message.path && <img src={message.path} alt={message.content} style={{ maxWidth: '200px', display: 'block', marginTop: '5px' }} />}
                                    </div>
                                )}
                                {message.type === 'file' && (
                                    <div>
                                        <span>File: {message.content}</span>
                                        {message.path && <a href={message.path} download style={{ display: 'block', marginTop: '5px' }}>Download</a>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LANBridgeComponent;

