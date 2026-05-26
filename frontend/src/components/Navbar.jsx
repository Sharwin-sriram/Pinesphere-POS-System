import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";

function Navbar() {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm px-8 py-4 flex justify-between items-center">

      {/* Left Side */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Analytics Dashboard
        </h1>

        <p className="text-gray-500">
          Business Intelligence & Reporting System
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Search Box */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search reports..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Notification */}
        <button className="relative">
          <FaBell
            size={22}
            className="text-slate-600 hover:text-cyan-600"
          />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <FaUserCircle
            size={38}
            className="text-cyan-600"
          />

          <div>
            <p className="text-sm text-gray-500">
              Welcome
            </p>

            <h3 className="font-semibold text-slate-700">
              Analytics Team
            </h3>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Navbar;