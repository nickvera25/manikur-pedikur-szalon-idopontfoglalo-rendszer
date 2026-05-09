const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

        const ujFelhasznalo = await prisma.felhasznalok.create({
            data: {
                vezeteknev,
                keresztnev,
                telefon,
                email,
                jelszo: titkositottJelszo,
                szerepkorok: {
                    create: {
                        szerep: {
                            connect: { nev: 'vendeg' }
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
                        szerep: true
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

        const felhasznaloSzerepe = felhasznalo.szerepkorok[0].szerep.nev;

        res.json({
            success: true,
            message: "Sikeres bejelentkezés!",
            token: token,
            user: {
                vezeteknev: felhasznalo.vezeteknev,
                keresztnev: felhasznalo.keresztnev,
                szerep: felhasznaloSzerepe
            }
        });

    } catch (error) {
        console.error("Bejelentkezési hiba:", error);
        res.status(500).json({ success: false, message: "Hiba történt a szerveren." });
    }
});

module.exports = router;