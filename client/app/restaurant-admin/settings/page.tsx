"use client";

import { useState } from "react";
import RestaurantAdminSidebar from "../components/RestaurantAdminSidebar";
import RestaurantAdminTopbar from "../components/RestaurantAdminTopbar";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    restaurantName: "My Restaurant",
    email: "admin@restaurant.com",
    phone: "+91 9876543210",
    address: "123 Main Street, City",
    zipCode: "12345",
    city: "City Name",
    state: "State",
    country: "India",
    timezone: "Asia/Kolkata",
    currency: "INR",
    serviceCharge: 5,
    gstNo: "27AAACR1234F2Z5",
    openTime: "09:00",
    closeTime: "23:00",
    allowOnlineOrders: true,
    allowDelivery: true,
    allowDineIn: true,
    maxTableCapacity: 100,
    notificationEmail: "notify@restaurant.com",
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call would go here
      console.log("Saving settings:", settings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <RestaurantAdminSidebar />

      <main className="flex-1">
        <RestaurantAdminTopbar />

        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Restaurant Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your restaurant's basic information and preferences
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Basic Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={settings.restaurantName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={settings.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNo"
                    value={settings.gstNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={settings.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={settings.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={settings.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={settings.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Operations Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Operations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    name="openTime"
                    value={settings.openTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    name="closeTime"
                    value={settings.closeTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    name="serviceCharge"
                    value={settings.serviceCharge}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Table Capacity
                  </label>
                  <input
                    type="number"
                    name="maxTableCapacity"
                    value={settings.maxTableCapacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Service Options Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Service Options
              </h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowDineIn"
                    checked={settings.allowDineIn}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">Allow Dine In</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowOnlineOrders"
                    checked={settings.allowOnlineOrders}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">Allow Online Orders</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowDelivery"
                    checked={settings.allowDelivery}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">Allow Delivery</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
