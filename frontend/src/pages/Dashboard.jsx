import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const Dashboard = () => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-yellow-100 text-yellow-700',
    user: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">🔐 RBAC Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleBadgeColor[user?.role]}`}>
            {user?.role?.toUpperCase()}
          </span>
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-600">
            You are logged in as <strong>{user?.email}</strong> with role{' '}
            <strong>{user?.role}</strong>.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Sessions */}
          <Link
            to="/sessions"
            className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200 hover:border-indigo-500 transition"
          >
            <div className="text-4xl mb-3">🖥️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Active Sessions</h3>
            <p className="text-sm text-gray-600">View and manage your login sessions</p>
          </Link>

          {/* Manager Card */}
          {(isManager || isAdmin) && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-yellow-500">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Team Management</h3>
              <p className="text-sm text-gray-600">Manage your team members</p>
            </div>
          )}

          {/* Admin Panel */}
          {isAdmin && (
            <Link
              to="/admin"
              className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-500 hover:border-red-600 transition"
            >
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Admin Panel</h3>
              <p className="text-sm text-gray-600">Full system control and audit logs</p>
            </Link>
          )}

        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Account Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</div>
              <div className="text-sm text-gray-900 font-medium">{user?.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Role</div>
              <div className="text-sm text-gray-900 font-medium">{user?.role}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Joined</div>
              <div className="text-sm text-gray-900 font-medium">
                {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Verified</div>
              <div className="text-sm text-gray-900 font-medium">
                {user?.isEmailVerified ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;