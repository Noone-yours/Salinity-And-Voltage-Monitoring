/**
 * UserRegistrationForm
 * Clean, validated form that triggers the atomic RTDB registration.
 */
const UserRegistrationForm = ({ selectedDevice, register, loading, error, onSuccess }) => {
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety Check: Ensure a device was actually passed from the previous step
    if (!selectedDevice?.id) return;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Separation: Nickname goes to the device tree, userInfo goes to the owners tree
    const { userDeviceName, ...userInfo } = data;

    // Trigger the atomic registration logic
    const result = await register(selectedDevice.id, userDeviceName, userInfo);
    
    if (result.success) {
      onSuccess(result.ownerId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-500">
      
      {/* HEADER: Safety Visual Check */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Hardware Selected</p>
        <p className="text-sm font-bold text-blue-900 truncate">
          {selectedDevice.id} <span className="font-normal opacity-60">({selectedDevice.deviceName || 'Fresh Node'})</span>
        </p>
      </div>

      {/* Device Section */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">Device Nickname</label>
        <input 
          name="userDeviceName" 
          required
          placeholder="e.g. Garden ESP32" 
          className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
        />
      </div>
      
      {/* Name Section - Grid for Clean Desktop Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
          <input name="firstName" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Middle Name</label>
          <input name="middleName" placeholder="(Opt)" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
          <input name="lastName" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
          <input name="email" type="email" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Mobile Number</label>
          <input name="mobile" type="tel" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      {/* Address Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Barangay</label>
          <input name="barangay" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Street / House No.</label>
          <input name="street" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      {/* Error Message with Shake Animation */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 font-medium animate-bounce">
          {error}
        </div>
      )}

      {/* Submit Button with Loading State */}
      <button 
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none mt-4 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Linking Hardware...
          </>
        ) : "Finalize Registration"}
      </button>
    </form>
  );
};

export default UserRegistrationForm;