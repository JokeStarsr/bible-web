'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';

interface QtImportItem {
  date: string;
  title: string;
  scriptureReference: string;
  scriptureText: string;
  commentary: string;
  hymn: string;
}

interface OcrResult {
  items: QtImportItem[];
}

export default function QtAdminPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOcrResult(null);
    setSaved(false);
    setError('');
    setSuccess('');
    // 生成预览
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleOcrPreview = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setOcrResult(null);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/qt/admin/ocr-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      setOcrResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '识别失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOcrImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setOcrResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/qt/admin/ocr-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      setSuccess(res.data.message || '导入成功');
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '导入失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!ocrResult || ocrResult.items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/qt/admin/import', ocrResult);
      setSuccess('已保存到数据库');
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setOcrResult(null);
    setSaved(false);
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-700 text-lg animate-pulse">{t('qtAdmin.checkingAuth')}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-2">{t('qtAdmin.noPermission')}</p>
          <p className="text-gray-500 text-sm">{t('qtAdmin.noPermissionHint')}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-amber-600 hover:text-amber-800 text-sm"
          >
            {t('qtAdmin.backHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-amber-700 hover:text-amber-900 transition-colors text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('qtAdmin.back')}
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t('qtAdmin.title')}</h1>
        <div className="w-16" />
      </div>

      {/* 上传区域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('qtAdmin.uploadTitle')}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {t('qtAdmin.uploadHint')}
        </p>

        {/* 文件选择 */}
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-amber-200 rounded-xl p-6 text-center hover:border-amber-400 transition-colors cursor-pointer bg-amber-50/30"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="预览"
                  className="max-h-80 mx-auto rounded-lg shadow-sm"
                />
                <p className="text-sm text-gray-500">{file?.name}</p>
              </div>
            ) : (
              <div className="py-8">
                <svg className="w-12 h-12 mx-auto text-amber-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-amber-700 font-medium">点击选择图片</p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG / PNG / WebP</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOcrPreview}
              disabled={!file || loading}
              className="flex items-center gap-2 bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {loading ? t('qtAdmin.previewing') : t('qtAdmin.previewBtn')}
            </button>
            <button
              onClick={handleOcrImport}
              disabled={!file || loading}
              className="flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {loading ? t('qtAdmin.importing') : t('qtAdmin.importBtn')}
            </button>
            {file && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
              >
                {t('qtAdmin.resetBtn')}
              </button>
            )}
          </div>

          {/* 提示信息 */}
          {loading && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-amber-700">
                  正在识别图片内容，OCR + AI 解析可能需要 10-30 秒，请耐心等待...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-700 whitespace-pre-line">{success}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OCR 预览结果 */}
      {ocrResult && ocrResult.items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('qtAdmin.previewTitle')}</h2>
            {!saved && (
              <button
                onClick={handleConfirmAndSave}
                disabled={loading}
                className="bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 text-sm font-medium py-2 px-5 rounded-xl transition-colors"
              >
                {loading ? t('qtAdmin.saving') : t('qtAdmin.saveBtn')}
              </button>
            )}
            {saved && <span className="text-green-600 text-sm font-medium">{t('qtAdmin.saved')}</span>}
          </div>

          <div className="space-y-4">
            {ocrResult.items.map((item, i) => (
              <div key={i} className="border border-amber-100 rounded-xl p-4 bg-amber-50/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">
                    {item.date}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{item.title}</span>
                </div>

                <div className="space-y-2 text-sm">
                  {item.scriptureReference && (
                    <div>
                      <span className="text-xs font-medium text-amber-600">{t('qtAdmin.scriptureRef')}</span>
                      <p className="text-gray-700">{item.scriptureReference}</p>
                    </div>
                  )}
                  {item.scriptureText && (
                    <div>
                      <span className="text-xs font-medium text-amber-600">{t('qtAdmin.scriptureText')}</span>
                      <p className="text-gray-700 whitespace-pre-wrap">{item.scriptureText}</p>
                    </div>
                  )}
                  {item.commentary && (
                    <div>
                      <span className="text-xs font-medium text-amber-600">{t('qtAdmin.commentary')}</span>
                      <p className="text-gray-700 whitespace-pre-wrap">{item.commentary}</p>
                    </div>
                  )}
                  {item.hymn && (
                    <div>
                      <span className="text-xs font-medium text-amber-600">{t('qtAdmin.hymn')}</span>
                      <p className="text-gray-700 whitespace-pre-wrap">{item.hymn}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('qtAdmin.usageTitle')}
        </h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>{t('qtAdmin.usage1')}</li>
          <li>{t('qtAdmin.usage2')}</li>
          <li>{t('qtAdmin.usage3')}</li>
          <li>{t('qtAdmin.usage4')}</li>
          <li>{t('qtAdmin.usage5')}</li>
        </ul>
      </div>
    </div>
  );
}
