// Removed unused React import for a cleaner, modern approach
const UserRegistrationForm = ({ selectedDevice, register, loading, error, onSuccess }) => {
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // The "userInfo" object will now automatically contain:
    // firstName, middleName, lastName, email, mobile, barangay, street
    const { userDeviceName, ...userInfo } = data;

    const result = await register(selectedDevice.id, userDeviceName, userInfo);
    
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Device Section */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">Device Nickname</label>
        <input 
          name="userDeviceName" 
          placeholder={selectedDevice.deviceName || "e.g. My ESP32 Node"} 
          className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
        />
      </div>
      
      {/* Name Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
          <input name="firstName" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Middle Name</label>
          <input name="middleName" placeholder="(Optional)" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" />
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

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 font-medium animate-shake">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button 
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none mt-4"
      >
        {loading ? "Processing..." : "Finalize Setup"}
      </button>
    </form>
  );
};

export default UserRegistrationForm;