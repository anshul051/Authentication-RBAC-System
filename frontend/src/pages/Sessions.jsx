import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import api from '../api/axios.js';

const Sessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data.data.sessions);
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (tokenId) => {
    setRevoking(tokenId);
    try {
      await api.delete(`/sessions/${tokenId}`);
      setSessions(sessions.filter(s => s.tokenId !== tokenId));
    } catch (err) {
      setError('Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevoking('all');
    try {
      await api.post('/sessions/revoke-all');
      await fetchSessions();
    } catch (err) {
      setError('Failed to revoke sessions');
    } finally {
      setRevoking(null);
    }
  };

  const deviceIcon = (device) => {
    if (device === 'Mobile') return '📱';
    if (device === 'Tablet') return '📟';
    return '🖥️';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading sessions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🖥️ Active Sessions</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          ← Dashboard
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Revoke All */}
        {sessions.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">You have {sessions.length} active sessions</p>
            <button
              onClick={handleRevokeAll}
              disabled={revoking === 'all'}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-70 transition"
            >
              {revoking === 'all' ? 'Revoking...' : '🚪 Logout All Other Devices'}
            </button>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.tokenId}
              className={`bg-white rounded-xl shadow-sm p-5 flex justify-between items-center ${
                session.isCurrent ? 'border-2 border-indigo-500' : 'border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{deviceIcon(session.device)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{session.sessionName}</span>
                    {session.isCurrent && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    IP: {session.ipAddress} • Last active: {new Date(session.lastActive).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires: {new Date(session.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.tokenId)}
                  disabled={revoking === session.tokenId}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-70 transition text-sm"
                >
                  {revoking === session.tokenId ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center text-gray-600 py-12 text-lg">
            No active sessions found
          </div>
        )}

      </div>
    </div>
  );
};

export default Sessions;