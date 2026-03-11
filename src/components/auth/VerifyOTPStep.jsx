import { useState, memo } from 'react';

const VerifyOTPStep = ({ email, onSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Standardized helper to match RequestOTPStep
  const getUserId = (emailStr) => 
    emailStr.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = getUserId(email);
      
      // Step A: Call the service (which now runs a secure transaction)
      const result = await verifyResetOTP(userId, otp);

      // Step B: If verified, pass the DB-verified email to the next step
      if (result.verified) {
        onSuccess(result.email); 
      }
    } catch (err) {
      // Step C: This now catches "Expired", "Invalid (with attempts left)", 
      // or "Security Lockout" errors from your service.
      setError(err.message);
      
      // If lockout or expired, clear the OTP field to signal a reset
      if (err.message.includes("lockout") || err.message.includes("expired")) {
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Verify Identity</h2>
        <p className="text-sm text-slate-500 mt-2">
          Enter the code sent to <span className="font-semibold text-slate-700">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg text-center animate-shake">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <input 
          type="text" 
          maxLength="6" 
          placeholder="· · · · · ·"
          className="w-full h-20 text-center text-5xl font-mono tracking-[0.2em] rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700" 
          value={otp} 
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          disabled={loading}
        />
        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
          Check your inbox and spam folder
        </p>
      </div>

      <button 
        type="submit"
        disabled={loading || otp.length < 6} 
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>

      <button 
        type="button" 
        onClick={onBack} 
        disabled={loading}
        className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
      >
        ← Change Email
      </button>
    </form>
  );
};
const MemoizedVerifyOTPStep = memo(VerifyOTPStep);
export default MemoizedVerifyOTPStep;