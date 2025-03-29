import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, UserPlus, Users, LogOut } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/enquiry', label: 'Enquiry', icon: UserPlus },
    { path: '/member-registration', label: 'Member Registration', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 h-screen transition-transform',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800 w-64">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-bold text-white">GymPro</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700',
                    location.pathname === item.path && 'bg-gray-700 text-white'
                  )}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
            <button
              className="w-full flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 mt-auto"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className={clsx(
        'transition-all duration-300',
        isSidebarOpen ? 'lg:ml-64' : 'ml-0'
      )}>
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;