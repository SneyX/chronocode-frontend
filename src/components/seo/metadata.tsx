
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetadataProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
}

const defaultMetadata = {
  siteName: 'Chronocode',
  titleTemplate: '%s | Chronocode',
  defaultTitle: 'Chronocode - Visualize Your Repository Timeline',
  defaultDescription: 'Visualize and analyze your code repository commits with intelligent timeline and insights.',
  defaultOgImage: '/lovable-uploads/c9272aad-7458-4ac7-9168-26adc0c800ef.png',
  defaultTwitterCard: 'summary_large_image' as const,
  defaultOgType: 'website' as const,
  siteUrl: 'https://chronocode.ai',
};

const Metadata: React.FC<MetadataProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = defaultMetadata.defaultOgType,
  twitterCard = defaultMetadata.defaultTwitterCard,
  noIndex = false,
}) => {
  const pageTitle = title 
    ? title === 'Home' 
      ? defaultMetadata.defaultTitle 
      : defaultMetadata.titleTemplate.replace('%s', title)
    : defaultMetadata.defaultTitle;
    
  const pageDescription = description || defaultMetadata.defaultDescription;
  const pageOgImage = ogImage || defaultMetadata.defaultOgImage;
  const pageUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : defaultMetadata.siteUrl);

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageOgImage.startsWith('/') && !pageOgImage.startsWith('http') 
        ? `${window.location.origin}${pageOgImage}` 
        : pageOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={defaultMetadata.siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageOgImage.startsWith('/') && !pageOgImage.startsWith('http')
        ? `${window.location.origin}${pageOgImage}`
        : pageOgImage} />
      
      {/* Indexing Control */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default Metadata;
