import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { ClientReport } from './ClientReport';

export const PDFExportButton: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <>
      <button
        onClick={() => reactToPrintFn()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-gray-700 rounded-xl font-bold transition-colors text-sm shadow-md"
      >
        <Printer size={16} />
        Export PDF Report
      </button>
      
      {/* Hidden container for the print content */}
      <div style={{ display: "none" }}>
        <div ref={contentRef}>
          <ClientReport />
        </div>
      </div>
    </>
  );
};
