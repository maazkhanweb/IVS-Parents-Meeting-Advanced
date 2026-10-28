import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Video, 
  Users, 
  Download, 
  Tv, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="bg-[#800020] text-white px-6 py-4 flex items-center justify-between border-b-4 border-[#D4AF37]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                Staff Operating Guide &amp; Instructions
              </h3>
              <p className="text-xs text-white/80">
                Iqra Virtual School Parents Meeting Live Operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-md text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700">
          {/* Quick Notice */}
          <div className="bg-rose-50 border-l-4 border-[#800020] p-4 rounded-r-lg">
            <h4 className="font-bold text-[#800020] text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#800020]" />
              Ready for Tomorrow's Meeting
            </h4>
            <p className="text-xs text-stone-700 mt-1">
              All data is stored directly in your browser's persistent storage. You do not need any database or API keys. Changes survive page refreshes and browser restarts.
            </p>
          </div>

          {/* Operational Steps */}
          <div className="space-y-4">
            <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider text-stone-500">
              Standard Operating Procedure (SOP)
            </h4>

            {/* Step 1 */}
            <div className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                1
              </div>
              <div>
                <h5 className="font-bold text-stone-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#800020]" />
                  Create Waiting Rooms
                </h5>
                <p className="text-xs text-stone-600 mt-1">
                  Click <strong>+ Create Waiting Room</strong> on the dashboard. Name it according to school zones, e.g., “Waiting Room 1”, “Waiting Room 2”, or “Primary Wing”.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                2
              </div>
              <div>
                <h5 className="font-bold text-stone-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  Add Department Rooms &amp; Zoom Links
                </h5>
                <p className="text-xs text-stone-600 mt-1">
                  Inside the waiting room, click <strong>+ Create Department Room</strong>. Examples include <em>Accounts</em>, <em>Accounts 1</em>, <em>IT Support</em>, <em>Management</em>, or <em>Academics</em>. Paste each department's existing Zoom meeting link.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                3
              </div>
              <div>
                <h5 className="font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Manual Token Assignment
                </h5>
                <p className="text-xs text-stone-600 mt-1">
                  Tokens are <strong>never generated automatically</strong>. When a parent contacts reception, the staff member enters the Parent Name, Student Name, Token Number (e.g. <code>A-05</code> or <code>101</code>), and optional issue, then clicks <em>Add Parent to Queue</em>.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                4
              </div>
              <div>
                <h5 className="font-bold text-stone-900 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#D4AF37]" />
                  Live Queue &amp; Screen Sharing for Parents
                </h5>
                <p className="text-xs text-stone-600 mt-1">
                  Click <strong>Parent Screen</strong> to open the full-screen display. You can share this window inside your Zoom main waiting room or project it on a screen so parents can see <em>Now Serving</em> and <em>Waiting</em> tokens clearly.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="w-7 h-7 rounded-full bg-[#800020] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                5
              </div>
              <div>
                <h5 className="font-bold text-stone-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-600" />
                  Backups &amp; Multi-Computer Setup
                </h5>
                <p className="text-xs text-stone-600 mt-1">
                  Use the <strong>Backup</strong> button in the top bar to save a <code>.json</code> file. If another school staff member or laptop needs the same rooms, click <strong>Restore</strong> and select the file.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
            <h5 className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Helpful Tips for Live Sessions
            </h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Turn on the audio chime with the <strong>Chime: ON</strong> button in the header to play a bell whenever a new token is called.</li>
              <li>When a consultation finishes, click <strong>Mark Completed</strong> to keep the queue clean.</li>
              <li>You can update or replace Zoom meeting links at any time without resetting the queue.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#800020] hover:bg-[#66001a] text-white font-bold text-xs sm:text-sm shadow transition-colors cursor-pointer"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
