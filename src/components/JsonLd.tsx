import React from 'react';

const JsonLd = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CoffeeShop",
        "name": "ProBrew",
        "image": "https://www.probrew.com.tr/images/logo/probrew.jpeg",
        "@id": "https://www.probrew.com.tr",
        "url": "https://www.probrew.com.tr",
        "telephone": "+90 554 172 96 43",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Yıldırım Beyazıt Caddesi, no: 84, Fevzi çakmak mahallesi",
            "addressLocality": "Bahçelievler",
            "addressRegion": "İstanbul",
            "postalCode": "34182",
            "addressCountry": "TR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 41.0028,
            "longitude": 28.8471
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday"
                ],
                "opens": "08:00",
                "closes": "22:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Saturday",
                    "Sunday"
                ],
                "opens": "09:00",
                "closes": "23:00"
            }
        ],
        "sameAs": [
            "https://www.instagram.com/probrew",
            "https://www.facebook.com/probrew"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
};

export default JsonLd;
