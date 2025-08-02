import React from 'react';

const QuestionProgressLights = ({ 
  totalQuestions, 
  currentQuestion, 
  answeredQuestions = [] 
}) => {
  const getLightColor = (index) => {
    if (index === currentQuestion) {
      return '#ffc107'; // Yellow for current question
    }
    
    if (answeredQuestions[index] !== undefined) {
      return answeredQuestions[index] ? '#28a745' : '#dc3545'; // Green for correct, Red for wrong
    }
    
    return '#e9ecef'; // Gray for unanswered
  };

  const lightStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    margin: '0 3px',
    border: '2px solid #6c757d',
    display: 'inline-block',
    transition: 'all 0.3s ease'
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '25px',
    margin: '10px 0',
    flexWrap: 'wrap',
    gap: '2px'
  };

  return (
    <div style={containerStyle}>
      {Array.from({ length: totalQuestions }, (_, index) => (
        <div
          key={index}
          style={{
            ...lightStyle,
            backgroundColor: getLightColor(index),
            boxShadow: index === currentQuestion 
              ? '0 0 10px rgba(255, 193, 7, 0.6)' 
              : 'none',
            transform: index === currentQuestion ? 'scale(1.1)' : 'scale(1)'
          }}
        />
      ))}
    </div>
  );
};

export default QuestionProgressLights;