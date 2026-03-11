import { Check, Circle } from 'lucide-react';
import { memo } from "react";

const RequirementItem = memo(({ label, isMet }) => (
  <div className={`flex items-center gap-2 transition-colors duration-300 ${isMet ? 'text-green-600' : 'text-slate-400'}`}>
    {isMet ? (
      <Check size={12} className="animate-in zoom-in duration-300" strokeWidth={3} />
    ) : (
      <Circle size={12} className="text-slate-200" strokeWidth={2} />
    )}
    <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
  </div>
));

const PasswordChecklist = ({ password = "" }) => {
  const requirements = [
    { label: "8+ Characters", met: password.length >= 8 },
    { label: "At least 1 Number", met: /[0-9]/.test(password) },
    { label: "At least 1 Symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
      {requirements.map((req, idx) => (
        <RequirementItem key={idx} label={req.label} isMet={req.met} />
      ))}
    </div>
  );
};

const MemoizedPasswordChecklist = memo(PasswordChecklist);
export default MemoizedPasswordChecklist;