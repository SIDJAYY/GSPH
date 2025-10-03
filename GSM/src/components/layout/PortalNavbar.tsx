import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ChevronDown, LogOut, ArrowLeft } from 'lucide-react';
import { getFullName } from '../../store/v1authStore';
import { useAuthStore } from '../../store/v1authStore';

export const PortalNavbar: React.FC = () => {
  const currentUser = useAuthStore(s => s.currentUser);
  const logout = useAuthStore(s => s.logout);
  const isLoggingOut = useAuthStore(s => s.isLoggingOut);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/portal');
    }
  };

  // Check if user is on the main portal page
  const isOnMainPortal = location.pathname === '/portal';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={handleBack}
              disabled={isOnMainPortal}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 ${
                isOnMainPortal
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
              }`}
              title={isOnMainPortal ? "Already on main page" : "Go back"}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Logo and Portal Name */}
            <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-orange-500" />
            <div>
              <span className="text-lg font-bold text-gray-900">
                Caloocan City
              </span>
              <br />
              <span className="text-sm text-orange-500 -mt-1 block">
                Scholarship Portal
              </span>
            </div>
            </div>
          </div>

          {/* Username Dropdown - Right Side */}
          <div className="flex items-center">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <span className="text-sm">Logged in as:</span>
                  <span className="text-sm font-medium text-orange-500">
                    {currentUser ? getFullName(currentUser) : ''}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-900" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? 'Logging out...' : 'Log Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
