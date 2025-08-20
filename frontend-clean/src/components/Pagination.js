// src/components/Pagination.js
import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
    // Generate an array of page numbers for display
    const pages = [...Array(totalPages).keys()].map(i => i + 1);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
            {/* Previous Page Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1} // Disable if on the first page
                style={{ padding: '8px 12px', margin: '0 5px', borderRadius: '5px', border: '1px solid #007bff', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}
            >
                Previous
            </button>

            {/* Page Number Buttons */}
            {pages.map(page => (
                <button
                    key={page} // Unique key for each button
                    onClick={() => onPageChange(page)}
                    style={{
                        padding: '8px 12px',
                        margin: '0 5px',
                        borderRadius: '5px',
                        border: `1px solid ${currentPage === page ? '#0056b3' : '#ddd'}`, // Highlight current page
                        backgroundColor: currentPage === page ? '#0056b3' : '#f0f0f0',
                        color: currentPage === page ? 'white' : 'black',
                        cursor: 'pointer'
                    }}
                >
                    {page}
                </button>
            ))}

            {/* Next Page Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages} // Disable if on the last page
                style={{ padding: '8px 12px', margin: '0 5px', borderRadius: '5px', border: '1px solid #007bff', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}
            >
                Next
            </button>
        </div>
    );
}

export default Pagination;