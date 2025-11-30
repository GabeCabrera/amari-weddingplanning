import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/planner/', '/settings/', '/templates/', '/welcome/', '/choose-plan/', '/payment-success/', '/manage-x7k9/'],
      },
    ],
    sitemap: 'https://aisleboard.com/sitemap.xml',
  };
}
