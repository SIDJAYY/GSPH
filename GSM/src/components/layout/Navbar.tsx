import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Home, FileText, Search, LogIn, ChevronDown, BarChart3, Users, TrendingUp, Award } from 'lucide-react';
import { useAuthStore } from '../../store/v1authStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentUser = useAuthStore(s => s.currentUser)
  const logout = useAuthStore(s => s.logout)
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEducationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-orange-500" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-900">
                Caloocan City
              </span>
              <br />
              <span className="text-sm text-orange-500 -mt-1 block">
                Scholarship Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              onClick={scrollToTop}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/apply"
              onClick={scrollToTop}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/apply')
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Apply</span>
            </Link>

            <Link
              to="/status"
              onClick={scrollToTop}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/status')
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Check Status</span>
            </Link>

            {/* Education Monitoring Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsEducationDropdownOpen(!isEducationDropdownOpen)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname.startsWith('/admin/education')
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Education Monitoring</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isEducationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isEducationDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/admin/education/overview"
                      onClick={() => {
                        setIsEducationDropdownOpen(false);
                        scrollToTop();
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard Overview</span>
                    </Link>
                    <Link
                      to="/admin/education/academic"
                      onClick={() => {
                        setIsEducationDropdownOpen(false);
                        scrollToTop();
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Academic Performance</span>
                    </Link>
                    <Link
                      to="/admin/education/enrollment"
                      onClick={() => {
                        setIsEducationDropdownOpen(false);
                        scrollToTop();
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Users className="h-4 w-4" />
                      <span>Enrollment Statistics</span>
                    </Link>
                    <Link
                      to="/admin/education/achievements"
                      onClick={() => {
                        setIsEducationDropdownOpen(false);
                        scrollToTop();
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Award className="h-4 w-4" />
                      <span>Student Achievements</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {!currentUser && (
              <Link
                to="/"
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}

            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <span>Welcome,</span>
                  <span className="font-medium text-orange-600">{currentUser.name}</span>
                </div>
                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-slate-700 hover:bg-slate-800"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {!currentUser ? (
              <Link
                to="/"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-slate-700"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 border border-slate-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-50 border-t">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            onClick={scrollToTop}
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              isActive('/') ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span>Home</span>
          </Link>
          <Link
            to="/apply"
            onClick={scrollToTop}
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              isActive('/apply') ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <FileText className="h-5 w-5 mb-1" />
            <span>Apply</span>
          </Link>
          <Link
            to="/status"
            onClick={scrollToTop}
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              isActive('/status') ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <Search className="h-5 w-5 mb-1" />
            <span>Status</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};