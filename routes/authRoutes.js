const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- 1. ITT LEGYEN A VÉDŐ MIDDLEWARE (A FÁJL ELEJÉN!) ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.json({ success: false, message: "Nincs bejelentkezve!" });
    
    const token = authHeader.split(" ")[1]; 
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.json({ success: false, message: "Érvénytelen vagy lejárt token!" });
        req.user = decoded; 
        next();
    });
};

// Regisztrációs végpont
router.post('/register', async (req, res) => {
    const { vezeteknev, keresztnev, telefon, email, jelszo } = req.body;

    try {
        const letezoFelhasznalo = await prisma.felhasznalok.findUnique({
            where: { email: email }
        });

        if (letezoFelhasznalo) {
            return res.json({ success: false, message: "Ezzel az e-mail címmel már regisztráltak!" });
        }

        const titkositottJelszo = await bcrypt.hash(jelszo, 10);

        const vendegSzerep = await prisma.szerepkorok.findFirst({
            where: { szerepkor_nev: 'Vendég' }
        });

        await prisma.felhasznalok.create({
            data: {
                vezeteknev: vezeteknev,
                keresztnev: keresztnev,
                telefon: telefon,
                email: email,
                jelszo: titkositottJelszo,
                szerepkorok: {
                    create: {
                        szerepkor: {
                            connect: {
                                szerepkor_id: vendegSzerep.szerepkor_id
                            }
                        }
                    }
                }
            }
        });

        res.json({ success: true, message: "Sikeres regisztráció!" });

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ success: false, message: "Hiba történt a szerveren." });
    }
});

// Bejelentkezési végpont
router.post('/login', async (req, res) => {
    const { email, jelszo } = req.body;

    try {
        const felhasznalo = await prisma.felhasznalok.findUnique({
            where: { email: email },
            include: {
                szerepkorok: {
                    include: {
                        szerepkor: true
                    }
                }
            }
        });

        if (!felhasznalo) {
            return res.json({ success: false, message: "Hibás e-mail cím vagy jelszó!" });
        }

        const jelszoJo = await bcrypt.compare(jelszo, felhasznalo.jelszo);
        if (!jelszoJo) {
            return res.json({ success: false, message: "Hibás e-mail cím vagy jelszó!" });
        }

        const token = jwt.sign(
            { id: felhasznalo.felhasznalo_id, email: felhasznalo.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        const felhasznaloSzerepe = felhasznalo.szerepkorok[0].szerepkor.szerepkor_nev;

        res.json({
            success: true,
            message: "Sikeres bejelentkezés!",
            token: token,
            user: {
                vezeteknev: felhasznalo.vezeteknev,
                keresztnev: felhasznalo.keresztnev,
                szerep: felhasznaloSzerepe,
                jelszo_modositas_szukseges: felhasznalo.jelszo_modositas_szukseges
            }
        });

    } catch (error) {
        console.error("Bejelentkezési hiba:", error);
        res.status(500).json({ success: false, message: "Hiba történt a szerveren." });
    }
});

// Kényszerített jelszóváltoztatás végpont
router.post('/force-password-change', verifyToken, async (req, res) => {
    const userId = req.user.id || req.user.felhasznalo_id; 
    const { ujJelszo } = req.body;

    if (!ujJelszo || ujJelszo.length < 6) {
        return res.status(400).json({ success: false, message: "A jelszónak legalább 6 karakter hosszúnak kell lennie!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(ujJelszo, 10);

        await prisma.felhasznalok.update({
            where: { felhasznalo_id: userId },
            data: {
                jelszo: hashedPassword,
                jelszo_modositas_szukseges: false
            }
        });

        res.json({ success: true, message: "Jelszó sikeresen frissítve!" });
    } catch (error) {
        console.error("Hiba jelszócserénél:", error);
        res.status(500).json({ success: false, message: "Szerverhiba történt." });
    }
});

// --- PROFIL KEZELÉSI VÉGPONTOK ---

// 1. A bejelentkezett felhasználó adatainak lekérése
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const felhasznalo = await prisma.felhasznalok.findUnique({
            where: { felhasznalo_id: req.user.id }
        });
        delete felhasznalo.jelszo; 
        res.json({ success: true, user: felhasznalo });
    } catch (error) {
        res.json({ success: false, message: "Hiba az adatok lekérésekor." });
    }
});

// 2. Személyes adatok frissítése
router.put('/profile/update', verifyToken, async (req, res) => {
    const { vezeteknev, keresztnev, telefon, email } = req.body;
    try {
        await prisma.felhasznalok.update({
            where: { felhasznalo_id: req.user.id },
            data: { vezeteknev, keresztnev, telefon, email }
        });
        res.json({ success: true, message: "Személyes adatok sikeresen frissítve!" });
    } catch (error) {
        res.json({ success: false, message: "Hiba a frissítés során." });
    }
});

// 3. Jelszó módosítása
router.put('/profile/password', verifyToken, async (req, res) => {
    const { regiJelszo, ujJelszo } = req.body;

    if (regiJelszo === ujJelszo) {
        return res.json({ success: false, message: "Az új jelszó nem lehet ugyanaz, mint a jelenlegi!" });
    }

    try {
        const felhasznalo = await prisma.felhasznalok.findUnique({ where: { felhasznalo_id: req.user.id } });
        const jelszoJo = await bcrypt.compare(regiJelszo, felhasznalo.jelszo);
        if (!jelszoJo) return res.json({ success: false, message: "A jelenlegi jelszó hibás!" });
        
        const titkositottJelszo = await bcrypt.hash(ujJelszo, 10);
        await prisma.felhasznalok.update({
            where: { felhasznalo_id: req.user.id },
            data: { jelszo: titkositottJelszo }
        });
        res.json({ success: true, message: "Jelszó sikeresen megváltoztatva!" });
    } catch (error) {
        res.json({ success: false, message: "Hiba a jelszó módosításakor." });
    }
});

// 4. Elfelejtett jelszó (Token generálás)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.felhasznalok.findUnique({ where: { email } });
        if (!user) return res.json({ success: false, message: "Ezzel az e-mail címmel nincs fiók regisztrálva!" });

        const resetToken = jwt.sign({ id: user.felhasznalo_id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        console.log("-----------------------------------------");
        console.log("JELSZÓ VISSZAÁLLÍTÓ LINK:", resetLink);
        console.log("-----------------------------------------");

        res.json({ success: true, message: "A visszaállító linket elküldtük az e-mail címedre!" });
    } catch (error) {
        res.json({ success: false, message: "Hiba történt a folyamat során." });
    }
});

// 5. Új jelszó mentése a token alapján
router.post('/reset-password', async (req, res) => {
    const { token, ujJelszo } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.felhasznalok.findUnique({ where: { felhasznalo_id: decoded.id } });
        
        const egyezik = await bcrypt.compare(ujJelszo, user.jelszo);
        if (egyezik) {
            return res.json({ success: false, message: "Az új jelszó nem lehet megegyező a régivel!" });
        }
        
        const titkositottJelszo = await bcrypt.hash(ujJelszo, 10);
        await prisma.felhasznalok.update({
            where: { felhasznalo_id: decoded.id },
            data: { jelszo: titkositottJelszo }
        });

        res.json({ success: true, message: "Jelszó sikeresen frissítve! Most már bejelentkezhetsz." });
    } catch (error) {
        res.json({ success: false, message: "A visszaállító link érvénytelen vagy lejárt!" });
    }
});

module.exports = router;