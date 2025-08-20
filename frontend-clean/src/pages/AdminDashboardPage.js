// src/pages/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserAuthContext'; // Keeping this as per your file structure
import api from '../services/api';

function AdminDashboardPage() {
    const { user, logout, updateUserContext } = useAuth();
    const navigate = useNavigate();

    // User Management States
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [adminCreateUserFormVisible, setAdminCreateUserFormVisible] = useState(false);
    const [newUserData, setNewUserData] = useState({
        firstName: '', lastName: '', username: '', email: '', password: '', role: 'USER'
    });
    const [editingUser, setEditingUser] = useState(null);
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [editMessage, setEditMessage] = useState({ text: '', type: '' });

    // User List Pagination & Search States
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userCurrentPage, setUserCurrentPage] = useState(1); // 1-indexed for display
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [userPageSize, setUserPageSize] = useState(10);
    const [userSortBy, setUserSortBy] = useState('id');
    const [userSortDir, setUserSortDir] = useState('asc');

    // Admin Profile Management States
    const [adminProfileModalOpen, setAdminProfileModalOpen] = useState(false);
    const [adminProfileData, setAdminProfileData] = useState({
        firstName: '', lastName: '', username: '', email: '', password: ''
    });
    const [adminProfileMessage, setAdminProfileMessage] = useState({ text: '', type: '' });

    // Parcel Management States
    const [parcels, setParcels] = useState([]);
    const [parcelMessage, setParcelMessage] = useState({ text: '', type: '' });
    const [addParcelFormVisible, setAddParcelFormVisible] = useState(false);
    const [newParcelData, setNewParcelData] = useState({
        senderName: '', senderAddress: '', recipientName: '', recipientAddress: '',
        recipientEmail: '',
        description: '', status: 'PENDING', currentLocation: '', userId: ''
    });
    const [editingParcel, setEditingParcel] = useState(null);
    const [editParcelModalOpen, setEditParcelModalOpen] = useState(false);
    const [editParcelMessage, setEditParcelMessage] = useState({ text: '', type: '' });

    // Parcel List Pagination & Search States
    const [parcelSearchTerm, setParcelSearchTerm] = useState('');
    const [parcelCurrentPage, setParcelCurrentPage] = useState(1); // 1-indexed for display
    const [parcelTotalPages, setParcelTotalPages] = useState(1);
    const [parcelPageSize, setParcelPageSize] = useState(10);
    const [parcelSortBy, setParcelSortBy] = useState('id');
    const [parcelSortDir, setParcelSortDir] = useState('asc');

    // For dropdown list of all non-admin users (used in Add Parcel form)
    const [allUsersForDropdown, setAllUsersForDropdown] = useState([]);

    // Feedback Management States (NEW)
    const [feedbackList, setFeedbackList] = useState([]);
    const [feedbackDisplayMessage, setFeedbackDisplayMessage] = useState({ text: '', type: '' });
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false); // NEW: State to control feedback modal visibility


    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        fetchUsers(); // Fetch users for the paginated table
        fetchParcels(); // Fetch parcels for the paginated table
        fetchAllUsersForDropdown(); // Fetch all users specifically for the dropdown
        // fetchFeedback(); // Removed from here, will be called when modal opens

        setAdminProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            username: user.username,
            email: user.email,
            password: ''
        });
    }, [user, navigate, updateUserContext,
        userSearchTerm, userCurrentPage, userPageSize, userSortBy, userSortDir, // User dependencies
        parcelSearchTerm, parcelCurrentPage, parcelPageSize, parcelSortBy, parcelSortDir, // Parcel dependencies
    ]);

    // --- Fetch Users Function (for paginated table) ---
    const fetchUsers = async () => {
        try {
            const response = await api.get(`/users?page=${userCurrentPage - 1}&size=${userPageSize}&sortBy=${userSortBy}&sortDir=${userSortDir}&searchTerm=${userSearchTerm}`);
            const filteredUsers = response.data.content.filter(u => u.role === 'USER');
            setUsers(filteredUsers);
            setUserTotalPages(response.data.totalPages);
            setMessage({ text: '', type: '' });
        } catch (error) {
            console.error('Failed to fetch users:', error.response?.data || error.message);
            setMessage({ text: 'Failed to load users. ' + (error.response?.data?.message || ''), type: 'error' });
        }
    };

    // --- Fetch Parcels Function (for paginated table) ---
    const fetchParcels = async () => {
        try {
            const response = await api.get(`/parcels/all?page=${parcelCurrentPage - 1}&size=${parcelPageSize}&sortBy=${parcelSortBy}&sortDir=${parcelSortDir}&searchTerm=${parcelSearchTerm}`);
            setParcels(response.data.content);
            setParcelTotalPages(response.data.totalPages);
            setParcelMessage({ text: '', type: '' });
        } catch (error) {
            console.error('Failed to fetch parcels:', error.response?.data || error.message);
            setParcelMessage({ text: 'Failed to load parcels. ' + (error.response?.data?.message || ''), type: 'error' });
        }
    };

    // --- Fetch All Non-Admin Users for Dropdown ---
    const fetchAllUsersForDropdown = async () => {
        try {
            const response = await api.get('/users/all-non-admin');
            setAllUsersForDropdown(response.data);
        } catch (error) {
            console.error('Failed to fetch all users for dropdown:', error.response?.data || error.message);
        }
    };

    // --- NEW: Fetch All Feedback Function (called when modal opens) ---
    const fetchFeedback = async () => {
        try {
            const response = await api.get('/feedback'); // Assuming /api/feedback returns all feedback
            setFeedbackList(response.data);
            setFeedbackDisplayMessage({ text: '', type: '' });
        } catch (error) {
            console.error('Failed to fetch feedback:', error.response?.data || error.message);
            setFeedbackDisplayMessage({ text: 'Failed to load feedback. ' + (error.response?.data?.message || ''), type: 'error' });
        }
    };


    // --- User Search & Pagination Handlers ---
    const handleUserSearch = () => {
        setUserCurrentPage(1);
    };

    const handleUserPageChange = (page) => {
        setUserCurrentPage(page);
    };

    const handleUserPageSizeChange = (e) => {
        setUserPageSize(parseInt(e.target.value));
        setUserCurrentPage(1);
    };

    const handleUserSortChange = (field) => {
        const newSortDir = userSortBy === field && userSortDir === 'asc' ? 'desc' : 'asc';
        setUserSortBy(field);
        setUserSortDir(newSortDir);
        setUserCurrentPage(1);
    };

    // --- Parcel Search & Pagination Handlers ---
    const handleParcelSearch = () => {
        setParcelCurrentPage(1);
    };

    const handleParcelPageChange = (page) => {
        setParcelCurrentPage(page);
    };

    const handleParcelPageSizeChange = (e) => {
        setParcelPageSize(parseInt(e.target.value));
        setParcelCurrentPage(1);
    };

    const handleParcelSortChange = (field) => {
        const newSortDir = parcelSortBy === field && parcelSortDir === 'asc' ? 'desc' : 'asc';
        setParcelSortBy(field);
        setParcelSortDir(newSortDir);
        setParcelCurrentPage(1);
    };


    // --- Admin Create User ---
    const handleNewUserChange = (e) => {
        setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
    };

    const handleNewUserSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            const response = await api.post('/users/admin/create', newUserData);
            setMessage({ text: `User ${response.data.username} created successfully!`, type: 'success' });
            setNewUserData({ firstName: '', lastName: '', username: '', email: '', password: '', role: 'USER' });
            setAdminCreateUserFormVisible(false);
            fetchUsers(); // Refresh user list on dashboard
            fetchAllUsersForDropdown(); // Refresh dropdown list too
        } catch (error) {
            console.error('Admin create user error:', error.response?.data || error.message);
            setMessage({ text: error.response?.data?.message || 'Failed to create user.', type: 'error' });
        }
    };

    // --- Edit User Modal (for other users) ---
    const handleEditClick = (userToEdit) => {
        setEditingUser({ ...userToEdit, password: '' });
        setEditUserModalOpen(true);
        setEditMessage({ text: '', type: '' });
    };

    const handleEditChange = (e) => {
        setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditMessage({ text: '', type: '' });

        try {
            const updatePayload = {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                username: editingUser.username,
                email: editingUser.email,
                role: editingUser.role
            };
            if (editingUser.password) {
                updatePayload.password = editingUser.password;
            }

            const response = await api.put(`/users/${editingUser.id}`, updatePayload);
            setEditMessage({ text: 'User updated successfully!', type: 'success' });
            setEditUserModalOpen(false);
            fetchUsers(); // Refresh user list
            fetchAllUsersForDropdown(); // Refresh dropdown list (if roles changed)
        } catch (error) {
            console.error('Error updating user:', error.response?.data || error.message);
            setEditMessage({ text: error.response?.data?.message || 'Failed to update user.', type: 'error' });
        }
    };

    const handleDeleteClick = async (userId) => {
        if (window.confirm(`Are you sure you want to delete user ID ${userId}?`)) {
            try {
                await api.delete(`/users/${userId}`);
                setMessage({ text: 'User deleted successfully!', type: 'success' });
                fetchUsers(); // Refresh user list
                fetchAllUsersForDropdown(); // Refresh dropdown list
            } catch (error) {
                console.error('Delete user error:', error.response?.data || error.message);
                setMessage({ text: error.response?.data?.message || 'Failed to delete user.', type: 'error' });
            }
        }
    };

    // --- Admin Own Profile Management ---
    const handleAdminProfileChange = (e) => {
        setAdminProfileData({ ...adminProfileData, [e.target.name]: e.target.value });
    };

    const handleAdminProfileSubmit = async (e) => {
        e.preventDefault();
        setAdminProfileMessage({ text: '', type: '' });

        try {
            const updatePayload = {
                firstName: adminProfileData.firstName,
                lastName: adminProfileData.lastName,
                username: adminProfileData.username,
                email: adminProfileData.email,
            };
            if (adminProfileData.password) {
                updatePayload.password = adminProfileData.password;
            }

            const response = await api.put(`/users/${user.id}`, updatePayload);
            setAdminProfileMessage({ text: 'Your profile updated successfully!', type: 'success' });
            updateUserContext({
                username: response.data.username,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName
            });
            setAdminProfileData(prev => ({ ...prev, password: '' }));
            setAdminProfileModalOpen(false);
        } catch (error) {
            console.error('Error updating admin profile:', error.response?.data || error.message);
            setAdminProfileMessage({ text: error.response?.data?.message || 'Failed to update your profile.', type: 'error' });
        }
    };

    // --- Parcel Management Handlers ---
    const handleNewParcelChange = (e) => {
        setNewParcelData({ ...newParcelData, [e.target.name]: e.target.value });
    };

    const handleAddParcelSubmit = async (e) => {
        e.preventDefault();
        setParcelMessage({ text: '', type: '' });
        try {
            const payload = { ...newParcelData, userId: newParcelData.userId ? newParcelData.userId : user.id };
            const response = await api.post('/parcels', payload);
            setParcelMessage({ text: `Parcel ${response.data.trackingId} added successfully!`, type: 'success' });
            setNewParcelData({ senderName: '', senderAddress: '', recipientName: '', recipientAddress: '', recipientEmail: '', description: '', status: 'PENDING', currentLocation: '', userId: '' });
            setAddParcelFormVisible(false);
            fetchParcels(); // Refresh parcel list
        } catch (error) {
            console.error('Add parcel error:', error.response?.data || error.message);
            setParcelMessage({ text: error.response?.data?.message || 'Failed to add parcel.', type: 'error' });
        }
    };

    const handleEditParcelClick = (parcelToEdit) => {
        setEditingParcel(parcelToEdit);
        setEditParcelModalOpen(true);
        setEditParcelMessage({ text: '', type: '' });
    };

    const handleEditParcelChange = (e) => {
        setEditingParcel({ ...editingParcel, [e.target.name]: e.target.value });
    };

    const handleEditParcelSubmit = async (e) => {
        e.preventDefault();
        setEditParcelMessage({ text: '', type: '' });
        try {
            const response = await api.put(`/parcels/${editingParcel.id}`, editingParcel);
            setEditParcelMessage({ text: `Parcel ${response.data.trackingId} updated successfully!`, type: 'success' });
            setEditParcelModalOpen(false);
            fetchParcels(); // Refresh parcel list
        } catch (error) {
            console.error('Edit parcel error:', error.response?.data || error.message);
            setEditParcelMessage({ text: error.response?.data?.message || 'Failed to update parcel.', type: 'error' });
        }
    };

    const handleDeleteParcelClick = async (parcelId) => {
        if (window.confirm(`Are you sure you want to delete Parcel ID ${parcelId}?`)) {
            try {
                await api.delete(`/parcels/${parcelId}`);
                setParcelMessage({ text: 'Parcel deleted successfully!', type: 'success' });
                fetchParcels();
            } catch (error) {
                console.error('Delete parcel error:', error.response?.data || error.message);
                setParcelMessage({ text: error.response?.data?.message || 'Failed to delete parcel.', type: 'error' });
            }
        }
    };

    if (!user) {
        return <div className="container">Loading user data...</div>;
    }

    // Inline Pagination Component for reusability
    const InlinePagination = ({ currentPage, totalPages, onPageChange }) => {
        const pages = [...Array(totalPages).keys()].map(i => i + 1);
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        padding: '6px 10px', // Smaller padding
                        margin: '0 3px',    // Smaller margin
                        borderRadius: '4px', // Slightly less rounded
                        border: '1px solid #007bff',
                        backgroundColor: '#007bff',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.85rem', // Smaller font size
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Subtle shadow
                        transition: 'background-color 0.2s ease, transform 0.1s ease'
                    }}
                >
                    Previous
                </button>
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={{
                            padding: '6px 10px', // Smaller padding
                            margin: '0 3px',    // Smaller margin
                            borderRadius: '4px', // Slightly less rounded
                            border: `1px solid ${currentPage === page ? '#0056b3' : '#ddd'}`,
                            backgroundColor: currentPage === page ? '#0056b3' : '#f0f0f0',
                            color: currentPage === page ? 'white' : 'black',
                            cursor: 'pointer',
                            fontSize: '0.85rem', // Smaller font size
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Subtle shadow
                            transition: 'background-color 0.2s ease, transform 0.1s ease'
                        }}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '6px 10px', // Smaller padding
                        margin: '0 3px',    // Smaller margin
                        borderRadius: '4px', // Slightly less rounded
                        border: '1px solid #007bff',
                        backgroundColor: '#007bff',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.85rem', // Smaller font size
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Subtle shadow
                        transition: 'background-color 0.2s ease, transform 0.1s ease'
                    }}
                >
                    Next
                </button>
            </div>
        );
    };


    return (
        <div className="container">
            <div className="dashboard-header">
                <button onClick={() => navigate(-1)} className="back-button"
                    style={{
                        padding: '8px 15px', borderRadius: '8px', border: 'none',
                        backgroundColor: '#6c757d', color: 'white', cursor: 'pointer',
                        fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'background-color 0.2s ease'
                    }}>
                    &larr; Back
                </button>
                <h2>Admin Dashboard</h2>
                <div className="profile-actions">
                    <button onClick={() => setAdminProfileModalOpen(true)} className="profile-icon-button"
                        style={{
                            padding: '8px 12px', borderRadius: '50%', border: 'none',
                            backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                            fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'background-color 0.2s ease'
                        }}>
                        👤
                    </button>
                    {/* NEW: Notifications Button */}
                    <button onClick={() => { setFeedbackModalOpen(true); fetchFeedback(); }} className="secondary-button"
                        style={{
                            padding: '8px 15px', borderRadius: '8px', border: '1px solid #007bff',
                            backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                            fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'background-color 0.2s ease', marginLeft: '10px'
                        }}>
                        Notifications
                    </button>
                    <button onClick={logout} className="secondary-button"
                        style={{
                            padding: '8px 15px', borderRadius: '8px', border: '1px solid #dc3545',
                            backgroundColor: '#dc3545', color: 'white', cursor: 'pointer',
                            fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'background-color 0.2s ease', marginLeft: '10px'
                        }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* User Management Section */}
            <div className="dashboard-section">
                <h3>User Management</h3>
                <button onClick={() => setAdminCreateUserFormVisible(!adminCreateUserFormVisible)}
                    style={{
                        marginBottom: '20px', padding: '10px 20px', borderRadius: '8px',
                        border: 'none', backgroundColor: '#28a745', color: 'white',
                        cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'background-color 0.2s ease'
                    }}>
                    {adminCreateUserFormVisible ? 'Hide Create User Form' : 'Create New User'}
                </button>

                {adminCreateUserFormVisible && (
                    <div style={{ padding: '20px', border: '1px solid #30363d', borderRadius: '10px', backgroundColor: '#1a1f26', marginBottom: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                        <h4>Create New User</h4>
                        <form onSubmit={handleNewUserSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'center' }}>
                            <label htmlFor="adminFirstName" style={{ textAlign: 'right' }}>First Name:</label>
                            <input type="text" id="adminFirstName" name="firstName" value={newUserData.firstName} onChange={handleNewUserChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminLastName" style={{ textAlign: 'right' }}>Last Name:</label>
                            <input type="text" id="adminLastName" name="lastName" value={newUserData.lastName} onChange={handleNewUserChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminUsername" style={{ textAlign: 'right' }}>Username:</label>
                            <input type="text" id="adminUsername" name="username" value={newUserData.username} onChange={handleNewUserChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminEmail" style={{ textAlign: 'right' }}>Email:</label>
                            <input type="email" id="adminEmail" name="email" value={newUserData.email} onChange={handleNewUserChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminPassword" style={{ textAlign: 'right' }}>Password:</label>
                            <input type="password" id="adminPassword" name="password" value={newUserData.password} onChange={handleNewUserChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminRole" style={{ textAlign: 'right' }}>Role:</label>
                            <select id="adminRole" name="role" value={newUserData.role} onChange={handleNewUserChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}>
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                                <button type="submit"
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                                        backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                                        fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        transition: 'background-color 0.2s ease'
                                    }}>
                                    Create User
                                </button>
                            </div>
                        </form>
                        {message.text && <div className={`message ${message.type}`} style={{ marginTop: '15px' }}>{message.text}</div>}
                    </div>
                )}

                {/* User Search and Pagination Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleUserSearch(); }}
                        style={{ flexGrow: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '0.85rem' }}
                    />
                    <button onClick={handleUserSearch}
                        style={{
                            padding: '6px 12px', borderRadius: '4px', border: 'none',
                            backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                            fontSize: '0.85rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            transition: 'background-color 0.2s ease'
                        }}>
                        Search
                    </button>
                    <select onChange={handleUserPageSizeChange} value={userPageSize}
                        style={{
                            padding: '6px 8px', borderRadius: '4px', border: '1px solid #555',
                            backgroundColor: '#333', color: 'white', fontSize: '0.85rem',
                            minWidth: '100px'
                        }}>
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                    </select>
                </div>

                {/* All Registered Users Table */}
                <h4>All Registered Users (excluding Admins)</h4>
                <div style={{ overflowX: 'auto', width: '100%', boxSizing: 'border-box', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', backgroundColor: '#1a1f26',
                    // Custom scrollbar styles
                    scrollbarWidth: 'thin', // For Firefox
                    scrollbarColor: '#007bff #1a1f26' // For Firefox (thumb color track color)
                }}>
                    {/* Webkit scrollbar styles (for Chrome, Safari) */}
                    <style>{`
                        div::-webkit-scrollbar {
                            width: 8px;
                            height: 8px;
                        }
                        div::-webkit-scrollbar-track {
                            background: #1a1f26;
                            border-radius: 10px;
                        }
                        div::-webkit-scrollbar-thumb {
                            background-color: #007bff;
                            border-radius: 10px;
                            border: 2px solid #1a1f26;
                        }
                    `}</style>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2a2f36' }}>
                                <th onClick={() => handleUserSortChange('id')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    ID {userSortBy === 'id' && (userSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleUserSortChange('username')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Username {userSortBy === 'username' && (userSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleUserSortChange('email')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Email {userSortBy === 'email' && (userSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleUserSortChange('role')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Role {userSortBy === 'role' && (userSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #30363d' }}>
                                        <td style={{ padding: '10px 8px' }}>{u.id}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'left' }}>{u.username}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'left' }}>{u.email}</td>
                                        <td style={{ padding: '10px 8px' }}>{u.role}</td>
                                        <td className="action-buttons" style={{ padding: '10px 8px', display: 'flex', gap: '5px' }}> {/* Added flex and gap */}
                                            <button onClick={() => handleEditClick(u)} className="secondary-button"
                                                style={{
                                                    padding: '6px 10px', borderRadius: '5px', border: 'none',
                                                    backgroundColor: '#6f42c1', color: 'white', cursor: 'pointer',
                                                    fontSize: '0.8rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    transition: 'background-color 0.2s ease'
                                                }}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteClick(u.id)} className="delete-button"
                                                style={{
                                                    padding: '6px 10px', borderRadius: '5px', border: 'none',
                                                    backgroundColor: '#dc3545', color: 'white', cursor: 'pointer',
                                                    fontSize: '0.8rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    transition: 'background-color 0.2s ease'
                                                }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '10px 8px', textAlign: 'center', color: '#aaa' }}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {message.text && <div className={`message ${message.type}`} style={{ marginTop: '15px' }}>{message.text}</div>}
                <InlinePagination
                    currentPage={userCurrentPage}
                    totalPages={userTotalPages}
                    onPageChange={handleUserPageChange}
                />
            </div>

            {/* Parcel Management Section */}
            <div className="dashboard-section">
                <h3>Parcel Management</h3>
                <button onClick={() => setAddParcelFormVisible(!addParcelFormVisible)}
                    style={{
                        marginBottom: '20px', padding: '10px 20px', borderRadius: '8px',
                        border: 'none', backgroundColor: '#28a745', color: 'white',
                        cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'background-color 0.2s ease'
                    }}>
                    {addParcelFormVisible ? 'Hide Add Parcel Form' : 'Add New Parcel'}
                </button>

                {addParcelFormVisible && (
                    <div style={{ padding: '20px', border: '1px solid #30363d', borderRadius: '10px', backgroundColor: '#1a1f26', marginBottom: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                        <h4>Add New Parcel</h4>
                        <form onSubmit={handleAddParcelSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'center' }}>
                            <label htmlFor="senderName" style={{ textAlign: 'right' }}>Sender Name:</label>
                            <input type="text" id="senderName" name="senderName" value={newParcelData.senderName} onChange={handleNewParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="senderAddress" style={{ textAlign: 'right' }}>Sender Address:</label>
                            <input type="text" id="senderAddress" name="senderAddress" value={newParcelData.senderAddress} onChange={handleNewParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="recipientName" style={{ textAlign: 'right' }}>Recipient Name:</label>
                            <input type="text" id="recipientName" name="recipientName" value={newParcelData.recipientName} onChange={handleNewParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="recipientAddress" style={{ textAlign: 'right' }}>Recipient Address:</label>
                            <input type="text" id="recipientAddress" name="recipientAddress" value={newParcelData.recipientAddress} onChange={handleNewParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="recipientEmail" style={{ textAlign: 'right' }}>Recipient Email:</label>
                            <input type="email" id="recipientEmail" name="recipientEmail" value={newParcelData.recipientEmail} onChange={handleNewParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="description" style={{ textAlign: 'right' }}>Description (Optional):</label>
                            <input type="text" id="description" name="description" value={newParcelData.description} onChange={handleNewParcelChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="currentLocation" style={{ textAlign: 'right' }}>Current Location (Optional):</label>
                            <input type="text" id="currentLocation" name="currentLocation" value={newParcelData.currentLocation} onChange={handleNewParcelChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />

                            <label htmlFor="parcelUserId" style={{ textAlign: 'right' }}>Associate with User ID:</label>
                            <select id="parcelUserId" name="userId" value={newParcelData.userId} onChange={handleNewParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}>
                                <option value="">-- Select User --</option>
                                {allUsersForDropdown.map(u => (
                                    <option key={u.id} value={u.id}>{u.username} (ID: {u.id})</option>
                                ))}
                            </select>

                            <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                                <button type="submit"
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                                        backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                                        fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        transition: 'background-color 0.2s ease'
                                    }}>
                                    Add Parcel
                                </button>
                            </div>
                        </form>
                        {parcelMessage.text && <div className={`message ${parcelMessage.type}`} style={{ marginTop: '15px' }}>{parcelMessage.text}</div>}
                    </div>
                )}

                {/* Parcel Search and Pagination Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search parcels..."
                        value={parcelSearchTerm}
                        onChange={(e) => setParcelSearchTerm(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleParcelSearch(); }}
                        style={{ flexGrow: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '0.85rem' }}
                    />
                    <button onClick={handleParcelSearch}
                        style={{
                            padding: '6px 12px', borderRadius: '4px', border: 'none',
                            backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                            fontSize: '0.85rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            transition: 'background-color 0.2s ease'
                        }}>
                        Search
                    </button>
                    <select onChange={handleParcelPageSizeChange} value={parcelPageSize}
                        style={{
                            padding: '6px 8px', borderRadius: '4px', border: '1px solid #555',
                            backgroundColor: '#333', color: 'white', fontSize: '0.85rem',
                            minWidth: '100px'
                        }}>
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                    </select>
                </div>

                {/* All Registered Parcels Table */}
                <h4>All Registered Parcels</h4>
                <div style={{ overflowX: 'auto', width: '100%', boxSizing: 'border-box', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', backgroundColor: '#1a1f26',
                    // Custom scrollbar styles
                    scrollbarWidth: 'thin', // For Firefox
                    scrollbarColor: '#007bff #1a1f26' // For Firefox (thumb color track color)
                }}>
                    {/* Webkit scrollbar styles (for Chrome, Safari) */}
                    <style>{`
                        div::-webkit-scrollbar {
                            width: 8px;
                            height: 8px;
                        }
                        div::-webkit-scrollbar-track {
                            background: #1a1f26;
                            border-radius: 10px;
                        }
                        div::-webkit-scrollbar-thumb {
                            background-color: #007bff;
                            border-radius: 10px;
                            border: 2px solid #1a1f26;
                        }
                    `}</style>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2a2f36' }}>
                                <th onClick={() => handleParcelSortChange('id')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    ID {parcelSortBy === 'id' && (parcelSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleParcelSortChange('trackingId')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Tracking ID {parcelSortBy === 'trackingId' && (parcelSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleParcelSortChange('senderName')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Sender {parcelSortBy === 'senderName' && (parcelSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleParcelSortChange('recipientName')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Recipient {parcelSortBy === 'recipientName' && (parcelSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleParcelSortChange('status')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Status {parcelSortBy === 'status' && (parcelSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleParcelSortChange('currentLocation')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Location {parcelSortBy === 'currentLocation' && (parcelSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleParcelSortChange('user.username')} style={{ cursor: 'pointer', padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                    Owner {parcelSortBy === 'user.username' && (parcelSortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th style={{ padding: '12px 8px', borderBottom: '1px solid #30363d', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcels.length > 0 ? (
                                parcels.map(parcel => (
                                    <tr key={parcel.id} style={{ borderBottom: '1px solid #30363d' }}>
                                        <td style={{ padding: '10px 8px' }}>{parcel.id}</td>
                                        <td style={{ padding: '10px 8px' }}>{parcel.trackingId}</td>
                                        <td style={{ padding: '10px 8px' }}>{parcel.senderName}</td>
                                        <td style={{ padding: '10px 8px' }}>{parcel.recipientName}</td>
                                        <td style={{ padding: '10px 8px' }}><span className={`status-badge status-${parcel.status.toLowerCase()}`}>{parcel.status.replace('_', ' ')}</span></td>
                                        <td style={{ padding: '10px 8px' }}>{parcel.currentLocation || 'N/A'}</td>
                                        <td style={{ padding: '10px 8px' }}>{parcel.username} (ID: {parcel.userId})</td>
                                        <td className="action-buttons" style={{ padding: '10px 8px', display: 'flex', gap: '5px' }}> {/* Added flex and gap */}
                                            <button onClick={() => handleEditParcelClick(parcel)} className="secondary-button"
                                                style={{
                                                    padding: '6px 10px', borderRadius: '5px', border: 'none',
                                                    backgroundColor: '#6f42c1', color: 'white', cursor: 'pointer',
                                                    fontSize: '0.8rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    transition: 'background-color 0.2s ease'
                                                }}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteParcelClick(parcel.id)} className="delete-button"
                                                style={{
                                                    padding: '6px 10px', borderRadius: '5px', border: 'none',
                                                    backgroundColor: '#dc3545', color: 'white', cursor: 'pointer',
                                                    fontSize: '0.8rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    transition: 'background-color 0.2s ease', marginLeft: '5px'
                                                }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ padding: '10px 8px', textAlign: 'center', color: '#aaa' }}>No parcels found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {parcelMessage.text && <div className={`message ${parcelMessage.type}`} style={{ marginTop: '15px' }}>{parcelMessage.text}</div>}
                <InlinePagination
                    currentPage={parcelCurrentPage}
                    totalPages={parcelTotalPages}
                    onPageChange={handleParcelPageChange}
                />
            </div>

            {/* Edit User Modal */}
            <div id="editUserModal" className={`modal ${editUserModalOpen ? 'open' : ''}`}>
                <div className="modal-content" style={{ backgroundColor: '#1a1f26', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '1px solid #30363d', padding: '25px', color: 'white', overflowY: 'auto', maxHeight: '90vh' }}>
                    <span className="close-button" onClick={() => setEditUserModalOpen(false)} style={{ color: '#aaa', float: 'right', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer' }}>&times;</span>
                    <h2 style={{ color: '#fff', marginBottom: '20px' }}>Edit User</h2>
                    {editingUser && (
                        <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'center' }}>
                            <input type="hidden" id="editUserId" value={editingUser.id} />
                            <label htmlFor="editFirstName" style={{ textAlign: 'right' }}>First Name:</label>
                            <input type="text" id="editFirstName" name="firstName" value={editingUser.firstName} onChange={handleEditChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editLastName" style={{ textAlign: 'right' }}>Last Name:</label>
                            <input type="text" id="editLastName" name="lastName" value={editingUser.lastName} onChange={handleEditChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editUsername" style={{ textAlign: 'right' }}>Username:</label>
                            <input type="text" id="editUsername" name="username" value={editingUser.username} onChange={handleEditChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editEmail" style={{ textAlign: 'right' }}>Email:</label>
                            <input type="email" id="editEmail" name="email" value={editingUser.email} onChange={handleEditChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editPassword" style={{ textAlign: 'right' }}>New Password (leave blank to keep current):</label>
                            <input type="password" id="editPassword" name="password" value={editingUser.password} onChange={handleEditChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editRole" style={{ textAlign: 'right' }}>Role:</label>
                            <select id="editRole" name="role" value={editingUser.role} onChange={handleEditChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}>
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                                <button type="submit"
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                                        backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                                        fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        transition: 'background-color 0.2s ease'
                                    }}>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                    {editMessage.text && <div className={`message ${editMessage.type}`} style={{ marginTop: '15px' }}>{editMessage.text}</div>}
                </div>
            </div>

            {/* Edit Parcel Modal */}
            <div id="editParcelModal" className={`modal ${editParcelModalOpen ? 'open' : ''}`}>
                <div className="modal-content" style={{ backgroundColor: '#1a1f26', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '1px solid #30363d', padding: '25px', color: 'white', overflowY: 'auto', maxHeight: '90vh' }}>
                    <span className="close-button" onClick={() => setEditParcelModalOpen(false)} style={{ color: '#aaa', float: 'right', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer' }}>&times;</span>
                    <h2 style={{ color: '#fff', marginBottom: '20px' }}>Edit Parcel: {editingParcel?.trackingId}</h2>
                    {editingParcel && (
                        <form onSubmit={handleEditParcelSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'center' }}>
                            <input type="hidden" id="editParcelId" value={editingParcel.id} />
                            <label htmlFor="editSenderName" style={{ textAlign: 'right' }}>Sender Name:</label>
                            <input type="text" id="editSenderName" name="senderName" value={editingParcel.senderName} onChange={handleEditParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editSenderAddress" style={{ textAlign: 'right' }}>Sender Address:</label>
                            <input type="text" id="editSenderAddress" name="senderAddress" value={editingParcel.senderAddress} onChange={handleEditParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editRecipientName" style={{ textAlign: 'right' }}>Recipient Name:</label>
                            <input type="text" id="editRecipientName" name="recipientName" value={editingParcel.recipientName} onChange={handleEditParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editRecipientAddress" style={{ textAlign: 'right' }}>Recipient Address:</label>
                            <input type="text" id="editRecipientAddress" name="recipientAddress" value={editingParcel.recipientAddress} onChange={handleEditParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="recipientEmail" style={{ textAlign: 'right' }}>Recipient Email:</label>
                            <input type="email" id="editRecipientEmail" name="recipientEmail" value={editingParcel.recipientEmail || ''} onChange={handleEditParcelChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editDescription" style={{ textAlign: 'right' }}>Description (Optional):</label>
                            <input type="text" id="editDescription" name="description" value={editingParcel.description || ''} onChange={handleEditParcelChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="editStatus" style={{ textAlign: 'right' }}>Status:</label>
                            <select id="editStatus" name="status" value={editingParcel.status} onChange={handleEditParcelChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}>
                                <option value="PENDING">PENDING</option>
                                <option value="DISPATCHED">DISPATCHED</option>
                                <option value="IN_TRANSIT">IN TRANSIT</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="RETURNED">RETURNED</option>
                            </select>
                            <label htmlFor="editCurrentLocation" style={{ textAlign: 'right' }}>Current Location (Optional):</label>
                            <input type="text" id="editCurrentLocation" name="currentLocation" value={editingParcel.currentLocation || ''} onChange={handleEditParcelChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                                <button type="submit"
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                                        backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                                        fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        transition: 'background-color 0.2s ease'
                                    }}>
                                    Save Parcel Changes
                                </button>
                            </div>
                        </form>
                    )}
                    {editParcelMessage.text && <div className={`message ${editParcelMessage.type}`} style={{ marginTop: '15px' }}>{editParcelMessage.text}</div>}
                </div>
            </div>

            {/* Admin Own Profile Modal - Existing */}
            <div id="adminProfileModal" className={`modal ${adminProfileModalOpen ? 'open' : ''}`}>
                <div className="modal-content" style={{ backgroundColor: '#1a1f26', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '1px solid #30363d', padding: '25px', color: 'white', overflowY: 'auto', maxHeight: '90vh' }}>
                    <span className="close-button" onClick={() => setAdminProfileModalOpen(false)} style={{ color: '#aaa', float: 'right', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer' }}>&times;</span>
                    <h2 style={{ color: '#fff', marginBottom: '20px' }}>Your Admin Profile</h2>
                    <div className="dashboard-section" style={{ backgroundColor: '#1a1f26', marginTop: '10px', padding: '20px', borderRadius: '10px', border: '1px solid #30363d', width: '100%', boxSizing: 'border-box' }}>
                        <h3>Details</h3>
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                    </div>

                    <div className="dashboard-section" style={{ backgroundColor: '#1a1f26', marginTop: '10px', padding: '20px', borderRadius: '10px', border: '1px solid #30363d', width: '100%', boxSizing: 'border-box' }}>
                        <h3>Edit Your Profile</h3>
                        <form onSubmit={handleAdminProfileSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'center' }}>
                            <label htmlFor="adminProfileFirstName" style={{ textAlign: 'right' }}>First Name:</label>
                            <input type="text" id="adminProfileFirstName" name="firstName" value={adminProfileData.firstName} onChange={handleAdminProfileChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminProfileLastName" style={{ textAlign: 'right' }}>Last Name:</label>
                            <input type="text" id="adminProfileLastName" name="lastName" value={adminProfileData.lastName} onChange={handleAdminProfileChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminProfileUsername" style={{ textAlign: 'right' }}>Username:</label>
                            <input type="text" id="adminProfileUsername" name="username" value={adminProfileData.username} onChange={handleAdminProfileChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminProfileEmail" style={{ textAlign: 'right' }}>Email:</label>
                            <input type="email" id="adminProfileEmail" name="email" value={adminProfileData.email} onChange={handleAdminProfileChange} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <label htmlFor="adminProfilePassword" style={{ textAlign: 'right' }}>New Password (leave blank to keep current):</label>
                            <input type="password" id="adminProfilePassword" name="password" value={adminProfileData.password} onChange={handleAdminProfileChange} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }} />
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                                <button type="submit"
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                                        backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                                        fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        transition: 'background-color 0.2s ease'
                                    }}>
                                    Update My Profile
                                </button>
                            </div>
                        </form>
                    </div>
                    {adminProfileMessage.text && <div className={`message ${adminProfileMessage.type}`} style={{ marginTop: '15px' }}>{adminProfileMessage.text}</div>}
                </div>
            </div>

            {/* Feedback Modal (NEW) */}
            <div id="feedbackModal" className={`modal ${feedbackModalOpen ? 'open' : ''}`}>
                <div className="modal-content" style={{ backgroundColor: '#1a1f26', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '1px solid #30363d', padding: '25px', color: 'white', overflowY: 'auto', maxHeight: '90vh' }}>
                    <span className="close-button" onClick={() => setFeedbackModalOpen(false)} style={{ color: '#aaa', float: 'right', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer' }}>&times;</span>
                    <h2 style={{ color: '#fff', marginBottom: '20px' }}>User Feedback</h2>
                    {feedbackDisplayMessage.text && <div className={`message ${feedbackDisplayMessage.type}`} style={{ marginBottom: '15px' }}>{feedbackDisplayMessage.text}</div>}
                    {feedbackList.length > 0 ? (
                        <div style={{ overflowX: 'auto', width: '100%', boxSizing: 'border-box', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', backgroundColor: '#2a2f36' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#3a3f46' }}>
                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #40464e', textAlign: 'left' }}>User</th>
                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #40464e', textAlign: 'left' }}>Parcel Tracking ID</th>
                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #40464e', textAlign: 'left' }}>Rating</th>
                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #40464e', textAlign: 'left' }}>Feedback</th>
                                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #40464e', textAlign: 'left' }}>Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbackList.map(feedback => (
                                        <tr key={feedback.id} style={{ borderBottom: '1px solid #30363d' }}>
                                            <td style={{ padding: '10px 8px' }}>{feedback.username} (ID: {feedback.userId})</td>
                                            <td style={{ padding: '10px 8px' }}>{feedback.parcelTrackingId} (ID: {feedback.parcelId})</td>
                                            <td style={{ padding: '10px 8px' }}>{'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}</td> {/* Star representation */}
                                            <td style={{ padding: '10px 8px' }}>{feedback.feedbackText}</td>
                                            <td style={{ padding: '10px 8px' }}>{new Date(feedback.submittedAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>No feedback submitted yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
