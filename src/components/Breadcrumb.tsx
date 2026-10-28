import React from 'react';
import { ChevronRight, ArrowLeft, Home, Building2, Layers } from 'lucide-react';

interface BreadcrumbProps {
  waitingRoomName?: string;
  departmentName?: string;
  onGoHome: () => void;
  onGoToWaitingRoom?: () => void;
  onBack: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  waitingRoomName,
  departmentName,
  onGoHome,
  onGoToWaitingRoom,
  onBack,
}) => {
  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200 py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-sm">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-stone-600 overflow-x-auto py-0.5">
          {/* Back button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-[#800020] bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors mr-2 cursor-pointer active:scale-95"
            title="Return to previous screen"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Root */}
          <button
            onClick={onGoHome}
            className={`inline-flex items-center gap-1 hover:text-[#800020] transition-colors cursor-pointer font-medium ${
              !waitingRoomName ? 'text-[#800020] font-bold' : ''
            }`}
          >
            <Home className="w-4 h-4 text-[#800020]" />
            <span>Dashboard</span>
          </button>

          {waitingRoomName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <button
                onClick={departmentName ? onGoToWaitingRoom : undefined}
                className={`inline-flex items-center gap-1 transition-colors cursor-pointer ${
                  departmentName
                    ? 'hover:text-[#800020] text-stone-600 font-medium'
                    : 'text-[#800020] font-bold'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-stone-400" />
                <span className="truncate max-w-[140px] sm:max-w-xs">{waitingRoomName}</span>
              </button>
            </>
          )}

          {departmentName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="inline-flex items-center gap-1 text-[#800020] font-bold">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="truncate max-w-[150px] sm:max-w-sm">{departmentName}</span>
              </span>
            </>
          )}
        </div>

        <div className="text-xs text-stone-600 hidden sm:block">
          {departmentName ? (
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Department Room Active
            </span>
          ) : waitingRoomName ? (
            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Waiting Room Selected
            </span>
          ) : (
            <span className="text-stone-600">Main Control Room</span>
          )}
        </div>
      </div>
    </nav>
  );
};
