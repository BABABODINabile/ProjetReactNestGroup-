import { Outlet, NavLink } from "react-router-dom";
import { FaHome, FaFolderOpen, FaExchangeAlt, FaUser, FaUsers, FaSignOutAlt, FaBell, FaCog, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import { useAuthStore } from "../store/auth.store";
import Swal from "sweetalert2";
import { useState } from "react";

export default function DashboardLayout() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Fonction de déconnexion avec confirmation
  function handleLogout() {
    Swal.fire({
      title: "Déconnexion",
      text: "Voulez-vous vraiment vous déconnecter ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, déconnecter",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          icon: "success",
          title: "Déconnecté",
          text: "Vous avez été déconnecté.",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    });
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-lg transition-all ${
      isActive
        ? "bg-blue-600 text-white font-bold shadow-md"
        : "text-gray-700 hover:bg-gray-100 font-medium"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white shadow-2xl transition-all duration-300 flex flex-col border-r border-gray-200 m-3 rounded-3xl overflow-hidden`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center w-full"}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-800">Entreprise</h1>
                  <p className="text-xs text-gray-500">Management</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-blue-50 rounded-xl transition-colors text-gray-600"
            >
              {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className={navLinkClass} end>
            <FaHome className={sidebarOpen ? "mr-3" : "mx-auto"} size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/dashboard/categories" className={navLinkClass}>
            <FaFolderOpen className={sidebarOpen ? "mr-3" : "mx-auto"} size={20} />
            {sidebarOpen && <span>Catégories</span>}
          </NavLink>

          <NavLink to="/dashboard/transactions" className={navLinkClass}>
            <FaExchangeAlt className={sidebarOpen ? "mr-3" : "mx-auto"} size={20} />
            {sidebarOpen && <span>Transactions</span>}
          </NavLink>

          <NavLink to="/dashboard/profile" className={navLinkClass}>
            <FaUser className={sidebarOpen ? "mr-3" : "mx-auto"} size={20} />
            {sidebarOpen && <span>Profil</span>}
          </NavLink>

          {user?.role === "Directeur" && (
            <NavLink to="/dashboard/users" className={navLinkClass}>
              <FaUsers className={sidebarOpen ? "mr-3" : "mx-auto"} size={20} />
              {sidebarOpen && <span>Utilisateurs</span>}
            </NavLink>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? "px-4" : "justify-center"} py-3 text-red-600 hover:text-white font-semibold hover:bg-red-600 rounded-xl transition-all ${sidebarOpen && "gap-3"}`}
          >
            <FaSignOutAlt size={18} className="rotate-180" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-3 m-3">
        {/* TOP HEADER */}
        <header className="bg-white shadow-xl rounded-3xl border border-gray-200">
          <div className="px-8 py-5 flex items-center justify-between">
            {/* Left - Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
                />
                <span className="absolute right-4 top-2.5 text-gray-400 text-lg">🔍</span>
              </div>
            </div>

            {/* Right - Icons & Profile */}
            <div className="flex items-center gap-6 ml-8">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2.5 hover:bg-blue-50 rounded-2xl transition-colors">
                  <FaBell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg"></span>
                </button>
              </div>

              {/* Settings */}
              <button className="p-2.5 hover:bg-blue-50 rounded-2xl transition-colors">
                <FaCog size={20} className="text-gray-600" />
              </button>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-300"></div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-2xl transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    U
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800">Utilisateur</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <FaChevronDown size={12} className={`text-gray-600 transition-transform ${profileDropdown && "rotate-180"}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 overflow-hidden">
                    <NavLink to="/dashboard/profile" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors font-medium">
                      <FaUser className="inline mr-2 text-blue-600" /> Mon Profil
                    </NavLink>
                    <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors font-medium">
                      <FaCog className="inline mr-2 text-blue-600" /> Paramètres
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                    >
                      <FaSignOutAlt className="inline mr-2 rotate-180" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 overflow-auto bg-white rounded-3xl shadow-lg border border-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
