// src/pages/UserListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/UserAuthContext'; // Match your context path
import api from '../services/api';
import Pagination from '../components/Pagination'; // Import Pagination component

function UserListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // 1-indexed for display
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Default page size
    const [sortBy, setSortBy] = useState('id'); // Default sort by ID
    const [sortDir, setSortDir] = useState('asc'); // Default sort direction

    // State for edit modal (similar to AdminDashboard)
    const [editingUser, setEditingUser] = useState(null);
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [editMessage, setEditMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        // Redirect if not logged in or not an admin
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [user, navigate, searchTerm, currentPage, pageSize, sortBy, sortDir]); // Re-fetch data whenever these change

    const fetchUsers = async () => {
        try {
            // API call to backend with pagination and search parameters
            // Note: Backend page numbers are 0-indexed, so send currentPage - 1
            const response = await api.get(`/users?page=${currentPage - 1}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}&searchTerm=${searchTerm}`);

            // Filter out the admin user from the displayed list if the backend returns them
            // This is a frontend filter, assuming backend returns all users
            const filteredUsers = response.data.content.filter(u => u.role === 'USER');
            setUsers(filteredUsers);
            setTotalPages(response.data.totalPages);
            setMessage({ text: '', type: '' }); // Clear message on successful fetch
        } catch (error) {
            console.error('Failed to fetch users:', error.response?.data || error.message);
            setMessage({ text: 'Failed to load users. ' + (error.response?.data?.message || ''), type: 'error' });
        }
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on new search
        // fetchUsers will be triggered by useEffect due to searchTerm change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page when page size changes
    };

    const handleSortChange = (field) => {
        const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDir(newSortDir);
        setCurrentPage(1); // Reset to first page on new sort
    };

    // --- Edit User Modal (logic copied from AdminDashboard) ---
    const handleEditClick = (userToEdit) => {
        setEditingUser({ ...userToEdit, password: '' }); // Don't pre-fill password for security
        setEditUserModalOpen(true);
        setEditMessage({ text: '', type: '' }); // Clear any old messages
    };

    const handleEditChange = (e) => {
        setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditMessage({ text: '', type: '' }); // Clear previous messages

        try {
            const updatePayload = {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                username: editingUser.username,
                email: editingUser.email,
                role: editingUser.role // Admin can change role
            };
            if (editingUser.password) { // Only send password if it's explicitly set by the user
                updatePayload.password = editingUser.password;
            }

            const response = await api.put(`/users/${editingUser.id}`, updatePayload);
            setEditMessage({ text: 'User updated successfully!', type: 'success' });
            setEditUserModalOpen(false); // Close modal
            fetchUsers(); // Refresh user list
        } catch (error) {
            console.error('Error updating user:', error.response?.data || error.message);
            setEditMessage({ text: error.response?.data?.message || 'Failed to update user.', type: 'error' });
        }
    };

    const handleDeleteClick = async (userId) => {
        // Use a custom modal or confirmation for better UX than window.confirm
        if (window.confirm(`Are you sure you want to delete user ID ${userId}?`)) {
            try {
                await api.delete(`/users/${userId}`);
                setMessage({ text: 'User deleted successfully!', type: 'success' });
                fetchUsers(); // Refresh user list
            } catch (error) {
                console.error('Delete user error:', error.response?.data || error.message);
                setMessage({ text: error.response?.data?.message || 'Failed to delete user.', type: 'error' });
            }
        }
    };


    if (!user) {
        return <div className="container">Loading user data...</div>;
    }

    return (
        <div className="container">
            <div className="dashboard-header">
                {/* Back button to Admin Dashboard */}
                <button onClick={() => navigate('/admin-dashboard')} className="back-button">&larr; Back to Admin Dashboard</button>
                <h2>All Registered Users</h2>
            </div>

            {/* Search and Pagination Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search by username, email, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }} // Trigger search on Enter
                    style={{ flexGrow: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <button onClick={handleSearch} style={{ padding: '8px 15px' }}>Search</button>
                <select onChange={handlePageSizeChange} value={pageSize} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}>
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                </select>
            </div>

            {/* User List Table */}
            <div style={{ overflowX: 'auto', width: '100%', boxSizing: 'border-box' }}>
                <table>
                    <thead>
                        <tr>
                            {/* Table Headers with Sort functionality */}
                            <th onClick={() => handleSortChange('id')} style={{ cursor: 'pointer' }}>
                                ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('username')} style={{ cursor: 'pointer', textAlign: 'left' }}>
                                Username {sortBy === 'username' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('email')} style={{ cursor: 'pointer', textAlign: 'left' }}>
                                Email {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('role')} style={{ cursor: 'pointer' }}>
                                Role {sortBy === 'role' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td style={{ textAlign: 'left' }}>{u.username}</td>
                                    <td style={{ textAlign: 'left' }}>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td className="action-buttons">
                                        <button onClick={() => handleEditClick(u)} className="secondary-button">Edit</button>
                                        <button onClick={() => handleDeleteClick(u.id)} className="delete-button">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="placeholder-text">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {/* Pagination Component */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* Edit User Modal (copied from AdminDashboard) */}
            <div id="editUserModal" className={`modal ${editUserModalOpen ? 'open' : ''}`}>
                <div className="modal-content">
                    <span className="close-button" onClick={() => setEditUserModalOpen(false)}>&times;</span>
                    <h2>Edit User</h2>
                    {editingUser && (
                        <form onSubmit={handleEditSubmit}>
                            <input type="hidden" id="editUserId" value={editingUser.id} />
                            <label htmlFor="editFirstName">First Name:</label>
                            <input type="text" id="editFirstName" name="firstName" value={editingUser.firstName} onChange={handleEditChange} />
                            <label htmlFor="editLastName">Last Name:</label>
                            <input type="text" id="editLastName" name="lastName" value={editingUser.lastName} onChange={handleEditChange} />
                            <label htmlFor="editUsername">Username:</label>
                            <input type="text" id="editUsername" name="username" value={editingUser.username} onChange={handleEditChange} />
                            <label htmlFor="editEmail">Email:</label>
                            <input type="email" id="editEmail" name="email" value={editingUser.email} onChange={handleEditChange} />
                            <label htmlFor="editPassword">New Password (leave blank to keep current):</label>
                            <input type="password" id="editPassword" name="password" value={editingUser.password} onChange={handleEditChange} />
                            <label htmlFor="editRole">Role:</label>
                            <select id="editRole" name="role" value={editingUser.role} onChange={handleEditChange}>
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                            <button type="submit">Save Changes</button>
                        </form>
                    )}
                    {editMessage.text && <div className={`message ${editMessage.type}`}>{editMessage.text}</div>}
                </div>
            </div>
        </div>
    );
}

export default UserListPage;