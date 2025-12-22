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
    // 1. Page Container
    pageContainer: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: "'Poppins', sans-serif",
        gap: '20px',
        paddingBottom: '20px'
    },

    // 2. Header
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#ffffff', 
        padding: '20px',            
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        boxSizing: 'border-box'
    },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: {
        backgroundColor: '#d1fae5', color: '#059669', padding: '12px',
        borderRadius: '12px', fontSize: '24px', display: 'flex',
    },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    alertBadge: {
        display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fee2e2', color: '#991b1b',
        padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600'
    },

    // 3. Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '100%'
    },
    statCard: {
        padding: '24px', borderRadius: '20px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '120px'
    },
    cardBlue: { background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', color: 'white' },
    cardTeal: { background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', color: 'white' },
    cardPurple: { background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)', color: 'white' },
    
    statValue: { fontSize: '28px', fontWeight: '700', margin: 0 },
    statLabel: { fontSize: '14px', margin: 0, opacity: 0.9 },
    statIconBox: {
        width: '50px', height: '50px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(5px)',
    },

    // 4. Content Panel
    contentPanel: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '30px',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        gap: '20px'
    },

    // Controls Row
    controlsRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%'
    },
    searchBox: { position: 'relative', width: '300px' },
    searchInput: {
        width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', 
        border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px',
        boxSizing: 'border-box'
    },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    actionGroup: { display: 'flex', gap: '10px' },
    
    filterSelect: { 
        padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', 
        outline: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#475569'
    },
    addBtn: {
        backgroundColor: '#0f172a', color: 'white', border: 'none', 
        padding: '10px 20px', borderRadius: '8px', fontWeight: '600', 
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
    },

    // Table
    tableContainer: { width: '100%', overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '12px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { 
        textAlign: 'left', padding: '16px', backgroundColor: '#f8fafc', 
        color: '#64748b', fontSize: '12px', fontWeight: '700', 
        textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' 
    },
    td: { padding: '16px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155', verticalAlign: 'middle' },
    
    iconBtn: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', padding: '5px', transition: 'transform 0.2s' },

    // Pagination
    pagination: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', paddingTop: '10px' },
    pageBtn: { border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    // Modal
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', width: '500px', borderRadius: '16px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .icon-btn:hover { transform: scale(1.1); }
      `}</style>

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
             {loading && <span style={{color:'#64748b', fontSize:'14px', display:'flex', alignItems:'center', gap:'5px'}}><FaSyncAlt className="spin"/> Syncing...</span>}
             {outOfStockCount > 0 && (
                <div style={styles.alertBadge}>
                    <FaExclamationCircle /> {outOfStockCount} Items Critical
                </div>
             )}
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.cardBlue}}>
                <div>
                    <h3 style={styles.statValue}>{totalItems}</h3>
                    <span style={styles.statLabel}>Total Products</span>
                </div>
                <div style={styles.statIconBox}><FaBoxOpen /></div>
            </div>

            <div style={{...styles.statCard, ...styles.cardTeal}}>
                <div>
                    <h3 style={styles.statValue}>{lowStockCount}</h3>
                    <span style={styles.statLabel}>Low Stock</span>
                </div>
                <div style={styles.statIconBox}><FaClipboardList /></div>
            </div>

            <div style={{...styles.statCard, ...styles.cardPurple}}>
                <div>
                    <h3 style={styles.statValue}>{outOfStockCount}</h3>
                    <span style={styles.statLabel}>Out of Stock</span>
                </div>
                <div style={styles.statIconBox}><FaExclamationCircle /></div>
            </div>
        </div>

        {/* --- CONTENT PANEL --- */}
        <div style={styles.contentPanel}>
            
            {/* Controls */}
            <div style={styles.controlsRow}>
                <div style={styles.searchBox}>
                    <FaSearch style={styles.searchIcon} />
                    <input type="text" placeholder="Search medicine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput}/>
                </div>

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

            {/* Table */}
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
                                        <div style={{display:'flex', alignItems:'center', gap:'10px', width:'150px'}}>
                                            <div style={{flex:1, height:'6px', backgroundColor:'#f1f5f9', borderRadius:'3px', overflow:'hidden'}}>
                                                <div style={{width:`${percentage}%`, height:'100%', backgroundColor: status.color, borderRadius:'3px'}}></div>
                                            </div>
                                            <span style={{fontSize:'12px', fontWeight:'600'}}>{item.stock}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'700', color: status.color, backgroundColor: status.bg}}>{status.label}</span>
                                    </td>
                                    <td style={{...styles.td, textAlign:'right'}}>
                                        <button className="icon-btn" style={{...styles.iconBtn, color:'#3b82f6'}} onClick={() => { setEditingItem(item); setShowModal(true); }}><FaEdit /></button>
                                        <button className="icon-btn" style={{...styles.iconBtn, color:'#ef4444'}} onClick={() => deleteItem(item._id || item.id)}><FaTrash /></button>
                                    </td>
                                </tr>
                            )
                        })}
                        {displayedItems.length === 0 && (
                            <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>No items found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
                <span style={{fontSize:'13px', color:'#64748b'}}>Page {currentPage} of {totalPages || 1}</span>
                <div style={{display:'flex', gap:'5px'}}>
                    <button disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)} style={{...styles.pageBtn, opacity: currentPage===1 ? 0.5 : 1}}><FaChevronLeft/></button>
                    <button disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)} style={{...styles.pageBtn, opacity: currentPage===totalPages ? 0.5 : 1}}><FaChevronRight/></button>
                </div>
            </div>
        </div>

        {/* --- MODAL --- */}
        {showModal && (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <h3 style={{margin:0, color:'#1e293b'}}>{editingItem.id || editingItem._id ? 'Edit Item' : 'Add New Item'}</h3>
                        <button onClick={() => setShowModal(false)} style={{border:'none', background:'transparent', fontSize:'18px', cursor:'pointer', color:'#64748b'}}><FaTimes /></button>
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

                        <button type="submit" style={{width:'100%', padding:'12px', backgroundColor:'#0f172a', color:'white', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer', fontSize:'14px'}}>
                            Save Item
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default Inventory;