// client/src/components/common/ModalStepper.jsx
import React from 'react';
import styles from './ModalStepper.module.css'; // Nuevo CSS para este componente

const ModalStepper = ({ currentStep, totalSteps, onStepChange }) => {
  return (
    <div className={styles.stepperContainer}>
      <div className={styles.steps}>
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={index}
            className={`${styles.stepItem} ${index + 1 === currentStep ? styles.active : ''} ${index + 1 < currentStep ? styles.completed : ''}`}
            onClick={() => onStepChange(index + 1)}
          >
            <span className={styles.stepNumber}>{index + 1}</span>
          </div>
        ))}
      </div>
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ModalStepper;