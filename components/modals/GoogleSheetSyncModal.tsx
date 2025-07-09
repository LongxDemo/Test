
import React, { useState, useEffect } from 'react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetUrl: (url: string) => void;
  onFetch: () => void;
  onSave: () => void;
  currentUrl: string | null;
  status: { loading: boolean; message: string; error: boolean };
  isAutoSaveEnabled: boolean;
  onToggleAutoSave: () => void;
}

const appsScriptCode = `
const SHEET_NAME = "Transactions"; // Change this if your sheet tab has a different name

function doGet(e) {
  // Return all data from the sheet as JSON
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(\`Sheet with name "\${SHEET_NAME}" not found.\`);
    }
    const data = sheet.getDataRange().getValues();
    // Start from row 2 (index 1) to skip header
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    const headers = data.shift();
    
    const transactions = data.map(row => {
      let transaction = {};
      headers.forEach((header, index) => {
        // Ensure amount is a number, handle empty cells
        if (header === 'amount' && row[index] !== '') {
          transaction[header] = Number(row[index]);
        } else {
          transaction[header] = row[index];
        }
      });
      return transaction;
    }).filter(t => t.id); // Filter out rows that don't have an ID

    return ContentService.createTextOutput(JSON.stringify(transactions))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Overwrite sheet data with new data from POST body
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(\`Sheet with name "\${SHEET_NAME}" not found.\`);
    }
    
    if (!e.postData || !e.postData.contents) {
      throw new Error("No data received in POST request.");
    }
    const transactions = JSON.parse(e.postData.contents);
    
    // Clear the sheet except for the header row
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getMaxColumns()).clearContent();
    }

    if (transactions.length > 0) {
      const headers = Object.keys(transactions[0]);
      // Ensure headers are set if the sheet is empty
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      // Map transaction objects to a 2D array for setValues
      const rows = transactions.map(t => headers.map(header => t[header]));
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: \`Updated \${transactions.length} transactions.\` }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`.trim();

const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({ 
    isOpen, onClose, onSetUrl, onFetch, onSave, currentUrl, status,
    isAutoSaveEnabled, onToggleAutoSave 
}) => {
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    if (currentUrl) {
      setUrlInput(currentUrl);
    }
  }, [currentUrl]);

  if (!isOpen) {
    return null;
  }

  const handleSaveUrl = () => {
    if (urlInput.trim()) {
      onSetUrl(urlInput.trim());
    }
  };

  const getStatusColor = () => {
    if (status.loading) return 'text-yellow-400';
    if (status.error) return 'text-red-400';
    return 'text-slate-400';
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-3xl m-4 p-6 transform transition-all text-slate-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-100 mb-4" id="modal-title">
          Connect to Google Sheets
        </h3>
        
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            <div>
                <label htmlFor="script-url" className="block text-sm font-medium text-slate-300">Google Apps Script URL</label>
                <div className="mt-1 flex gap-2">
                    <input
                        type="text"
                        id="script-url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://script.google.com/macros/s/.../exec"
                    />
                    <button onClick={handleSaveUrl} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors">
                        Save URL
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-md border border-slate-700">
              <label htmlFor="auto-save-toggle" className="font-medium text-slate-200">
                Enable Auto-Save
                <p className="text-xs text-slate-400">Automatically save changes to Google Sheets.</p>
              </label>
              <button
                id="auto-save-toggle"
                type="button"
                role="switch"
                aria-checked={isAutoSaveEnabled}
                onClick={onToggleAutoSave}
                className={`${
                  isAutoSaveEnabled ? 'bg-indigo-600' : 'bg-slate-600'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    isAutoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div>
                <p className={`text-sm ${getStatusColor()}`}>{status.message}</p>
            </div>

            <details className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <summary className="font-semibold text-slate-200 cursor-pointer hover:text-white">Setup Instructions: How to Get Your URL</summary>
                <div className="mt-4 space-y-4 text-sm text-slate-400">
                    <p><strong>1. Create Google Sheet:</strong> Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">sheets.new</a>.</p>
                    <p><strong>2. Name Sheet & Tab:</strong> Name your spreadsheet file. Then, at the bottom, rename the tab to be exactly <strong>Transactions</strong>.</p>
                    <p><strong>3. Set Headers:</strong> In the first row (A1, B1, etc.), set these exact headers in order: <code>id</code>, <code>type</code>, <code>amount</code>, <code>description</code>, <code>category</code>, <code>date</code>.</p>
                    <p><strong>4. Open Apps Script:</strong> In the menu, go to <code>Extensions &gt; Apps Script</code>.</p>
                    <p><strong>5. Paste Code:</strong> Copy the code below and paste it into the editor, replacing all existing content. Click the floppy disk icon to save the script project.</p>
                    <div className="relative">
                        <pre className="bg-slate-800 p-3 rounded-md text-xs overflow-x-auto border border-slate-600">{appsScriptCode}</pre>
                        <button onClick={() => navigator.clipboard.writeText(appsScriptCode)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded">Copy</button>
                    </div>
                    <p><strong>6. Deploy as Web App:</strong>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>Click the blue <code>Deploy</code> button and select <strong>New deployment</strong>.</li>
                            <li>Click the gear icon (⚙️) on the left and choose <strong>Web app</strong>.</li>
                            <li className="space-y-2">In the configuration screen:
                                <ul className="list-decimal pl-5 mt-2 space-y-2">
                                    <li>Set <strong>Execute as</strong> to <strong>Me (your@email.com)</strong>.</li>
                                    <li>Set <strong>Who has access</strong> to <strong className="text-yellow-300">Anyone</strong>.
                                        <div className="text-xs text-slate-500 mt-1 p-2 bg-slate-800 rounded"><strong>Note:</strong> This is required. It does NOT make your sheet public. It only allows this script (when called with its secret URL) to run and access the data.</div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </p>
                    <p><strong>7. Authorize & Get URL:</strong>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Click <code>Deploy</code>. Google will ask for authorization.</li>
                            <li>Click <code>Authorize access</code>, choose your account, click "Advanced", then "Go to ... (unsafe)" to approve.</li>
                            <li>After it deploys, copy the provided <strong>Web app URL</strong> and paste it in the input field above.</li>
                        </ul>
                    </p>
                    <p className="border-t border-slate-700 pt-3 mt-3"><strong><span className="text-red-400">CRITICAL:</span> Updating Your Script</strong><br/>If you ever change the script's code, you MUST re-deploy it. Go to <code>Deploy &gt; Manage deployments</code>, click the edit (pencil) icon, select a <strong>New version</strong> from the "Version" dropdown, and click <code>Deploy</code> again.</p>
                    <p className="border-t border-slate-700 pt-3 mt-3"><strong>Troubleshooting "Fetch failed" Errors</strong><br/>Paste your Web app URL directly into a new browser tab and press Enter. You should see text, like `[]` or `[{"id":...}]`. If you see a Google login page or an error, your "Who has access" setting from Step 6 is incorrect.</p>
                </div>
            </details>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
          <div className="flex gap-3">
              <button
                type="button"
                onClick={onFetch}
                disabled={!currentUrl || status.loading}
                className="px-6 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {status.loading && status.message.includes('Fetching') ? 'Fetching...' : 'Fetch from Sheet'}
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!currentUrl || status.loading}
                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {status.loading && !status.message.includes('Fetching') ? 'Saving...' : 'Save to Sheet'}
              </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetSyncModal;
