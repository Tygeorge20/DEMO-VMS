// pages/AdminAnalytics.js
import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import { RoleContext } from '../context/RoleContext';
import styles from '../styles/AdminAnalytics.module.css';

const AdminAnalytics = () => {
  const { role } = useContext(RoleContext);
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'approvalRate', direction: 'asc' });
  const [filterColumn, setFilterColumn] = useState('email');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (role !== 'admin') {
      alert('Access restricted: Admins only');
      router.push('/home');
    }
  }, [role]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase.from('vendor_request').select('*');
    if (!error) setRequests(data);
  };

  const getEmailMetrics = () => {
    const metrics = {};

    requests.forEach((req) => {
      const email = req.email || 'Unknown';

      if (!metrics[email]) {
        metrics[email] = {
          total: 0,
          approved: 0,
          completed: 0,
        };
      }

      metrics[email].total++;
      if (req.approved) metrics[email].approved++;
      if (req.completion === 'complete') metrics[email].completed++;
    });

    return Object.entries(metrics).map(([email, data]) => ({
      email,
      totalOrders: data.total,
      approvalRate: ((data.approved / data.total) * 100).toFixed(2),
      completionRate: ((data.completed / data.total) * 100).toFixed(2),
    }));
  };

  const handleSort = (key) => {
    if (['approvalRate', 'completionRate', 'totalOrders'].includes(key)) {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
      setSortConfig({ key, direction });
    }
  };

  const sortedFilteredMetrics = () => {
    const allMetrics = getEmailMetrics();

    const filtered = allMetrics.filter((item) =>
      item[filterColumn]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (!['approvalRate', 'completionRate', 'totalOrders'].includes(sortConfig.key)) return 0;
      const valA = parseFloat(a[sortConfig.key]);
      const valB = parseFloat(b[sortConfig.key]);
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });

    return sorted;
  };

  const paginatedMetrics = () => {
    const data = sortedFilteredMetrics();
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };

  const averageRow = () => {
    const data = sortedFilteredMetrics();
    const total = data.length || 1;
    const avg = (key) =>
      (data.reduce((sum, item) => sum + parseFloat(item[key]), 0) / total).toFixed(2);

    return {
      email: 'Average',
      totalOrders: data.reduce((sum, item) => sum + item.totalOrders, 0),
      approvalRate: avg('approvalRate'),
      completionRate: avg('completionRate'),
    };
  };

  const getCellColor = (value) => {
    const num = parseFloat(value);
    if (num >= 75) return styles.green;
    if (num >= 50) return styles.yellow;
    return styles.red;
  };

  const downloadCSV = () => {
    const headers = ['Email', 'Total Orders', 'Approval Rate (%)', 'Completion Rate (%)'];
    const rows = sortedFilteredMetrics().map((row) =>
      [row.email, row.totalOrders, row.approvalRate, row.completionRate]
    );
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'email_analytics.csv';
    link.click();
  };

  const tooltip = {
    approvalRate: 'Percent of requests marked as approved.',
    completionRate: 'Percent of requests marked complete.',
    totalOrders: 'Total number of requests submitted by this email.',
  };

  const totalPages = Math.ceil(sortedFilteredMetrics().length / pageSize);

  if (role !== 'admin') return null;

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Admin Analytics</h1>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder={`Search by ${filterColumn}...`}
            className={styles.searchBar}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className={styles.dropdown}
            value={filterColumn}
            onChange={(e) => {
              setFilterColumn(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="email">Email</option>
            <option value="approvalRate">Approval Rate</option>
            <option value="completionRate">Completion Rate</option>
            <option value="totalOrders">Total Orders</option>
          </select>
          <button className={styles.downloadButton} onClick={downloadCSV}>⬇️ Export CSV</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.analyticsTable}>
            <thead>
              <tr>
                <th>Email</th>
                <th className={styles.sortable} onClick={() => handleSort('totalOrders')} title={tooltip.totalOrders}>
                  Total Orders
                </th>
                <th className={styles.sortable} onClick={() => handleSort('approvalRate')} title={tooltip.approvalRate}>
                  Approval Rate (%)
                </th>
                <th className={styles.sortable} onClick={() => handleSort('completionRate')} title={tooltip.completionRate}>
                  Completion Rate (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedMetrics().map((row, index) => (
                <tr key={index}>
                  <td>{row.email}</td>
                  <td>{row.totalOrders}</td>
                  <td className={getCellColor(row.approvalRate)}>{row.approvalRate}</td>
                  <td className={getCellColor(row.completionRate)}>{row.completionRate}</td>
                </tr>
              ))}
              <tr className={styles.averageRow}>
                <td><strong>{averageRow().email}</strong></td>
                <td>{averageRow().totalOrders}</td>
                <td className={getCellColor(averageRow().approvalRate)}>{averageRow().approvalRate}</td>
                <td className={getCellColor(averageRow().completionRate)}>{averageRow().completionRate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;