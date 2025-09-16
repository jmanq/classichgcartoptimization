import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import ShelfCalculator from './components/ShelfCalculator';
import CustomCalculator from './components/CustomCalculator';
import { TabType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('classic');

  const handlePrintPage = () => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: landscape;
          margin: 1cm;
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
          visibility: hidden;
        }
        #print-page-content {
          visibility: visible;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        .diagram {
          border: 2px solid #666;
          position: relative;
          background: #f9fafb;
          page-break-inside: avoid;
          margin-bottom: 30px;
        }
        .tray {
          position: absolute;
          border: 1px solid #3b82f6;
          background: #dbeafe;
        }
        .tray-count {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #1e40af;
        }
        .tab-content {
          page-break-before: always;
        }
        .tab-content:first-child {
          page-break-before: auto;
        }
      }
    `;
    document.head.appendChild(style);

    const printContent = document.createElement('div');
    printContent.id = 'print-page-content';
    
    const currentContent = document.querySelector('.max-w-5xl');
    if (currentContent) {
      printContent.innerHTML = `
        <h1 style="font-size: 28px; margin-bottom: 24px; text-align: center;">
          HC X CHG Cart Optimization - ${getTabDisplayName(activeTab)}
        </h1>
        ${currentContent.innerHTML}
      `;
    }

    document.body.appendChild(printContent);
    window.print();
    
    // Cleanup after printing
    document.body.removeChild(printContent);
    document.head.removeChild(style);
  };

  const getTabDisplayName = (tab: TabType): string => {
    switch (tab) {
      case 'classic': return 'HC X CHG';
      case 'stadium': return 'Stadium';
      case '3d': return '3D - Forever Forward';
      case 'custom': return 'Custom';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">HC X CHG Cart Optimization</h1>
          <button
            onClick={handlePrintPage}
            className="no-print inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Page
          </button>
        </div>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('classic')}
            className={`no-print px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'classic'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            HC X CHG
          </button>
          <button
            onClick={() => setActiveTab('stadium')}
            className={`no-print px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'stadium'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Stadium
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`no-print px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === '3d'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            3D - Forever Forward
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`no-print px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Custom
          </button>
        </div>
        {activeTab === 'custom' ? (
          <CustomCalculator />
        ) : (
          <ShelfCalculator type={activeTab} />
        )}
      </div>
    </div>
  );
}

export default App;