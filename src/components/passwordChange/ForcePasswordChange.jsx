import { useState, useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { PasswordInput, StrengthMeter, PasswordChecklist } from "../passwordChange";
import { calculatePasswordStrength } from "../../utils/passwordMetrics";
import { PasswordReset } from "../../services/auth.service"; 
import { LoadingSpinner, Toast } from "../ui"; 

const ForcePasswordChange = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { setMustChangePassword } = useAuth(); 

  // STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [strength, setStrength] = useState(0);

  // TOAST STATE
  const [toast, setToast] = useState({ 
    isOpen: false, 
    message: "", 
    type: "success" 
  });

  // FORM INITIALIZATION
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: "onChange"
  });
  
  const newPassword = watch("newPassword", "");

  // HELPER: Show Toast
  const showToast = (message, type = "error") => {
    setToast({ isOpen: true, message, type });
  };

  // Password Strength Tracker
  useEffect(() => {
    setStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const onSubmit = async (data) => {
    // 1. SECURITY GATE: Hard requirement
    if (strength < 80) return;

    setIsSubmitting(true);
    
    try {
      /** * ATOMIC RESET:
       * Ang PasswordReset() na ang bahala sa Auth update at Database flag syncing.
       */
      await PasswordReset(data.newPassword);
      
      // Step B: Visual Confirmation
      setShowSuccessOverlay(true);

      // Step C: UX Transition Delay
      setTimeout(() => {
        if (setMustChangePassword) setMustChangePassword(false);
        if (onSuccess) onSuccess(); 
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      // Gagamit ng Toast sa halip na inline serverError para sa "Top Middle" feedback
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS OVERLAY UI
  if (showSuccessOverlay) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <span className="material-symbols-outlined text-4xl font-bold">check</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Updated</h2>
        <p className="text-slate-500 text-sm mt-2 text-center leading-relaxed">
          Your new password is now active. <br />
          <span className="font-bold text-emerald-600">Redirecting to login...</span>
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-[32px] max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Protect Your Account</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Change your temporary password to unlock the SmartAqua dashboard.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <div className="space-y-6">
          <PasswordInput 
            label="New Password" 
            name="newPassword" 
            register={register} 
            errors={errors} 
            strength={strength}
            validation={{ 
              required: "Password required",
              validate: (v) => strength >= 80 || "Does not meet security requirements"
            }}
          >
            <div className="flex flex-col gap-3 mt-3">
              <StrengthMeter strength={strength} />
              <PasswordChecklist password={newPassword} />
            </div>
          </PasswordInput>

          <PasswordInput 
            label="Verify New Password" 
            name="confirmPassword" 
            register={register} 
            errors={errors} 
            validation={{ 
              required: "Please confirm your password",
              validate: (v) => v === newPassword || "Passwords do not match" 
            }} 
          />
        </div>
          
        <button 
          type="submit"
          disabled={isSubmitting || strength < 80}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl 
                     transition-all shadow-xl active:scale-[0.98] 
                     disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <LoadingSpinner size="w-5 h-5" color="text-white"/>
              <span className="animate-pulse">Updating Security...</span>
            </div>
          ) : (
            "Secure Account & Continue"
          )}
        </button>
      </form>

      {/* TOAST PLACEMENT: Lalabas ito sa Top Middle base sa iyong Toast configuration */}
      <Toast 
        isOpen={toast.isOpen} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, isOpen: false })} 
      />
    </div>
  );
};

const MemoizedForcePasswordChange = memo(ForcePasswordChange);
export default MemoizedForcePasswordChange;