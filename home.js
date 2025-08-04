import React from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.heroSection}>
      <div className={styles.imageOverlay}></div>

      <img src="/Eco-home.webp" alt="EcoWare background 1" className={styles.heroImage} />
      <img src="/Eco-home.webp" alt="EcoWare background 2" className={styles.heroImage} />

      <div className={styles.heroOverlay}>
        <p className={styles.heroSubtitle}>
          ECOWARE: Sustainable, compostable solutions that help you reduce waste without compromising on quality.
        </p>

        <Link href="/about" legacyBehavior>
          <a className={styles.learnMoreBtn}>Learn More</a>
        </Link>
      </div>
    </div>
  );
}