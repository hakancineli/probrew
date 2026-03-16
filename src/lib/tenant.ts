import { prisma } from './prisma';

/**
 * Mevcut isteğin hangi işletmeye ait olduğunu belirler.
 * Gelecekte query params, headers veya subdomain üzerinden çalışacak şekilde genişletilebilir.
 */
export async function getTenantFromRequest(slug: string) {
    if (!slug) return null;

    const business = await prisma.business.findUnique({
        where: { slug },
        include: {
            systemSettings: true,
        },
    });

    return business;
}

/**
 * Bir kullanıcının veya personelin erişim yetkisi olan işletmeleri döner.
 */
export async function getUserBusiness(email: string) {
    // Önce barista/personel tablosuna bak
    const staff = await prisma.barista.findUnique({
        where: { email },
        include: { business: true },
    });

    if (staff) return staff.business;

    // Sonra normal müşteri/user tablosuna bak
    const user = await prisma.user.findUnique({
        where: { email },
        include: { business: true },
    });

    return user?.business || null;
}
