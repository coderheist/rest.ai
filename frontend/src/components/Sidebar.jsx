import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare,
  BarChart3,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Kanban,
  Target
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
    { name: 'Jobs', path: '/jobs', icon: Briefcase, description: 'Manage job postings' },
    { name: 'Candidate Inbox', path: '/candidates', icon: Inbox, description: 'Review incoming resumes' },
    { name: 'Pipeline View', path: '/pipeline', icon: Kanban, description: 'Kanban board' },
    { name: 'Talent Pool', path: '/talent-pool', icon: Users, description: 'All candidates' },
    { name: 'Matches', path: '/matches', icon: Target, description: 'AI matching results' },
    { name: 'Interviews', path: '/interviews', icon: MessageSquare, description: 'Interview kits' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, description: 'Performance insights' },
    { name: 'Exports', path: '/exports', icon: Download, description: 'Reports & exports' },
    { name: 'Settings', path: '/settings', icon: Settings, description: 'System settings' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110 z-50"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="mt-6 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={collapsed ? item.name : ''}
            >
              {/* Active Indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full" />
              )}
              
              {/* Icon */}
              <Icon className={`flex-shrink-0 w-5 h-5 transition-transform duration-200 ${
                active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
              } ${!collapsed && 'mr-3'} ${active && !collapsed ? 'scale-110' : ''}`} />
              
              {/* Text */}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate">{item.name}</p>
                  {!active && (
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  )}
                </div>
              )}
              
              {/* Hover Tooltip for Collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-300">{item.description}</div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info (when expanded) */}
      {!collapsed && (
        <div className="absolute bottom-6 left-3 right-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-xs font-medium text-blue-900 mb-1">Need Help?</p>
          <p className="text-xs text-blue-700">Check our documentation</p>
          <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
            Learn More →
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
