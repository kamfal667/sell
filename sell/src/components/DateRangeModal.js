import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styles from './DateRangeModal.module.css';

const DateRangeModal = ({ onClose, onSave }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});

  const validateDates = () => {
    const errors = {};
    
    if (!startDate) {
      errors.startDate = 'Date de début requise';
    }
    
    if (!endDate) {
      errors.endDate = 'Date de fin requise';
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        errors.dateRange = 'La date de début doit être antérieure à la date de fin';
      }
      
      const today = new Date();
      if (end > today) {
        errors.endDate = 'La date de fin ne peut pas être dans le futur';
      }
    }
    
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateDates()) {
      onSave(startDate, endDate);
      toast.success('Plage de dates mise à jour');
    } else {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Sélectionner une plage de dates</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Date de début</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={errors.startDate ? styles.inputError : ''}
            />
            {errors.startDate && (
              <div className={styles.errorMessage}>{errors.startDate}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="endDate">Date de fin</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={errors.endDate ? styles.inputError : ''}
            />
            {errors.endDate && (
              <div className={styles.errorMessage}>{errors.endDate}</div>
            )}
          </div>
          
          {errors.dateRange && (
            <div className={styles.errorMessage}>{errors.dateRange}</div>
          )}
          
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className={styles.saveButton}>
              Appliquer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DateRangeModal;
