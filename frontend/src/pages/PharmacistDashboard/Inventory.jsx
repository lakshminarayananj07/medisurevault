import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext'; // To get currentUser ID
// You need to create these functions in your apiService (See Part 2 below)
import { 
  getInventoryAPI, 
  addInventoryItemAPI, 
  updateInventoryItemAPI, 
  deleteInventoryItemAPI 
} from '../../services/apiService'; 
import './Inventory.css';
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaExclamationCircle, 
  FaBoxOpen, FaClipboardList, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaSyncAlt 
} from 'react-icons/fa';

const Inventory = () => {
  const { currentUser } = useAppContext();
  
  // 1. STATE: Start empty, fill from DB
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [showModal, setShowModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState({ 
    id: null, name: '', type: 'Tablet', batch: '', expiry: '', stock: 0, lowLimit: 10, highLimit: 100 
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // --- 2. FETCH DATA FROM DATABASE ---
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const pharmacistId = currentUser?.id || currentUser?._id;
      // Assuming your API takes a pharmacist ID to load their specific stock
      const result = await getInventoryAPI(pharmacistId);
      
      if (result.success) {
        setMedicines(result.data);
      } else {
        console.error("Failed to load inventory");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    if (currentUser) {
      fetchInventory();
    }
  }, [currentUser]);

  // --- STATS ---
  const totalItems = medicines.length;
  const lowStockCount = medicines.filter(m => m.stock > 0 && m.stock <= m.lowLimit).length;
  const outOfStockCount = medicines.filter(m => m.stock === 0).length;

  // --- FILTERING ---
  const filteredMedicines = medicines.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.batch.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'low') return matchesSearch && item.stock > 0 && item.stock <= item.lowLimit;
    if (filter === 'out') return matchesSearch && item.stock === 0;
    return matchesSearch;
  });

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);
  if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedItems = filteredMedicines.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- HANDLERS (DATABASE INTERACTION) ---
  
  const handleSaveItem = async (e) => {
    e.preventDefault();
    const pharmacistId = currentUser?.id || currentUser?._id;

    try {
      if (editingItem._id || editingItem.id) {
        // UPDATE EXISTING (PUT)
        // Use _id if coming from Mongo, or id if from temp state
        const itemId = editingItem._id || editingItem.id;
        const result = await updateInventoryItemAPI(itemId, editingItem);
        if (result.success) {
          // Optimistic UI Update or Refetch
          fetchInventory(); 
          setShowModal(false);
        } else {
          alert("Failed to update item");
        }
      } else {
        // ADD NEW (POST)
        const newItem = { ...editingItem, pharmacistId };
        const result = await addInventoryItemAPI(newItem);
        if (result.success) {
          fetchInventory();
          setShowModal(false);
        } else {
          alert("Failed to add item");
        }
      }
      // Reset Form
      setEditingItem({ id: null, name: '', type: 'Tablet', batch: '', expiry: '', stock: 0, lowLimit: 10, highLimit: 100 });
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item. Check console.");
    }
  };

  const deleteItem = async (id) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
        try {
          const result = await deleteInventoryItemAPI(id);
          if (result.success) {
            fetchInventory(); // Refresh list
          } else {
            alert("Failed to delete item");
          }
        } catch (error) {
          console.error("Error deleting:", error);
        }
    }
  };

  const openAddModal = () => {
    setEditingItem({ id: null, name: '', type: 'Tablet', batch: '', expiry: '', stock: 0, lowLimit: 10, highLimit: 100 });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const getStockStatus = (item) => {
    if (item.stock === 0) return { label: 'Out of Stock', class: 'status-out' };
    if (item.stock <= item.lowLimit) return { label: 'Low Stock', class: 'status-low' };
    if (item.stock >= item.highLimit) return { label: 'Overstocked', class: 'status-high' };
    return { label: 'In Stock', class: 'status-ok' };
  };

  return (
    <div className="inventory-page">
      
      {/* Header */}
      <div className="inv-header">
        <div className="title-section">
          <h1>Stock Management</h1>
          <p>Real-time inventory tracking with custom alerts.</p>
        </div>
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
            {loading && <span style={{color:'#64748b'}}><FaSyncAlt className="spin-icon"/> Syncing...</span>}
            {outOfStockCount > 0 && (
            <div className="critical-alert">
                <FaExclamationCircle />
                <span>Action Required: {outOfStockCount} items out of stock!</span>
            </div>
            )}
        </div>
      </div>

      {/* Stats */}
      <div className="inv-stats-grid">
        <div className="inv-stat-card">
          <div className="icon-box blue"><FaBoxOpen /></div>
          <div><h3>{totalItems}</h3><span>Total Products</span></div>
        </div>
        <div className="inv-stat-card">
          <div className="icon-box orange"><FaClipboardList /></div>
          <div><h3>{lowStockCount}</h3><span>Low Stock Alerts</span></div>
        </div>
        <div className="inv-stat-card">
          <div className="icon-box red"><FaExclamationCircle /></div>
          <div><h3>{outOfStockCount}</h3><span>Critical (0 Qty)</span></div>
        </div>
      </div>

      {/* Controls */}
      <div className="inv-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search medicine..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-dropdown">
            <FaFilter />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <button className="add-btn" onClick={openAddModal}>
            <FaPlus /> Add New Item
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-scroll-wrapper"> 
            <table className="inv-table">
            <thead>
                <tr>
                <th>Medicine Name</th>
                <th>Batch</th>
                <th>Limits (Low/High)</th>
                <th style={{width: '25%'}}>Stock Level</th>
                <th>Status</th>
                <th style={{textAlign:'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="no-data">Loading inventory...</td></tr>
                ) : displayedItems.length > 0 ? (
                    displayedItems.map((item) => {
                        const status = getStockStatus(item);
                        const percentage = Math.min((item.stock / item.highLimit) * 100, 100);
                        const itemId = item._id || item.id; // Support both DB _id and generic id

                        return (
                            <tr key={itemId} className={item.stock === 0 ? 'row-critical' : ''}>
                            <td>
                                <div className="fw-bold">{item.name}</div>
                                <small className="text-muted">{item.type} • Exp: {item.expiry}</small>
                            </td>
                            <td>{item.batch}</td>
                            <td className="text-small">
                                Min: {item.lowLimit} <br/> Max: {item.highLimit}
                            </td>
                            <td>
                                <div className="stock-visual">
                                    <div className="stock-info-row">
                                        <span className="stock-qty">{item.stock} units</span>
                                        <span className="stock-pct">{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="stock-bar-wrapper">
                                    <div 
                                        className={`stock-bar-fill ${status.class}`} 
                                        style={{width: `${percentage}%`}}
                                    ></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${status.class}`}>{status.label}</span>
                            </td>
                            <td style={{textAlign:'right'}}>
                                <button className="action-icon edit" onClick={() => openEditModal(item)}><FaEdit /></button>
                                <button className="action-icon delete" onClick={() => deleteItem(itemId)}><FaTrash /></button>
                            </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr><td colSpan="6" className="no-data">No items found. Add a new item to get started.</td></tr>
                )}
            </tbody>
            </table>
        </div>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
            <div className="pagination-footer">
                <span>Page {currentPage} of {totalPages || 1}</span>
                <div className="page-actions">
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="page-btn"
                    >
                        <FaChevronLeft />
                    </button>
                    <button 
                        disabled={currentPage === totalPages || totalPages === 0} 
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="page-btn"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Modal (Same as before) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content stock-modal">
            <div className="modal-header">
              <h3>{editingItem.id || editingItem._id ? 'Edit Stock & Limits' : 'Add New Medicine'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="form-group">
                <label>Medicine Name</label>
                <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} required placeholder="e.g. Paracetamol"/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={editingItem.type} onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}>
                    <option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Injection</option><option>Cream</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch No</label>
                  <input type="text" value={editingItem.batch} onChange={(e) => setEditingItem({...editingItem, batch: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                 <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={editingItem.expiry} onChange={(e) => setEditingItem({...editingItem, expiry: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label-highlight">Current Stock</label>
                  <input type="number" className="stock-input" value={editingItem.stock} onChange={(e) => setEditingItem({...editingItem, stock: parseInt(e.target.value) || 0})} required />
                </div>
              </div>
              <hr className="modal-divider" />
              <div className="limits-section">
                  <h4>Alert Settings</h4>
                  <div className="form-row">
                    <div className="form-group">
                        <label>Low Limit</label>
                        <input type="number" value={editingItem.lowLimit} onChange={(e) => setEditingItem({...editingItem, lowLimit: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="form-group">
                        <label>High Limit</label>
                        <input type="number" value={editingItem.highLimit} onChange={(e) => setEditingItem({...editingItem, highLimit: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">{editingItem.id || editingItem._id ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;