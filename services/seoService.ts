import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.ts';

export interface RouteSEOOverride {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  keywords?: string;
  canonicalPath?: string;
}

export interface SEOConfig {
  canonicalUrl: string;
  allowCrawling: boolean;
  metaTitlePrefix: string;
  metaDescription: string;
  socialTitle: string;
  socialDescription: string;
  socialImageUrl: string;
  shareUrlFormat: 'domain_only' | 'vercel';
  sitemapActive: boolean;
  keywords: string;
  author: string;
  siteName: string;
  twitterHandle: string;
  routeOverrides: Record<string, RouteSEOOverride>;
}

export const DEFAULT_SEO_CONFIG: SEOConfig = {
  canonicalUrl: 'https://smartpeindia.app/',
  allowCrawling: true,
  metaTitlePrefix: 'Smart PE India',
  metaDescription: "India's #1 AI-Powered Platform for Physical Education Teachers & Schools. Generate CBSE/ICSE PE lesson plans, calculate Khelo India fitness scores, manage sports teams, and design curriculum.",
  socialTitle: "Smart PE India - India's #1 AI Platform for PE Teachers",
  socialDescription: "Generate CBSE/ICSE PE lesson plans in seconds, calculate Khelo India fitness scores, and design your curriculum on smartpeindia.app.",
  socialImageUrl: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1200&auto=format&fit=crop',
  shareUrlFormat: 'domain_only',
  sitemapActive: true,
  keywords: 'Physical Education, PE Teachers India, CBSE PE Lesson Plan, ICSE PE, Khelo India Fitness Test, School Fitness Management, Sports Curriculum, smartpeindia.app',
  author: 'Smart PE India Team',
  siteName: 'Smart PE India',
  twitterHandle: '@smartpeindia',
  routeOverrides: {
    dashboard: {
      title: 'PE Teacher Dashboard & School Analytics',
      description: 'Access physical education teaching resources, student fitness analytics, class schedules, and lesson planners on smartpeindia.app.',
      keywords: 'PE Teacher Dashboard, CBSE Sports Management, School Fitness Overview',
      canonicalPath: '/'
    },
    planner: {
      title: 'AI PE Lesson Plan Generator (CBSE/ICSE)',
      description: 'Generate comprehensive PE lesson plans with age-appropriate warm-ups, skill drills, safety measures, and equipment checklists in seconds.',
      keywords: 'AI Lesson Planner, Physical Education Lesson Plan, CBSE PE Plan, ICSE Physical Education',
      canonicalPath: '/#lesson-planner'
    },
    yearly: {
      title: 'Yearly PE Curriculum & Syllabus Planner',
      description: 'Auto-map 40 weeks of physical education curriculum for CBSE and ICSE grades with Smart PE India.',
      keywords: 'Yearly PE Plan, Physical Education Syllabus, Sports Curriculum',
      canonicalPath: '/#yearly-planner'
    },
    'weekly-planner': {
      title: 'Academic Weekly PE Planner & Homework Splitter',
      description: 'Plan weekly physical education theory and practical sessions with 1-click homework assignment generators.',
      keywords: 'Weekly PE Planner, PE Homework Generator, Academic Sports Schedule',
      canonicalPath: '/#weekly-planner'
    },
    fitness: {
      title: 'Khelo India Fitness Assessment & Score Calculator',
      description: 'Conduct standardized fitness battery tests, measure BMI, cardiorespiratory endurance, flexibility, and agility with instant AI scoring.',
      keywords: 'Khelo India Fitness Test, BMI Calculator, PE Fitness Assessment, Student Fitness Card',
      canonicalPath: '/#fitness-tests'
    },
    khelo: {
      title: 'Khelo India Battery Test Portal & Fitness Cards',
      description: 'Official Khelo India PE test scoring engine. Generate student fitness report cards and track physical literacy standards.',
      keywords: 'Khelo India Battery Test, Fitness Report Card, Ministry of Sports PE',
      canonicalPath: '/#khelo-india'
    },
    'school-admin': {
      title: 'School PE Administrative Center & SEO Controls',
      description: 'Manage physical education team staff access, master timetable OCR ingestion, and search engine optimization settings for smartpeindia.app.',
      keywords: 'School Admin, PE Timetable OCR, School Fitness Management, SEO Controls',
      canonicalPath: '/#school-admin'
    },
    'subscription-plans': {
      title: 'Pricing & Subscription Plans - Smart PE India',
      description: 'Choose the best plan for PE teachers, sports coaches, and school physical education departments on smartpeindia.app.',
      keywords: 'Smart PE India Pricing, PE Software Plans, School Fitness Subscription',
      canonicalPath: '/#pricing'
    },
    'about': {
      title: 'About Smart PE India - Empowering Physical Educators',
      description: 'Learn about Smart PE India mission to digitize and elevate physical education across Indian schools.',
      keywords: 'About Smart PE India, PE Education Mission, Sports Tech India',
      canonicalPath: '/#about'
    },
    'contact': {
      title: 'Contact Us & Support - Smart PE India',
      description: 'Get in touch with the Smart PE India support team for school onboardings, custom curriculum setups, and assistance.',
      keywords: 'Contact Smart PE India, PE Support, School PE Inquiry',
      canonicalPath: '/#contact'
    }
  }
};

const SEO_LOCAL_STORAGE_KEY = 'smartpe_seo_config_v1';

export async function loadSEOConfig(schoolId?: string): Promise<SEOConfig> {
  try {
    // Try local storage cache first for instant load
    const cached = localStorage.getItem(SEO_LOCAL_STORAGE_KEY);
    let initialConfig: SEOConfig = cached ? JSON.parse(cached) : DEFAULT_SEO_CONFIG;

    if (schoolId) {
      const snap = await getDoc(doc(db, 'seo_configs', schoolId));
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<SEOConfig>;
        initialConfig = {
          ...DEFAULT_SEO_CONFIG,
          ...remoteData,
          routeOverrides: {
            ...DEFAULT_SEO_CONFIG.routeOverrides,
            ...(remoteData.routeOverrides || {})
          }
        };
        localStorage.setItem(SEO_LOCAL_STORAGE_KEY, JSON.stringify(initialConfig));
      }
    }
    return initialConfig;
  } catch (err) {
    console.warn("Error loading SEO config, returning default:", err);
    return DEFAULT_SEO_CONFIG;
  }
}

export async function saveSEOConfig(schoolId: string, config: SEOConfig): Promise<void> {
  // Always prioritize canonical URL to smartpeindia.app if left empty
  const sanitizedConfig: SEOConfig = {
    ...config,
    canonicalUrl: config.canonicalUrl?.trim() || 'https://smartpeindia.app/'
  };

  localStorage.setItem(SEO_LOCAL_STORAGE_KEY, JSON.stringify(sanitizedConfig));

  if (schoolId) {
    await setDoc(doc(db, 'seo_configs', schoolId), sanitizedConfig);
  }

  // Dispatch custom event to notify React components to update head dynamically
  window.dispatchEvent(new CustomEvent('seo_config_updated', { detail: sanitizedConfig }));
}
