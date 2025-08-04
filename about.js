import { useEffect, useState } from 'react';
import styles from '../styles/About.module.css';
import Navbar from '../components/Navbar';
import Link from 'next/link';


const backgroundImages = ['/leaves.jpg', '/leaves.jpg'];

export default function About() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // changes every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={styles.aboutContainer}
      style={{
        backgroundImage: `url(${backgroundImages[bgIndex]})`,
        transition: 'background-image 1s ease-in-out',
      }}
    >
      <div className={styles.aboutContent}>
        <h1 className={styles.aboutTitle}>About EcoWare</h1>

        <div className={styles.aboutSection}>
          <h2>Our Mission</h2>
          <p>
            At EcoWare, we aim to transform how businesses and communities engage with sustainable goods. 
            Our mission is to eliminate single-use plastics and empower vendors with affordable, earth-friendly alternatives.
          </p>
        </div>

        <div className={styles.aboutSection}>
          <h2>What We Do</h2>
          <p>
            From compostable packaging to biodegradable tableware, we partner with artisans, local makers, 
            and innovative green tech suppliers to deliver products that are good for business and better for the planet.
          </p>
        </div>

        <div className={styles.aboutSection}>
          <h2>Why EcoWare?</h2>
          <p>
            EcoWare is more than just a marketplace — we’re a movement. We help vendors make the switch 
            to sustainable solutions while promoting transparency, low-impact logistics, and community-based sourcing.
          </p>
        </div>

        <div className={styles.aboutSection}>
          <h2>Looking Ahead</h2>
          <p>
            Whether you're a startup, school, restaurant, or nonprofit, we believe sustainability should be easy to access. 
            Join us as we lead the charge toward a zero-waste future, one product at a time.
          </p>
          <Link href="/add" legacyBehavior>
  <a className={styles.submitBtn}>Submit a Vendor Request</a>
</Link>
        </div>
      </div>
    </div>
  );
}