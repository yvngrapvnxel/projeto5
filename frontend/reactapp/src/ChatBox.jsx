import React, {useEffect, useRef, useState} from 'react';
import useUserStore from './stores/userStore';
import useChatStore from './stores/chatStore';
import { API_URL } from './config';
import './Global.css';

function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const senderID = useUserStore((state) => state.user.id);
    const {messages, addMessage, setMessages} = useChatStore();

    const [receiver, setReceiver] = useState('');
    const [inputText, setInputText] = useState('');
    const [usersList, setUsersList] = useState([]);

    const socketRef = useRef(null);

    // fetch users list
    useEffect(() => {
        fetch(`${API_URL}/chat/users/${senderID}`, {
            headers: { token: localStorage.getItem('token') }
        })
            .then(res => res.json())
            .then(data => {
                setUsersList(data);
            })
            .catch(err => console.error("Failed to load users", err));
    }, [senderID]);

    // fetch chat history when receiver changes
    useEffect(() => {
        if (!receiver || !senderID) return;

        fetch(`${API_URL}/chat/history/${receiver}`, {
            headers: {
                token: localStorage.getItem('token')
            }
        })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Failed to fetch history.");
            })
            .then(data => {
                // load DB history into store
                setMessages(data);
            })
            .catch(err => console.error("Error loading chat history:", err));

    }, [receiver, senderID, setMessages]);

    useEffect(() => {
        if (!senderID) return;

        const WS_BASE = API_URL.replace('http://', 'ws://').replace('https://', 'wss://').replace('/rest', '');
        const socket = new WebSocket(`${WS_BASE}/chat/${senderID}`);
        socketRef.current = socket;

        socket.onopen = () => console.log("Connected to Chat.");

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                addMessage({
                    sender: data.sender,
                    receiver: senderID,
                    text: data.text
                });
            } catch (error) {
                console.error("Received non-JSON message: ", event.data);
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

        const receiverNum = parseInt(receiver, 10);
        const messagePayload = { receiver: receiverNum, text: inputText };

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(messagePayload));

            addMessage({ sender: senderID, receiver: receiverNum, text: inputText });
            setInputText('');
        }
    };


    const activeConversation = messages.filter(msg =>
        (msg.sender === senderID && msg.receiver === parseInt(receiver, 10)) ||
        (msg.sender === parseInt(receiver, 10) && msg.receiver === senderID)
    );

    return (
        <div className="chat-widget-container">
            <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-chat-dots-fill"></i>}
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h4>Live Chat</h4>
                    </div>

                    <div className="chat-receiver-input">
                        <select
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                        >
                            <option value="" disabled>Select user to message</option>
                            {usersList.map(user => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </select>
                    </div>

                    {/* ONLY show chat history if a receiver is selected */}
                    {receiver ? (
                        <>
                            <div className="chat-history">
                                {activeConversation.length === 0 ? (
                                    <p className="no-messages">No messages yet.</p>
                                ) : (
                                    activeConversation.map((msg, index) => (
                                        <div key={index} className={`chat-bubble ${msg.sender === senderID ? 'sent' : 'received'}`}>
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
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <p>Please select a user to start chatting.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ChatBox;