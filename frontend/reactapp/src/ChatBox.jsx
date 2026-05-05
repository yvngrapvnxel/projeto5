import React, { useEffect, useRef, useState } from 'react';
import useUserStore from './stores/userStore';
import useChatStore from './stores/chatStore';
import { API_URL } from './config';
import { useTranslation } from 'react-i18next';
import './Global.css';

function ChatBox() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('LIST');
    const [searchQuery, setSearchQuery] = useState('');
    const [receiver, setReceiver] = useState(null);
    const [inputText, setInputText] = useState('');
    const [usersList, setUsersList] = useState([]);

    const senderID = useUserStore((state) => state.user.id);
    const { messages, addMessage, setMessages } = useChatStore();
    const socketRef = useRef(null);

    // Guards against processing the same incoming message twice in rapid succession
    const lastProcessedMessageRef = useRef(null);

    const formatTimestamp = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        return isToday
            ? date.toLocaleTimeString([], timeOptions)
            : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], timeOptions)}`;
    };

    useEffect(() => {
        if (!senderID) return;
        fetch(`${API_URL}/chat/users/${senderID}`, {
            headers: { token: localStorage.getItem('token') }
        })
            .then(res => res.json())
            .then(data => setUsersList(data))
            .catch(err => console.error("Failed to load users", err));
    }, [senderID]);

    useEffect(() => {
        if (!senderID) return;

        // Derive the WS URL from the REST API URL by swapping protocol and removing /rest
        const WS_BASE = API_URL.replace('http://', 'ws://').replace('https://', 'wss://').replace('/rest', '');
        const socket = new WebSocket(`${WS_BASE}/chat/${senderID}`);
        socketRef.current = socket;

        socket.onopen = () => console.log("Connected to Chat.");
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'READ') {
                    useChatStore.getState().markMessagesAsReadByReceiver(data.readerId);
                } else {
                    addMessage({
                        sender: data.sender,
                        receiver: senderID,
                        text: data.text,
                        timestamp: data.timestamp || new Date().toISOString(),
                        read: false
                    });
                }
            } catch (error) {
                console.error("Socket error:", error);
            }
        };

        return () => socket.close();
    }, [senderID, addMessage]);

    useEffect(() => {
        if (!receiver || !senderID) return;

        // When opening a chat: load history, mark as read in DB, and send a WS read receipt
        fetch(`${API_URL}/chat/history/${receiver.id}`, {
            headers: { token: localStorage.getItem('token') }
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => setMessages(data))
            .catch(err => console.error("Error loading history:", err));

        fetch(`${API_URL}/chat/read/${receiver.id}`, {
            method: 'PUT',
            headers: { token: localStorage.getItem('token') }
        }).catch(err => console.error("Failed to mark read in DB", err));

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "READ", receiver: receiver.id }));
        }
    }, [receiver, senderID, setMessages]);

    // TODO EM VEZ DE ENVIAR TODAS ENVIAR APENAS A PRIMEIRA
    useEffect(() => {
        if (!receiver || !senderID || messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];

        if (lastProcessedMessageRef.current === lastMsg.timestamp) return;

        if (lastMsg.sender === receiver.id && !lastMsg.read) {
            lastProcessedMessageRef.current = lastMsg.timestamp;

            useChatStore.getState().markMessagesAsReadByMe(receiver.id);

            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "READ", receiver: receiver.id }));
            }

            fetch(`${API_URL}/chat/read/${receiver.id}`, {
                method: 'PUT',
                headers: { token: localStorage.getItem('token') }
            }).catch(err => console.error("Failed to sync read status", err));
        }
    }, [messages, receiver, senderID]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !receiver) return;

        const messagePayload = { type: "MESSAGE", receiver: receiver.id, text: inputText };
        console.log("messagePayload: ", messagePayload);

        fetch(`${API_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            body: JSON.stringify(messagePayload)
        }).then(res => {
            if (res.ok) {
                addMessage({
                    sender: senderID,
                    receiver: receiver.id,
                    text: inputText,
                    timestamp: new Date().toISOString(),
                    read: false
                });
                setInputText('');
            } else {
                console.error("Failed to send message");
            }
        });
    };

    const filteredUsers = usersList.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <div className="chat-header"><h4>{t('chatBox.chats')}</h4></div>
                            <div className="chat-search">
                                <div className="search-input-wrapper">
                                    <i className="bi bi-search search-icon"></i>
                                    <input
                                        type="text"
                                        placeholder={t('chatBox.searchUsers')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="chat-user-list">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="chat-user-item" onClick={() => { setReceiver(user); setView('CHAT'); }}>
                                        <div className="chat-user-avatar">
                                            <img src={user.photoUrl || "/default-user.png"} alt={user.username} className="chat-avatar-img" />
                                        </div>
                                        <div className="chat-user-info">
                                            <h5>{user.username}</h5>
                                            <span className="chat-user-status">{t('chatBox.clickToChat')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="chat-header chat-header-active">
                                <button className="chat-back-btn" onClick={() => { setView('LIST'); setReceiver(null); }}>
                                    <i className="bi bi-arrow-left"></i>
                                </button>
                                <h4>{receiver.username}</h4>
                            </div>
                            <div className="chat-history">
                                {activeConversation.map((msg, index) => (
                                    <div key={index} className={`chat-message-wrapper ${msg.sender === senderID ? 'sent' : 'received'}`}>
                                        <div className="chat-bubble"><p>{msg.text}</p></div>
                                        <div className="chat-meta">
                                            <span className="chat-timestamp">{formatTimestamp(msg.timestamp)}</span>
                                            {msg.sender === senderID && (
                                                <span className={`chat-read-status ${msg.read ? 'read' : 'sent'}`}>
                                                    <i className={`bi ${msg.read ? 'bi-check-all' : 'bi-check'}`}></i>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSend} className="chat-input-area">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={t('chatBox.typeMessage')}
                                />
                                <button type="submit" disabled={!inputText.trim()}><i className="bi bi-send-fill"></i></button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default ChatBox;