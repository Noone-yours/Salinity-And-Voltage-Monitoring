import { memo } from "react";
/**
 * MODAL BACKDROP WRAPPER
 * Purpose: Dims the background, adds a blur effect, and centers the child modal.
 * Uses: fixed inset-0 for full-screen coverage and flex for perfect centering.
 */
const ModalBackdrop = ({ children }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-0">
      {/* 1. The Dimmer & Blur Layer */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500" 
        aria-hidden="true"
      />

      {/* 2. The Content Layer (Your ForcePasswordChange Modal) */}
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in duration-300 ease-out">
        {children}
      </div>
    </div>
  );
};
const MemoizedModalBackdrop = memo(ModalBackdrop);
export default MemoizedModalBackdrop ;