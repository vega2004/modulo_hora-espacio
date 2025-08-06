import React, { useEffect, useState } from 'react';
import './TitleWithTransition.css';

const TitleWithTransition = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 className={`title ${isActive ? 'active' : ''}`}>
     
    </h1>
  );
};

export default TitleWithTransition;
