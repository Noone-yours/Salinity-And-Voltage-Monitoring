import { useState, useEffect, memo } from 'react';
import RequestOTPStep from './RequestOTPStep';
import VerifyOTPStep from './VerifyOTPStep';
import ResetPassword from './ResetPassword';

/**
 * ORGANISM: ForgotPasswordModal
 * Orchestrates the 3-step recovery flow: Request -> Verify -> Reset.
 * Standardized on 8pt grid with backdrop-blur and in-memory security.
 */
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // LOGIC: Reset state whenever the modal closes to prevent data leaks
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail("");
      setIsVerified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * SECURITY HANDSHAKE:
   * Moves to Reset step only after a successful DB transaction.
   */
  const handleVerifySuccess = (verifiedEmail) => {
    setEmail(verifiedEmail);
    setIsVerified(true);
    setStep(3);
  };

  /**
   * FLOW CLEANUP:
   * Called after successful reset to return user to the Login screen.
   */
  const handleFinalSuccess = () => {
    // 2-second buffer is handled inside ResetPasswordStep for the animation
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Click-outside backdrop (Accessibility) */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* STEP INDICATOR (8pt Grid: h-1.5 = 6px) */}
        <div className="flex h-1.5 bg-slate-100">
          <div 
            className={`h-full bg-blue-600 transition-all duration-700 ease-in-out ${
              step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
            }`} 
          />
        </div>

        <div className="p-8">
          {/* HEADER: Close Action (8pt: mb-8 = 32px) */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* STEP 1: Request Email */}
          {step === 1 && (
            <RequestOTPStep 
              onNext={(sanitizedEmail) => { 
                setEmail(sanitizedEmail); 
                setStep(2); 
              }} 
            />
          )}
          
          {/* STEP 2: Verify 6-Digit Code */}
          {step === 2 && (
            <VerifyOTPStep 
              email={email} 
              onSuccess={handleVerifySuccess} 
              onBack={() => setStep(1)} 
            />
          )}

          {/* STEP 3: Create New Password (Guarded by isVerified) */}
          {step === 3 && isVerified && (
            <ResetPassword
              email={email} 
              onSuccess={handleFinalSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
const MemoizedForgotPasswordModal = memo(ForgotPasswordModal);
export default MemoizedForgotPasswordModal;