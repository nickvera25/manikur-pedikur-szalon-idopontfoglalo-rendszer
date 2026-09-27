// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Nodemailer beállítása (.env adatokkal)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Token ellenőrző middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "A művelethez be kell jelentkezned!" });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'titokkulcs', (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Érvénytelen munkamenet." });
        req.user = user;
        next();
    });
};

// 1. Kategóriák lekérése
router.get('/categories', async (req, res) => {
    try {
        const kategoriak = await prisma.kategoriak.findMany({ orderBy: { kategoria_neve: 'asc' } });
        res.json({ success: true, data: kategoriak });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba a kategóriák lekérésekor." });
    }
});

// 2. Szolgáltatások lekérése
router.get('/services/:categoryId', async (req, res) => {
    const catId = parseInt(req.params.categoryId);
    try {
        const szolgaltatasok = await prisma.szolgaltatasok.findMany({
            where: { kategoria_id: catId },
            orderBy: { szolgaltatas_neve: 'asc' }
        });
        res.json({ success: true, data: szolgaltatasok });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba a szolgáltatások lekérésekor." });
    }
});

// Nyilvános végpont: Az összes szolgáltatás lekérése a kategóriájával együtt a főoldalhoz
router.get('/all-services', async (req, res) => {
    try {
        const services = await prisma.szolgaltatasok.findMany({
            include: {
                kategoria: true
            },
            orderBy: {
                szolgaltatas_neve: 'asc'
            }
        });
        res.json({ success: true, data: services });
    } catch (error) {
        console.error("Hiba a szolgáltatások lekérésekor:", error);
        res.status(500).json({ success: false, message: "Nem sikerült betölteni a szolgáltatásokat." });
    }
});

// 3. Szakemberek lekérése
router.get('/professionals/:serviceId', async (req, res) => {
    const servId = parseInt(req.params.serviceId);
    try {
        const kapcsolatok = await prisma.alkalmazott_szolgaltatasok.findMany({
            where: { szolgaltatas_id: servId },
            include: { felhasznalo: true }
        });

        const szakemberek = kapcsolatok
            .filter(k => k.felhasznalo.aktiv)
            .map(k => ({
                felhasznalo_id: k.felhasznalo.felhasznalo_id,
                nev: `${k.felhasznalo.vezeteknev} ${k.felhasznalo.keresztnev}`
            }));

        res.json({ success: true, data: szakemberek });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba a szakemberek lekérésekor." });
    }
});

// 4. ELÉRHETŐ IDŐPONTOK KALKULÁLÁSA (Óra-alapú szabadság, munkarend és pontos státuszok)
router.get('/available-slots', async (req, res) => {
    const { employeeId, serviceId, date } = req.query;
    if (!employeeId || !serviceId || !date) {
        return res.status(400).json({ success: false, message: "Hiányzó paraméterek." });
    }

    try {
        const empId = parseInt(employeeId);
        const srvId = parseInt(serviceId);
        const targetDate = dayjs(date);

        // 1. Munkarend ellenőrzése
        const jsDay = targetDate.day();
        const aHetNapja = jsDay === 0 ? 7 : jsDay;

        const shift = await prisma.munkarend.findFirst({
            where: {
                alkalmazott_id: empId,
                OR: [{ a_het_napja: aHetNapja }, { a_het_napja: jsDay }]
            }
        });

        // Ha a munkarend szerint pihenőnap (pl. szombat/vasárnap) -> NINCS VÁRÓLISTA!
        if (!shift) {
            return res.json({ 
                success: true, 
                data: [], 
                status: 'NOT_WORKING', 
                message: "A szakember nem dolgozik ezen a napon." 
            });
        }

        // 2. Szolgáltatás adatai
        const service = await prisma.szolgaltatasok.findUnique({ where: { szolgaltatas_id: srvId } });
        if (!service) return res.status(404).json({ success: false, message: "A szolgáltatás nem található." });
        const durationMinutes = service.idotartam_perc;

        // 3. Munkaidő határok
        const openStr = new Date(shift.nyitas_ido).toISOString().substring(11, 16);
        const [openHour, openMinute] = openStr.split(':').map(Number);
        const startTotalMinutes = openHour * 60 + openMinute;

        const closeStr = new Date(shift.zaras_ido).toISOString().substring(11, 16);
        const [closeHour, closeMinute] = closeStr.split(':').map(Number);
        const endTotalMinutes = closeHour * 60 + closeMinute;

        const startOfDay = targetDate.startOf('day').toDate();
        const endOfDay = targetDate.endOf('day').toDate();

        // 4. Lekérjük az aznapi szabadságokat
        const vacationsToday = await prisma.szabadsagok.findMany({
            where: {
                alkalmazott_id: empId,
                kezdo_datum: { lt: endOfDay },
                veg_datum: { gt: startOfDay }
            }
        });

        // Ellenőrizzük: van-e olyan szabadság, ami a TELJES munkaidőt lefedi aznap?
        const shiftStartDateTime = targetDate.hour(openHour).minute(openMinute).second(0).millisecond(0);
        const shiftEndDateTime = targetDate.hour(closeHour).minute(closeMinute).second(0).millisecond(0);

        const isFullDayVacation = vacationsToday.some(v => 
            !dayjs(v.kezdo_datum).isAfter(shiftStartDateTime) && !dayjs(v.veg_datum).isBefore(shiftEndDateTime)
        );

        if (isFullDayVacation) {
            return res.json({ 
                success: true, 
                data: [], 
                status: 'ON_VACATION', 
                message: "A szakember ezen a napon egész nap szabadságon van." 
            });
        }

        // 5. Lekérjük az aznapi foglalásokat
        const existingBookings = await prisma.foglalasok.findMany({
            where: {
                alkalmazott_id: empId,
                kezdo_idopont: { gte: startOfDay, lte: endOfDay }
            }
        });

        // 6. Idősávok generálása
        const availableSlots = [];
        const step = 30;

        for (let current = startTotalMinutes; current + durationMinutes <= endTotalMinutes; current += step) {
            const slotStartHour = Math.floor(current / 60);
            const slotStartMinute = current % 60;

            const slotStartDate = targetDate.hour(slotStartHour).minute(slotStartMinute).second(0).millisecond(0);
            const slotEndDate = slotStartDate.add(durationMinutes, 'minute');

            const overlapsBooking = existingBookings.some(b => {
                const bStart = dayjs(b.kezdo_idopont);
                const bEnd = dayjs(b.veg_idopont);
                return slotStartDate.isBefore(bEnd) && slotEndDate.isAfter(bStart);
            });

            const overlapsVacation = vacationsToday.some(v => {
                const vStart = dayjs(v.kezdo_datum);
                const vEnd = dayjs(v.veg_datum);
                return slotStartDate.isBefore(vEnd) && slotEndDate.isAfter(vStart);
            });

            const isOverlap = overlapsBooking || overlapsVacation;
            const isPast = slotStartDate.isBefore(dayjs());

            if (!isOverlap && !isPast) {
                const formattedTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`;
                availableSlots.push(formattedTime);
            }
        }

        res.json({ 
            success: true, 
            data: availableSlots,
            status: availableSlots.length > 0 ? 'AVAILABLE' : 'FULLY_BOOKED',
            message: availableSlots.length === 0 ? "Erre a napra minden időpont betelt." : ""
        });

    } catch (error) {
        console.error("Hiba az időpontok kalkulációjakor:", error);
        res.status(500).json({ success: false, message: "Hiba az időpontok kalkulációjakor." });
    }
});

// 5. IDŐPONT LEFOGLALÁSA
router.post('/book', verifyToken, async (req, res) => {
    const vendegId = req.user.id || req.user.felhasznalo_id;
    const { alkalmazott_id, szolgaltatas_id, datum, ido, megjegyzes } = req.body;

    if (!alkalmazott_id || !szolgaltatas_id || !datum || !ido) {
        return res.status(400).json({ success: false, message: "Minden adat kitöltése kötelező!" });
    }

    try {
        const empId = parseInt(alkalmazott_id);
        const srvId = parseInt(szolgaltatas_id);

        const service = await prisma.szolgaltatasok.findUnique({ where: { szolgaltatas_id: srvId } });
        const employee = await prisma.felhasznalok.findUnique({ where: { felhasznalo_id: empId } });
        const guest = await prisma.felhasznalok.findUnique({ where: { felhasznalo_id: vendegId } });

        const [hours, minutes] = ido.split(':').map(Number);
        const kezdoIdopont = dayjs(datum).hour(hours).minute(minutes).second(0).millisecond(0).toDate();
        const vegIdopont = dayjs(kezdoIdopont).add(service.idotartam_perc, 'minute').toDate();

        let statusz = await prisma.foglalas_statuszok.findFirst({ where: { statusz_neve: 'Jóváhagyva' } });
        if (!statusz) statusz = await prisma.foglalas_statuszok.findFirst();

        const result = await prisma.$transaction(async (tx) => {
            const conflict = await tx.foglalasok.findFirst({
                where: {
                    alkalmazott_id: empId,
                    kezdo_idopont: { lt: vegIdopont },
                    veg_idopont: { gt: kezdoIdopont }
                }
            });

            if (conflict) {
                throw new Error("Sajnos ezt az időpontot épp most foglalta le valaki más!");
            }

            const ujFoglalas = await tx.foglalasok.create({
                data: {
                    vendeg_id: vendegId,
                    alkalmazott_id: empId,
                    szolgaltatas_id: srvId,
                    statusz_id: statusz ? statusz.statusz_id : 1,
                    kezdo_idopont: kezdoIdopont,
                    veg_idopont: vegIdopont,
                    megjegyzes: megjegyzes || null
                }
            });

            await tx.ertesitesek.create({
                data: {
                    felhasznalo_id: vendegId,
                    tipus: "Időpontfoglalás",
                    uzenet_szovege: `Sikeres időpontfoglalás: ${service.szolgaltatas_neve} (${datum} ${ido}).`
                }
            });

            return ujFoglalas;
        });

        // E-mail küldés vagy Terminálos szimuláció
        if (guest && guest.email) {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                transporter.sendMail({
                    from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
                    to: guest.email,
                    subject: 'Időpontfoglalás visszaigazolása',
                    html: `<p>Kedves ${guest.keresztnev}! Sikeresen lefoglaltad: ${service.szolgaltatas_neve} (${datum} ${ido}).</p>`
                }).catch(err => console.error("E-mail hiba:", err));
            } else {
                console.log("\n=======================================================");
                console.log("✉️  [SZIMULÁLT E-MAIL] - SIKERES IDŐPONTFOGLALÁS");
                console.log(`Címzett: ${guest.email} (${guest.vezeteknev} ${guest.keresztnev})`);
                console.log(`Tárgy:   Időpontfoglalás visszaigazolása`);
                console.log("-------------------------------------------------------");
                console.log(`Szolgáltatás: ${service.szolgaltatas_neve} (${service.ar} Ft)`);
                console.log(`Szakember:    ${employee.vezeteknev} ${employee.keresztnev}`);
                console.log(`Időpont:      ${datum} ${ido} (${service.idotartam_perc} perc)`);
                console.log("=======================================================\n");
            }
        }

        res.json({
            success: true,
            message: "Időpont sikeresen lefoglalva! Visszaigazolást rögzítettünk.",
            data: result
        });

    } catch (error) {
        console.error("Foglalási hiba:", error);
        res.status(400).json({ success: false, message: error.message || "Nem sikerült rögzíteni a foglalást." });
    }
});

// 6. A BEJELENTKEZETT VENDÉG FOGLALÁSAINAK LEKÉRÉSE (Közelgő)
router.get('/my-bookings/upcoming', verifyToken, async (req, res) => {
    const vendegId = req.user.id || req.user.felhasznalo_id;

    try {
        const bookings = await prisma.foglalasok.findMany({
            where: {
                vendeg_id: vendegId,
                kezdo_idopont: { gte: dayjs().toDate() }
            },
            include: {
                szolgaltatas: true,
                alkalmazott: {
                    select: { vezeteknev: true, keresztnev: true, telefon: true }
                },
                statusz: true
            },
            orderBy: { kezdo_idopont: 'asc' }
        });

        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("Hiba a közelgő foglalások lekérésekor:", error);
        res.status(500).json({ success: false, message: "Nem sikerült betölteni a közelgő foglalásokat." });
    }
});

// 6.B KORÁBBI FOGLALÁSOK (Előzmények)
router.get('/my-bookings/past', verifyToken, async (req, res) => {
    const vendegId = req.user.id || req.user.felhasznalo_id;

    try {
        const bookings = await prisma.foglalasok.findMany({
            where: {
                vendeg_id: vendegId,
                kezdo_idopont: { lt: dayjs().toDate() }
            },
            include: {
                szolgaltatas: true,
                alkalmazott: {
                    select: { vezeteknev: true, keresztnev: true }
                },
                statusz: true
            },
            orderBy: { kezdo_idopont: 'desc' }
        });

        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error("Hiba a korábbi foglalások lekérésekor:", error);
        res.status(500).json({ success: false, message: "Nem sikerült betölteni a korábbi foglalásokat." });
    }
});

// 7. FOGLALÁS LEMONDÁSA (24h szabály + Intelligens nap- és idősáv-szűrt Várólista értesítés)
router.delete('/cancel-booking/:id', verifyToken, async (req, res) => {
    const vendegId = req.user.id || req.user.felhasznalo_id;
    const bookingId = parseInt(req.params.id);

    try {
        const booking = await prisma.foglalasok.findFirst({
            where: { foglalas_id: bookingId, vendeg_id: vendegId },
            include: { 
                vendeg: true,
                szolgaltatas: true,
                alkalmazott: true
            }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "A foglalás nem található vagy nincs hozzá jogosultságod." });
        }

        const guest = booking.vendeg;

        // 1. HÁZIREND: 24 órán belüli lemondás blokkolása
        const now = dayjs();
        const bookingStart = dayjs(booking.kezdo_idopont);
        const hoursUntilBooking = bookingStart.diff(now, 'hour', true);

        if (hoursUntilBooking < 24) {
            return res.status(400).json({ 
                success: false, 
                message: "A házirend értelmében az időpontot a kezdés előtt kevesebb mint 24 órával már nem lehet lemondani!" 
            });
        }

        // 2. FOGLALÁS TÖRLÉSE
        await prisma.foglalasok.delete({
            where: { foglalas_id: bookingId }
        });

        await prisma.ertesitesek.create({
            data: {
                felhasznalo_id: vendegId,
                tipus: "Időpont lemondva",
                uzenet_szovege: `A(z) ${booking.szolgaltatas.szolgaltatas_neve} időpontodat (${bookingStart.format('YYYY-MM-DD HH:mm')}) sikeresen lemondtad.`
            }
        });

        // Lemondás visszajelzése
        if (guest && guest.email) {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                transporter.sendMail({
                    from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
                    to: guest.email,
                    subject: 'Időpont lemondás megerősítése',
                    html: `<p>Kedves ${guest.keresztnev}! Az időpontodat (${bookingStart.format('YYYY-MM-DD HH:mm')}) sikeresen töröltük.</p>`
                }).catch(err => console.error(err));
            } else {
                console.log("\n=======================================================");
                console.log("🗑️  [SZIMULÁLT E-MAIL] - IDŐPONT LEMONDVA");
                console.log(`Címzett: ${guest.email} (${guest.vezeteknev} ${guest.keresztnev})`);
                console.log(`Törölt szolgáltatás: ${booking.szolgaltatas.szolgaltatas_neve}`);
                console.log(`Időpont: ${bookingStart.format('YYYY. MM. DD. HH:mm')}`);
                console.log("=======================================================\n");
            }
        }

        // 3. VÁRÓLISTA AUTOMATIZÁLÁSA (Csak azonos nap és idősáv egyezés esetén értesít!)
        const cancelledDateStr = bookingStart.format('YYYY-MM-DD');
        const cancelledTimeStr = bookingStart.format('HH:mm');

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

        // Idősáv vizsgálata (ha nincs idosav_tol megadva, az egész nap megfelel neki)
        const eligibleUsers = waitlistedUsers.filter(w => {
            if (!w.idosav_tol || !w.idosav_ig) return true;
            return cancelledTimeStr >= w.idosav_tol && cancelledTimeStr < w.idosav_ig;
        });

        if (eligibleUsers.length > 0) {
            const emails = eligibleUsers.map(w => w.vendeg.email).filter(Boolean);

            if (emails.length > 0) {
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    transporter.sendMail({
                        from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
                        bcc: emails.join(','),
                        subject: 'Felszabadult időpont a szalonban!',
                        html: `
                            <p>Szia!</p>
                            <p>Felszabadult egy hely az alábbi szolgáltatásra: <strong>${booking.szolgaltatas.szolgaltatas_neve}</strong></p>
                            <p>Időpont: <strong>${cancelledDateStr} ${cancelledTimeStr}</strong></p>
                            <p>Szakember: <strong>${booking.alkalmazott.vezeteknev} ${booking.alkalmazott.keresztnev}</strong></p>
                        `
                    }).catch(err => console.error("Várólista e-mail hiba:", err));
                } else {
                    console.log("\n=======================================================");
                    console.log("📢  [SZIMULÁLT E-MAIL] - CÉLZOTT VÁRÓLISTA ÉRTESÍTŐ");
                    console.log(`Címzettek (BCC): ${emails.join(', ')}`);
                    console.log(`Tárgy:           Felszabadult neked megfelelő időpont!`);
                    console.log("-------------------------------------------------------");
                    console.log(`Megüresedett:    ${booking.szolgaltatas.szolgaltatas_neve}`);
                    console.log(`Időpont:         ${cancelledDateStr} ${cancelledTimeStr}`);
                    console.log(`Szakember:       ${booking.alkalmazott.vezeteknev} ${booking.alkalmazott.keresztnev}`);
                    console.log("=======================================================\n");
                }
            }
        }

        res.json({ success: true, message: "Időpont sikeresen lemondva!" });

    } catch (error) {
        console.error("Lemondási hiba:", error);
        res.status(500).json({ success: false, message: "Hiba történt a lemondás során." });
    }
});

// 8. FELIRATKOZÁS VÁRÓLISTÁRA (Dátummal, idősávval és terminálos naplózással)
router.post('/waitlist', verifyToken, async (req, res) => {
    const vendegId = req.user.id || req.user.felhasznalo_id;
    const { szolgaltatas_id, datum, idosav_tol, idosav_ig } = req.body;

    if (!szolgaltatas_id || !datum) {
        return res.status(400).json({ success: false, message: "Hiányzó adatok a feliratkozáshoz!" });
    }

    try {
        const srvId = parseInt(szolgaltatas_id);
        // Déli 12:00 UTC idővel rögzítjük, így az időzóna elcsúszás sosem viszi át az előző napra!
        const targetDate = new Date(`${datum}T12:00:00Z`);

        // Ellenőrizzük, hogy nincs-e már feliratkozva ugyanerre a napra és szolgáltatásra
        const letezo = await prisma.varolista.findFirst({
            where: {
                vendeg_id: vendegId,
                szolgaltatas_id: srvId,
                kivant_datum: {
                    gte: dayjs(datum).startOf('day').toDate(),
                    lte: dayjs(datum).endOf('day').toDate()
                }
            }
        });

        if (letezo) {
            return res.json({ 
                success: true, 
                message: `Már korábban feliratkoztál erre a napra (${datum})!` 
            });
        }

        const ujVarolista = await prisma.varolista.create({
            data: {
                vendeg_id: vendegId,
                szolgaltatas_id: srvId,
                kivant_datum: targetDate,
                idosav_tol: idosav_tol || null,
                idosav_ig: idosav_ig || null
            }
        });

        // TERMINÁLOS NAPLÓZÁS
        console.log("\n=======================================================");
        console.log("📋  [ÚJ VÁRÓLISTA FELIRATKOZÁS RÖGZÍTVE]");
        console.log(`Vendég ID:       ${vendegId}`);
        console.log(`Szolgáltatás ID: ${srvId}`);
        console.log(`Dátum:           ${datum}`);
        console.log(`Kért idősáv:     ${idosav_tol || '00:00'} - ${idosav_ig || '24:00'}`);
        console.log("=======================================================\n");

        res.json({ 
            success: true, 
            message: `Sikeresen feliratkoztál a várólistára (${datum} ${idosav_tol || '00:00'} - ${idosav_ig || '24:00'})!`,
            data: ujVarolista
        });
    } catch (error) {
        console.error("Várólista feliratkozási hiba:", error);
        res.status(500).json({ success: false, message: "Nem sikerült feliratkozni a várólistára." });
    }
});

module.exports = router;