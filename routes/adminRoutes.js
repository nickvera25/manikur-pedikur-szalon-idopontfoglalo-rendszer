// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Token & Admin jogosultság ellenőrzése
const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: "Bejelentkezés szükséges!" });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'titokkulcs', async (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Érvénytelen munkamenet." });

        const userId = decoded.id || decoded.felhasznalo_id;
        const userRoles = await prisma.felhasznalo_szerepkor.findMany({
            where: { felhasznalo_id: userId },
            include: { szerepkor: true }
        });

        const isAdmin = userRoles.some(r => r.szerepkor.szerepkor_nev === 'Admin');
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Csak adminisztrátorok férhetnek hozzá ehhez az oldalhoz!" });
        }

        req.user = decoded;
        next();
    });
};

// STATISZTIKA LEKÉRÉSE (Hónap és év szűréssel)
// STATISZTIKA LEKÉRÉSE (Pénz nélkül: Darabszámok, No-Show ráta, Leterheltség)
router.get('/statistics', verifyAdmin, async (req, res) => {
    try {
        const year = parseInt(req.query.year) || dayjs().year();
        const month = parseInt(req.query.month) || dayjs().month() + 1;

        const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
        const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

        const bookings = await prisma.foglalasok.findMany({
            where: {
                kezdo_idopont: { gte: startDate, lte: endDate }
            },
            include: {
                szolgaltatas: true,
                alkalmazott: { select: { felhasznalo_id: true, vezeteknev: true, keresztnev: true } },
                statusz: true
            }
        });

        // 1. Darabszám alapú mutatók
        const totalBookings = bookings.length;
        const completedCount = bookings.filter(b => b.statusz?.statusz_neve === 'Teljesítve').length;
        const noShowCount = bookings.filter(b => b.statusz?.statusz_neve === 'Nem jelent meg').length;
        const pendingCount = bookings.filter(b => b.statusz?.statusz_neve === 'Jóváhagyva').length;

        // Megbízhatósági / Megjelenési arány (azok közül, amiknek le kellett zárulniuk)
        const closedCount = completedCount + noShowCount;
        const attendanceRate = closedCount > 0 ? Math.round((completedCount / closedCount) * 100) : 100;

        // 2. Szolgáltatások népszerűsége (Darabszám szerint rendezve)
        const serviceMap = {};
        bookings.forEach(b => {
            const id = b.szolgaltatas_id;
            const name = b.szolgaltatas.szolgaltatas_neve;

            if (!serviceMap[id]) {
                serviceMap[id] = { name, count: 0 };
            }
            serviceMap[id].count += 1;
        });

        const topServices = Object.values(serviceMap).sort((a, b) => b.count - a.count);

        // 3. Dolgozói leterheltség (Elvégzett vs. összes vendégszám)
        const employeeMap = {};
        bookings.forEach(b => {
            const id = b.alkalmazott_id;
            const name = `${b.alkalmazott.vezeteknev} ${b.alkalmazott.keresztnev}`;
            const isCompleted = b.statusz?.statusz_neve === 'Teljesítve';

            if (!employeeMap[id]) {
                employeeMap[id] = { name, total: 0, completed: 0 };
            }
            employeeMap[id].total += 1;
            if (isCompleted) employeeMap[id].completed += 1;
        });

        const employeeWorkload = Object.values(employeeMap).sort((a, b) => b.total - a.total);

        res.json({
            success: true,
            data: {
                year,
                month,
                totalBookings,
                completedCount,
                noShowCount,
                pendingCount,
                attendanceRate,
                topServices,
                employeeWorkload
            }
        });

    } catch (error) {
        console.error("Hiba a statisztika lekérésekor:", error);
        res.status(500).json({ success: false, message: "Hiba történt a statisztikák kalkulációjakor." });
    }
});

// backend/routes/adminRoutes.js
router.get('/calendar-events', verifyAdmin, async (req, res) => {
    const { employeeId } = req.query;

    try {
        // Feltétel: ha kiválasztott egy konkrét dolgozót, csak az övét kérjük le, egyébként az összesét
        const whereClause = {};
        if (employeeId && employeeId !== 'all') {
            whereClause.alkalmazott_id = parseInt(employeeId);
        }

        // 1. Foglalások lekérése
        const bookings = await prisma.foglalasok.findMany({
            where: whereClause,
            include: {
                vendeg: { select: { vezeteknev: true, keresztnev: true, telefon: true, email: true } },
                szolgaltatas: true,
                alkalmazott: { select: { felhasznalo_id: true, vezeteknev: true, keresztnev: true } },
                statusz: true
            }
        });

        // 2. Szabadságok lekérése
        const vacations = await prisma.szabadsagok.findMany({
            where: whereClause,
            include: {
                alkalmazott: { select: { felhasznalo_id: true, vezeteknev: true, keresztnev: true } }
            }
        });

        // Események formázása a FullCalendarhoz
        const events = [
            ...bookings.map(b => ({
                id: `booking-${b.foglalas_id}`,
                title: `[${b.alkalmazott.keresztnev}] ${b.vendeg.vezeteknev} ${b.vendeg.keresztnev} - ${b.szolgaltatas.szolgaltatas_neve}`,
                start: b.kezdo_idopont,
                end: b.veg_idopont,
                backgroundColor: '#4F4646',
                borderColor: '#4F4646',
                textColor: '#FEF9F9',
                extendedProps: {
                    type: 'booking',
                    employeeName: `${b.alkalmazott.vezeteknev} ${b.alkalmazott.keresztnev}`,
                    guestName: `${b.vendeg.vezeteknev} ${b.vendeg.keresztnev}`,
                    guestPhone: b.vendeg.telefon || 'Nincs megadva',
                    serviceName: b.szolgaltatas.szolgaltatas_neve,
                    price: b.szolgaltatas.ar,
                    status: b.statusz.statusz_neve
                }
            })),
            ...vacations.map(v => ({
                id: `vacation-${v.szabadsag_id}`,
                title: `TÁVOLLÉT: ${v.alkalmazott.keresztnev} (${v.megjegyzes || 'Szabadság'})`,
                start: v.kezdo_datum,
                end: v.veg_datum,
                backgroundColor: '#F0B4B4',
                borderColor: '#4F4646',
                textColor: '#4F4646',
                extendedProps: {
                    type: 'vacation',
                    employeeName: `${v.alkalmazott.vezeteknev} ${v.alkalmazott.keresztnev}`,
                    note: v.megjegyzes || 'Szabadság'
                }
            }))
        ];

        res.json({ success: true, data: events });
    } catch (error) {
        console.error("Admin naptár lekérési hiba:", error);
        res.status(500).json({ success: false, message: "Hiba az események betöltésekor." });
    }
});

module.exports = router;