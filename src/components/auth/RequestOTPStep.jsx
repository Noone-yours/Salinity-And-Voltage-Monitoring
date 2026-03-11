import { useState, memo } from 'react';

const RequestOTPStep = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // Added for anti-enumeration

  const getUserId = (emailStr) => 
    emailStr.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const sanitizedEmail = email.trim();
      const userId = getUserId(sanitizedEmail);
      
      // The service now handles database checks and rate limiting
      await requestPasswordResetOTP(sanitizedEmail, userId);
      
      // INDUSTRY STANDARD: Always show a neutral success message
      setSuccessMsg(`If an account exists for ${sanitizedEmail}, a 6-digit code has been sent.`);
      
      // Small delay so the user can read the message before swapping to Step 2
      setTimeout(() => {
        onNext(sanitizedEmail);
      }, 2000);

    } catch (err) {
      // This will catch the "Rate Limit" error from your transaction
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Forgot Password?</h2>
        <p className="text-sm text-slate-500 mt-2">Enter your email to receive a secure reset code.</p>
      </header>

      {/* ERROR: Shows Rate Limit errors */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase rounded">
          {error}
        </div>
      )}

      {/* SUCCESS: Industry Standard neutral message */}
      {successMsg && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-bold rounded">
          {successMsg}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
          Email Address
        </label>
        <input 
          type="email" 
          required 
          placeholder="name@example.com"
          className="w-full h-14 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>

      <button 
        disabled={loading || successMsg} 
        className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400"
      >
        {loading ? "Checking System..." : "Send Reset Code"}
      </button>
    </form>
  );
};
const MemoizedRequestOTPStep = memo(RequestOTPStep);
export default MemoizedRequestOTPStep ;