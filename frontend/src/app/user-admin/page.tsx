'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  status: string;
  hasPassword: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

type ModalMode = 'create' | 'edit' | 'reset' | null;

export default function UserAdminPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [keyword, setKeyword] = useState('');

  // 弹窗状态
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 表单字段
  const [fUsername, setFUsername] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPassword, setFPassword] = useState('');
  const [fDisplayName, setFDisplayName] = useState('');
  const [fBio, setFBio] = useState('');
  const [fStatus, setFStatus] = useState('active');
  const [fNewPassword, setFNewPassword] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      try {
        const res = await api.get('/qt/admin/check');
        if (res.data.data === true) {
          setIsAdmin(true);
          await loadUsers();
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAdmin();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/admin/list');
      if (!res.data.success) {
        setError(res.data.message || t('userAdmin.loadFail'));
      } else {
        setUsers(res.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('userAdmin.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return users;
    return users.filter(u =>
      u.username.toLowerCase().includes(k) ||
      u.email.toLowerCase().includes(k) ||
      (u.displayName || '').toLowerCase().includes(k)
    );
  }, [users, keyword]);

  const openCreate = () => {
    setModalMode('create');
    setEditing(null);
    setFUsername('');
    setFEmail('');
    setFPassword('');
    setFDisplayName('');
    setFBio('');
    setFStatus('active');
    setError('');
    setSuccess('');
  };

  const openEdit = (u: AdminUser) => {
    setModalMode('edit');
    setEditing(u);
    setFUsername(u.username);
    setFEmail(u.email);
    setFDisplayName(u.displayName || '');
    setFBio(u.bio || '');
    setFStatus(u.status || 'active');
    setError('');
    setSuccess('');
  };

  const openReset = (u: AdminUser) => {
    setModalMode('reset');
    setEditing(u);
    setFNewPassword('');
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditing(null);
    setSubmitting(false);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/users/admin', {
        username: fUsername.trim(),
        email: fEmail.trim(),
        password: fPassword,
        displayName: fDisplayName.trim() || undefined,
        status: fStatus,
      });
      if (!res.data.success) {
        setError(res.data.message || t('userAdmin.saveFail'));
      } else {
        setSuccess(t('userAdmin.saveSuccess'));
        await loadUsers();
        closeModal();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('userAdmin.saveFail'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editing) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/users/admin/${editing.id}`, {
        username: fUsername.trim(),
        email: fEmail.trim(),
        displayName: fDisplayName,
        bio: fBio,
        status: fStatus,
      });
      if (!res.data.success) {
        setError(res.data.message || t('userAdmin.saveFail'));
      } else {
        setSuccess(t('userAdmin.saveSuccess'));
        await loadUsers();
        closeModal();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('userAdmin.saveFail'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!editing) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/users/admin/${editing.id}/reset-password`, {
        newPassword: fNewPassword,
      });
      if (!res.data.success) {
        setError(res.data.message || t('userAdmin.saveFail'));
      } else {
        setSuccess(t('userAdmin.resetSuccess'));
        closeModal();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('userAdmin.saveFail'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!window.confirm(t('userAdmin.confirmDelete'))) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/users/admin/${u.id}`);
      if (!res.data.success) {
        setError(res.data.message || t('userAdmin.deleteFail'));
      } else {
        setSuccess(t('userAdmin.deleteSuccess'));
        await loadUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('userAdmin.deleteFail'));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return t('userAdmin.never');
    try {
      const d = new Date(iso);
      return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'active') return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">{t('userAdmin.statusActive')}</span>;
    if (s === 'suspended') return <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">{t('userAdmin.statusSuspended')}</span>;
    return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">{t('userAdmin.statusDisabled')}</span>;
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-700 text-lg animate-pulse">{t('userAdmin.checkingAuth')}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-2">{t('userAdmin.noPermission')}</p>
          <p className="text-gray-500 text-sm">{t('userAdmin.noPermissionHint')}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-amber-600 hover:text-amber-800 text-sm"
          >
            {t('userAdmin.backHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/')}
          className="text-amber-700 hover:text-amber-900 transition-colors text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('userAdmin.back')}
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t('userAdmin.title')}</h1>
        <div className="w-16" />
      </div>

      <p className="text-sm text-gray-500 mb-4">{t('userAdmin.subtitle')}</p>

      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('userAdmin.searchPlaceholder')}
          className="flex-1 min-w-[200px] px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
        />
        <button
          onClick={openCreate}
          className="bg-amber-600 text-white hover:bg-amber-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + {t('userAdmin.addBtn')}
        </button>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:bg-gray-100 disabled:text-gray-400 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {t('userAdmin.refreshBtn')}
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        {t('userAdmin.total').replace('{n}', String(filtered.length))}
      </p>

      {loading && <div className="text-center py-8 text-amber-700">{t('userAdmin.loading')}</div>}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* 用户列表 */}
      {!loading && filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-12 text-center text-gray-400">
          {t('userAdmin.empty')}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50/50 border-b border-amber-100">
                <tr className="text-left text-xs text-amber-700">
                  <th className="px-4 py-3 font-semibold">{t('userAdmin.colUsername')}</th>
                  <th className="px-4 py-3 font-semibold">{t('userAdmin.colEmail')}</th>
                  <th className="px-4 py-3 font-semibold">{t('userAdmin.colDisplayName')}</th>
                  <th className="px-4 py-3 font-semibold">{t('userAdmin.colStatus')}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{t('userAdmin.colLastLogin')}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{t('userAdmin.colCreatedAt')}</th>
                  <th className="px-4 py-3 font-semibold text-right">{t('userAdmin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/30">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {u.username}
                      {!u.hasPassword && (
                        <span className="ml-2 text-xs text-gray-400">({t('userAdmin.noPassword')})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.displayName || '-'}</td>
                    <td className="px-4 py-3">{statusBadge(u.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatTime(u.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatTime(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-amber-700 hover:text-amber-900 text-xs font-medium mr-3"
                      >
                        {t('userAdmin.editBtn')}
                      </button>
                      <button
                        onClick={() => openReset(u)}
                        className="text-blue-700 hover:text-blue-900 text-xs font-medium mr-3"
                      >
                        {t('userAdmin.resetPwdBtn')}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        {t('userAdmin.deleteBtn')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 弹窗 */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {modalMode === 'create' && t('userAdmin.createTitle')}
              {modalMode === 'edit' && t('userAdmin.editTitle')}
              {modalMode === 'reset' && t('userAdmin.resetTitle')}
            </h2>

            <div className="space-y-3">
              {modalMode === 'create' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldUsername')}</label>
                    <input
                      type="text"
                      value={fUsername}
                      onChange={(e) => setFUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldEmail')}</label>
                    <input
                      type="email"
                      value={fEmail}
                      onChange={(e) => setFEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldPassword')}</label>
                    <input
                      type="password"
                      value={fPassword}
                      onChange={(e) => setFPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('userAdmin.pwdHint')}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldDisplayName')}</label>
                    <input
                      type="text"
                      value={fDisplayName}
                      onChange={(e) => setFDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldStatus')}</label>
                    <select
                      value={fStatus}
                      onChange={(e) => setFStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    >
                      <option value="active">{t('userAdmin.statusActive')}</option>
                      <option value="suspended">{t('userAdmin.statusSuspended')}</option>
                      <option value="disabled">{t('userAdmin.statusDisabled')}</option>
                    </select>
                  </div>
                </>
              )}

              {modalMode === 'edit' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldUsername')}</label>
                    <input
                      type="text"
                      value={fUsername}
                      onChange={(e) => setFUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldEmail')}</label>
                    <input
                      type="email"
                      value={fEmail}
                      onChange={(e) => setFEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldDisplayName')}</label>
                    <input
                      type="text"
                      value={fDisplayName}
                      onChange={(e) => setFDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldBio')}</label>
                    <textarea
                      value={fBio}
                      onChange={(e) => setFBio(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldStatus')}</label>
                    <select
                      value={fStatus}
                      onChange={(e) => setFStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    >
                      <option value="active">{t('userAdmin.statusActive')}</option>
                      <option value="suspended">{t('userAdmin.statusSuspended')}</option>
                      <option value="disabled">{t('userAdmin.statusDisabled')}</option>
                    </select>
                  </div>
                </>
              )}

              {modalMode === 'reset' && (
                <>
                  <p className="text-sm text-gray-500">
                    {t('userAdmin.fieldUsername')}: <span className="font-medium text-gray-800">{editing?.username}</span>
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">{t('userAdmin.fieldNewPassword')}</label>
                    <input
                      type="password"
                      value={fNewPassword}
                      onChange={(e) => setFNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('userAdmin.pwdHint')}</p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {t('userAdmin.cancelBtn')}
              </button>
              <button
                onClick={modalMode === 'create' ? handleCreate : modalMode === 'edit' ? handleEdit : handleReset}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-300 rounded-lg font-medium"
              >
                {submitting ? t('userAdmin.loading') : t('userAdmin.saveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
