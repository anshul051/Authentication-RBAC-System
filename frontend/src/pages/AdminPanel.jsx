import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import api from '../api/axios.js';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [auditStats, setAuditStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/user/all'),
        api.get('/audit/stats'),
      ]);
      setUsers(usersRes.data.data.users);
      setAuditStats(statsRes.data.data);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Panel</h1>
          <p className="text-sm text-gray-600">Logged in as {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            ← Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {auditStats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-900">{auditStats.totalLogs}</div>
              <div className="text-sm text-gray-600 mt-1">Total Logs</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-900">{auditStats.loginAttempts}</div>
              <div className="text-sm text-gray-600 mt-1">Login Attempts</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border-2 border-red-200">
              <div className="text-3xl font-bold text-red-600">{auditStats.failedLogins}</div>
              <div className="text-sm text-gray-600 mt-1">Failed Logins</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border-2 border-green-200">
              <div className="text-3xl font-bold text-green-600">{auditStats.successRate}%</div>
              <div className="text-sm text-gray-600 mt-1">Success Rate</div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Users ({users.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Verified</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'manager' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{u.isEmailVerified ? '✅' : '❌'}</td>
                    <td className="py-3 px-4 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Logs */}
        {auditStats?.recentLogs && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {auditStats.recentLogs.map((log) => (
                <div key={log._id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-sm font-medium">{log.action}</span>
                    <span className="text-sm text-gray-600">
                      {log.userId?.email || log.email || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;