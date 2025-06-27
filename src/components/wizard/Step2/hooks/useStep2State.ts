import { useState, useCallback } from 'react';
import { FormData, ViewType } from '../types';

export const useStep2State = () => {
  const [activeView, setActiveView] = useState<ViewType>('grid');
  const [activeTab, setActiveTab] = useState<'stations' | 'custom'>('stations');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedPraesidien, setExpandedPraesidien] = useState<Set<string>>(new Set());
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    street: '',
    zipCode: '',
    city: ''
  });

  const resetStates = useCallback(() => {
    setSearchQuery('');
    setActiveView('grid');
    setActiveTab('stations');
    setShowAddForm(false);
    setExpandedPraesidien(new Set());
    setShowQuickPreview(false);
    setLastSelectedId(null);
    setFormData({ name: '', street: '', zipCode: '', city: '' });
  }, []);

  return {
    activeView,
    setActiveView,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showAddForm,
    setShowAddForm,
    expandedPraesidien,
    setExpandedPraesidien,
    showQuickPreview,
    setShowQuickPreview,
    lastSelectedId,
    setLastSelectedId,
    formData,
    setFormData,
    resetStates
  };
}; 