import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'bn'];

// 🟢 Fix: Next.js 15/16 requires 'requestLocale' as a Promise
export default getRequestConfig(async ({ requestLocale }) => {
  // Await the promise to extract the string
  const locale = await requestLocale;

  // Validate the locale
  if (!locale || !locales.includes(locale)) {
    notFound(); 
  }

  return {
    locale, 
    messages: (await import(`./messages/${locale}.json`)).default
  };
});