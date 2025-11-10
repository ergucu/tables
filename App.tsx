
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import TablePreview from './components/TablePreview';
import HtmlOutput from './components/HtmlOutput';

type TextAlign = 'left' | 'center' | 'right';

export interface StyleOptions {
  hasHeader: boolean;
  enableZebraStriping: boolean;
  borderColor: string;
  headerBgColor: string;
  zebraStripeColor: string;
  textAlign: TextAlign;
  fontFamily: string;
  fontColor: string;
  fontSize: string;
  cellPadding: number;
  headerBold: boolean;
  headerItalic: boolean;
  headerUnderline: boolean;
  highlightedRowIndex: number | null;
  highlightedRowColor: string;
}

function App() {
  const [pastedData, setPastedData] = useState('');
  const [tableData, setTableData] = useState<string[][]>([]);
  const [htmlOutput, setHtmlOutput] = useState('');

  // Style options state
  const [hasHeader, setHasHeader] = useState(true);
  const [enableZebraStriping, setEnableZebraStriping] = useState(true);
  const [borderColor, setBorderColor] = useState('#dddddd');
  const [headerBgColor, setHeaderBgColor] = useState('#f2f2f2');
  const [zebraStripeColor, setZebraStripeColor] = useState('#f9f9f9');
  const [textAlign, setTextAlign] = useState<TextAlign>('left');
  
  // Advanced style options state
  const [fontFamily, setFontFamily] = useState('inherit');
  const [fontColor, setFontColor] = useState('#333333');
  const [fontSize, setFontSize] = useState('medium');
  const [cellPadding, setCellPadding] = useState(12);
  const [headerBold, setHeaderBold] = useState(true);
  const [headerItalic, setHeaderItalic] = useState(false);
  const [headerUnderline, setHeaderUnderline] = useState(false);

  // Individual row styling
  const [highlightedRowIndex, setHighlightedRowIndex] = useState<number | null>(null);
  const [highlightedRowColor, setHighlightedRowColor] = useState('#fffbcc');


  const generateHtmlTable = useCallback((data: string[][], options: StyleOptions): string => {
    if (data.length === 0 || (data.length === 1 && data[0].length <= 1 && data[0][0] === '')) {
      return '';
    }

    const {
        hasHeader,
        enableZebraStriping,
        borderColor,
        headerBgColor,
        zebraStripeColor,
        textAlign,
        fontFamily,
        fontColor,
        fontSize,
        cellPadding,
        headerBold,
        headerItalic,
        headerUnderline,
        highlightedRowIndex,
        highlightedRowColor,
    } = options;

    const header = hasHeader ? (data[0] || []) : [];
    const body = hasHeader ? data.slice(1) : data;

    if (body.every(row => row.every(cell => cell.trim() === ''))) {
        return '';
    }
    
    const headerFontWeight = headerBold ? 'bold' : 'normal';
    const headerFontStyle = headerItalic ? 'italic' : 'normal';
    const headerTextDecoration = headerUnderline ? 'underline' : 'none';

    const fontSizeMap: { [key: string]: string } = {
        small: '14px',
        medium: '16px',
        large: '18px',
        xlarge: '20px',
    };
    const actualFontSize = fontSizeMap[fontSize] || '16px';


    let html = '<style>\n';
    html += `  .generated-table { border-collapse: collapse; width: 100%; font-family: ${fontFamily}; font-size: ${actualFontSize}; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n`;
    html += `  .generated-table th, .generated-table td { border: 1px solid ${borderColor}; padding: ${cellPadding}px; text-align: ${textAlign}; color: ${fontColor}; }\n`;
    if (hasHeader) {
        html += `  .generated-table thead tr { background-color: ${headerBgColor}; font-weight: ${headerFontWeight}; font-style: ${headerFontStyle}; text-decoration: ${headerTextDecoration}; }\n`;
    }
    if (enableZebraStriping) {
      html += `  .generated-table tbody tr:nth-child(even) { background-color: ${zebraStripeColor}; }\n`;
    }
    html += `  .generated-table tbody tr:hover { background-color: #f1f1f1; }\n`;
    html += '</style>\n\n';

    html += '<table class="generated-table">\n';
    
    if (hasHeader && header.length > 0) {
        html += '  <thead>\n';
        html += '    <tr>\n';
        header.forEach(cell => {
          html += `      <th>${cell.trim()}</th>\n`;
        });
        html += '    </tr>\n';
        html += '  </thead>\n';
    }
    
    html += '  <tbody>\n';
    body.forEach((row, index) => {
      if (row.every(cell => cell.trim() === '')) return;
      const isHighlighted = index === highlightedRowIndex;
      const styleAttr = isHighlighted ? ` style="background-color: ${highlightedRowColor};"` : '';
      html += `    <tr${styleAttr}>\n`;
      row.forEach(cell => {
        html += `      <td>${cell.trim()}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
    html += '</table>';

    return html;
  }, []);
  
  const getStyleOptions = useCallback((): StyleOptions => ({
    hasHeader, 
    enableZebraStriping, 
    borderColor, 
    headerBgColor, 
    zebraStripeColor, 
    textAlign,
    fontFamily,
    fontColor,
    fontSize,
    cellPadding,
    headerBold,
    headerItalic,
    headerUnderline,
    highlightedRowIndex,
    highlightedRowColor
  }), [hasHeader, enableZebraStriping, borderColor, headerBgColor, zebraStripeColor, textAlign, fontFamily, fontColor, fontSize, cellPadding, headerBold, headerItalic, headerUnderline, highlightedRowIndex, highlightedRowColor]);


  useEffect(() => {
    if (pastedData.trim() === '') {
      setTableData([]);
      setHtmlOutput('');
      return;
    }
    const rows = pastedData.split('\n');
    const data = rows.map(row => row.split('\t'));
    
    setTableData(data);
    setHtmlOutput(generateHtmlTable(data, getStyleOptions()));
  }, [pastedData, getStyleOptions, generateHtmlTable]);
  
  const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <div className="flex items-center space-x-2">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-white"
                aria-label={`${label} hex code`}
            />
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="p-0 h-9 w-10 border-none rounded-md cursor-pointer appearance-none bg-transparent"
                style={{'backgroundColor': 'transparent'}}
                aria-label={`Pick ${label}`}
            />
        </div>
    </div>
);


  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
             <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
             </svg>
            <h1 className="text-2xl font-bold text-gray-900">Paste to HTML Table</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Paste data from Excel, Word, or Sheets to instantly generate a clean, styled HTML table.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        
        <div>
            <label htmlFor="pasted-data" className="block text-sm font-medium text-gray-700 mb-2">
                1. Paste Your Data
            </label>
            <textarea
                id="pasted-data"
                rows={20}
                className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-3 bg-white"
                placeholder="Paste tab-separated data here from Excel, Google Sheets, or a Word table..."
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                aria-label="Paste your data here"
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">2. Customize Styles</h2>
                <div className="bg-white p-6 rounded-lg shadow space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={hasHeader} onChange={() => setHasHeader(!hasHeader)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                            <span className="text-sm font-medium text-gray-700">First row is header</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={enableZebraStriping} onChange={() => setEnableZebraStriping(!enableZebraStriping)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                            <span className="text-sm font-medium text-gray-700">Zebra striping</span>
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <ColorInput label="Border Color" value={borderColor} onChange={setBorderColor} />
                        <ColorInput label="Header Background" value={headerBgColor} onChange={setHeaderBgColor} />
                        {enableZebraStriping && <ColorInput label="Stripe Color" value={zebraStripeColor} onChange={setZebraStripeColor} />}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Text Alignment</label>
                        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
                            {(['left', 'center', 'right'] as TextAlign[]).map(align => (
                                <button key={align} onClick={() => setTextAlign(align)} className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${textAlign === align ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:bg-gray-200'}`}>
                                    <span className="capitalize">{align}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-4">Typography & Spacing</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="font-family" className="block text-sm font-medium text-gray-600 mb-1">Font Family</label>
                                <select
                                    id="font-family"
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-white"
                                >
                                    <option value="inherit">Inherit (Default)</option>
                                    <option value="Arial, sans-serif">Sans-Serif (Arial)</option>
                                    <option value="'Times New Roman', Times, serif">Serif (Times New Roman)</option>
                                    <option value="'Courier New', Courier, monospace">Monospace (Courier)</option>
                                    <option value="Verdana, sans-serif">Verdana</option>
                                </select>
                            </div>
                            
                            <ColorInput label="Font Color" value={fontColor} onChange={setFontColor} />

                            <div>
                                <label htmlFor="font-size" className="block text-sm font-medium text-gray-600 mb-1">Font Size</label>
                                <select
                                    id="font-size"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-white"
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="xlarge">X-Large</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="cell-padding" className="block text-sm font-medium text-gray-600 mb-1">Cell Padding (px)</label>
                                <input
                                    id="cell-padding"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={cellPadding}
                                    onChange={(e) => setCellPadding(Number(e.target.value))}
                                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 bg-white"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Header Text Style</label>
                                <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg">
                                    <button onClick={() => setHeaderBold(!headerBold)} className={`w-full py-2 px-2 rounded-md text-sm transition-colors ${headerBold ? 'bg-white text-indigo-700 shadow font-bold' : 'text-gray-500 hover:bg-gray-200 font-bold'}`} aria-pressed={headerBold}>B</button>
                                    <button onClick={() => setHeaderItalic(!headerItalic)} className={`w-full py-2 px-2 rounded-md text-sm transition-colors ${headerItalic ? 'bg-white text-indigo-700 shadow italic' : 'text-gray-500 hover:bg-gray-200 italic'}`} aria-pressed={headerItalic}>I</button>
                                    <button onClick={() => setHeaderUnderline(!headerUnderline)} className={`w-full py-2 px-2 rounded-md text-sm transition-colors ${headerUnderline ? 'bg-white text-indigo-700 shadow underline' : 'text-gray-500 hover:bg-gray-200 underline'}`} aria-pressed={headerUnderline}>U</button>
                                </div>
                            </div>
                        </div>
                    </div>
                     
                    {highlightedRowIndex !== null && (
                        <div className="border-t border-gray-200 pt-6 space-y-4 bg-indigo-50 p-4 rounded-lg">
                             <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Styling Body Row {highlightedRowIndex + 1}
                                </h3>
                                <button 
                                    onClick={() => setHighlightedRowIndex(null)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                    Clear Selection
                                </button>
                             </div>
                            <ColorInput 
                                label="Highlight Color" 
                                value={highlightedRowColor} 
                                onChange={setHighlightedRowColor} 
                            />
                        </div>
                    )}

                </div>
            </div>
            
            <div className="space-y-6">
               <h2 className="text-lg font-semibold text-gray-800">3. Live Preview</h2>
               <div className="bg-white p-2 rounded-lg shadow-inner border border-gray-200 min-h-[200px]">
                 <TablePreview 
                    data={tableData}
                    styleOptions={getStyleOptions()}
                    onRowClick={(index) => setHighlightedRowIndex(index === highlightedRowIndex ? null : index)}
                 />
               </div>
            </div>
        </div>

        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Copy HTML</h2>
            <div className="flex-grow bg-gray-800 rounded-lg shadow-lg overflow-hidden min-h-[20rem] lg:min-h-0">
                <HtmlOutput html={htmlOutput} />
            </div>
        </div>

      </main>
      
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
      </footer>
    </div>
  );
}

export default App;
