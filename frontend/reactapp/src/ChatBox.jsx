import React, {useEffect, useRef, useState} from 'react';
import { API_URL } from "./config";
import useUserStore from './stores/userStore';
import useChatStore from './stores/chatStore';
import './Global.css';

function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const senderID = useUserStore((state) => state.user.id);
    const {messages, addMessage} = useChatStore();

    const [receiver, setReceiver] = useState('');
    const [inputText, setInputText] = useState('');

    // NEW: State to hold the list of users for the dropdown
    const [usersList, setUsersList] = useState([]);

    const socketRef = useRef(null);

    const urlUsers = `${API_URL}/admin/users/all`;

    useEffect(() => {
        fetch(`${urlUsers}`, {
            headers: {
                token: localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(data => {
                const otherUsers = data.filter(u => u.id !== senderID);
                setUsersList(otherUsers);
            })
            .catch(err => console.error("Failed to load users for chat", err));
    }, [senderID, urlUsers]);

    useEffect(() => {
        if (!senderID) return;

        const socket = new WebSocket(`ws://localhost:8080/chat/${senderID}`);
        socketRef.current = socket;

        socket.onopen = () => console.log("Connected to Chat.");

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
                socket.addEventListener('open', () => socket.close());
            } else {
                socket.close();
            }
        };
    }, [senderID, addMessage]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText || !receiver) return;

        const messagePayload = {
            // FIX: Convert the receiver to a number so the Java backend doesn't crash
            receiver: parseInt(receiver, 10),
            text: inputText
        };

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(messagePayload));

            addMessage({sender: senderID, text: inputText});
            setInputText('');
        }
    };

    return (
        <div className="chat-widget-container">
            <button
                className="chat-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-chat-dots-fill"></i>}
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h4>Live Chat</h4>
                    </div>

                    <div className="chat-receiver-input">
                        {/* FIX: Replaced input with select dropdown */}
                        <select
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select user to message</option>
                            {usersList.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
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