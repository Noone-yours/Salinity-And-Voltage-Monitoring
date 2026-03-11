import { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getFullUserData } from "../../services/auth.service";
import { PasswordInput } from "../passwordChange";
import { SpinnerIcon} from "../ui";
import ForgotPasswordModal from "./ForgotPasswordModal";

/**
 * ORGANISM: Login Form
 * Integrated with ForgotPasswordModal for a seamless "One Path" experience.
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // 1. MODAL STATE: Controls the visibility of the reset flow
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
  setIsSubmitting(true);
  setAuthError(""); // I-reset ang error bawat attempt

  try {
    // 1. AUTHENTICATION: I-verify ang credentials sa Firebase
    const userCredential = await loginUser(data.email, data.password);
    const uid = userCredential.user.uid;

    sessionStorage.setItem("is_verified", "true");

    // 3. DATA SYNC: Kunin ang Profile at Role mula sa Database
    const userData = await getFullUserData(uid);

    if (!userData) {
      throw new Error("Account not found. Please contact your system administrator.");
    }

    // 4. SECURITY CHECK: Forced Password Change logic
    if (userData.requiresPasswordChange) {
      navigate("/force-password-change");
      return;
    }

    // 5. ROLE-BASED ROUTING: Direkta sa tamang 'Office'
    switch (userData.role) {
      case "superAdmin":
        navigate("/admin", { replace: true });
        break;
      case "admin":
        navigate("/admin/dashboard", { replace: true });
        break;
      case "technician":
        navigate("/tech/controls", { replace: true });
        break;
      default:
        navigate("/dashboard", { replace: true });
    }

    } catch (err) {
        setAuthError(err.message);
        sessionStorage.removeItem("is_verified");
    } finally {
        setIsSubmitting(false);
    }
 };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-500">
        
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to monitor your water quality system.</p>
        </header>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
              })}
              placeholder="name@example.com"
              className={`w-full p-3 h-14 border rounded-xl text-sm outline-none transition-all shadow-sm
                ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
            />
            {errors.email && (
              <span className="text-[10px] text-red-600 font-bold uppercase mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="relative">
            <PasswordInput
              label="Password"
              name="password"
              register={register}
              errors={errors}
              validation={{ required: "Password is required" }}
            />
            
            {/* 2. TRIGGER: Replaced <Link> with <button> to open Modal */}
            <div className="flex justify-end mt-2">
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[10px] font-bold text-blue-600 uppercase tracking-tight hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg 
                       transition-all active:scale-[0.98] flex items-center justify-center gap-3
                       disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon size="w-5 h-5" />
                <span className="animate-pulse uppercase text-[12px] tracking-widest">Verifying...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">Need an account or device?</p>
          <div className="flex flex-col gap-2 mt-3">
            <Link to="/get-device" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700">
              How to Get a Device
            </Link>
            <a href="mailto:admin@smartaqua.com" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
              Contact System Admin
            </a>
          </div>
        </footer>
      </div>

      {/* 3. MODAL COMPONENT: Rendered outside the main card but within the layout */}
      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
};
const MemoizedLoginForm = memo(LoginForm);
export default MemoizedLoginForm;