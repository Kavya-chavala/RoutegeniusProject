// src/pages/UserDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserAuthContext';
import api from '../services/api';

function UserDashboardPage() {
    const { user, logout, updateUserContext } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editFormVisible, setEditFormVisible] = useState(false);

    // --- Parcel Tracking State ---
    const [trackingIdInput, setTrackingIdInput] = useState('');
    const [trackedParcel, setTrackedParcel] = useState(null);
    const [trackingMessage, setTrackingMessage] = useState({ text: '', type: '' });

    // --- Feedback State ---
    const [currentParcelFeedback, setCurrentParcelFeedback] = useState({ feedbackText: '', rating: 0, message: { text: '', type: '' } });
    const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState(new Set());

    // --- Notifications State (NEW) ---
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);


    useEffect(() => {
        if (!user || (user.role !== 'USER' && user.role !== 'ADMIN')) {
            navigate('/login');
            return;
        }
        fetchUserProfile();
        fetchUnreadCount(); // NEW: Fetch unread count on load to show badge
    }, [user, navigate]);

    // NEW: useEffect to fetch notifications ONLY when the modal is opened
    useEffect(() => {
        if (notificationsModalOpen) {
            fetchNotifications();
        }
    }, [notificationsModalOpen]);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get(`/users/${user.id}`);
            setProfileData(prev => ({
                ...prev,
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                username: response.data.username,
                email: response.data.email
            }));
        } catch (error) {
            console.error('Failed to fetch user profile:', error.response?.data || error.message);
            setMessage({ text: 'Failed to load profile data.', type: 'error' });
        }
    };

    // --- NEW: Fetch all notifications for the user ---
    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error.response?.data || error.message);
            // Handle error without blocking UI
        }
    };

    // --- NEW: Fetch unread notification count ---
    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread/count');
            setUnreadCount(response.data);
        } catch (error) {
            console.error('Failed to fetch unread count:', error.response?.data || error.message);
        }
    };

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            const updatePayload = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                username: profileData.username,
                email: profileData.email,
            };
            if (profileData.password) {
                updatePayload.password = profileData.password;
            }

            const response = await api.put(`/users/${user.id}`, updatePayload);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            updateUserContext({
                username: response.data.username,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName
            });
            setProfileData(prev => ({ ...prev, password: '' }));
            setEditFormVisible(false);
        } catch (error) {
            console.error('Error updating user profile:', error.response?.data || error.message);
            setMessage({ text: error.response?.data?.message || 'Failed to update profile.', type: 'error' });
        }
    };

    // --- Parcel Tracking Handlers ---
    const handleTrackParcel = async (e) => {
        e.preventDefault();
        setTrackedParcel(null);
        setTrackingMessage({ text: '', type: '' });
        setCurrentParcelFeedback({ feedbackText: '', rating: 0, message: { text: '', type: '' } });

        if (!trackingIdInput.trim()) {
            setTrackingMessage({ text: 'Please enter a tracking ID.', type: 'error' });
            return;
        }

        try {
            const response = await api.get(`/parcels/track/${trackingIdInput.trim()}`);
            const fetchedParcel = response.data;

            setTrackedParcel(fetchedParcel);
            setTrackingMessage({ text: 'Tracking details found!', type: 'success' });

            if (fetchedParcel.status === 'DELIVERED') {
                try {
                    const feedbackExistsResponse = await api.get(`/feedback/exists/${fetchedParcel.id}`);
                    if (feedbackExistsResponse.data === true) {
                        setSubmittedFeedbackIds(prev => new Set(prev).add(fetchedParcel.id));
                    } else {
                        setCurrentParcelFeedback({ feedbackText: '', rating: 0, message: { text: '', type: '' } });
                    }
                } catch (error) {
                    console.error(`Failed to check feedback existence for tracked parcel ${fetchedParcel.id}:`, error.response?.data || error.message);
                }
            } else {
                setCurrentParcelFeedback({ feedbackText: '', rating: 0, message: { text: '', type: '' } });
            }

        } catch (error) {
            console.error('Tracking error:', error.response?.data || error.message);
            setTrackingMessage({ text: error.response?.data?.message || 'Parcel not found.', type: 'error' });
            setTrackedParcel(null);
        }
    };
    
    // --- NEW: handleNotificationClick ---
    const handleNotificationClick = async (notification) => {
        // Automatically populate tracking input and trigger tracking
        setTrackingIdInput(notification.parcelTrackingId);
        // We'll call handleTrackParcel inside this function
        // so it fetches the details from the backend
        // We need to pass a mock event object to prevent an error
        await handleTrackParcel({ preventDefault: () => {} });

        // Mark the notification as read
        if (!notification.isRead) {
            try {
                await api.put(`/notifications/read/${notification.id}`);
                // Refresh the notification list and unread count
                fetchNotifications();
                fetchUnreadCount();
            } catch (error) {
                console.error('Failed to mark notification as read:', error.response?.data || error.message);
            }
        }
        // Close the modal after clicking
        setNotificationsModalOpen(false);
    };


    // --- Feedback Handlers ---
    const handleFeedbackTextChange = (value) => {
        setCurrentParcelFeedback(prev => ({
            ...prev,
            feedbackText: value,
            message: { text: '', type: '' }
        }));
    };

    const handleRatingChange = (rating) => {
        setCurrentParcelFeedback(prev => ({
            ...prev,
            rating: rating,
            message: { text: '', type: '' }
        }));
    };

    const handleFeedbackSubmit = async () => {
        const parcelId = trackedParcel?.id;
        const parcelFeedback = currentParcelFeedback;

        if (!parcelId || !parcelFeedback || !parcelFeedback.feedbackText || parcelFeedback.rating === 0) {
            setCurrentParcelFeedback(prev => ({
                ...prev,
                message: { text: 'Please provide both feedback text and a rating.', type: 'error' }
            }));
            return;
        }

        try {
            const payload = {
                parcelId: parcelId,
                feedbackText: parcelFeedback.feedbackText,
                rating: parcelFeedback.rating
            };
            const response = await api.post('/feedback', payload);
            setCurrentParcelFeedback(prev => ({
                ...prev,
                message: { text: 'Feedback submitted successfully!', type: 'success' }
            }));
            setSubmittedFeedbackIds(prev => new Set(prev).add(parcelId));
        } catch (error) {
            console.error('Feedback submission error:', error.response?.data || error.message);
            setCurrentParcelFeedback(prev => ({
                ...prev,
                message: { text: error.response?.data?.message || 'Failed to submit feedback.', type: 'error' }
            }));
        }
    };

    const StarRating = ({ currentRating, onRatingChange }) => {
        return (
            <div style={{ display: 'flex', gap: '2px', cursor: 'pointer', fontSize: '24px', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => onRatingChange(star)}
                        style={{ color: star <= currentRating ? '#ffc107' : '#e4e5e9' }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };


    if (!user) {
        return <div className="container">Loading user data...</div>;
    }

    return (
        <div className="container">
            <div className="dashboard-header">
                <button onClick={() => navigate(-1)} className="back-button">&larr; Back</button>
                <h2>Welcome, {user.firstName || user.username}!</h2>
                <div className="profile-actions">
                    {/* NEW: Notifications Button with unread count */}
                    <button onClick={() => setNotificationsModalOpen(true)} className="notification-button">
                        🔔
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                    <button onClick={logout} className="secondary-button">Logout</button>
                </div>
            </div>

            <div className="dashboard-section">
                <h3>Your Profile Details</h3>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <button onClick={() => setEditFormVisible(!editFormVisible)} className="secondary-button" style={{ marginTop: '15px' }}>
                    {editFormVisible ? 'Hide Edit Form' : 'Edit Your Profile'}
                </button>
            </div>

            {editFormVisible && (
                <div className="dashboard-section" style={{ backgroundColor: '#1a1f26' }}>
                    <h3>Edit Your Profile</h3>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="firstName">First Name:</label>
                        <input type="text" id="firstName" name="firstName" value={profileData.firstName} onChange={handleChange} />

                        <label htmlFor="lastName">Last Name:</label>
                        <input type="text" id="lastName" name="lastName" value={profileData.lastName} onChange={handleChange} />

                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" value={profileData.username} onChange={handleChange} required />

                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" value={profileData.email} onChange={handleChange} required />

                        <label htmlFor="password">New Password (leave blank to keep current):</label>
                        <input type="password" id="password" name="password" value={profileData.password} onChange={handleChange} />

                        <button type="submit">Update Profile</button>
                    </form>
                    {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
                </div>
            )}

            <div className="dashboard-section">
                <h3>Track Your Parcel</h3>
                <form onSubmit={handleTrackParcel} className="track-parcel-form">
                    <label htmlFor="trackingIdInput">Enter Tracking ID / Order ID:</label>
                    <input
                        type="text"
                        id="trackingIdInput"
                        value={trackingIdInput}
                        onChange={(e) => setTrackingIdInput(e.target.value)}
                        placeholder="e.g., ABC123DEF456"
                        required
                    />
                    <button type="submit">Track Order</button>
                </form>
                {trackingMessage.text && <div className={`message ${trackingMessage.type}`}>{trackingMessage.text}</div>}

                {/* Display Tracked Parcel Details */}
                {trackedParcel && (
                    <div className="parcel-details-card">
                        <h4>Parcel Details: {trackedParcel.trackingId}</h4>
                        <p><strong>Status:</strong> <span className={`status-badge status-${trackedParcel.status.toLowerCase()}`}>{trackedParcel.status.replace('_', ' ')}</span></p>
                        <p><strong>Current Location:</strong> {trackedParcel.currentLocation || 'N/A'}</p>
                        <p><strong>Description:</strong> {trackedParcel.description || 'No description provided'}</p>
                        <p><strong>Sender:</strong> {trackedParcel.senderName}</p>
                        <p><strong>Recipient:</strong> {trackedParcel.recipientName}</p>
                        <p><strong>Last Updated:</strong> {new Date(trackedParcel.updatedAt).toLocaleString()}</p>

                        {/* Feedback Section (NEW) - ONLY appears if parcel is DELIVERED and feedback not yet submitted */}
                        {trackedParcel.status === 'DELIVERED' && !submittedFeedbackIds.has(trackedParcel.id) && (
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
                                <h4>Provide Feedback for Delivery</h4>
                                <StarRating
                                    currentRating={currentParcelFeedback.rating || 0}
                                    onRatingChange={handleRatingChange}
                                />
                                <textarea
                                    placeholder="Tell us about your experience..."
                                    value={currentParcelFeedback.feedbackText || ''}
                                    onChange={(e) => handleFeedbackTextChange(e.target.value)}
                                    rows="3"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white', marginTop: '10px', boxSizing: 'border-box' }}
                                ></textarea>
                                <button onClick={handleFeedbackSubmit} style={{ marginTop: '10px', padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>
                                    Submit Feedback
                                </button>
                                {currentParcelFeedback.message.text && (
                                    <div className={`message ${currentParcelFeedback.message.type}`} style={{ marginTop: '10px' }}>
                                        {currentParcelFeedback.message.text}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Display submitted message if feedback was given for this specific tracked parcel */}
                        {trackedParcel.status === 'DELIVERED' && submittedFeedbackIds.has(trackedParcel.id) && (
                            <p style={{ marginTop: '15px', color: '#28a745' }}>Thank you for your feedback!</p>
                        )}
                    </div>
                )}
            </div>

            <div className="dashboard-section">
                <h3>Your Logistics Overview</h3>
                <p className="placeholder-text">
                    This area will evolve with more features related to your personal logistics, beyond just tracking.
                </p>
            </div>

            {/* NEW: Notifications Modal */}
            <div id="notificationsModal" className={`modal ${notificationsModalOpen ? 'open' : ''}`}>
                <div className="modal-content">
                    <span className="close-button" onClick={() => setNotificationsModalOpen(false)}>&times;</span>
                    <h2>Notifications</h2>
                    {notifications.length > 0 ? (
                        <div style={{ width: '100%' }}>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {notifications.map(notification => (
                                    <li
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{
                                            backgroundColor: notification.isRead ? '#2a2a2a' : '#3a4f6a',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            marginBottom: '10px',
                                            cursor: 'pointer',
                                            borderLeft: notification.isRead ? '3px solid #666' : '3px solid #00FFC0',
                                            transition: 'background-color 0.2s ease, border-color 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', color: notification.isRead ? '#aaa' : '#e0e0e0' }}>
                                            {notification.message}
                                        </div>
                                        <div style={{ fontSize: '0.85em', color: '#999', marginTop: '5px' }}>
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>You have no notifications.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboardPage;
