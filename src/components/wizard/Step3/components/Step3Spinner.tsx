import React from 'react';
import { Loader2 } from 'lucide-react';

interface Step3SpinnerProps {
  text?: string;
}

const Step3Spinner: React.FC<Step3SpinnerProps> = ({ text = 'Routen werden berechnet...' }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="mx-auto h-16 w-16 text-blue-600 animate-spin mb-6" />
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {text}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Bitte warten Sie einen Moment
      </p>
    </div>
  </div>
);

export default Step3Spinner; 