import React, { useState, useMemo } from 'react';
import { LayoutResult, TrayPosition, CustomTray } from '../types';
import { Printer } from 'lucide-react';

const TRAY_MARGIN = 0.001; // Margin between trays in inches

interface RemainingSpace {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface LayoutCalculation {
  positions: TrayPosition[];
  remainingSpaces: RemainingSpace[];
}

function calculateMainLayout(
  shelfWidth: number,
  shelfLength: number,
  trayWidth: number,
  trayLength: number,
  isVertical: boolean
): LayoutCalculation {
  const actualWidth = isVertical ? trayLength : trayWidth;
  const actualLength = isVertical ? trayWidth : trayLength;

  // Calculate maximum trays that can fit
  const traysAcross = Math.floor((shelfWidth + TRAY_MARGIN) / (actualWidth + TRAY_MARGIN));
  const traysDown = Math.floor((shelfLength + TRAY_MARGIN) / (actualLength + TRAY_MARGIN));

  const positions: TrayPosition[] = [];
  
  // Calculate used space
  const usedWidth = traysAcross * (actualWidth + TRAY_MARGIN) - TRAY_MARGIN;
  const usedLength = traysDown * (actualLength + TRAY_MARGIN) - TRAY_MARGIN;

  // Place trays in grid
  for (let row = 0; row < traysDown; row++) {
    for (let col = 0; col < traysAcross; col++) {
      positions.push({
        x: col * (actualWidth + TRAY_MARGIN),
        y: row * (actualLength + TRAY_MARGIN),
        isVertical,
        trayWidth: actualWidth,
        trayLength: actualLength
      });
    }
  }

  // Calculate remaining spaces
  const remainingSpaces: RemainingSpace[] = [];

  // Right space
  if (shelfWidth - usedWidth > TRAY_MARGIN) {
    remainingSpaces.push({
      width: shelfWidth - usedWidth - TRAY_MARGIN,
      height: shelfLength,
      x: usedWidth + TRAY_MARGIN,
      y: 0
    });
  }

  // Bottom space
  if (shelfLength - usedLength > TRAY_MARGIN) {
    remainingSpaces.push({
      width: usedWidth,
      height: shelfLength - usedLength - TRAY_MARGIN,
      x: 0,
      y: usedLength + TRAY_MARGIN
    });
  }

  return { positions, remainingSpaces };
}

function tryFitInRemainingSpace(
  space: RemainingSpace,
  trayWidth: number,
  trayLength: number
): TrayPosition[] {
  const positions: TrayPosition[] = [];

  // Try vertical orientation first (rotated 90 degrees)
  if (space.width >= trayLength) {
    const traysAcross = Math.floor((space.width + TRAY_MARGIN) / (trayLength + TRAY_MARGIN));
    const traysDown = Math.floor((space.height + TRAY_MARGIN) / (trayWidth + TRAY_MARGIN));
    
    for (let col = 0; col < traysAcross; col++) {
      for (let row = 0; row < traysDown; row++) {
        positions.push({
          x: space.x + col * (trayLength + TRAY_MARGIN),
          y: space.y + row * (trayWidth + TRAY_MARGIN),
          isVertical: true,
          trayWidth: trayLength,
          trayLength: trayWidth
        });
      }
    }
  }

  // If no vertical trays fit, try horizontal orientation
  if (positions.length === 0 && space.width >= trayWidth) {
    const traysAcross = Math.floor((space.width + TRAY_MARGIN) / (trayWidth + TRAY_MARGIN));
    const traysDown = Math.floor((space.height + TRAY_MARGIN) / (trayLength + TRAY_MARGIN));
    
    for (let col = 0; col < traysAcross; col++) {
      for (let row = 0; row < traysDown; row++) {
        positions.push({
          x: space.x + col * (trayWidth + TRAY_MARGIN),
          y: space.y + row * (trayLength + TRAY_MARGIN),
          isVertical: false,
          trayWidth,
          trayLength
        });
      }
    }
  }

  return positions;
}

function findOptimalLayout(
  shelfWidth: number,
  shelfLength: number,
  customTray: CustomTray
): LayoutResult {
  // Convert CustomTray to TrayType format
  const tray = {
    name: customTray.name,
    tod: {
      width: customTray.width,
      length: customTray.length
    },
    count: customTray.count
  };

  // Try both main orientations
  const horizontal = calculateMainLayout(shelfWidth, shelfLength, tray.tod.width, tray.tod.length, false);
  const vertical = calculateMainLayout(shelfWidth, shelfLength, tray.tod.width, tray.tod.length, true);

  // Try mixed layouts with remaining spaces
  const horizontalWithExtra = {
    main: horizontal.positions,
    extra: horizontal.remainingSpaces.flatMap(space => 
      tryFitInRemainingSpace(space, tray.tod.width, tray.tod.length)
    )
  };

  const verticalWithExtra = {
    main: vertical.positions,
    extra: vertical.remainingSpaces.flatMap(space => 
      tryFitInRemainingSpace(space, tray.tod.width, tray.tod.length)
    )
  };

  // Choose the layout with the most total trays
  const horizontalTotal = horizontalWithExtra.main.length + horizontalWithExtra.extra.length;
  const verticalTotal = verticalWithExtra.main.length + verticalWithExtra.extra.length;

  const finalLayout = horizontalTotal >= verticalTotal
    ? [...horizontalWithExtra.main, ...horizontalWithExtra.extra]
    : [...verticalWithExtra.main, ...verticalWithExtra.extra];

  return {
    trayType: tray,
    totalTrays: finalLayout.length,
    totalPots: finalLayout.length * tray.count,
    positions: finalLayout,
    shelfWidth,
    shelfLength
  };
}

function ShelfDiagram({ result }: { result: LayoutResult }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const maxWidth = container.clientWidth - 240;
    const maxHeight = 300;

    const scaleX = maxWidth / result.shelfWidth;
    const scaleY = maxHeight / result.shelfLength;
    setScale(Math.min(scaleX, scaleY, 25));
  }, [result.shelfWidth, result.shelfLength]);

  const handlePrint = () => {
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
        #print-content {
          visibility: visible;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .diagram {
          border: 2px solid #666;
          position: relative;
          background: #f9fafb;
          page-break-inside: avoid;
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
        .info {
          margin-top: 20px;
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(style);

    const printContent = document.createElement('div');
    printContent.id = 'print-content';
    const printScale = Math.min(600 / result.shelfWidth, 800 / result.shelfLength);

    printContent.innerHTML = `
      <h1 style="font-size: 24px; margin-bottom: 16px;">${result.trayType.name} Layout</h1>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
        <div style="background: #f3f4f6; padding: 12px; border-radius: 6px;">
          <strong>Total Trays:</strong> ${result.totalTrays}<br>
          <strong>Total Pots:</strong> ${result.totalPots}
        </div>
        <div style="background: #f3f4f6; padding: 12px; border-radius: 6px;">
          <strong>Shelf Dimensions:</strong><br>
          Width: ${result.shelfWidth.toFixed(2)}"<br>
          Length: ${result.shelfLength.toFixed(2)}"
        </div>
      </div>
      <div class="diagram" style="width: ${result.shelfWidth * printScale}px; height: ${result.shelfLength * printScale}px;">
        ${result.positions.map(pos => `
          <div class="tray" style="
            width: ${pos.trayWidth * printScale}px;
            height: ${pos.trayLength * printScale}px;
            left: ${pos.x * printScale}px;
            top: ${pos.y * printScale}px;
          ">
            <div class="tray-count">${result.trayType.count}</div>
          </div>
        `).join('')}
      </div>
    `;

    document.body.appendChild(printContent);
    window.print();
    
    // Cleanup after printing
    document.body.removeChild(printContent);
    document.head.removeChild(style);
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm print:shadow-none" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{result.trayType.name} Layout</h3>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Layout
        </button>
      </div>
      <div className="flex gap-8 items-start">
        <div className="relative border-2 border-gray-400 bg-gray-50 shadow-inner">
          <div
            style={{
              width: `${result.shelfWidth * scale}px`,
              height: `${result.shelfLength * scale}px`,
              position: 'relative',
            }}
          >
            {result.positions.map((pos, i) => (
              <div
                key={i}
                className="absolute border border-blue-500 bg-blue-100 shadow-sm transition-colors hover:bg-blue-200"
                style={{
                  width: `${pos.trayWidth * scale}px`,
                  height: `${pos.trayLength * scale}px`,
                  left: `${pos.x * scale}px`,
                  top: `${pos.y * scale}px`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-blue-800">
                  {result.trayType.count}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 w-52">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">Layout Summary</h4>
              <div className="mt-2 space-y-2">
                <p className="text-lg font-bold text-blue-600">
                  {result.totalTrays} Trays
                </p>
                <p className="text-lg font-bold text-green-600">
                  {result.totalPots} Pots
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Dimensions</h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Tray: {result.trayType.tod.width.toFixed(2)}" × {result.trayType.tod.length.toFixed(2)}"</p>
                <p>Shelf: {result.shelfWidth.toFixed(2)}" × {result.shelfLength.toFixed(2)}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomCalculator() {
  const [shelfWidth, setShelfWidth] = useState<string>('60.25');
  const [shelfLength, setShelfLength] = useState<string>('20.5');
  const [trayName, setTrayName] = useState<string>('Custom Tray');
  const [trayWidth, setTrayWidth] = useState<string>('18.00');
  const [trayLength, setTrayLength] = useState<string>('8.00');
  const [potCount, setPotCount] = useState<string>('10');

  const layout = useMemo(() => {
    const numShelfWidth = parseFloat(shelfWidth);
    const numShelfLength = parseFloat(shelfLength);
    const numTrayWidth = parseFloat(trayWidth);
    const numTrayLength = parseFloat(trayLength);
    const numPotCount = parseInt(potCount);
    
    if (isNaN(numShelfWidth) || isNaN(numShelfLength) || isNaN(numTrayWidth) || isNaN(numTrayLength) || isNaN(numPotCount)) {
      return null;
    }
    
    const customTray: CustomTray = {
      name: trayName || 'Custom Tray',
      width: numTrayWidth,
      length: numTrayLength,
      count: numPotCount
    };
    
    return findOptimalLayout(numShelfWidth, numShelfLength, customTray);
  }, [shelfWidth, shelfLength, trayName, trayWidth, trayLength, potCount]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Shelf Dimensions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shelf Width (inches)
              </label>
              <input
                type="number"
                value={shelfWidth}
                onChange={(e) => setShelfWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
                placeholder="60.25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shelf Length (inches)
              </label>
              <input
                type="number"
                value={shelfLength}
                onChange={(e) => setShelfLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
                placeholder="20.5"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Tray Specifications</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tray Name
              </label>
              <input
                type="text"
                value={trayName}
                onChange={(e) => setTrayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Custom Tray"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tray Width (inches)
                </label>
                <input
                  type="number"
                  value={trayWidth}
                  onChange={(e) => setTrayWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  placeholder="18.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tray Length (inches)
                </label>
                <input
                  type="number"
                  value={trayLength}
                  onChange={(e) => setTrayLength(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  placeholder="8.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pots per Tray
              </label>
              <input
                type="number"
                value={potCount}
                onChange={(e) => setPotCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="1"
                min="1"
                placeholder="10"
              />
            </div>
          </div>
        </div>
      </div>

      {layout && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Custom Layout</h3>
          <ShelfDiagram result={layout} />
        </div>
      )}

      {!layout && (shelfWidth || shelfLength || trayWidth || trayLength || potCount) && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Please fill in all fields with valid numbers to see the layout calculation.
          </p>
        </div>
      )}
    </div>
  );
}