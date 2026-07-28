'use client';

import { useI18n } from '@/i18n/I18nContext';

export default function I18nBanner() {
  const { t } = useI18n();
  return (
    <div className="w-full bg-red-50 border-b border-red-100">
      <div className="max-w-5xl mx-auto px-4 py-2.5 text-center">
        <p className="text-red-600 font-bold text-sm md:text-base">
          {t('layout.banner')}
        </p>
      </div>
    </div>
  );
}
