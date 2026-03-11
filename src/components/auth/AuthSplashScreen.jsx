import LoadingSpinner from "../ui/LoadingSpinner";
import { memo } from "react";

/**
 * AUTH SPLASH SCREEN
 * Location: src/components/auth/AuthSplashScreen.jsx
 * Purpose: Full-screen branded loading state for initial Firebase sync.
 */
export const AuthSplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[10000] antialiased">
      {/* Container with Premium Animations */}
      <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Brand Identity with 8pt Rhythm */}
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-blue-600">
            SMART<span className="text-slate-900">AQUA</span>
          </h1>
          {/* Underline: h-1 (4px), w-12 (48px), mt-2 (8px) */}
          <div className="h-1 w-12 bg-blue-600 mx-auto mt-2 rounded-full" />
        </div>

        {/* Atomic UI Component */}
        <LoadingSpinner message="Synchronizing Secure Environment" />
      </div>
    </div>
  );
};
const MemoizedAuthSplashScreen = memo(AuthSplashScreen);
export default MemoizedAuthSplashScreen;