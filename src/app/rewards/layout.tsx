import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ProBrew Rewards',
    description: 'ProBrew Rewards ile her kahvenizde yıldız kazanın. Size özel indirimler, hediyeler ve avantajlı kampanyaları kaçırmayın.',
    alternates: {
        canonical: 'https://www.probrew.com.tr/rewards',
    },
};

export default function RewardsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
