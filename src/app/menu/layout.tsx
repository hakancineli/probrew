import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Menü',
    description: 'ProBrew\'nin zengin menüsünü keşfedin. Taze kahveler, tatlılar ve özel içecekler sizi bekliyor.',
    alternates: {
        canonical: 'https://www.probrew.com.tr/menu',
    },
};

export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
