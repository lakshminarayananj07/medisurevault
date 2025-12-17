import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  getInventoryAPI, addInventoryItemAPI, 
  updateInventoryItemAPI, deleteInventoryItemAPI 
} from '../../services/apiService'; 
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaExclamationCircle, 
  FaBoxOpen, FaClipboardList, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaSyncAlt 
} from 'react-icons/fa';

const Inventory = () => {
  const { currentUser } = useAppContext();
  
  // --- STATES ---
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

  // --- FETCH DATA ---
  const fetchInventory = useCallback(async () => {
    const pharmacistId = currentUser?.id || currentUser?._id;
    if (!pharmacistId) return;

    try {
      setLoading(true);
      const result = await getInventoryAPI(pharmacistId);
      if (result.success) setMedicines(result.data);
    } catch (error) { 
      console.error("Error fetching inventory:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [currentUser]);

  // --- EFFECT ---
  useEffect(() => {
    if (currentUser) {
        fetchInventory();
    }
  }, [currentUser, fetchInventory]);

  // --- COMPUTED DATA ---
  const totalItems = medicines.length;
  const lowStockCount = medicines.filter(m => m.stock > 0 && m.stock <= m.lowLimit).length;
  const outOfStockCount = medicines.filter(m => m.stock === 0).length;

  const filteredMedicines = medicines.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.batch.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'low') return matchesSearch && item.stock > 0 && item.stock <= item.lowLimit;
    if (filter === 'out') return matchesSearch && item.stock === 0;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);
  const displayedItems = filteredMedicines.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- HANDLERS ---
  const handleSaveItem = async (e) => {
    e.preventDefault();
    const pharmacistId = currentUser?.id || currentUser?._id;
    try {
      if (editingItem._id || editingItem.id) {
        const itemId = editingItem._id || editingItem.id;
        await updateInventoryItemAPI(itemId, editingItem);
      } else {
        await addInventoryItemAPI({ ...editingItem, pharmacistId });
      }
      fetchInventory();
      setShowModal(false);
      setEditingItem({ id: null, name: '', type: 'Tablet', batch: '', expiry: '', stock: 0, lowLimit: 10, highLimit: 100 });
    } catch (error) { alert(error.message); }
  };

  const deleteItem = async (id) => {
    if(window.confirm('Delete this item?')) {
        await deleteInventoryItemAPI(id);
        fetchInventory();
    }
  };

  const getStockStatus = (item) => {
    if (item.stock === 0) return { label: 'Out of Stock', color: '#ef4444', bg: '#fee2e2' };
    if (item.stock <= item.lowLimit) return { label: 'Low', color: '#f59e0b', bg: '#fef3c7' };
    if (item.stock >= item.highLimit) return { label: 'Over', color: '#3b82f6', bg: '#dbeafe' };
    return { label: 'Good', color: '#10b981', bg: '#d1fae5' };
  };

  // --- STYLES ---
  const styles = {
    pageContainer: {
        height: 'calc(100vh - 60px)',
        width: '99%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '10px',
        overflow: 'hidden'
    },
    // HEADER
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '98%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: '20px' },
    headerIcon: {
        backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex',
    },
    headerTitle: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    alertBadge: {
        display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fee2e2', color: '#991b1b',
        padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600'
    },

    // CONTENT PANEL
    contentPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '25px',
        boxSizing: 'border-box',
        gap: '20px',
        overflow: 'hidden'
    },

    // STATS ROW
    statsGrid: { display: 'flex', gap: '20px', marginBottom: '10px' },
    statCard: {
        flex: 1, backgroundColor: '#f8fafc', padding: '15px 20px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0'
    },
    statValue: { fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: 0 },
    statLabel: { fontSize: '13px', color: '#64748b' },
    iconBox: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },

    // CONTROLS (Updated for Layout Revert)
    controlsRow: { 
        display: 'flex', 
        justifyContent: 'space-between', // Pushes Search Left, Actions Right
        alignItems: 'center',
        gap: '20px'
    },
    searchBox: { position: 'relative', width: '300px' },
    searchInput: {
        width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'
    },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    actionGroup: { display: 'flex', gap: '10px' },
    
    // Filter Select
    filterSelect: { 
        padding: '10px', 
        borderRadius: '8px', 
        border: '1px solid #cbd5e1', 
        outline: 'none', 
        cursor: 'pointer',
        whiteSpace: 'nowrap' 
    },

    // Add Button (Broad & Single Line)
    addBtn: {
        backgroundColor: '#0f172a', 
        color: 'white', 
        border: 'none', 
        padding: '10px 24px', 
        borderRadius: '8px',
        fontWeight: '600', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        whiteSpace: 'nowrap' 
    },

    // TABLE
    tableContainer: { flex: 1, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '12px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: '600', position: 'sticky', top: 0 },
    td: { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' },
    
    // Action Icons
    iconBtn: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', padding: '5px' },

    // Pagination
    pagination: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', paddingTop: '10px' },
    pageBtn: { border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' },

    // Modal
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', width: '500px', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#475569' }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={styles.pageContainer}>
        
        {/* --- HEADER --- */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaBoxOpen /></div>
            <div>
              <h1 style={styles.headerTitle}>Stock Management</h1>
              <p style={styles.headerSubtitle}>Real-time inventory tracking</p>
            </div>
          </div>
          <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
             {loading && <span style={{color:'#64748b', fontSize:'14px'}}><FaSyncAlt style={{animation:'spin 1s linear infinite'}}/> Syncing...</span>}
             {outOfStockCount > 0 && (
                <div style={styles.alertBadge}>
                    <FaExclamationCircle /> {outOfStockCount} Items Critical
                </div>
             )}
          </div>
        </div>

        {/* --- CONTENT PANEL --- */}
        <div style={styles.contentPanel}>
            
            {/* 1. Stats Summary */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div><h3 style={styles.statValue}>{totalItems}</h3><span style={styles.statLabel}>Total Products</span></div>
                    <div style={{...styles.iconBox, backgroundColor: '#dbeafe', color: '#2563eb'}}><FaBoxOpen /></div>
                </div>
                <div style={styles.statCard}>
                    <div><h3 style={styles.statValue}>{lowStockCount}</h3><span style={styles.statLabel}>Low Stock</span></div>
                    <div style={{...styles.iconBox, backgroundColor: '#ffedd5', color: '#ea580c'}}><FaClipboardList /></div>
                </div>
                <div style={styles.statCard}>
                    <div><h3 style={styles.statValue}>{outOfStockCount}</h3><span style={styles.statLabel}>Out of Stock</span></div>
                    <div style={{...styles.iconBox, backgroundColor: '#fee2e2', color: '#ef4444'}}><FaExclamationCircle /></div>
                </div>
            </div>

            {/* 2. Controls - Search LEFT, Buttons RIGHT */}
            <div style={styles.controlsRow}>
                {/* Search Box (Left) */}
                <div style={styles.searchBox}>
                    <FaSearch style={styles.searchIcon} />
                    <input type="text" placeholder="Search medicine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput}/>
                </div>

                {/* Action Buttons (Right) */}
                <div style={styles.actionGroup}>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterSelect}>
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                    <button style={styles.addBtn} onClick={() => { setEditingItem({ id: null, name: '', type: 'Tablet', batch: '', expiry: '', stock: 0, lowLimit: 10, highLimit: 100 }); setShowModal(true); }}>
                        <FaPlus /> Add New Item
                    </button>
                </div>
            </div>

            {/* 3. Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Medicine Name</th>
                            <th style={styles.th}>Batch</th>
                            <th style={styles.th}>Limits (Min/Max)</th>
                            <th style={styles.th}>Stock Level</th>
                            <th style={styles.th}>Status</th>
                            <th style={{...styles.th, textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((item) => {
                            const status = getStockStatus(item);
                            const percentage = Math.min((item.stock / item.highLimit) * 100, 100);
                            return (
                                <tr key={item._id || item.id}>
                                    <td style={styles.td}>
                                        <div style={{fontWeight:'600'}}>{item.name}</div>
                                        <div style={{fontSize:'12px', color:'#64748b'}}>{item.type} • Exp: {item.expiry}</div>
                                    </td>
                                    <td style={styles.td}>{item.batch}</td>
                                    <td style={styles.td}>{item.lowLimit} / {item.highLimit}</td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                            <div style={{flex:1, height:'6px', backgroundColor:'#f1f5f9', borderRadius:'3px'}}>
                                                <div style={{width:`${percentage}%`, height:'100%', backgroundColor: status.color, borderRadius:'3px'}}></div>
                                            </div>
                                            <span style={{fontSize:'12px', fontWeight:'600'}}>{item.stock}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'700', color: status.color, backgroundColor: status.bg}}>{status.label}</span>
                                    </td>
                                    <td style={{...styles.td, textAlign:'right'}}>
                                        <button style={{...styles.iconBtn, color:'#3b82f6'}} onClick={() => { setEditingItem(item); setShowModal(true); }}><FaEdit /></button>
                                        <button style={{...styles.iconBtn, color:'#ef4444'}} onClick={() => deleteItem(item._id || item.id)}><FaTrash /></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* 4. Pagination */}
            <div style={styles.pagination}>
                <span style={{fontSize:'13px', color:'#64748b'}}>Page {currentPage} of {totalPages || 1}</span>
                <div style={{display:'flex', gap:'5px'}}>
                    <button disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)} style={styles.pageBtn}><FaChevronLeft/></button>
                    <button disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)} style={styles.pageBtn}><FaChevronRight/></button>
                </div>
            </div>
        </div>

        {/* --- MODAL --- */}
        {showModal && (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <h3 style={{margin:0}}>{editingItem.id || editingItem._id ? 'Edit Item' : 'Add New Item'}</h3>
                        <button onClick={() => setShowModal(false)} style={{border:'none', background:'transparent', fontSize:'18px', cursor:'pointer'}}><FaTimes /></button>
                    </div>
                    <form onSubmit={handleSaveItem}>
                        <label style={styles.label}>Name</label>
                        <input style={styles.input} value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                        
                        <div style={{display:'flex', gap:'15px'}}>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Batch</label>
                                <input style={styles.input} value={editingItem.batch} onChange={e => setEditingItem({...editingItem, batch: e.target.value})} />
                            </div>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Expiry Date</label>
                                <input type="date" style={styles.input} value={editingItem.expiry} onChange={e => setEditingItem({...editingItem, expiry: e.target.value})} required />
                            </div>
                        </div>

                        <label style={styles.label}>Stock Quantity</label>
                        <input type="number" style={styles.input} value={editingItem.stock} onChange={e => setEditingItem({...editingItem, stock: parseInt(e.target.value)})} />

                        <div style={{display:'flex', gap:'15px'}}>
                            <div style={{flex:1}}>
                                <label style={styles.label}>Low Limit</label>
                                <input type="number" style={styles.input} value={editingItem.lowLimit} onChange={e => setEditingItem({...editingItem, lowLimit: parseInt(e.target.value)})} />
                            </div>
                            <div style={{flex:1}}>
                                <label style={styles.label}>High Limit</label>
                                <input type="number" style={styles.input} value={editingItem.highLimit} onChange={e => setEditingItem({...editingItem, highLimit: parseInt(e.target.value)})} />
                            </div>
                        </div>

                        <button type="submit" style={{width:'100%', padding:'12px', backgroundColor:'#0f172a', color:'white', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer'}}>Save Item</button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default Inventory;