import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import de from '../locales/de.json'

type MessageSchema = typeof en

export default createI18n<[MessageSchema], 'en' | 'de'>({
  locale: 'en', // set default locale
  fallbackLocale: 'en', // fallback to English
  messages: {
    en: en,
    de: de
  },
  datetimeFormats: {
    de: {
      short: {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      },
      long: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    },
    en: {
      short: {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      },
      long: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    }
  }
})
