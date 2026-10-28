import React, { useState } from 'react';
import { ParentQueueItem } from '../types';
import { formatWhatsAppSlip } from '../utils/token';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  Clock, 
  Users, 
  Video, 
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';

interface TokenPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentItem: ParentQueueItem | null;
  departmentName: string;
  waitingRoomName: string;
  zoomLink?: string;
  schoolName: string;
  parentsAhead: number;
  estimatedWaitMinutes: number;
}

export const TokenPassModal: React.FC<TokenPassModalProps> = ({
  isOpen,
  onClose,
  parentItem,
  departmentName,
  waitingRoomName,
  zoomLink,
  schoolName,
  parentsAhead,
  estimatedWaitMinutes,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !parentItem) return null;

  const handleCopyWhatsApp = () => {
    const text = formatWhatsAppSlip({
      schoolName,
      tokenNumber: parentItem.tokenNumber,
      parentName: parentItem.parentName,
      studentName: parentItem.studentName,
      departmentName,
      waitingRoomName,
      parentsAhead,
      estimatedWaitMinutes,
      zoomLink,
      issue: parentItem.issue,
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Token Pass – ${parentItem.tokenNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: white;
      color: #1c1917;
      padding: 20mm;
    }
    @page { size: portrait; margin: 10mm; }
    @media print {
      body { padding: 0; }
    }
    .slip {
      border: 2px solid #800020;
      border-radius: 12px;
      padding: 24px;
      max-width: 420px;
      margin: 0 auto;
    }
    .header { text-align: center; padding-bottom: 14px; border-bottom: 2px solid #800020; margin-bottom: 16px; }
    .school-name { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; color: #800020; }
    .slip-title { font-size: 16px; font-weight: 700; margin: 4px 0 2px; color: #111827; }
    .slip-sub { font-size: 12px; color: #4b5563; font-weight: 600; }
    .token-box { background: #fafaf9; border: 2px dashed #D4AF37; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 16px; }
    .token-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #78716c; }
    .token-number { font-size: 48px; font-weight: 900; color: #800020; letter-spacing: 2px; margin: 4px 0; }
    .token-status { font-size: 11px; font-weight: 700; color: #92400e; }
    table { width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 16px; }
    td { padding: 7px 4px; border-bottom: 1px solid #e5e7eb; }
    .td-label { color: #6b7280; font-weight: 500; }
    .td-value { text-align: right; font-weight: 700; color: #111827; }
    .td-highlight-label { color: #78350f; font-weight: 700; background: #fffbeb; padding: 6px 4px; }
    .td-highlight-value { text-align: right; font-weight: 700; color: #800020; background: #fffbeb; padding: 6px 4px; }
    .footer { text-align: center; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; }
    .footer p { margin: 0 0 4px; }
    .footer .main-note { font-weight: 500; color: #374151; font-size: 11px; }
  </style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <div class="school-name">${schoolName}</div>
      <div class="slip-title">Parents-Teacher Meeting Token Pass</div>
      <div class="slip-sub">${waitingRoomName} &bull; Desk: ${departmentName}</div>
    </div>
    <div class="token-box">
      <div class="token-label">Official Token Number</div>
      <div class="token-number">${parentItem.tokenNumber}</div>
      <div class="token-status">Status: Waiting in Waiting Room</div>
    </div>
    <table>
      <tbody>
        <tr><td class="td-label">Parent Name:</td><td class="td-value">${parentItem.parentName}</td></tr>
        <tr><td class="td-label">Student Name:</td><td class="td-value">${parentItem.studentName}</td></tr>
        <tr><td class="td-label">Department Desk:</td><td class="td-value">${departmentName}</td></tr>
        ${parentItem.issue ? `<tr><td class="td-label">Discussion:</td><td class="td-value">${parentItem.issue}</td></tr>` : ''}
        <tr>
          <td class="td-highlight-label">Aap ke aage:</td>
          <td class="td-highlight-value">${parentsAhead === 0 ? 'Aap ki baari hai (Next)' : `${parentsAhead} Parent(s)`}</td>
        </tr>
        <tr><td class="td-label">Takhmeenan Intezar:</td><td class="td-value">~${estimatedWaitMinutes} minutes</td></tr>
      </tbody>
    </table>
    ${zoomLink ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 10px;font-size:11px;margin-bottom:14px;">
      <strong style="color:#1e3a8a">Zoom Link: </strong><span style="color:#1d4ed8;word-break:break-all;font-family:monospace">${zoomLink}</span>
    </div>` : ''}
    <div class="footer">
      <p class="main-note">Barahe karam Waiting Room mein intezar karein. Desk khali hotay hi Sir aap ko desk par move karenge.</p>
      <p>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <>
      {/* ON-SCREEN MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#D4AF37] w-full max-w-lg overflow-hidden my-auto">
          {/* Header Ribbon */}
          <div className="bg-gradient-to-r from-[#800020] to-[#590016] text-white p-5 text-center relative border-b-2 border-[#D4AF37]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-[#D4AF37] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Token Successfully Created</span>
            </div>

            <h3 className="text-lg font-bold tracking-tight text-white">
              {schoolName} Parents Meeting Pass
            </h3>
            <p className="text-xs text-stone-200">
              {waitingRoomName} &bull; {departmentName}
            </p>
          </div>

          {/* Ticket Preview on Screen */}
          <div className="p-6 space-y-4 bg-stone-50">
            {/* Big Token Display */}
            <div className="bg-white rounded-xl border-2 border-dashed border-[#D4AF37] p-4 text-center shadow-xs">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                Official Token Number
              </span>
              <div className="text-5xl font-black text-[#800020] tracking-wider my-0.5">
                {parentItem.tokenNumber}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold mt-1">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Status: Waiting in Waiting Room</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="bg-white rounded-xl border border-stone-200 p-3.5 divide-y divide-stone-100 text-xs">
              <div className="py-1.5 flex justify-between items-center">
                <span className="text-stone-500 font-medium">Parent Name:</span>
                <span className="font-bold text-stone-900">{parentItem.parentName}</span>
              </div>
              <div className="py-1.5 flex justify-between items-center">
                <span className="text-stone-500 font-medium">Student Name:</span>
                <span className="font-bold text-stone-900">{parentItem.studentName}</span>
              </div>
              <div className="py-1.5 flex justify-between items-center">
                <span className="text-stone-500 font-medium">Department Desk:</span>
                <span className="font-semibold text-stone-900">{departmentName}</span>
              </div>
              {parentItem.issue && (
                <div className="py-1.5 flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Discussion:</span>
                  <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">
                    {parentItem.issue}
                  </span>
                </div>
              )}
              <div className="py-1.5 flex justify-between items-center bg-amber-50/50 px-2 -mx-2 rounded">
                <span className="text-stone-600 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Aap ke aage:
                </span>
                <span className="font-bold text-[#800020]">
                  {parentsAhead === 0 ? 'Aap ki baari hai (Next)' : `${parentsAhead} Parent(s)`}
                </span>
              </div>
              <div className="py-1.5 flex justify-between items-center bg-stone-50 px-2 -mx-2 rounded">
                <span className="text-stone-600 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  Takhmeenan Intezar:
                </span>
                <span className="font-bold text-stone-700">
                  ~{estimatedWaitMinutes} minutes
                </span>
              </div>
            </div>

            {/* Zoom Information */}
            {zoomLink ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">Zoom Meeting Link Active</div>
                    <div className="text-[11px] text-blue-700 truncate max-w-[220px]">
                      {zoomLink}
                    </div>
                  </div>
                </div>
                <a
                  href={zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex-shrink-0"
                >
                  <span>Join</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="bg-stone-100 rounded-xl p-2.5 text-center text-xs text-stone-500">
                Desk khali hotay hi Sir Zoom meeting link activate karenge.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row gap-2.5 justify-end">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>WhatsApp Slip Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Copy WhatsApp Slip</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Theek Hai
            </button>
          </div>
        </div>
      </div>

    </>
  );
};
