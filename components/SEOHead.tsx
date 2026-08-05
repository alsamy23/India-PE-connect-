import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOConfig, DEFAULT_SEO_CONFIG, loadSEOConfig } from '../services/seoService.ts';

interface SEOHeadProps {
  activeTab?: string;
  customTitle?: string;
  customDescription?: string;
  schoolId?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  activeTab = 'dashboard',
  customTitle,
  customDescription,
  schoolId
}) => {
  const [config, setConfig] = useState<SEOConfig>(DEFAULT_SEO_CONFIG);

  useEffect(() => {
    let isMounted = true;
    loadSEOConfig(schoolId).then(loaded => {
      if (isMounted && loaded) {
        setConfig(loaded);
      }
    });

    const handleUpdated = (e: any) => {
      if (e.detail) {
        setConfig(e.detail);
      }
    };

    window.addEventListener('seo_config_updated', handleUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('seo_config_updated', handleUpdated);
    };
  }, [schoolId]);

  // Determine route override
  const routeOverride = config.routeOverrides?.[activeTab] || {};

  // Build clean base canonical domain prioritizing smartpeindia.app
  const rawBaseDomain = config.canonicalUrl || 'https://smartpeindia.app/';
  const baseDomain = rawBaseDomain.endsWith('/') ? rawBaseDomain : `${rawBaseDomain}/`;

  // Determine relative canonical path for current route
  const subPath = routeOverride.canonicalPath || (activeTab === 'dashboard' ? '' : `#${activeTab}`);
  const cleanSubPath = subPath.startsWith('/') ? subPath.slice(1) : subPath;
  const canonicalFullUrl = `${baseDomain}${cleanSubPath}`;

  // Determine Page Title
  const prefix = config.metaTitlePrefix || 'Smart PE India';
  const pageTitlePart = customTitle || routeOverride.title;
  const fullTitle = pageTitlePart 
    ? `${pageTitlePart} | ${prefix}`
    : `${prefix} - India's #1 AI Platform for PE Teachers`;

  // Determine Meta Description
  const metaDescription = customDescription || routeOverride.description || config.metaDescription;

  // Determine Keywords
  const keywords = routeOverride.keywords 
    ? `${routeOverride.keywords}, ${config.keywords}`
    : config.keywords;

  // Determine Social OG Tags
  const ogTitle = routeOverride.ogTitle || pageTitlePart || config.socialTitle || fullTitle;
  const ogDescription = routeOverride.ogDescription || metaDescription || config.socialDescription;
  const ogImage = routeOverride.ogImage || config.socialImageUrl;

  // Determine Crawling Robots
  const robotsSetting = config.allowCrawling ? 'index, follow' : 'noindex, nofollow';

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Basic Meta Tags */}
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={config.author || 'Smart PE India Team'} />
      <meta name="robots" content={robotsSetting} />
      <meta name="googlebot" content={robotsSetting} />

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalFullUrl} />

      {/* Open Graph / Facebook / WhatsApp Tags */}
      <meta property="og:site_name" content={config.siteName || 'Smart PE India'} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalFullUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={config.twitterHandle || '@smartpeindia'} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEOHead;
