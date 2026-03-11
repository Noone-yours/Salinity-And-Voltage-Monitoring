import { cn } from "../../utils/cn";

/**
 * ATOMIC COMPONENT: InputField
 * Features: 8-point grid spacing, A11y support, and dynamic error states.
 */
const InputField = ({ label, name, register, validation, errors, type = "text", className, ...rest }) => {
  const hasError = !!errors?.[name];

  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold uppercase text-slate-400 mb-2">
        {label}
      </label>
      
      <input 
        type={type} 
        // A11y: Ipinapaalam sa screen readers kung ang input ay may error
        aria-invalid={hasError ? "true" : "false"}
        {...register(name, validation)} 
        className={cn(
          // BASE STYLES
          "p-3 border rounded-lg text-sm outline-none transition-all",
          
          // DEFAULT STATE
          "border-slate-200 focus:border-blue-500 bg-white",
          
          // ERROR STATE
          hasError && "border-red-500 bg-red-50 focus:border-red-500",
          
          className
        )}
        {...rest}
      />

      {hasError && (
        <span className="text-[10px] text-red-500 mt-1 font-medium italic">
          {errors[name].message}
        </span>
      )}
    </div>
  );
};

/**
 * COMPOSITE COMPONENT: RegistrationFields
 * Features: 8-point grid system, semantic sections, and auto-role assignment.
 */
export const RegistrationFields = ({ register, errors, isAdmin = false }) => {
  return (
    <div className="space-y-10">
      {/* 1. PERSONAL INFORMATION SECTION */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField 
            label="First Name" name="firstName" register={register} errors={errors} 
            validation={{ required: "First name is required" }} 
          />
          <InputField label="Middle Name" name="middleName" register={register} errors={errors} />
          <InputField 
            label="Last Name" name="lastName" register={register} errors={errors} 
            validation={{ required: "Last name is required" }} 
          />
          <InputField label="Suffix" name="suffix" register={register} errors={errors} placeholder="Jr." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField 
            label="Age" name="age" type="number" register={register} errors={errors}
            validation={{ 
              required: "Age is required", 
              min: { value: 18, message: "Must be 18 or older" },
              max: { value: 100, message: "Invalid age" }
            }} 
          />
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-2">Gender</label>
            <select 
              aria-invalid={errors?.gender ? "true" : "false"}
              {...register("gender")} 
              className={cn(
                "p-3 border rounded-lg text-sm bg-white outline-none cursor-pointer transition-all",
                errors?.gender ? "border-red-500 bg-red-50" : "border-slate-200 focus:border-blue-500"
              )}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <InputField 
            label="Mobile Number" name="mobileNum" register={register} errors={errors}
            placeholder="09123456789"
            validation={{ 
              required: "Mobile number is required",
              pattern: { value: /^09\d{9}$/, message: "Format: 09XXXXXXXXX" } 
            }} 
          />
        </div>
      </section>

      {/* 2. ADDRESS SECTION */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">
          Permanent Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Street / House No." name="street" register={register} errors={errors} placeholder="e.g. 123 Rizal St." />
          <InputField label="Baranggay" name="baranggay" register={register} errors={errors} validation={{ required: "Baranggay is required" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="City / Province" name="cityProvince" register={register} errors={errors} validation={{ required: "City/Province is required" }} />
          <InputField label="Region" name="region" register={register} errors={errors} />
          <InputField label="Zip Code" name="zipCode" register={register} errors={errors} />
        </div>
      </section>

      {/* 3. ACCESS CREDENTIALS SECTION */}
      <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
          Access Credentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Work Email" name="email" type="email" register={register} errors={errors}
            validation={{ 
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } 
            }} 
          />
          <InputField 
            label="Username" name="userName" register={register} errors={errors} 
            placeholder="j.donquillo"
            validation={{ required: "Username required" }} 
          />
        </div>

        {/* HIDDEN ROLE FIELD: Kinukuha ang value base sa isAdmin prop */}
        <input 
          type="hidden" 
          value={isAdmin ? "admin" : "user"} 
          {...register("role")} 
        />
        
        {/* VISUAL INDICATOR: Confirmation para sa Admin */}
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-white rounded-lg border border-slate-100 w-fit">
          <div className={cn("w-2 h-2 rounded-full", isAdmin ? "bg-blue-500" : "bg-slate-400")} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Auto-assigned Role: <span className={isAdmin ? "text-blue-600" : "text-slate-600"}>{isAdmin ? "Admin" : "User"}</span>
          </span>
        </div>
      </section>
    </div>
  );
};