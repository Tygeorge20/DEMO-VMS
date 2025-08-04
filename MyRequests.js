// pages/MyRequests.js
import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/MyRequests.module.css';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RoleContext } from '../context/RoleContext';

export default function MyRequests() {
  const { role } = useContext(RoleContext);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newFile, setNewFile] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const testUserEmail = 'testuser@email.com';
  const router = useRouter();

  useEffect(() => {
    if (role === 'admin') {
      alert('Admins are not allowed to access this page.');
      router.push('/home');
    } else {
      fetchRequests();
    }
  }, [role]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('vendor_request')
      .select('*')
      .eq('user_email', testUserEmail);

    if (error) console.error('Error fetching requests:', error);
    else setRequests(data);
  };

  const handleEditClick = (req) => {
    setEditingId(req.id);
    setEditedData({ ...req });
    setNewFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
    setNewFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getArrow = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    return '';
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    return sortConfig.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const filteredRequests = sortedRequests.filter((req) =>
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handleSaveEdit = async () => {
    let fileUrl = editedData.document_path;

    if (newFile) {
      const fileExt = newFile.name.split('.').pop();
      const filePath = `documents/${editingId}_${Date.now()}.${fileExt}`;
      if (fileUrl) {
        const oldPath = fileUrl.split('/storage/v1/object/public/')[1];
        await supabase.storage.from('vendor-documents').remove([oldPath]);
      }
      const { error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(filePath, newFile);
      if (uploadError) {
        console.error('File upload failed:', uploadError);
        return;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from('vendor-documents')
        .getPublicUrl(filePath);
      fileUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('vendor_request')
      .update({
        name: editedData.name,
        contact: editedData.contact,
        email: editedData.email,
        phone: editedData.phone,
        address: editedData.address,
        company_web: editedData.company_web,
        requested_delivery: editedData.requested_delivery,
        supplies: editedData.supplies,
        city: editedData.city,
        state: editedData.state,
        document_path: fileUrl,
        updated_at: new Date(),
      })
      .eq('id', editingId);

    if (error) console.error('Error updating request:', error);
    else {
      setEditingId(null);
      setEditedData({});
      setNewFile(null);
      fetchRequests();
    }
  };

  const handleDelete = async (id, documentPath) => {
    const confirmed = window.confirm('Are you sure you want to delete this request?');
    if (!confirmed) return;

    if (documentPath) {
      const path = documentPath.split('/storage/v1/object/public/')[1];
      await supabase.storage.from('vendor-documents').remove([path]);
    }

    const { error } = await supabase.from('vendor_request').delete().eq('id', id);
    if (error) console.error('Error deleting request:', error);
    else fetchRequests();
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>My Vendor Requests</h1>
      <p className={styles.subtext}>
        Below are the vendor requests you’ve submitted. Use the search bar to find specific entries.
      </p>
      <input
        className={styles.searchBar}
        type="text"
        placeholder="Search by Organization or Email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className={styles.submitAnotherBtn} onClick={() => router.push('/add')}>
        Submit Another Request
      </button>
      <table className={styles.table}>
        <thead>
          <tr>
            {['organization', 'contact', 'email', 'phone', 'address', 'city', 'state', 'requested date', 'supplies', 'company_web', 'completion', 'approved', 'start_date', 'document_path', 'created_at'].map((key) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                {key === 'document_path' ? 'File'
                  : key === 'company_web' ? 'Website'
                  : key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                {getArrow(key)}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRequests.map((req) => (
            <tr key={req.id}>
              {editingId === req.id ? (
                <>
                  {['name', 'contact', 'email', 'phone', 'address', 'city', 'state', 'requested_delivery', 'supplies', 'company_web'].map((field) => (
                    <td key={field}>
                      <input
                        name={field}
                        value={editedData[field] || ''}
                        onChange={handleInputChange}
                        type={field === 'requested_delivery' ? 'date' : 'text'}
                      />
                    </td>
                  ))}
                  <td>{req.completion}</td>
                  <td>{req.approved ? 'Approved' : 'Not Approved'}</td>
                  <td>{req.approved && req.start_date ? new Date(req.start_date).toLocaleDateString() : '—'}</td>
                  <td>
                    {req.document_path ? (
                      <a href={req.document_path} target="_blank" rel="noopener noreferrer">View</a>
                    ) : 'No File'}
                    <input type="file" onChange={handleFileChange} />
                  </td>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                  <td>
                    <button onClick={handleSaveEdit}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{req.name}</td>
                  <td>{req.contact}</td>
                  <td>{req.email}</td>
                  <td>{req.phone}</td>
                  <td>{req.address}</td>
                  <td>{req.city}</td>
                  <td>{req.state}</td>
                  <td>{req.requested_delivery ? new Date(req.requested_delivery).toLocaleDateString() : '—'}</td>
                  <td>{req.supplies || '—'}</td>
                  <td>
                    {req.company_web ? (
                      <a
  href={req.company_web?.startsWith('http') ? req.company_web : `https://${req.company_web}`}
  target="_blank"
  rel="noopener noreferrer"
>
  {req.company_web}
</a>
                    ) : '—'}
                  </td>
                  <td>{req.completion}</td>
                  <td>{req.approved ? 'Approved' : 'Not Approved'}</td>
                  <td>{req.approved && req.start_date ? new Date(req.start_date).toLocaleDateString() : '—'}</td>
                  <td>
                    {req.document_path ? (
                      <a href={req.document_path} target="_blank" rel="noopener noreferrer">View</a>
                    ) : 'No File'}
                  </td>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleEditClick(req)} className={styles.iconBtn}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(req.id, req.document_path)} className={styles.iconBtn}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredRequests.length > itemsPerPage && (
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}