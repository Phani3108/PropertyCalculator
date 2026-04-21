import React from 'react';
import { formatIndianRupee } from '@/lib/utils';

interface ResultCardProps {
  title: string;
  amount: number;
  description?: string;
  subItems?: { label: string; value: number }[];
}

const ResultCard: React.FC<ResultCardProps> = ({
  title,
  amount,
  description,
  subItems,
}) => {
  return (
    <div className="results-section">
      <h2>{title}</h2>
      <div className="results-grid">
        <div className="result-item highlight">
          <span className="result-label">{title}</span>
          <span className="result-value">
            {formatIndianRupee(amount)}
          </span>
        </div>
        
        {description && (
          <div className="result-item">
            <span className="result-label">Note</span>
            <span className="result-value" style={{fontSize: '0.75rem', fontWeight: 'normal'}}>{description}</span>
          </div>
        )}
        
        {subItems && subItems.length > 0 && (
          <>
            {subItems.map((item, index) => (
              <div key={index} className="result-item">
                <span className="result-label">{item.label}</span>
                <span className="result-value">{formatIndianRupee(item.value)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
