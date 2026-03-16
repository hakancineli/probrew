'use client';

import React, { useState, useEffect } from 'react';
import LicenseSuspended from './LicenseSuspended';

const SUSPENSION_TIME = new Date('2099-12-31T23:59:59+03:00').getTime();

export default function SuspensionWrapper({ children }: { children: React.ReactNode }) {
    const [isSuspended, setIsSuspended] = useState(false);

    useEffect(() => {
        const checkSuspension = () => {
            // Lisans kontrolü devre dışı bırakıldı
            setIsSuspended(false);
        };

        checkSuspension();
        const interval = setInterval(checkSuspension, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isSuspended) {
        return <LicenseSuspended />;
    }

    return <>{children}</>;
}
