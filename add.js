import React, { useState, useContext } from 'react';
import { RoleContext } from '../context/RoleContext';
import styles from '../styles/AddVendorRequest.module.css';
import { supabase } from '../utils/supabaseClient';

export default function VendorForm() {
  const { role } = useContext(RoleContext);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    company_web: '',
    requested_delivery: '',
    supplies: '',
    city: '',
    state: '',
  });

  const [file, setFile] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowToast(false);

    const { city, state, supplies, requested_delivery } = formData;

    if (!city || !state || !supplies) {
      alert('Please complete the City, State, and Supplies Needed fields before submitting.');
      return;
    }

    if (requested_delivery) {
      const today = new Date();
      const selectedDate = new Date(requested_delivery);
      today.setHours(0, 0, 0, 0); // Strip time
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert('Requested delivery date cannot be in the past.');
        return;
      }
    }

    let fileUrl = null;

    if (file) {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `documents/${Date.now()}_${sanitizedFileName}`;
      const { data, error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('File upload failed.');
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from('vendor-documents')
        .getPublicUrl(filePath);

      fileUrl = publicData.publicUrl;
    }

    const { error } = await supabase.from('vendor_request').insert([
      {
        ...formData,
        user_email: 'testuser@email.com',
        status: 'pending',
        completion: 'incomplete',
        document_path: fileUrl,
      },
    ]);

    if (error) {
      console.error(error);
      alert('Error submitting request.');
    } else {
      setShowToast(true);
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        company_web: '',
        requested_delivery: '',
        supplies: '',
        city: '',
        state: '',
      });
      setFile(null);
      setTimeout(() => {
        window.location.href = '/MyRequests';
      }, 1800);
    }
  };

  if (role === 'admin') {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.overlay}>
          <div className={styles.formBox}>
            <h1 className={styles.heading}>Access Denied</h1>
            <p className={styles.subtext}>
              🚫 Admins are not allowed to submit vendor requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Today's date in yyyy-mm-dd format
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.overlay}>
        <div className={styles.formBox}>
          <h1 className={styles.heading}>Vendor Request Form</h1>
          <p className={styles.subtext}>
            Fill out the form below to request an EcoWare vendor
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input type="text" name="name" placeholder="Organization *" value={formData.name} onChange={handleChange} required />
            <input type="text" name="contact" placeholder="Contact *" value={formData.contact} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
            <input type="tel" name="phone" placeholder="Phone *" value={formData.phone} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address *" value={formData.address} onChange={handleChange} required />
            <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleChange} required />
            <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleChange} required />
            <input type="text" name="company_web" placeholder="Company Website (optional)" value={formData.company_web} onChange={handleChange} />
            <input
              type="date"
              name="requested_delivery"
              className={styles.dateInput}
              value={formData.requested_delivery}
              onChange={handleChange}
              min={minDate}
            />
            <input type="text" name="supplies" placeholder="Supplies Needed *" value={formData.supplies} onChange={handleChange} required />
            <label className={styles.fileLabel}>
              Upload Tax File
              <input
                type="file"
                onChange={handleFileChange}
                className={styles.fileInput}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </label>
            <button type="submit" className={styles.submitButton}>Submit Request</button>
          </form>

          {showToast && (
            <div className={styles.toast}>
              ✅ Vendor request submitted! Redirecting...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}