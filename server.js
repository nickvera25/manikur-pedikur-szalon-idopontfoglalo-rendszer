// server.js
require('dotenv').config();
const cron = require('node-cron');
const dayjs = require('dayjs');
const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();
const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const port = process.env.PORT || 3000;

// Útvonalak (Routes)
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

// Nodemailer beállítása (ha van megadva .env, egyébként a terminálba naplóz)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Automatikus 24 órás emlékeztető ellenőrzés (óránként, a 0. percben)
cron.schedule('0 * * * *', async () => {
    console.log("⏰ Cron job indul: 24 órás emlékeztetők ellenőrzése...");

    try {
        const now = dayjs();
        const startTarget = now.add(24, 'hour').toDate();
        const endTarget = now.add(25, 'hour').toDate();

        const upcomingBookings = await prisma.foglalasok.findMany({
            where: {
                kezdo_idopont: {
                    gte: startTarget,
                    lt: endTarget
                }
            },
            include: {
                vendeg: true,
                szolgaltatas: true,
                alkalmazott: true
            }
        });

        for (const booking of upcomingBookings) {
            if (booking.vendeg && booking.vendeg.email) {
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    await transporter.sendMail({
                        from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
                        to: booking.vendeg.email,
                        subject: 'Emlékeztető: Holnap várunk a szalonban!',
                        html: `<p>Kedves ${booking.vendeg.keresztnev}! Holnap ${dayjs(booking.kezdo_idopont).format('HH:mm')}-kor várunk.</p>`
                    });
                } else {
                    console.log("\n⏰ =======================================================");
                    console.log("🔔  [SZIMULÁLT E-MAIL] - 24 ÓRÁS AUTOMATIKUS EMLÉKEZTETŐ");
                    console.log(`Címzett:  ${booking.vendeg.email} (${booking.vendeg.keresztnev})`);
                    console.log(`Időpont:  ${dayjs(booking.kezdo_idopont).format('YYYY. MM. DD. HH:mm')}`);
                    console.log(`Kezelő:   ${booking.alkalmazott.vezeteknev} ${booking.alkalmazott.keresztnev}`);
                    console.log("==========================================================\n");
                }
            }
        }
    } catch (error) {
        console.error("Hiba az emlékeztető cron job futtatásakor:", error);
    }
});

// Szerver indítása
app.listen(port, () => {
    console.log(`A szerver fut a http://localhost:${port} címen`);
});