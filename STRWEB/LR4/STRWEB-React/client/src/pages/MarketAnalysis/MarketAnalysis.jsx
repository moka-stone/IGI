import React from 'react';
import MarketAnalyzer from '../../components/MarketAnalyzer/MarketAnalyzer.jsx';
import styles from './MarketAnalysis.module.css';

function MarketAnalysis() {
  return (
    <div className={styles.marketAnalysis}>
      <MarketAnalyzer />
    </div>
  );
}

export default MarketAnalysis;

