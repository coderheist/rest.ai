import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current page should hide sidebar (login, register, etc.)
  const hideSidebar = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Navbar />
      
      {!hideSidebar && <Sidebar />}
      
      <main className={`transition-all duration-300 pt-16 ${
        hideSidebar ? '' : 'ml-64'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
