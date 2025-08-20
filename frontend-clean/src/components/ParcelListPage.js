// src/pages/ParcelListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/UserAuthContext'; // Match your context path
import api from '../services/api';
import Pagination from '../components/Pagination'; // Import Pagination component

function ParcelListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [parcels, setParcels] = useState([]);
    const [parcelMessage, setParcelMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('asc');

    // State for edit modal (similar to AdminDashboard)
    const [editingParcel, setEditingParcel] = useState(null);
    const [editParcelModalOpen, setEditParcelModalOpen] = useState(false);
    const [editParcelMessage, setEditParcelMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        // Redirect if not logged in or not an admin
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        fetchParcels();
    }, [user, navigate, searchTerm, currentPage, pageSize, sortBy, sortDir]); // Re-fetch data whenever these change

    const fetchParcels = async () => {
        try {
            // API call to backend with pagination and search parameters
            // Note: Backend page numbers are 0-indexed, so send currentPage - 1
            // Use the /parcels/all endpoint as defined in ParcelController
            const response = await api.get(`/parcels/all?page=${currentPage - 1}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}&searchTerm=${searchTerm}`);
            setParcels(response.data.content);
            setTotalPages(response.data.totalPages);
            setParcelMessage({ text: '', type: '' }); // Clear message on successful fetch
        } catch (error) {
            console.error('Failed to fetch parcels:', error.response?.data || error.message);
            setParcelMessage({ text: 'Failed to load parcels. ' + (error.response?.data?.message || ''), type: 'error' });
        }
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on new search
        // fetchParcels will be triggered by useEffect due to searchTerm change
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

    // --- Edit Parcel Modal (logic copied from AdminDashboard) ---
    const handleEditParcelClick = (parcelToEdit) => {
        setEditingParcel(parcelToEdit);
        setEditParcelModalOpen(true);
        setEditParcelMessage({ text: '', type: '' }); // Clear any old messages
    };

    const handleEditParcelChange = (e) => {
        setEditingParcel({ ...editingParcel, [e.target.name]: e.target.value });
    };

    const handleEditParcelSubmit = async (e) => {
        e.preventDefault();
        setEditParcelMessage({ text: '', type: '' }); // Clear previous messages
        try {
            const response = await api.put(`/parcels/${editingParcel.id}`, editingParcel);
            setEditParcelMessage({ text: `Parcel ${response.data.trackingId} updated successfully!`, type: 'success' });
            setEditParcelModalOpen(false); // Close modal
            fetchParcels(); // Refresh parcel list
        } catch (error) {
            console.error('Edit parcel error:', error.response?.data || error.message);
            setEditParcelMessage({ text: error.response?.data?.message || 'Failed to update parcel.', type: 'error' });
        }
    };

    const handleDeleteParcelClick = async (parcelId) => {
        // Use a custom modal or confirmation for better UX than window.confirm
        if (window.confirm(`Are you sure you want to delete Parcel ID ${parcelId}?`)) {
            try {
                await api.delete(`/parcels/${parcelId}`);
                setParcelMessage({ text: 'Parcel deleted successfully!', type: 'success' });
                fetchParcels(); // Refresh parcel list
            } catch (error) {
                console.error('Delete parcel error:', error.response?.data || error.message);
                setParcelMessage({ text: error.response?.data?.message || 'Failed to delete parcel.', type: 'error' });
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
                <h2>All Registered Parcels</h2>
            </div>

            {/* Search and Pagination Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search by tracking ID, sender, recipient..."
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

            {/* Parcel List Table */}
            <div style={{ overflowX: 'auto', width: '100%', boxSizing: 'border-box' }}>
                <table>
                    <thead>
                        <tr>
                            {/* Table Headers with Sort functionality */}
                            <th onClick={() => handleSortChange('id')} style={{ cursor: 'pointer' }}>
                                ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('trackingId')} style={{ cursor: 'pointer' }}>
                                Tracking ID {sortBy === 'trackingId' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('senderName')} style={{ cursor: 'pointer' }}>
                                Sender {sortBy === 'senderName' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('recipientName')} style={{ cursor: 'pointer' }}>
                                Recipient {sortBy === 'recipientName' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('status')} style={{ cursor: 'pointer' }}>
                                Status {sortBy === 'status' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('currentLocation')} style={{ cursor: 'pointer' }}>
                                Location {sortBy === 'currentLocation' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSortChange('user.username')} style={{ cursor: 'pointer' }}> {/* Note: Sorting by nested property might need backend config */}
                                Owner {sortBy === 'user.username' && (sortDir === 'asc' ? '▲' : '▼')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parcels.length > 0 ? (
                            parcels.map(parcel => (
                                <tr key={parcel.id}>
                                    <td>{parcel.id}</td>
                                    <td>{parcel.trackingId}</td>
                                    <td>{parcel.senderName}</td>
                                    <td>{parcel.recipientName}</td>
                                    <td><span className={`status-badge status-${parcel.status.toLowerCase()}`}>{parcel.status.replace('_', ' ')}</span></td>
                                    <td>{parcel.currentLocation || 'N/A'}</td>
                                    <td>{parcel.username} (ID: {parcel.userId})</td>
                                    <td className="action-buttons">
                                        <button onClick={() => handleEditParcelClick(parcel)} className="secondary-button">Edit</button>
                                        <button onClick={() => handleDeleteParcelClick(parcel.id)} className="delete-button">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="placeholder-text">No parcels found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {parcelMessage.text && <div className={`message ${parcelMessage.type}`}>{parcelMessage.text}</div>}

            {/* Pagination Component */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* Edit Parcel Modal (copied from AdminDashboard) */}
            <div id="editParcelModal" className={`modal ${editParcelModalOpen ? 'open' : ''}`}>
                <div className="modal-content">
                    <span className="close-button" onClick={() => setEditParcelModalOpen(false)}>&times;</span>
                    <h2>Edit Parcel: {editingParcel?.trackingId}</h2>
                    {editingParcel && (
                        <form onSubmit={handleEditParcelSubmit}>
                            <input type="hidden" id="editParcelId" value={editingParcel.id} />
                            <label htmlFor="editSenderName">Sender Name:</label>
                            <input type="text" id="editSenderName" name="senderName" value={editingParcel.senderName} onChange={handleEditParcelChange} required />
                            <label htmlFor="editSenderAddress">Sender Address:</label>
                            <input type="text" id="editSenderAddress" name="senderAddress" value={editingParcel.senderAddress} onChange={handleEditParcelChange} required />
                            <label htmlFor="editRecipientName">Recipient Name:</label>
                            <input type="text" id="editRecipientName" name="recipientName" value={editingParcel.recipientName} onChange={handleEditParcelChange} required />
                            <label htmlFor="editRecipientAddress">Recipient Address:</label>
                            <input type="text" id="editRecipientAddress" name="recipientAddress" value={editingParcel.recipientAddress} onChange={handleEditParcelChange} required />
                            <label htmlFor="recipientEmail">Recipient Email:</label>
                            <input type="email" id="editRecipientEmail" name="recipientEmail" value={editingParcel.recipientEmail || ''} onChange={handleEditParcelChange} required />
                            <label htmlFor="editDescription">Description (Optional):</label>
                            <input type="text" id="editDescription" name="description" value={editingParcel.description || ''} onChange={handleEditParcelChange} />
                            <label htmlFor="editStatus">Status:</label>
                            <select id="editStatus" name="status" value={editingParcel.status} onChange={handleEditParcelChange}>
                                <option value="PENDING">PENDING</option>
                                <option value="DISPATCHED">DISPATCHED</option>
                                <option value="IN_TRANSIT">IN TRANSIT</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="RETURNED">RETURNED</option>
                            </select>
                            <label htmlFor="editCurrentLocation">Current Location (Optional):</label>
                            <input type="text" id="editCurrentLocation" name="currentLocation" value={editingParcel.currentLocation || ''} onChange={handleEditParcelChange} />
                            <button type="submit">Save Parcel Changes</button>
                        </form>
                    )}
                    {editParcelMessage.text && <div className={`message ${editParcelMessage.type}`}>{editParcelMessage.text}</div>}
                </div>
            </div>
        </div>
    );
}

export default ParcelListPage;