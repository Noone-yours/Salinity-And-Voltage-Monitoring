import { useState, useEffect, memo } from 'react';
import { useForm } from 'react-hook-form';
import { PasswordReset } from '../../services/auth.service'; 
import { PasswordInput, StrengthMeter, PasswordChecklist } from '../passwordChange'; 
import { calculatePasswordStrength } from '../../utils/passwordMetrics';

const ResetPassword = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ 
    mode: "onChange" 
  });

  const newPassword = watch("newPassword", "");

  useEffect(() => {
    setStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const onSubmit = async (data) => {
    if (strength < 80) {
      setError("Security Check: Please satisfy all complexity requirements.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Perform the update in Firebase
      await PasswordReset(data.newPassword);
      
      // Step 2: Show the success animation
      setSuccess(true);

      // Step 3: Wait 2 seconds so the user feels the "Success", 
      // then call onSuccess to close the modal and show the Login form.
      setTimeout(() => {
        onSuccess(); 
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-500">
        {/* Success Checkmark Circle (8pt: w-20 = 80px) */}
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce-short">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">Security Updated</h2>
        <p className="text-slate-500 text-sm mt-2 text-center leading-relaxed">
          Your password has been changed successfully. 
          <br />
          <span className="font-semibold text-blue-600 italic">You can now sign in with your new credentials.</span>
        </p>
        
        {/* Visual Progress Bar (8pt: mt-8 = 32px) */}
        <div className="w-full h-1 bg-slate-100 rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-green-500 animate-progress-fast" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">New Password</h2>
        <p className="text-sm text-slate-500 mt-1">Create a strong password to secure your account.</p>
      </header>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PasswordInput
          label="Create Password"
          name="newPassword"
          register={register}
          errors={errors}
          strength={strength}
          validation={{
            required: "Required",
            validate: () => strength >= 80 || "Does not meet complexity requirements"
          }}
        >
          <div className="flex flex-col gap-2 mt-2">
            <StrengthMeter strength={strength} />
            <PasswordChecklist password={newPassword} />
          </div>
        </PasswordInput>

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          register={register}
          errors={errors}
          validation={{
            required: "Required",
            validate: (val) => val === newPassword || "Passwords do not match"
          }}
        />

        <button
          type="submit"
          disabled={loading || strength < 80}
          className="w-full h-14 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};
const MemoizedResetPassword = memo(ResetPassword);
export default MemoizedResetPassword;