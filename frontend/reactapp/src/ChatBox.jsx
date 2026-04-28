import React, {useEffect, useRef, useState} from 'react';
import useUserStore from './stores/userStore';
import useChatStore from './stores/chatStore';
import {API_URL} from './config';
import './Global.css';

function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);

    // View States: 'LIST' (shows all users) or 'CHAT' (active conversation)
    const [view, setView] = useState('LIST');
    const [searchQuery, setSearchQuery] = useState('');

    const senderID = useUserStore((state) => state.user.id);
    const { messages, addMessage, setMessages, markMessagesAsReadByReceiver } = useChatStore();

    const [receiver, setReceiver] = useState(null); // Now stores the entire user object {id, username}
    const [inputText, setInputText] = useState('');
    const [usersList, setUsersList] = useState([]);

    const socketRef = useRef(null);

    const formatTimestamp = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const today = new Date();

        const isToday = date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        // Format options
        const timeOptions = {hour: '2-digit', minute: '2-digit'};

        if (isToday) {
            return date.toLocaleTimeString([], timeOptions); // e.g., "14:30"
        } else {
            // e.g., "12/05/2026 14:30" (Format depends on user locale)
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], timeOptions)}`;
        }
    };

    // Fetch users list (Acts as your 'Conversations' list)
    useEffect(() => {
        fetch(`${API_URL}/chat/users/${senderID}`, {
            headers: {token: localStorage.getItem('token')}
        })
            .then(res => res.json())
            .then(data => setUsersList(data))
            .catch(err => console.error("Failed to load users", err));
    }, [senderID]);

    // Fetch chat history when the receiver changes
    useEffect(() => {
        if (!receiver || !senderID) return;

        fetch(`${API_URL}/chat/history/${receiver.id}`, {
            headers: {token: localStorage.getItem('token')}
        })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Failed to fetch history.");
            })
            .then(data => {
                console.log("CHAT HISTORY FROM BACKEND:", data);
                setMessages(data);
            })
            .catch(err => console.error("Error loading chat history:", err));

    }, [receiver, senderID, setMessages]);

    // WebSocket connection logic
    useEffect(() => {
        if (!senderID) return;

        const WS_BASE = API_URL.replace('http://', 'ws://').replace('https://', 'wss://').replace('/rest', '');
        const socket = new WebSocket(`${WS_BASE}/chat/${senderID}`);
        socketRef.current = socket;

        socket.onopen = () => console.log("Connected to Chat.");

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WebSocket received:", data);

                if (data.type === 'READ') {
                    useChatStore.getState().markMessagesAsReadByReceiver(data.readerId);
                } else {
                    useChatStore.getState().addMessage({
                        sender: data.sender,
                        receiver: senderID,
                        text: data.text,
                        timestamp: data.timestamp || new Date().toISOString(),
                        isRead: false
                    });
                }
            } catch (error) {
                console.error("Received non-JSON message: ", event.data);
            }
        };

        return () => {
            if (socket.readyState === 1 || socket.readyState === 0) {
                socket.close();
            }
        };
    }, [senderID]);

    useEffect(() => {
        if (receiver && senderID) {
            fetch(`${API_URL}/chat/read/${receiver.id}`, {
                method: 'PUT',
                headers: { token: localStorage.getItem('token') }
            }).catch(err => console.error("Failed to mark messages as read", err));

            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                const readPayload = { type: "READ", receiver: receiver.id };
                console.log("Sending READ via WebSocket:", readPayload);
                socketRef.current.send(JSON.stringify(readPayload));
            } else {
                console.warn("WebSocket not open yet, skipped sending real-time read receipt.");
            }
        }
    }, [receiver, senderID]);

    useEffect(() => {
        if (!receiver || !senderID) return;

        // Tell DB we read their past messages
        fetch(`${API_URL}/chat/read/${receiver.id}`, {
            method: 'PUT',
            headers: { token: localStorage.getItem('token') }
        }).catch(err => console.error("Failed to update DB read status", err));

        // Tell WebSocket we read their past messages
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "READ", receiver: receiver.id }));
        }
    }, [receiver, senderID]); // Only runs when you click a user from the list

    // 3. INSTANT AUTO-READ WHEN CHAT IS ALREADY OPEN
    useEffect(() => {
        if (!receiver || !senderID || messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];

        // If a new message pops up from the person we are CURRENTLY staring at, and it's unread
        if (lastMsg.sender === receiver.id && !lastMsg.isRead) {

            // Mark it locally immediately to prevent infinite loops
            useChatStore.getState().markMessagesAsReadByMe(receiver.id);

            // Send WS receipt so THEIR screen instantly updates to double-blue checkmarks
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "READ", receiver: receiver.id }));
            }

            // Update DB for this new message
            fetch(`${API_URL}/chat/read/${receiver.id}`, {
                method: 'PUT',
                headers: { token: localStorage.getItem('token') }
            });
        }
    }, [messages, receiver, senderID]); // Runs whenever the messages array updates

    useEffect(() => {
        if (receiver && senderID && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];

            // If the last message is from the person we are currently chatting with, and it's unread
            if (lastMsg.sender === receiver.id && !lastMsg.read) {
                // Instantly notify them we read it
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({
                        type: "READ",
                        receiver: receiver.id
                    }));
                }
            }
        }
    }, [messages, receiver, senderID]);

    // Send a message
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !receiver) return;

        const currentTimestamp = new Date().toISOString();

        const messagePayload = {receiver: receiver.id, text: inputText, timestamp: currentTimestamp};

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(messagePayload));

            addMessage({sender: senderID, receiver: receiver.id, text: inputText, timestamp: currentTimestamp});
            setInputText('');
        }
    };

    // Navigation handlers
    const openChat = (user) => {
        setReceiver(user);
        setView('CHAT');
    };

    const goBackToList = () => {
        setView('LIST');
        setReceiver(null);
    };

    // Filtered users for the search bar
    const filteredUsers = usersList.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Active conversation filter
    const activeConversation = receiver ? messages.filter(msg =>
        (msg.sender === senderID && msg.receiver === receiver.id) ||
        (msg.sender === receiver.id && msg.receiver === senderID)
    ) : [];

    return (
        <div className="chat-widget-container">
            <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-chat-dots-fill"></i>}
            </button>

            {isOpen && (
                <div className="chat-window">
                    {view === 'LIST' ? (
                        <>
                            {/* --- LIST VIEW --- */}
                            <div className="chat-header">
                                <h4>Chats</h4>
                            </div>

                            <div className="chat-search">
                                <div className="search-input-wrapper">
                                    <i className="bi bi-search search-icon"></i>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="chat-user-list">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <div key={user.id} className="chat-user-item" onClick={() => openChat(user)}>
                                            <div className="chat-user-avatar">
                                                <img
                                                    src={user.photoUrl ? user.photoUrl : "/default-user.png"}
                                                    alt={`${user.username}`}
                                                    className="chat-avatar-img"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "/default-user.png"; }}
                                                />
                                            </div>
                                            <div className="chat-user-info">
                                                <h5>{user.username}</h5>
                                                <span className="chat-user-status">Click to chat</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-users">No users found.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* --- ACTIVE CHAT VIEW --- */}
                            <div className="chat-header chat-header-active">
                                <button className="chat-back-btn" onClick={goBackToList}>
                                    <i className="bi bi-arrow-left"></i>
                                </button>
                                <div className="chat-header-user">
                                    <div className="chat-header-avatar-small">
                                        <img
                                            src={receiver.photoUrl ? receiver.photoUrl : "/default-user.png"}
                                            alt={`${receiver.username}`}
                                            className="chat-avatar-img"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <h4>{receiver.username}</h4>
                                </div>
                                <div style={{width: '24px'}}></div>
                            </div>

                            <div className="chat-history">
                                {activeConversation.length === 0 ? (
                                    <p className="no-messages">No messages yet. Say hi!</p>
                                ) : (
                                    activeConversation.map((msg, index) => (
                                        <div key={index} className={`chat-message-wrapper ${msg.sender === senderID ? 'sent' : 'received'}`}>
                                            <div className="chat-bubble">
                                                <p>{msg.text}</p>
                                            </div>
                                            <div className="chat-meta">
                                                <span className="chat-timestamp">{formatTimestamp(msg.timestamp)}</span>

                                                {msg.sender === senderID && (
                                                    <span className={`chat-read-status ${msg.read ? 'read' : 'sent'}`}>
                                                        {msg.read ? (
                                                            <i className="bi bi-check-all"></i>
                                                        ) : (
                                                            <i className="bi bi-check"></i>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
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
                                    autoFocus
                                />
                                <button type="submit" disabled={!inputText.trim()}>
                                    <i className="bi bi-send-fill"></i>
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default ChatBox;