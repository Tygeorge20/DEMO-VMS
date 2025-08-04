import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/AddVendorRequest.module.css';

export default function VendorForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const testUserEmail = 'testuser@email.com';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let fileUrl = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        setMessage({ type: 'error', text: 'File upload failed.' });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('vendor-documents')
        .getPublicUrl(fileName);

      fileUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('vendor_request').insert([
      {
        ...formData,
        status: 'pending',
        completion: 'incomplete',
        user_email: testUserEmail,
        created_at: new Date(),
        updated_at: new Date(),
        document_path: fileUrl,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Submission failed. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Vendor request submitted!' });
      setFormData({ name: '', contact: '', email: '', phone: '', address: '' });
      setFile(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>Vendor Request Form</h1>
        <p className={styles.subtitle}>Fill out the form below to request to be an EcoWare vendor.</p>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {['name', 'contact', 'email', 'phone', 'address'].map((field) => (
            <div className={styles.inputGroup} key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className={styles.inputGroup}>
            <label>Upload Document (PDF, DOCX, etc.)</label>
            <input type="file" onChange={handleFileChange} />
          </div>
          <button type="submit" className={styles.button}>Submit Request</button>
        </form>
      </div>
    </div>
  );
}