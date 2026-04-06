// src/components/Layout.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isRHM, isBHM, isEmployee } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Overview', path: '/admin/overview' },
        { name: 'Manage RHM', path: '/admin/rhm' },
        { name: 'Manage BHM', path: '/admin/bhm' },
        { name: 'Manage Employees', path: '/admin/employees' },
        { name: 'Live Map', path: '/admin/live-map' },
      ];
    } else if (isRHM) {
      return [
        { name: 'Dashboard', path: '/rhm' },
        { name: 'My BHMs', path: '/rhm/bhms' },
        { name: 'Employees', path: '/rhm/employees' },
      ];
    } else if (isBHM) {
      return [
        { name: 'Dashboard', path: '/bhm' },
        { name: 'My Employees', path: '/bhm/employees' },
      ];
    } else if (isEmployee) {
      return [
        { name: 'Dashboard', path: '/employee' },
        { name: 'Location History', path: '/employee/history' },
        { name: 'Share Location', path: '/employee/share' },
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Army Tracker</span>
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;