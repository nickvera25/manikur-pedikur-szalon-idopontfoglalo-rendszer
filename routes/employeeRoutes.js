// backend/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');
const emailService = require('../services/emailService');

// Token ellenőrző middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "A funkcióhoz be kell jelentkezned!" });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'titokkulcs', (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Érvénytelen vagy lejárt token!" });
        req.user = user;
        next();
    });
};

// 1. BEJELENTKEZETT ALKALMAZOTT MUNKARENDJÉNEK LEKÉRÉSE
router.get('/munkarend', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;

    try {
        const munkarend = await prisma.munkarend.findMany({
            where: { alkalmazott_id: empId },
            orderBy: { a_het_napja: 'asc' }
        });

        res.json({ success: true, data: munkarend });
    } catch (error) {
        console.error("Hiba a munkarend lekérésekor:", error);
        res.status(500).json({ success: false, message: "Nem sikerült betölteni a munkarendet." });
    }
});

// 2. MUNKAREND MENTÉSE (A tokenből olvasott ID alapján!)
router.post('/munkarend', verifyToken, async (req, res) => {
    // A tokenből olvassuk ki, ki van bejelentkezve, nem bízunk a kliens body-ban!
    const empId = req.user.id || req.user.felhasznalo_id;
    const { hetiBeosztas } = req.body;

    if (!hetiBeosztas || !Array.isArray(hetiBeosztas)) {
        return res.status(400).json({ success: false, message: "Érvénytelen beosztás adatok!" });
    }

    try {
        // 1. Töröljük a dolgozó korábbi munkarendjét
        await prisma.munkarend.deleteMany({
            where: { alkalmazott_id: empId }
        });

        // 2. Kiszűrjük az aktív munkanapokat és formázzuk a Prisma számára
        const ujNapok = hetiBeosztas
            .filter(nap => nap.dolgozik)
            .map(nap => ({
                alkalmazott_id: empId,
                a_het_napja: nap.nap_id,
                nyitas_ido: new Date(`1970-01-01T${nap.tol}:00Z`),
                zaras_ido: new Date(`1970-01-01T${nap.ig}:00Z`)
            }));

        // 3. Mentés az adatbázisba
        if (ujNapok.length > 0) {
            await prisma.munkarend.createMany({ data: ujNapok });
        }

        res.json({ success: true, message: "Munkarend sikeresen elmentve!" });
    } catch (error) {
        console.error("Hiba a munkarend mentésekor:", error);
        res.status(500).json({ success: false, message: "Hiba történt a mentés során az adatbázisban." });
    }
});

// 3. TÁVOLLÉTEK / SZABADSÁGOK LEKÉRÉSE (A bejelentkezett alkalmazottnak)
router.get('/szabadsagok', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;

    try {
        const szabadsagok = await prisma.szabadsagok.findMany({
            where: { alkalmazott_id: empId },
            orderBy: { kezdo_datum: 'asc' }
        });
        res.json({ success: true, data: szabadsagok });
    } catch (error) {
        console.error("Hiba a szabadságok lekérésekor:", error);
        res.status(500).json({ success: false, message: "Nem sikerült betölteni a távolléteket." });
    }
});

// 4. ÚJ TÁVOLLÉT / SZABADSÁG FELVÉTELE + ÜTKÖZŐ FOGLALÁSOK AUTOMATIKUS TÖRLÉSE
router.post('/szabadsagok', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;
    const { kezdo_datum, veg_datum, megjegyzes } = req.body;

    if (!kezdo_datum || !veg_datum) {
        return res.status(400).json({ success: false, message: "A kezdő és végdátum megadása kötelező!" });
    }

    try {
        const start = new Date(kezdo_datum);
        const end = new Date(veg_datum);

        if (start >= end) {
            return res.status(400).json({ success: false, message: "A befejező időpontnak későbbinek kell lennie a kezdésnél!" });
        }

        // 1. Megkeressük az érintett meglévő foglalásokat
        const conflictingBookings = await prisma.foglalasok.findMany({
            where: {
                alkalmazott_id: empId,
                kezdo_idopont: { lt: end },
                veg_idopont: { gt: start }
            },
            include: {
                vendeg: true,
                szolgaltatas: true,
                alkalmazott: true
            }
        });

        // 2. Ha vannak ütköző időpontok, töröljük őket és értesítést küldünk
        for (const booking of conflictingBookings) {
            await prisma.foglalasok.delete({
                where: { foglalas_id: booking.foglalas_id }
            });

            // Belső értesítés rögzítése a vendég profiljába
            await prisma.ertesitesek.create({
                data: {
                    felhasznalo_id: booking.vendeg_id,
                    tipus: "Időpont törölve a szakember távolléte miatt",
                    uzenet_szovege: `Sajnálattal tájékoztatunk, hogy a(z) ${booking.szolgaltatas.szolgaltatas_neve} időpontod (${new Date(booking.kezdo_idopont).toLocaleString('hu-HU')}) a szakember váratlan távolléte/szabadsága miatt törlésre került.`
                }
            });

            // Éles lemondó e-mail küldése az ütköző vendégnek
            if (booking.vendeg && booking.vendeg.email) {
                emailService.sendCancellation(booking.vendeg.email, {
                    vendegNev: `${booking.vendeg.vezeteknev} ${booking.vendeg.keresztnev}`,
                    szolgaltatasNev: booking.szolgaltatas.szolgaltatas_neve,
                    idopont: booking.kezdo_idopont,
                    indok: `A szakember váratlan távolléte / szabadsága miatt (${megjegyzes || 'Szabadság'}). Kérjük, válassz másik időpontot!`
                }).catch(err => console.error("E-mail küldési hiba szabadság miatti törléskor:", err));
            }
        }

        // 3. Elmentjük magát a szabadságot
        const ujSzabadsag = await prisma.szabadsagok.create({
            data: {
                alkalmazott_id: empId,
                kezdo_datum: start,
                veg_datum: end,
                megjegyzes: megjegyzes || null
            }
        });

        let responseMessage = "Távollét sikeresen rögzítve!";
        if (conflictingBookings.length > 0) {
            responseMessage += ` Figyelem: ${conflictingBookings.length} db ütköző vendégfoglalás automatikusan törlésre került és a vendégek értesítést kaptak!`;
        }

        res.json({ success: true, message: responseMessage, data: ujSzabadsag });

    } catch (error) {
        console.error("Hiba a szabadság mentésekor:", error);
        res.status(500).json({ success: false, message: "Hiba történt a mentés során." });
    }
});

// 5. TÁVOLLÉT TÖRLÉSE (Ha mégis dolgozik)
router.delete('/szabadsagok/:id', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;
    const szabId = parseInt(req.params.id);

    try {
        await prisma.szabadsagok.deleteMany({
            where: {
                szabadsag_id: szabId,
                alkalmazott_id: empId
            }
        });
        res.json({ success: true, message: "Távollét sikeresen törölve, az idősáv újra elérhető a vendégeknek!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba a törlés során." });
    }
});

// 6. ALKALMAZOTTI NAPTÁR ESEMÉNYEINEK LEKÉRÉSE (Foglalások + Szabadságok)
router.get('/employee-calendar', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;

    try {
        // 1. Foglalások lekérése
        const bookings = await prisma.foglalasok.findMany({
            where: { alkalmazott_id: empId },
            include: {
                vendeg: { select: { vezeteknev: true, keresztnev: true, telefon: true, email: true } },
                szolgaltatas: true,
                statusz: true
            }
        });

        // 2. Szabadságok és távollétek lekérése
        const vacations = await prisma.szabadsagok.findMany({
            where: { alkalmazott_id: empId }
        });

        // Események formázása a FullCalendar számára
        const events = [
            ...bookings.map(b => ({
                id: `booking-${b.foglalas_id}`,
                bookingId: b.foglalas_id,
                title: `${b.vendeg.vezeteknev} ${b.vendeg.keresztnev} - ${b.szolgaltatas.szolgaltatas_neve}`,
                start: b.kezdo_idopont,
                end: b.veg_idopont,
                backgroundColor: '#4F4646',
                borderColor: '#4F4646',
                textColor: '#FEF9F9',
                extendedProps: {
                    type: 'booking',
                    guestName: `${b.vendeg.vezeteknev} ${b.vendeg.keresztnev}`,
                    guestPhone: b.vendeg.telefon || 'Nincs megadva',
                    guestEmail: b.vendeg.email,
                    serviceName: b.szolgaltatas.szolgaltatas_neve,
                    price: b.szolgaltatas.ar,
                    duration: b.szolgaltatas.idotartam_perc,
                    note: b.megjegyzes || 'Nincs megjegyzés'
                }
            })),
            ...vacations.map(v => ({
                id: `vacation-${v.szabadsag_id}`,
                title: `TÁVOLLÉT: ${v.megjegyzes || 'Szabadság'}`,
                start: v.kezdo_datum,
                end: v.veg_datum,
                backgroundColor: '#F0B4B4',
                borderColor: '#4F4646',
                textColor: '#4F4646',
                extendedProps: {
                    type: 'vacation',
                    note: v.megjegyzes || 'Szabadság / Távollét'
                }
            }))
        ];

        res.json({ success: true, data: events });
    } catch (error) {
        console.error("Hiba a naptár betöltésekor:", error);
        res.status(500).json({ success: false, message: "Nem sikerült betölteni a naptárat." });
    }
});

// 7. ALKALMAZOTTI IDŐPONT LEMONDÁS (Vendég értesítésével)
// 7. ALKALMAZOTTI IDŐPONT LEMONDÁS (Vendég értesítésével + VÁRÓLISTA AUTOMATIZÁLÁSSAL)
router.delete('/cancel-appointment/:id', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;
    const bookingId = parseInt(req.params.id);

    try {
        // 1. Lekérjük a törlendő foglalás adatait
        const booking = await prisma.foglalasok.findFirst({
            where: { foglalas_id: bookingId, alkalmazott_id: empId },
            include: { vendeg: true, szolgaltatas: true, alkalmazott: true }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "A foglalás nem található." });
        }

        const guest = booking.vendeg;
        const bookingStart = dayjs(booking.kezdo_idopont);
        const cancelledDateStr = bookingStart.format('YYYY-MM-DD');
        const cancelledTimeStr = bookingStart.format('HH:mm');

        // 2. Töröljük a foglalást az adatbázisból
        await prisma.foglalasok.delete({
            where: { foglalas_id: bookingId }
        });

        // 3. Belső értesítés a lemondott vendég profiljába
        await prisma.ertesitesek.create({
            data: {
                felhasznalo_id: booking.vendeg_id,
                tipus: "Időpont törölve a szolgáltató által",
                uzenet_szovege: `A(z) ${bookingStart.format('YYYY.MM.DD. HH:mm')} időpontra lefoglalt ${booking.szolgaltatas.szolgaltatas_neve} kezelésedet a szakember lemondta.`
            }
        });

        // 4. Éles e-mail a lemondott vendégnek
        if (guest && guest.email) {
            emailService.sendCancellation(guest.email, {
                vendegNev: `${guest.vezeteknev} ${guest.keresztnev}`,
                szolgaltatasNev: booking.szolgaltatas.szolgaltatas_neve,
                idopont: booking.kezdo_idopont,
                indok: `A kezelést a szakember (${booking.alkalmazott.vezeteknev} ${booking.alkalmazott.keresztnev}) váratlan akadályoztatás miatt lemondta. Kérjük, foglalj új időpontot a weboldalon!`
            }).catch(err => console.error("E-mail hiba alkalmazotti lemondáskor:", err));
        }

        // 5. VÁRÓLISTA ELLENŐRZÉSE ÉS AUTOMATIKUS KIKÜLDÉSE
        const waitlistedUsers = await prisma.varolista.findMany({
            where: {
                szolgaltatas_id: booking.szolgaltatas_id,
                kivant_datum: {
                    gte: bookingStart.startOf('day').toDate(),
                    lte: bookingStart.endOf('day').toDate()
                }
            },
            include: { vendeg: true }
        });

        // Idősáv szűrése: csak annak küldünk, akinek az idősávjába beleesik a felszabadult időpont (pl. 11:00 beleesik a 08:00-12:00-ba)
        const eligibleUsers = waitlistedUsers.filter(w => {
            // Kizárjuk magát a lemondott vendéget (ha véletlen ő is rajta lett volna)
            if (w.vendeg_id === booking.vendeg_id) return false;

            // Ha nincs idősáv megadva, az egész nap jó neki
            if (!w.idosav_tol || !w.idosav_ig) return true;

            // Ellenőrizzük, hogy a felszabadult kezdőidőpont (pl. 11:00) a kért sávban van-e (08:00 <= 11:00 < 12:00)
            return cancelledTimeStr >= w.idosav_tol && cancelledTimeStr < w.idosav_ig;
        });

        // Kiküldjük az értesítő e-maileket a jogosult várólistásoknak
        for (const item of eligibleUsers) {
            if (item.vendeg && item.vendeg.email) {
                emailService.sendWaitlistNotification(item.vendeg.email, {
                    datum: booking.kezdo_idopont,
                    szolgaltatasNev: booking.szolgaltatas.szolgaltatas_neve
                }).catch(err => console.error("Várólista e-mail hiba:", err));
            }
        }

        res.json({ 
            success: true, 
            message: `Időpont sikeresen törölve! A vendéget értesítettük, és ${eligibleUsers.length} db várólistás kapott értesítést a megüresedett helyről.` 
        });

    } catch (error) {
        console.error("Hiba az időpont törlésekor:", error);
        res.status(500).json({ success: false, message: "Hiba az időpont törlésekor." });
    }
});

// MAI BEOSZTÁS LEKÉRÉSE AZ ALKALMAZOTTI KEZDŐOLDALHOZ
router.get('/today-schedule', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;

    try {
        const todayStart = dayjs().startOf('day').toDate();
        const todayEnd = dayjs().endOf('day').toDate();

        const todayBookings = await prisma.foglalasok.findMany({
            where: {
                alkalmazott_id: empId,
                kezdo_idopont: {
                    gte: todayStart,
                    lte: todayEnd
                }
            },
            include: {
                vendeg: { select: { vezeteknev: true, keresztnev: true, telefon: true } },
                szolgaltatas: true,
                statusz: true
            },
            orderBy: { kezdo_idopont: 'asc' }
        });

        res.json({ success: true, data: todayBookings });
    } catch (error) {
        console.error("Hiba a mai beosztás lekérésekor:", error);
        res.status(500).json({ success: false, message: "Hiba a mai beosztás lekérésekor." });
    }
});

// KEZELÉS STÁTUSZÁNAK FRISSÍTÉSE (Jóváhagyva / Teljesítve / Lemondva)
router.put('/update-appointment-status/:id', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;
    const bookingId = parseInt(req.params.id);
    const { statusz_neve } = req.body;

    // Csak a te 3 adatbázis-státuszodat engedjük
    const engedelyezett = ['Jóváhagyva', 'Teljesítve', 'Lemondva'];
    if (!engedelyezett.includes(statusz_neve)) {
        return res.status(400).json({ success: false, message: "Érvénytelen státusz!" });
    }

    try {
        const booking = await prisma.foglalasok.findFirst({
            where: { foglalas_id: bookingId, alkalmazott_id: empId }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "A foglalás nem található." });
        }

        // Megkeressük az adott nevű státusz ID-jét
        const statuszRekord = await prisma.foglalas_statuszok.findFirst({
            where: { statusz_neve: statusz_neve }
        });

        if (!statuszRekord) {
            return res.status(400).json({ success: false, message: "A státusz nem található az adatbázisban." });
        }

        await prisma.foglalasok.update({
            where: { foglalas_id: bookingId },
            data: { statusz_id: statuszRekord.statusz_id }
        });

        res.json({ success: true, message: `Státusz frissítve: ${statusz_neve}` });
    } catch (error) {
        console.error("Hiba a státusz módosításakor:", error);
        res.status(500).json({ success: false, message: "Nem sikerült módosítani a státuszt." });
    }
});

module.exports = router;