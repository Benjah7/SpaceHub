import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Translation } from '@/types';

interface LanguageState {
  language: Language;
  translations: Record<Language, Translation>;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translation> = {
  en: {
    common: {
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
    },
    nav: {
      home: 'Home',
      listings: 'Listings',
      dashboard: 'Dashboard',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
    },
    home: {
      hero_title: 'Find Your Perfect Retail Space in Nairobi',
      hero_subtitle: 'Connect with verified property owners instantly',
      search_placeholder: 'Search by location, size, or price...',
      browse_properties: 'Browse Properties',
      list_property: 'List Your Property',
      how_it_works: 'How It Works',
      featured_properties: 'Featured Properties',
      view_all: 'View All Listings',
    },
    property: {
      available: 'Available',
      booked: 'Booked',
      unavailable: 'Unavailable',
      verified: 'Verified',
      per_month: '/month',
      sqm: 'sqm',
      view_details: 'View Details',
      contact_owner: 'Contact Owner',
      send_message: 'Send Message',
      request_viewing: 'Request Viewing',
      pay_deposit: 'Pay Deposit via M-Pesa',
      schedule_visit: 'Schedule Visit',
      report_listing: 'Report Listing',
    },
    filters: {
      location: 'Location',
      property_type: 'Property Type',
      size: 'Size (sqm)',
      price: 'Price/Month',
      amenities: 'Amenities',
      min: 'Min',
      max: 'Max',
      apply: 'Apply Filters',
      reset: 'Reset Filters',
    },
  },
  sw: {
    common: {
      search: 'Tafuta',
      filter: 'Chuja',
      loading: 'Inapakia...',
      error: 'Hitilafu imetokea',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      delete: 'Futa',
      edit: 'Hariri',
      view: 'Tazama',
      close: 'Funga',
    },
    nav: {
      home: 'Nyumbani',
      listings: 'Orodha',
      dashboard: 'Dashibodi',
      login: 'Ingia',
      signup: 'Jisajili',
      logout: 'Toka',
    },
    home: {
      hero_title: 'Pata Nafasi Yako Bora ya Biashara Nairobi',
      hero_subtitle: 'Unganisha na wamiliki wa mali walioidhinishwa papo hapo',
      search_placeholder: 'Tafuta kwa eneo, ukubwa, au bei...',
      browse_properties: 'Angalia Mali',
      list_property: 'Weka Mali Yako',
      how_it_works: 'Jinsi Inavyofanya Kazi',
      featured_properties: 'Mali Zilizochaguliwa',
      view_all: 'Tazama Orodha Zote',
    },
    property: {
      available: 'Inapatikana',
      booked: 'Imewekwa Akiba',
      unavailable: 'Haipatikani',
      verified: 'Imethibitishwa',
      per_month: '/mwezi',
      sqm: 'mita za mraba',
      view_details: 'Tazama Maelezo',
      contact_owner: 'Wasiliana na Mmiliki',
      send_message: 'Tuma Ujumbe',
      request_viewing: 'Omba Kutembelea',
      pay_deposit: 'Lipa Amana kupitia M-Pesa',
      schedule_visit: 'Panga Ziara',
      report_listing: 'Ripoti Orodha',
    },
    filters: {
      location: 'Eneo',
      property_type: 'Aina ya Mali',
      size: 'Ukubwa (mita za mraba)',
      price: 'Bei/Mwezi',
      amenities: 'Huduma',
      min: 'Chini',
      max: 'Juu',
      apply: 'Tumia Kichujio',
      reset: 'Rudisha Kichujio',
    },
  },
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      translations,

      setLanguage: (language) => {
        set({ language });
      },

      t: (key) => {
        const { language, translations } = get();
        const keys = key.split('.');
        let value: unknown = translations[language];

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
          } else {
            return key; // Return key if translation not found
          }
        }

        return typeof value === 'string' ? value : key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
