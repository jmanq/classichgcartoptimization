import React, { useState } from 'react';
import ShelfCalculator from './components/ShelfCalculator';
import { TabType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('classic');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('classic')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'classic'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Classic Home and Garden
          </button>
          <button
            onClick={() => setActiveTab('stadium')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'stadium'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Stadium
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === '3d'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            3D - Forever Forward
          </button>
        </div>
        <ShelfCalculator type={activeTab} />
      </div>
    </div>
  );
}

export default App;