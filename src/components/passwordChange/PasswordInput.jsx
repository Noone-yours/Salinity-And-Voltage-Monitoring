import { useState, memo} from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"; // Added CheckCircle2

const PasswordInput = ({ 
  label, 
  register, 
  name, 
  errors, 
  validation, 
  children, 
  strength = 0 // New prop to track progress
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  // Requirement Check logic
  const isSatisfied = strength >= 80;

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">
          {label}
        </label>
        
        {/* Requirement Badge: Shows only when strength meets the 80% bar */}
        {isSatisfied && (
          <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
            <span className="text-[9px] font-bold uppercase text-green-600 tracking-widest">Secure</span>
            <CheckCircle2 size={12} className="text-green-500" />
          </div>
        )}
      </div>

      <div className="relative group">
        <input 
          type={isVisible ? "text" : "password"} 
          {...register(name, validation)}
          autoComplete="new-password"
          className={`w-full p-3 pr-12 border rounded-xl text-sm outline-none transition-all shadow-sm
            ${errors[name] ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}
            ${isSatisfied && !errors[name] ? 'border-green-200 focus:border-green-500 focus:ring-green-50' : ''}`}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
          tabIndex="-1"
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {children}

      {errors[name] && (
        <span className="text-[10px] text-red-600 font-bold uppercase mt-1">
          {errors[name].message}
        </span>
      )}
    </div>
  );
};
const MemoizedPasswordInput = memo(PasswordInput);
export default MemoizedPasswordInput;