import * as cheerio from 'cheerio';
import { WebpageData } from './openai';
import { URL } from 'url';

// Function to extract the domain from a URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}

// Function to extract tags from meta keywords or content
function extractTags($: cheerio.CheerioAPI): string[] {
  // Try to extract from meta keywords
  const keywordsMeta = $('meta[name="keywords"]').attr('content');
  if (keywordsMeta) {
    return keywordsMeta.split(',').map(tag => tag.trim()).filter(Boolean);
  }

  // Extract from article tags if present
  const articleTags: string[] = [];
  $('a[rel="tag"], .tag, .tags a, .category, .categories a').each((_, el) => {
    const tagText = $(el).text().trim();
    if (tagText && tagText.length < 30) {
      articleTags.push(tagText);
    }
  });

  // If no tags found, extract from headings to create topic tags
  if (articleTags.length === 0) {
    const headingText: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        // Extract potential keywords (nouns, proper names)
        const words = text.split(/\s+/).filter(word => 
          word.length > 4 && /^[A-Z]/.test(word)
        );
        headingText.push(...words);
      }
    });
    return Array.from(new Set(headingText)).slice(0, 5);
  }

  return Array.from(new Set(articleTags)).slice(0, 10);
}

// Function to extract images from content - ONLY use meta tags
function extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];
  
  // ONLY extract og:image or twitter:image from meta tags
  const ogImage = $('meta[property="og:image"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  
  // Make URL absolute and add to images array
  const makeAbsoluteAndAdd = (src: string) => {
    if (!src) return;
    
    // Skip base64 encoded images
    if (src.startsWith('data:')) return;
    
    let absoluteSrc = src;
    
    // Make relative URLs absolute
    if (!src.startsWith('http')) {
      try {
        const urlObj = new URL(baseUrl);
        if (src.startsWith('/')) {
          absoluteSrc = `${urlObj.protocol}//${urlObj.host}${src}`;
        } else {
          absoluteSrc = `${urlObj.protocol}//${urlObj.host}/${src}`;
        }
      } catch (error) {
        return; // If URL construction fails, skip this image
      }
    }
    
    // Add to images array if not already included
    if (absoluteSrc && !images.includes(absoluteSrc)) {
      images.push(absoluteSrc);
    }
  };
  
  // Add meta images only
  if (ogImage) makeAbsoluteAndAdd(ogImage);
  if (twitterImage) makeAbsoluteAndAdd(twitterImage);
  
  // We're intentionally NOT extracting any other images from the page
  // as per the user's request to only use meta tag images
  
  console.log('Meta images extracted:', images);
  return images;
}

// Extract content from an article
function extractContent($: cheerio.CheerioAPI): string {
  // Try common article containers
  const selectors = [
    'article',
    '.article',
    '.post-content',
    '.entry-content',
    '.content',
    'main',
    '#content'
  ];
  
  let content = '';
  
  // Try each selector until we find content
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      // Remove common noise elements
      el.find('aside, nav, .navigation, .comments, .related, .sidebar, script, style').remove();
      content = el.text().trim();
      break;
    }
  }
  
  // If no content found in containers, get body text
  if (!content) {
    $('body').find('script, style, nav, header, footer').remove();
    content = $('body').text().trim();
  }
  
  // Normalize whitespace
  content = content.replace(/\s+/g, ' ');
  
  return content;
}

export async function scrapeWebpage(url: string): Promise<WebpageData> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') || 
                  'Untitled Page';
    
    // Extract description
    const description = $('meta[name="description"]').attr('content') || 
                        $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="twitter:description"]').attr('content') || '';
    
    // Extract domain
    const domain = extractDomain(url);
    
    // Extract content
    const content = extractContent($);
    
    // Extract tags
    const tags = extractTags($);
    
    // Extract images
    const images = extractImages($, url);
    
    return {
      url,
      title,
      description,
      domain,
      content,
      tags,
      images
    };
  } catch (error: any) {
    console.error('Error scraping webpage:', error);
    throw new Error(`Failed to scrape webpage: ${error.message || 'Unknown error'}`);
  }
}
