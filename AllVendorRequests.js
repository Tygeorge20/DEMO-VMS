import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import { RoleContext } from '../context/RoleContext';
import styles from '../styles/AllVendorRequests.module.css';

export default function AllVendorRequests() {
  const { role } = useContext(RoleContext);
  const router = useRouter();

  const [vendorRequests, setVendorRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (role !== 'admin') router.push('/home');
  }, [role]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('vendor_request')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching vendor requests:', error);
    else setVendorRequests(data);
  };

  const columnMap = {
    'Organization': 'name',
    'Contact': 'contact',
    'Email': 'email',
    'Phone': 'phone',
    'Address': 'address',
    'City': 'city',
    'State': 'state',
    'Delivery Date': 'requested_delivery',
    'Supplies': 'supplies',
    'Website': 'company_web',
    'Status': 'completion',
    'Approval': 'approved',
    'Start Date': 'start_date',
    'Document': 'document_path',
    'Created At': 'created_at',
  };

  const handleSort = (label) => {
    const key = columnMap[label];
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getArrow = (label) => {
    const key = columnMap[label];
    return sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : '';
  };

  const filteredRequests = vendorRequests.filter((req) => {
    const value = searchTerm.toLowerCase();
    return (
      req.name?.toLowerCase().includes(value) ||
      req.contact?.toLowerCase().includes(value) ||
      req.email?.toLowerCase().includes(value) ||
      req.phone?.toLowerCase().includes(value) ||
      req.address?.toLowerCase().includes(value) ||
      req.city?.toLowerCase().includes(value) ||
      req.state?.toLowerCase().includes(value) ||
      req.supplies?.toLowerCase().includes(value) ||
      req.company_web?.toLowerCase().includes(value) ||
      req.completion?.toLowerCase().includes(value) ||
      (req.approved ? 'approved' : 'not approved').includes(value)
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aVal = a[sortConfig.key] ?? '';
    const bVal = b[sortConfig.key] ?? '';
    return sortConfig.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const downloadCSV = () => {
    const headers = Object.keys(columnMap);

    const rows = filteredRequests.map((req) => [
      req.name || '', req.contact || '', req.email || '', req.phone || '', req.address || '',
      req.city || '', req.state || '', req.requested_delivery || '', req.supplies || '',
      req.company_web || '', req.completion || '',
      req.approved ? 'Approved' : 'Not Approved',
      req.start_date ? new Date(req.start_date).toLocaleString() : '',
      req.document_path || '', new Date(req.created_at).toLocaleString() || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vendor_requests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCompletionToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'complete' ? 'incomplete' : 'complete';
    const { error } = await supabase
      .from('vendor_request')
      .update({ completion: newStatus })
      .eq('id', id);
    if (!error) fetchRequests();
  };

  const handleApprovalToggle = async (id, approved) => {
    const updates = {
      approved: !approved,
      start_date: !approved ? new Date().toISOString() : null,
    };
    const { error } = await supabase
      .from('vendor_request')
      .update(updates)
      .eq('id', id);
    if (!error) fetchRequests();
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.heading}>All Vendor Requests</h1>

        <div className={styles.controls}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Search across Organization, Contact, Email, Phone, Address, City, State, Supplies, Website, Approval or Status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className={styles.downloadButton} onClick={downloadCSV}>
            ⬇️ Export CSV
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.tableContainer}>
            <table className={styles.scrollableTable}>
              <thead>
                <tr>
                  {Object.keys(columnMap).map((label) => (
                    <th key={label} onClick={() => handleSort(label)}>
                      {label}{getArrow(label)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.name}</td>
                    <td>{req.contact}</td>
                    <td>{req.email}</td>
                    <td>{req.phone}</td>
                    <td>{req.address}</td>
                    <td>{req.city || '—'}</td>
                    <td>{req.state || '—'}</td>
                    <td>{req.requested_delivery ? new Date(req.requested_delivery).toLocaleDateString() : '—'}</td>
                    <td>{req.supplies || '—'}</td>
                    <td>
                      {req.company_web ? (
                        <a href={req.company_web.startsWith('http') ? req.company_web : `https://${req.company_web}`} target="_blank" rel="noopener noreferrer">
                          {req.company_web}
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <button className={styles.statusBtn} onClick={() => handleCompletionToggle(req.id, req.completion)}>
                        {req.completion || 'incomplete'}
                      </button>
                    </td>
                    <td>
                      <button className={styles.statusBtn} onClick={() => handleApprovalToggle(req.id, req.approved)}>
                        {req.approved ? 'Approved ✅' : 'Not Approved ❌'}
                      </button>
                    </td>
                    <td>{req.approved && req.start_date ? new Date(req.start_date).toLocaleString() : '—'}</td>
                    <td>
                      {req.document_path ? (
                        <a href={req.document_path} target="_blank" rel="noopener noreferrer">View</a>
                      ) : 'No File'}
                    </td>
                    <td>{new Date(req.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRequests.length > itemsPerPage && (
          <div className={styles.pagination}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}