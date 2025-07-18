import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Download, CheckCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { useWizardStore } from '@/store/useWizardStore';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';

const WizardContainer: React.FC = () => {
  const { wizard, setWizardStep } = useAppStore();

  // Auto-load stations on mount
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await fetch('/data/polizeistationen.json');
        const stations = await response.json();
        // Store in app state if needed
        console.log('Polizeistationen geladen:', stations.length);
      } catch (error) {
        console.error('Fehler beim Laden der Polizeistationen:', error);
      }
    };
    
    loadStations();
  }, []);

  const steps = [
    {
      number: 1,
      title: 'Startadresse eingeben',
      description: 'Geben Sie Ihre Startadresse ein',
      icon: MapPin,
      completed: wizard.currentStep > 1
    },
    {
      number: 2,
      title: 'Ziele auswählen',
      description: 'Polizeistationen und eigene Adressen',
      icon: Users,
      completed: wizard.currentStep > 2
    },
    {
      number: 3,
      title: 'Export & Ergebnisse',
      description: 'Premium Excel Export',
      icon: Download,
      completed: wizard.currentStep > 3
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Kompakte Header-Sektion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            RevierKompass
          </span>{' '}
          <span className="text-gray-700 dark:text-gray-300">Routing</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Optimale Routen zu Polizeistationen in Baden-Württemberg
        </p>
      </motion.div>

      {/* Step Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center space-x-8 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = wizard.currentStep === step.number;
            const isCompleted = step.completed;
            
            return (
              <React.Fragment key={step.number}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center space-y-2 cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isCompleted 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}
                  onClick={() => {
                    if (isCompleted || wizard.currentStep >= step.number) {
                      setWizardStep(step.number);
                    }
                  }}
                >
                  <div className={`relative p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-blue-500/25' 
                      : isCompleted 
                        ? 'bg-green-600 text-white shadow-green-500/25'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive 
                        ? 'bg-white text-blue-600' 
                        : isCompleted 
                          ? 'bg-white text-green-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {step.number}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 rounded-full transition-all duration-300 ${
                    wizard.currentStep > step.number 
                      ? 'bg-green-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={wizard.currentStep}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-[500px]"
      >
        {wizard.currentStep === 1 && <Step1 />}
        {wizard.currentStep === 2 && <Step2 />}
        {wizard.currentStep === 3 && <Step3 />}
      </motion.div>
    </div>
  );
};

export default WizardContainer;