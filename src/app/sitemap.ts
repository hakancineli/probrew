import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.probrew.com.tr';

    const routes = [
        '',
        '/pos',
        '/about',
        '/corporate',
        '/faq',
        '/contact',
        '/privacy',
        '/terms',
        '/cookies',
        '/kvkk',
        '/legal',
        '/iptal-iade-kosullari',
        '/mesafeli-satis-sozlesmesi',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));
}
