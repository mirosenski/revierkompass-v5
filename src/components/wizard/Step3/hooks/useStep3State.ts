import { useState } from 'react';

export const useStep3State = () => {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [activeTab, setActiveTab] = useState('summary');

  return {
    exportFormat,
    setExportFormat,
    activeTab,
    setActiveTab
  };
}; 