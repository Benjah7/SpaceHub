import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Translation } from '@/types';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Complete translation dictionary
const translations: Record<Language, Translation> = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      listings: 'Listings',
      dashboard: 'Dashboard',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
    },

    // Common/Global
    common: {
      search: 'Search',
      filter: 'Filter',
      apply: 'Apply',
      reset: 'Reset',
      clear: 'Clear',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
      submit: 'Submit',
      continue: 'Continue',
      learnMore: 'Learn More',
      seeAll: 'See All',
      showMore: 'Show More',
      showLess: 'Show Less',
    },

    // Property
    property: {
      view_details: 'View Details',
      contact_owner: 'Contact Owner',
      sqm: 'm²',
      per_month: '/month',
      available: 'Available',
      rented: 'Rented',
      pending: 'Pending',
      inactive: 'Inactive',
      featured: 'Featured',
      verified: 'Verified',
      new: 'New',
      propertyType: 'Property Type',
      priceRange: 'Price Range',
      size: 'Size',
      location: 'Location',
      amenities: 'Amenities',
      description: 'Description',
      details: 'Details',
      features: 'Features',
      neighborhood: 'Neighborhood',
      views: 'Views',
      inquiries: 'Inquiries',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      share: 'Share',
      reportListing: 'Report Listing',
    },

    // Property Types
    propertyTypes: {
      RETAIL: 'Retail Shop',
      OFFICE: 'Office Space',
      KIOSK: 'Kiosk',
      STALL: 'Market Stall',
    },

    // Home Page
    home: {
      hero_title: 'Find Your Perfect Commercial Space in Nairobi',
      hero_subtitle: 'Connect with verified property owners and secure your business location with ease',
      search_placeholder: 'Search by location, property type...',
      featured_properties: 'Featured Properties',
      how_it_works: 'How It Works',
      why_choose_us: 'Why Choose Space Hub',
      testimonials: 'What Our Users Say',
      cta_title: 'Ready to Find Your Space?',
      cta_subtitle: 'Join thousands of entrepreneurs finding their perfect business location',
      cta_button: 'Get Started',
    },

    // Listings Page
    listings: {
      title: 'Property Listings',
      subtitle: 'Browse available commercial spaces across Nairobi',
      resultsFound: 'properties found',
      noResults: 'No Properties Found',
      noResultsDescription: 'Try adjusting your filters or search criteria',
      filterByType: 'Filter by Type',
      filterByPrice: 'Filter by Price',
      filterBySize: 'Filter by Size',
      filterByLocation: 'Filter by Location',
      sortBy: 'Sort By',
      relevance: 'Relevance',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
      newest: 'Newest First',
      viewMode: 'View Mode',
      gridView: 'Grid View',
      listView: 'List View',
      mapView: 'Map View',
    },

    // Dashboard
    dashboard: {
      welcome: 'Welcome back',
      overview: 'Overview',
      myProperties: 'My Properties',
      addProperty: 'Add Property',
      editProperty: 'Edit Property',
      deleteProperty: 'Delete Property',
      propertyDetails: 'Property Details',
      activeListings: 'Active Listings',
      totalInquiries: 'Total Inquiries',
      totalViews: 'Total Views',
      monthlyRevenue: 'Monthly Revenue',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      viewAllProperties: 'View All Properties',
      viewInquiries: 'View Inquiries',
      noPropertiesYet: 'No properties yet',
      noPropertiesDescription: 'Start by adding your first property listing',
    },

    // Auth
    auth: {
      login: 'Log In',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      createAccount: 'Create Account',
      selectRole: 'Select your role',
      iAmOwner: "I'm a Property Owner",
      iAmTenant: "I'm looking to rent",
      loginSuccess: 'Welcome back!',
      signupSuccess: 'Account created successfully!',
      logoutSuccess: 'Logged out successfully',
    },

    // Forms
    forms: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid Kenyan phone number',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordsDontMatch: "Passwords don't match",
      selectAtLeastOne: 'Please select at least one option',
      minValue: 'Value must be at least',
      maxValue: 'Value cannot exceed',
      invalidFormat: 'Invalid format',
    },

    // Inquiry
    inquiry: {
      sendInquiry: 'Send Inquiry',
      yourMessage: 'Your Message',
      messagePlaceholder: "I'm interested in this property...",
      preferredViewingDate: 'Preferred Viewing Date',
      contactInfo: 'Contact Information',
      inquirySent: 'Inquiry sent successfully!',
      inquiryFailed: 'Failed to send inquiry',
    },

    // Review
    review: {
      writeReview: 'Write a Review',
      yourRating: 'Your Rating',
      yourReview: 'Your Review',
      reviewPlaceholder: 'Share your experience with this property...',
      submitReview: 'Submit Review',
      reviewSubmitted: 'Review submitted successfully!',
      reviews: 'Reviews',
      noReviews: 'No reviews yet',
      beTheFirst: 'Be the first to review this property',
    },

    // Payment
    payment: {
      payNow: 'Pay Now',
      paymentMethod: 'Payment Method',
      mpesa: 'M-Pesa',
      amount: 'Amount',
      phoneNumber: 'M-Pesa Phone Number',
      enterPin: 'Enter your M-Pesa PIN on your phone',
      paymentProcessing: 'Processing payment...',
      paymentSuccess: 'Payment successful!',
      paymentFailed: 'Payment failed',
      transactionId: 'Transaction ID',
    },

    // Notifications
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No notifications',
      newInquiry: 'New inquiry on your property',
      propertyViewed: 'Your property was viewed',
      inquiryResponse: 'Owner responded to your inquiry',
      paymentReceived: 'Payment received',
    },

    // Errors
    errors: {
      somethingWentWrong: 'Something went wrong',
      tryAgain: 'Please try again',
      notFound: 'Not Found',
      pageNotFound: 'Page not found',
      goHome: 'Go to Homepage',
      unauthorized: 'Unauthorized',
      loginRequired: 'Please login to continue',
      networkError: 'Network error. Please check your connection.',
    },

    // Footer
    footer: {
      aboutUs: 'About Us',
      contactUs: 'Contact Us',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved',
    },
  },

  sw: {
    // Navigation
    nav: {
      home: 'Nyumbani',
      listings: 'Orodha',
      dashboard: 'Dashibodi',
      login: 'Ingia',
      signup: 'Jisajili',
      logout: 'Toka',
      profile: 'Wasifu',
      settings: 'Mipangilio',
    },

    // Common/Global
    common: {
      search: 'Tafuta',
      filter: 'Chuja',
      apply: 'Tumia',
      reset: 'Rejesha',
      clear: 'Futa',
      loading: 'Inapakia...',
      error: 'Kosa',
      success: 'Mafanikio',
      cancel: 'Ghairi',
      save: 'Hifadhi',
      delete: 'Futa',
      edit: 'Hariri',
      view: 'Tazama',
      back: 'Rudi',
      next: 'Ifuatayo',
      previous: 'Iliyopita',
      close: 'Funga',
      confirm: 'Thibitisha',
      submit: 'Wasilisha',
      continue: 'Endelea',
      learnMore: 'Jifunze Zaidi',
      seeAll: 'Ona Zote',
      showMore: 'Onyesha Zaidi',
      showLess: 'Onyesha Kidogo',
    },

    // Property
    property: {
      view_details: 'Tazama Maelezo',
      contact_owner: 'Wasiliana na Mmiliki',
      sqm: 'm²',
      per_month: '/mwezi',
      available: 'Inapatikana',
      rented: 'Imepangishwa',
      pending: 'Inasubiri',
      inactive: 'Haijaamilishwa',
      featured: 'Inayopendekezwa',
      verified: 'Imethibitishwa',
      new: 'Mpya',
      propertyType: 'Aina ya Mali',
      priceRange: 'Bei',
      size: 'Ukubwa',
      location: 'Eneo',
      amenities: 'Huduma',
      description: 'Maelezo',
      details: 'Maelezo',
      features: 'Vipengele',
      neighborhood: 'Mtaa',
      views: 'Matazamo',
      inquiries: 'Maswali',
      addToFavorites: 'Ongeza kwa Vipendwa',
      removeFromFavorites: 'Ondoa kutoka Vipendwa',
      share: 'Shiriki',
      reportListing: 'Ripoti Orodha',
    },

    // Property Types
    propertyTypes: {
      RETAIL: 'Duka la Rejareja',
      OFFICE: 'Nafasi ya Ofisi',
      KIOSK: 'Kiosk',
      STALL: 'Kibanda cha Soko',
    },

    // Home Page
    home: {
      hero_title: 'Pata Nafasi Yako Bora ya Biashara Nairobi',
      hero_subtitle: 'Unganisha na wamiliki wa mali walioidhinishwa na uhakikishe eneo lako la biashara kwa urahisi',
      search_placeholder: 'Tafuta kwa eneo, aina ya mali...',
      featured_properties: 'Mali Zinazoshangaza',
      how_it_works: 'Jinsi Inavyofanya Kazi',
      why_choose_us: 'Kwa Nini Utuchague',
      testimonials: 'Watumiaji Wetu Wanasema Nini',
      cta_title: 'Tayari Kupata Nafasi Yako?',
      cta_subtitle: 'Jiunge na maelfu ya wafanyabiashara wanaopata eneo lao kamili la biashara',
      cta_button: 'Anza Sasa',
    },

    // Listings Page
    listings: {
      title: 'Orodha ya Mali',
      subtitle: 'Vinjari nafasi za kibiashara zinazopatikana kote Nairobi',
      resultsFound: 'mali zimepatikana',
      noResults: 'Hakuna Mali Iliyopatikana',
      noResultsDescription: 'Jaribu kurekebisha vichujio vyako au vigezo vya utafutaji',
      filterByType: 'Chuja kwa Aina',
      filterByPrice: 'Chuja kwa Bei',
      filterBySize: 'Chuja kwa Ukubwa',
      filterByLocation: 'Chuja kwa Eneo',
      sortBy: 'Panga kwa',
      relevance: 'Umuhimu',
      priceAsc: 'Bei: Ya Chini hadi Juu',
      priceDesc: 'Bei: Ya Juu hadi Chini',
      newest: 'Mpya Kwanza',
      viewMode: 'Muonekano',
      gridView: 'Muonekano wa Gridi',
      listView: 'Muonekano wa Orodha',
      mapView: 'Muonekano wa Ramani',
    },

    // Dashboard
    dashboard: {
      welcome: 'Karibu tena',
      overview: 'Muhtasari',
      myProperties: 'Mali Yangu',
      addProperty: 'Ongeza Mali',
      editProperty: 'Hariri Mali',
      deleteProperty: 'Futa Mali',
      propertyDetails: 'Maelezo ya Mali',
      activeListings: 'Orodha Hai',
      totalInquiries: 'Jumla ya Maswali',
      totalViews: 'Jumla ya Matazamo',
      monthlyRevenue: 'Mapato ya Mwezi',
      recentActivity: 'Shughuli za Hivi Karibuni',
      quickActions: 'Vitendo vya Haraka',
      viewAllProperties: 'Tazama Mali Zote',
      viewInquiries: 'Tazama Maswali',
      noPropertiesYet: 'Hakuna mali bado',
      noPropertiesDescription: 'Anza kwa kuongeza orodha yako ya kwanza ya mali',
    },

    // Auth
    auth: {
      login: 'Ingia',
      signup: 'Jisajili',
      logout: 'Toka',
      email: 'Barua Pepe',
      password: 'Nenosiri',
      confirmPassword: 'Thibitisha Nenosiri',
      firstName: 'Jina la Kwanza',
      lastName: 'Jina la Mwisho',
      phone: 'Nambari ya Simu',
      rememberMe: 'Nikumbuke',
      forgotPassword: 'Umesahau nenosiri?',
      alreadyHaveAccount: 'Tayari una akaunti?',
      dontHaveAccount: 'Huna akaunti?',
      createAccount: 'Fungua Akaunti',
      selectRole: 'Chagua jukumu lako',
      iAmOwner: 'Mimi ni Mmiliki wa Mali',
      iAmTenant: 'Ninatafuta kupanga',
      loginSuccess: 'Karibu tena!',
      signupSuccess: 'Akaunti imeundwa!',
      logoutSuccess: 'Umetoka',
    },

    // Forms
    forms: {
      required: 'Sehemu hii inahitajika',
      invalidEmail: 'Tafadhali weka barua pepe halali',
      invalidPhone: 'Tafadhali weka nambari ya simu ya Kenya halali',
      passwordTooShort: 'Nenosiri lazima liwe angalau herufi 8',
      passwordsDontMatch: 'Nenosiri hazilingani',
      selectAtLeastOne: 'Tafadhali chagua angalau moja',
      minValue: 'Thamani lazima iwe angalau',
      maxValue: 'Thamani haiwezi kuzidi',
      invalidFormat: 'Umbizo si sahihi',
    },

    // Inquiry
    inquiry: {
      sendInquiry: 'Tuma Swali',
      yourMessage: 'Ujumbe Wako',
      messagePlaceholder: 'Ninapendezwa na mali hii...',
      preferredViewingDate: 'Tarehe Unayopendelea Kutembelea',
      contactInfo: 'Maelezo ya Mawasiliano',
      inquirySent: 'Swali limetumwa!',
      inquiryFailed: 'Imeshindwa kutuma swali',
    },

    // Review
    review: {
      writeReview: 'Andika Ukaguzi',
      yourRating: 'Ukadiriaji Wako',
      yourReview: 'Ukaguzi Wako',
      reviewPlaceholder: 'Shiriki uzoefu wako na mali hii...',
      submitReview: 'Wasilisha Ukaguzi',
      reviewSubmitted: 'Ukaguzi umewasilishwa!',
      reviews: 'Ukaguzi',
      noReviews: 'Hakuna ukaguzi bado',
      beTheFirst: 'Kuwa wa kwanza kukagua mali hii',
    },

    // Payment
    payment: {
      payNow: 'Lipa Sasa',
      paymentMethod: 'Njia ya Malipo',
      mpesa: 'M-Pesa',
      amount: 'Kiasi',
      phoneNumber: 'Nambari ya M-Pesa',
      enterPin: 'Weka PIN yako ya M-Pesa kwenye simu yako',
      paymentProcessing: 'Inachakata malipo...',
      paymentSuccess: 'Malipo yamefaulu!',
      paymentFailed: 'Malipo yameshindikana',
      transactionId: 'Kitambulisho cha Muamala',
    },

    // Notifications
    notifications: {
      title: 'Arifa',
      markAllRead: 'Weka zote zimesomwa',
      noNotifications: 'Hakuna arifa',
      newInquiry: 'Swali jipya kwenye mali yako',
      propertyViewed: 'Mali yako imetazamwa',
      inquiryResponse: 'Mmiliki amejibu swali lako',
      paymentReceived: 'Malipo yamepokelewa',
    },

    // Errors
    errors: {
      somethingWentWrong: 'Kuna tatizo limetokea',
      tryAgain: 'Tafadhali jaribu tena',
      notFound: 'Haipatikani',
      pageNotFound: 'Ukurasa haupatikani',
      goHome: 'Nenda Nyumbani',
      unauthorized: 'Hauruhusiwi',
      loginRequired: 'Tafadhali ingia ili kuendelea',
      networkError: 'Kosa la mtandao. Tafadhali angalia muunganisho wako.',
    },

    // Footer
    footer: {
      aboutUs: 'Kuhusu Sisi',
      contactUs: 'Wasiliana Nasi',
      termsOfService: 'Masharti ya Huduma',
      privacyPolicy: 'Sera ya Faragha',
      followUs: 'Tufuate',
      allRightsReserved: 'Haki zote zimehifadhiwa',
    },
  },
};

/**
 * Helper function to get nested translation
 */
function getNestedTranslation(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path; // Return key if translation not found
    }
  }

  return typeof current === 'string' ? current : path;
}

/**
 * Language Store
 */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',

      setLanguage: (language) => {
        set({ language });
      },

      t: (key) => {
        const { language } = get();
        return getNestedTranslation(translations[language], key);
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
