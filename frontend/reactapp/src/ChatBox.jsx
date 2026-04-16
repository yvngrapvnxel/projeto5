import React, {useEffect, useRef, useState} from 'react';
import useUserStore from './stores/userStore';
import useChatStore from './stores/chatStore';
import './Global.css';

function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const senderID = useUserStore((state) => state.user.id);
    const {messages, addMessage} = useChatStore();

    const [receiver, setReceiver] = useState('');
    const [inputText, setInputText] = useState('');

    // We use a ref to hold the websocket so we can use it to send messages outside of useEffect
    const socketRef = useRef(null);

    useEffect(() => {
        if (!senderID) return;

        // Connect to the CHAT endpoint (make sure port/path matches your backend)
        const socket = new WebSocket(`ws://localhost:8080/chat/${senderID}`);
        socketRef.current = socket;

        socket.onopen = () => console.log("Connected to Chat.");

        // When we RECEIVE a message from someone else
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                addMessage(data);
            } catch (error) {
                console.error("Received non-JSON message from WebSocket: ", event.data);
            }
        };

        return () => {
            if (socket.readyState === WebSocket.CONNECTING) {
                // If it's still connecting, wait for it to open, then close it safely
                socket.addEventListener('open', () => socket.close());
            } else {
                // Otherwise, close it normally
                socket.close();
            }
        };
    }, [senderID, addMessage]);

    // Handle clicking the "Send" button
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText || !receiver) return;

        // 1. Build the JSON object the Backend is expecting
        const messagePayload = {
            receiver: receiver,
            text: inputText
        };

        // 2. Send it over the WebSocket to the backend
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(messagePayload));

            // 3. Add our own message to the screen locally so we can see what we typed
            addMessage({sender: senderID, text: inputText});
            setInputText('');
        }
    };

    return (
        <div className="chat-widget-container">
            {/* 1. The floating button to open/close chat */}
            <button
                className="chat-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-chat-dots-fill"></i>}
            </button>

            {/* 2. The actual chat window (only visible if isOpen is true) */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h4>Live Chat</h4>
                    </div>

                    <div className="chat-receiver-input">
                        <input
                            type="text"
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                            placeholder="Who are you texting? (username)"
                        />
                    </div>

                    <div className="chat-history">
                        {messages.length === 0 ? (
                            <p className="no-messages">No messages yet.</p>
                        ) : (
                            messages?.map((msg, index) => (
                                <div key={index} className={`chat-bubble ${msg.sender === senderID ? 'sent' : 'received'}`}>
                                    <span className="sender-name">{msg.sender}</span>
                                    <p>{msg.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSend} className="chat-input-area">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit"><i className="bi bi-send-fill"></i></button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ChatBox;