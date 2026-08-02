'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { courtshipApi, type CourtshipProfile, type ProfileRequest } from '@/services/courtshipApi';

interface Props {
  myProfile: CourtshipProfile | null;
  loading: boolean;
  onSaved: (saved: CourtshipProfile) => void;
}

const MAX_PHOTOS = 6;

export default function ProfileEditor({ myProfile, loading, onSaved }: Props) {
  const { t } = useI18n();

  const [form, setForm] = useState<ProfileRequest>({
    nickname: '',
    gender: 'MALE',
    birthDate: '',
    region: '',
    occupation: '',
    bio: '',
    beliefYears: undefined,
    churchName: '',
    ministryRole: '',
    seekingGender: '',
    seekingAgeMin: undefined,
    seekingAgeMax: undefined,
    seekingRegion: '',
    photos: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (myProfile) {
      setForm({
        nickname: myProfile.nickname || '',
        gender: myProfile.gender || 'MALE',
        birthDate: myProfile.birthDate ? myProfile.birthDate.substring(0, 10) : '',
        region: myProfile.region || '',
        occupation: myProfile.occupation || '',
        bio: myProfile.bio || '',
        beliefYears: myProfile.beliefYears ?? undefined,
        churchName: myProfile.churchName || '',
        ministryRole: myProfile.ministryRole || '',
        seekingGender: myProfile.seekingGender || '',
        seekingAgeMin: myProfile.seekingAgeMin ?? undefined,
        seekingAgeMax: myProfile.seekingAgeMax ?? undefined,
        seekingRegion: myProfile.seekingRegion || '',
        photos: myProfile.photos ? myProfile.photos.split(',').filter(Boolean) : [],
      });
    }
  }, [myProfile]);

  const handleUploadPhoto = async (file: File) => {
    if (!file) return;
    if (form.photos && form.photos.length >= MAX_PHOTOS) {
      setError(t('courtship.photoLimit'));
      return;
    }
    setUploadingPhoto(true);
    setError('');
    try {
      const url = await courtshipApi.uploadPhoto(file);
      setForm((prev) => ({ ...prev, photos: [...(prev.photos || []), url] }));
    } catch (err: any) {
      setError(err.response?.data?.message || t('fellowship.uploadFailed'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!form.nickname.trim()) {
      setError(t('courtship.nicknameRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await courtshipApi.upsertProfile(form);
      onSaved(saved);
    } catch (err: any) {
      setError(err.response?.data?.message || t('courtship.loadFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-bible-muted animate-pulse">
        {t('home.generatingScripture')}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-bold text-bible-dark">{t('courtship.editProfile')}</h2>

      {/* 状态显示 */}
      {myProfile && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-bible-muted">状态：</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              myProfile.status === 'APPROVED'
                ? 'bg-green-50 text-green-700'
                : myProfile.status === 'PENDING'
                ? 'bg-amber-50 text-amber-700'
                : myProfile.status === 'REJECTED'
                ? 'bg-red-50 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {myProfile.status === 'APPROVED'
              ? t('courtship.statusApproved')
              : myProfile.status === 'PENDING'
              ? t('courtship.statusPending')
              : myProfile.status === 'REJECTED'
              ? t('courtship.statusRejected')
              : t('courtship.statusHidden')}
          </span>
          {myProfile.status === 'REJECTED' && myProfile.rejectReason && (
            <span className="text-xs text-red-600">
              ({t('courtship.rejectReason')}: {myProfile.rejectReason})
            </span>
          )}
        </div>
      )}

      {/* 基本信息区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-bible-muted mb-1">
            {t('courtship.nickname')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            placeholder={t('courtship.nickname')}
          />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('courtship.gender')}</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as 'MALE' | 'FEMALE' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          >
            <option value="MALE">{t('courtship.male')}</option>
            <option value="FEMALE">{t('courtship.female')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('courtship.birthDate')}</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('courtship.region')}</label>
          <input
            type="text"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            placeholder={t('courtship.regionPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('courtship.occupation')}</label>
          <input
            type="text"
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">
            {t('courtship.beliefYears')}
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.beliefYears ?? ''}
            onChange={(e) =>
              setForm({
                ...form,
                beliefYears: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('courtship.church')}</label>
          <input
            type="text"
            value={form.churchName}
            onChange={(e) => setForm({ ...form, churchName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('courtship.ministry')}</label>
          <input
            type="text"
            value={form.ministryRole}
            onChange={(e) => setForm({ ...form, ministryRole: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* 自我介绍 */}
      <div>
        <label className="block text-sm text-bible-muted mb-1">{t('courtship.bio')}</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
          placeholder={t('courtship.bio')}
        />
      </div>

      {/* 交友意向 */}
      <div className="pt-2 border-t border-pink-100">
        <h3 className="text-sm font-bold text-bible-dark mb-2">💖 {t('courtship.seekingGender')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-bible-muted mb-1">
              {t('courtship.seekingGender')}
            </label>
            <select
              value={form.seekingGender}
              onChange={(e) =>
                setForm({ ...form, seekingGender: e.target.value as '' | 'MALE' | 'FEMALE' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            >
              <option value="">{t('courtship.allGender')}</option>
              <option value="MALE">{t('courtship.male')}</option>
              <option value="FEMALE">{t('courtship.female')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-bible-muted mb-1">
              {t('courtship.seekingRegion')}
            </label>
            <input
              type="text"
              value={form.seekingRegion}
              onChange={(e) => setForm({ ...form, seekingRegion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              placeholder={t('courtship.regionPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm text-bible-muted mb-1">
              {t('courtship.seekingAgeMin')}
            </label>
            <input
              type="number"
              min={18}
              max={99}
              value={form.seekingAgeMin ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  seekingAgeMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm text-bible-muted mb-1">
              {t('courtship.seekingAgeMax')}
            </label>
            <input
              type="number"
              min={18}
              max={99}
              value={form.seekingAgeMax ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  seekingAgeMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      {/* 照片上传 */}
      <div className="pt-2 border-t border-pink-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-bible-dark">📷 {t('courtship.photos')}</h3>
          <span className="text-xs text-bible-muted">
            {(form.photos?.length || 0)}/{MAX_PHOTOS}
          </span>
        </div>
        <p className="text-xs text-bible-muted mb-2">{t('courtship.photoLimit')}</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(form.photos || []).map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden bg-pink-50 group"
            >
              <img
                src={url}
                alt={`photo-${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <button
                onClick={() => handleRemovePhoto(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="remove"
              >
                ×
              </button>
            </div>
          ))}
          {(form.photos?.length || 0) < MAX_PHOTOS && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-pink-200 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 transition-colors text-pink-500">
              {uploadingPhoto ? (
                <span className="text-xs animate-pulse">...</span>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-xs mt-1">{t('courtship.uploadPhoto')}</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadPhoto(f);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 rounded-lg py-2 px-3">{error}</div>
      )}

      {/* 保存按钮 */}
      <div className="flex justify-end gap-2 pt-2 border-t border-pink-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {saving ? t('courtship.saving') : t('courtship.save')}
        </button>
      </div>
    </div>
  );
}
