// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const dayjs = require('dayjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('./services/emailService');

const app = express();
const port = process.env.PORT || 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- Útvonalak (Routes) ---
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api', bookingRoutes);

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api', employeeRoutes);

const adminEmployeesRoutes = require('./routes/adminEmployeesRoutes');
app.use('/api/admin', adminEmployeesRoutes);

const adminServicesRoutes = require('./routes/adminServicesRoutes');
app.use('/api/admin', adminServicesRoutes);

const galleryRoutes = require('./routes/galleryRoutes');
app.use('/api', galleryRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// --- 24 ÓRÁS EMLÉKEZTETŐ FÜGGVÉNY ---
async function sendDailyReminders() {
    try {
        const tomorrowStart = dayjs().add(1, 'day').startOf('day').toDate();
        const tomorrowEnd = dayjs().add(1, 'day').endOf('day').toDate();

        const bookings = await prisma.foglalasok.findMany({
            where: {
                kezdo_idopont: { gte: tomorrowStart, lte: tomorrowEnd }
            },
            include: {
                vendeg: true,
                szolgaltatas: true,
                alkalmazott: true
            }
        });

        console.log(`[CRON] ${bookings.length} db holnapi időpont ellenőrzése és emlékeztető küldése...`);

        for (const b of bookings) {
            if (b.vendeg && b.vendeg.email) {
                await emailService.sendReminder(b.vendeg.email, {
                    vendegNev: `${b.vendeg.vezeteknev} ${b.vendeg.keresztnev}`,
                    szolgaltatasNev: b.szolgaltatas.szolgaltatas_neve,
                    idopont: b.kezdo_idopont,
                    alkalmazottNev: `${b.alkalmazott.vezeteknev} ${b.alkalmazott.keresztnev}`
                }).catch(err => console.error("Hiba az emlékeztető levél küldésekor:", err));
            }
        }
        return bookings.length;
    } catch (err) {
        console.error("[CRON HIBA] Nem sikerült leküldeni az emlékeztetőket:", err);
        throw err;
    }
}

// 1. ÉLES IDŐZÍTŐ: Minden reggel 08:00-kor lefut a másnapi időpontokra
cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Reggeli 08:00-as automatikus emlékeztető futtatása...');
    await sendDailyReminders();
});

// 2. KÉZI TESZT VÉGPONT: Azonnal lefutatja a küldést várakozás nélkül
app.get('/api/test-reminder', async (req, res) => {
    try {
        const count = await sendDailyReminders();
        res.json({ success: true, message: `Sikeres teszt! ${count} db holnapi emlékeztető kiküldve.` });
    } catch (err) {
        res.status(500).json({ success: false, message: "Hiba az emlékeztetők küldésekor." });
    }
});

// Szerver indítása
app.listen(port, () => {
    console.log(`A szerver fut a http://localhost:${port} címen`);
});