import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Copy } from 'lucide-react';
import * as XLSX from 'xlsx';
import { RouteResult } from '@/lib/store/app-store';
import { ExportFormat } from '../types';
import toast from 'react-hot-toast';

interface ExportTabProps {
  results: RouteResult[];
  exportFormat: 'excel' | 'pdf' | 'csv';
  setExportFormat: (format: 'excel' | 'pdf' | 'csv') => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({ results, exportFormat, setExportFormat }) => {
  const exportFormats: ExportFormat[] = [
    {
      id: 'excel',
      label: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: 'Professionelle Excel-Datei mit mehreren Arbeitsblättern'
    },
    {
      id: 'pdf',
      label: 'PDF (.pdf)',
      icon: FileText,
      description: 'Druckbare PDF-Datei mit allen Routen'
    },
    {
      id: 'csv',
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'Einfache CSV-Datei für weitere Verarbeitung'
    }
  ];

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Hauptdaten-Arbeitsblatt
    const worksheetData = [
      ['POLIZEI BADEN-WÜRTTEMBERG'],
      ['ROUTENANALYSE - REVIERKOMPASS'],
      ['Exportiert am: ' + new Date().toLocaleString('de-DE')],
      [''],
      ['Ziel', 'Typ', 'Adresse', 'Entfernung (km)', 'Fahrzeit (min)', 'Kraftstoff (L)', 'Kosten (€)', 'Route-Typ'],
      ...(results).map(result => [
        result.destinationName,
        result.destinationType === 'station' ? 'Polizeistation' : 'Eigene Adresse',
        result.address,
        (result.distance > 1000 ? result.distance / 1000 : result.distance).toFixed(1),
        result.duration,
        result.estimatedFuel,
        result.estimatedCost,
        result.routeType
      ]),
      [''],
      ['ZUSAMMENFASSUNG'],
      ['Gesamtanzahl Ziele:', results.length],
      ['Gesamtentfernung (km):', results.reduce((sum, r) => {
        const distanceInKm = r.distance > 1000 ? r.distance / 1000 : r.distance;
        return sum + distanceInKm;
      }, 0).toFixed(1)],
      ['Gesamtfahrzeit (min):', results.reduce((sum, r) => sum + r.duration, 0)],
      ['Gesamtkraftstoff (L):', results.reduce((sum, r) => sum + r.estimatedFuel, 0).toFixed(1)],
      ['Gesamtkosten (€):', results.reduce((sum, r) => sum + r.estimatedCost, 0).toFixed(2)]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Spaltenbreiten setzen
    worksheet['!cols'] = [
      { width: 35 }, // Ziel
      { width: 15 }, // Typ
      { width: 40 }, // Adresse
      { width: 15 }, // Entfernung
      { width: 15 }, // Fahrzeit
      { width: 15 }, // Kraftstoff
      { width: 12 }, // Kosten
      { width: 15 }  // Route-Typ
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Routenanalyse');
    
    // Zusätzliches Arbeitsblatt mit Metadaten
    const metaData = [
      ['METADATEN'],
      [''],
      ['Export-Information'],
      ['Anwendung:', 'RevierKompass v2.0'],
      ['Organisation:', 'Polizei Baden-Württemberg'],
      ['Export-Datum:', new Date().toLocaleString('de-DE')],
      ['Anzahl Routen:', results.length],
      [''],
      ['Routing-Parameter'],
      ['Provider:', 'OSRM, Valhalla, GraphHopper'],
      ['Optimierung:', 'Multi-Provider Fallback'],
      ['Kraftstoffpreis:', '1.75 €/L (Durchschnitt)'],
      ['Verbrauch:', '9.5 L/100km (Annahme)']
    ];

    const metaWorksheet = XLSX.utils.aoa_to_sheet(metaData);
    metaWorksheet['!cols'] = [{ width: 20 }, { width: 30 }];
    
    XLSX.utils.book_append_sheet(workbook, metaWorksheet, 'Metadaten');
    
    // Datei speichern
    const fileName = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Excel-Datei erfolgreich exportiert!');
  };

  const exportToPDF = () => {
    // Vereinfachter PDF-Export (in production würde hier jsPDF oder ähnliches verwendet)
    const content = results.map(result =>
      `${result.destinationName} | ${result.address} | ${(result.distance > 1000 ? result.distance / 1000 : result.distance).toFixed(1)}km | ${result.duration}min`
    ).join('\n');
    
    const blob = new Blob([
      'POLIZEI BADEN-WÜRTTEMBERG - ROUTENANALYSE\n',
      '=====================================\n\n',
      content,
      '\n\nExportiert am: ' + new Date().toLocaleString('de-DE')
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('PDF-Datei erfolgreich exportiert!');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Ziel', 'Typ', 'Adresse', 'Entfernung (km)', 'Fahrzeit (min)', 'Kraftstoff (L)', 'Kosten (€)', 'Route-Typ'],
      ...(results).map(result => [
        result.destinationName,
        result.destinationType === 'station' ? 'Polizeistation' : 'Eigene Adresse',
        result.address,
        (result.distance > 1000 ? result.distance / 1000 : result.distance).toFixed(1),
        result.duration,
        result.estimatedFuel,
        result.estimatedCost,
        result.routeType
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('CSV-Datei erfolgreich exportiert!');
  };

  const copyToClipboard = () => {
    const summary = results.map(result =>
      `${result.destinationName}: ${(result.distance > 1000 ? result.distance / 1000 : result.distance).toFixed(1)}km, ${result.duration}min, ${result.estimatedCost.toFixed(2)}€`
    ).join('\n');
    
    navigator.clipboard.writeText(summary).then(() => {
      toast.success('Zusammenfassung in Zwischenablage kopiert!');
    });
  };

  const getExportHandler = () => {
    switch (exportFormat) {
      case 'excel':
        return exportToExcel;
      case 'pdf':
        return exportToPDF;
      case 'csv':
        return exportToCSV;
      default:
        return exportToExcel;
    }
  };

  return (
    <div className="space-y-8">
      {/* Export-Format-Auswahl */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportFormats.map((format) => {
          const Icon = format.icon;
          const isActive = exportFormat === format.id;
          return (
            <motion.div
              key={format.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExportFormat(format.id)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-3 rounded-xl ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {format.label}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Export-Aktionen */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export-Aktionen
        </h3>
        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={getExportHandler()}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Exportieren</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyToClipboard}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Copy className="h-5 w-5" />
            <span>Kopieren</span>
          </motion.button>
        </div>
      </div>

      {/* Export-Vorschau */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export-Vorschau
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
          <pre className="text-sm text-gray-700 dark:text-gray-300">
            {results.map((result, index) => 
              `${index + 1}. ${result.destinationName} - ${(result.distance > 1000 ? result.distance / 1000 : result.distance).toFixed(1)}km, ${result.duration}min, ${result.estimatedCost.toFixed(2)}€`
            ).join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
};