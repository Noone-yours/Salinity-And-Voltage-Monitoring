import { cn } from "../../utils/cn";

const SummaryItem = ({ label, value, className }) => (
  <div className={cn("flex flex-col border-b border-slate-50 py-3", className)}>
    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
      {label}
    </span>
    <span className="text-sm font-medium text-slate-700 break-words">
      {value || "---"}
    </span>
  </div>
);

export const RegistrationSummary = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* SECTION 1: IDENTITY */}
      <div>
        <h3 className="text-[11px] font-black uppercase text-blue-600 tracking-widest mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          Account Identity
        </h3>
        <div className="grid grid-cols-2 gap-x-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <SummaryItem 
            label="Full Name" 
            value={`${data.firstName} ${data.middleName || ""} ${data.lastName} ${data.suffix || ""}`} 
            className="col-span-2"
          />
          <SummaryItem label="Username" value={data.userName} />
          <SummaryItem label="System Role" value={data.role} className="capitalize font-bold text-blue-700" />
          <SummaryItem label="Work Email" value={data.email} className="col-span-2" />
        </div>
      </div>

      {/* SECTION 2: PERSONAL & CONTACT */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-3">Profile Details</h3>
          <div className="space-y-1">
            <SummaryItem label="Age" value={`${data.age} years old`} />
            <SummaryItem label="Gender" value={data.gender} className="capitalize" />
            <SummaryItem label="Mobile" value={data.mobileNum} />
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-3">Permanent Address</h3>
          <div className="space-y-1">
            <SummaryItem label="Baranggay" value={data.baranggay} />
            <SummaryItem label="City / Province" value={data.cityProvince} />
            <SummaryItem label="Region" value={data.region} />
          </div>
        </div>
      </div>

      {/* SECURITY NOTICE */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
        <p className="text-[10px] text-amber-700 leading-relaxed italic">
          * Confirming this will trigger an automated onboarding email containing the system-generated credentials to the email address provided above.
        </p>
      </div>
    </div>
  );
};