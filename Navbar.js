// components/Navbar.js
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { RoleContext } from '../context/RoleContext';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const { role, setRole } = useContext(RoleContext);
  const [isMobile, setIsMobile] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide menu after 7 seconds
  useEffect(() => {
    if (!peeked && !menuOpen) return;
    const timer = setTimeout(() => {
      setPeeked(false);
      setMenuOpen(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, [peeked, menuOpen]);

  return (
    <div className={styles.navbarPeekWrapper}>
      {/* Mobile Top Tap Zone */}
      {isMobile && (
        <div
          className={styles.peekZone}
          onClick={() => {
            setPeeked((prev) => !prev);
            if (menuOpen) setMenuOpen(false);
          }}
        />
      )}

      {/* Mobile Peek Menu Button */}
      {isMobile && peeked && (
        <div
          className={styles.mobilePeekBtn}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? 'Close Menu' : '☰ EcoWare'}
        </div>
      )}

      {/* Navbar Section */}
      <nav
        className={`${styles.navbar} ${
          isMobile && menuOpen ? styles.mobileVisible : ''
        }`}
      >
        <div className={styles.logoContainer}>
          <Link href="/home">
            <img src="/logo.png" alt="EcoWare Logo" className={styles.logo} />
          </Link>
        </div>

        <div className={styles.links}>
          <Link href="/home" className={styles.navLink}>Home</Link>
          <Link href="/about" className={styles.navLink}>About</Link>

          {role === 'admin' ? (
            <>
              <Link href="/AllVendorRequests" className={styles.navLink}>All Vendor Requests</Link>
              <Link href="/AdminAnalytics" className={styles.navLink}>Admin Analytics</Link>
            </>
          ) : (
            <>
              <Link href="/add" className={styles.navLink}>Vendor Request Form</Link>
              <Link href="/MyRequests" className={styles.navLink}>My Requests</Link>
            </>
          )}

          <button
            className={styles.roleBtn}
            onClick={() => setRole(role === 'admin' ? 'user' : 'admin')}
          >
            Switch to {role === 'admin' ? 'User' : 'Admin'}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;