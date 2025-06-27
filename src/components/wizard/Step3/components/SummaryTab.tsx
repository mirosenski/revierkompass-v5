import React from 'react';
import { motion } from 'framer-motion';
import { Route, Clock, MapPin, Zap, BarChart3 } from 'lucide-react';
import { RouteResult } from '@/lib/store/app-store';
import { SummaryStats } from '../types';

interface SummaryTabProps {
  results: RouteResult[];
  isCalculating: boolean;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ results, isCalculating }) => {
  const calculateStats = (): SummaryStats => {
    const totalRoutes = results.length;
    const totalDistance = results.reduce((sum, r) => {
      const distanceInKm = r.distance > 1000 ? r.distance / 1000 : r.distance;
      return sum + distanceInKm;
    }, 0);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const totalFuel = results.reduce((sum, r) => sum + r.estimatedFuel, 0);
    const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);
    const averageDistance = totalRoutes > 0 ? totalDistance / totalRoutes : 0;
    const averageDuration = totalRoutes > 0 ? totalDuration / totalRoutes : 0;

    return {
      totalRoutes,
      totalDistance,
      totalDuration,
      totalFuel,
      totalCost,
      averageDistance,
      averageDuration
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      icon: Route,
      label: 'Gesamtstrecke',
      value: `${stats.totalDistance.toFixed(1)} km`,
      color: 'blue'
    },
    {
      icon: Clock,
      label: 'Gesamtzeit',
      value: `${stats.totalDuration} min`,
      color: 'green'
    },
    {
      icon: Zap,
      label: 'Kraftstoff',
      value: `${stats.totalFuel.toFixed(1)} L`,
      color: 'yellow'
    },
    {
      icon: MapPin,
      label: 'Durchschnitt',
      value: `${stats.averageDistance.toFixed(1)} km`,
      color: 'purple'
    }
  ];

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Routen werden berechnet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Kostenübersicht */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Kostenübersicht
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">Gesamtkosten</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.totalCost.toFixed(2)} €
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">Durchschnitt pro Route</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalRoutes > 0 ? (stats.totalCost / stats.totalRoutes).toFixed(2) : '0.00'} €
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">Anzahl Routen</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalRoutes}
            </p>
          </div>
        </div>
      </div>

      {/* Route-Liste */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Route-Übersicht
        </h3>
        <div className="space-y-3">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {result.destinationName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.address}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {(result.distance > 1000 ? result.distance / 1000 : result.distance).toFixed(1)} km
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.duration} min
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}; 