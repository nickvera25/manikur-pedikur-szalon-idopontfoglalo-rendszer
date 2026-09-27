const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/employees', async (req, res) => {
    try {
        const employeeRole = await prisma.szerepkorok.findFirst({ where: { szerepkor_nev: 'Alkalmazott' } });
        if (!employeeRole) return res.json({ success: true, data: [] });

        const employees = await prisma.felhasznalok.findMany({
            where: {
                szerepkorok: { some: { szerepkor_id: employeeRole.szerepkor_id } }
            },
            include: {
                szolgaltatasok: { include: { szolgaltatas: true } }
            }
        });
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, message: "Szerverhiba történt." });
    }
});

router.post('/employees', async (req, res) => {
    const { vezeteknev, keresztnev, email, telefonszam, szolgaltatas_id_lista } = req.body;
    if (!vezeteknev || !keresztnev || !email) return res.status(400).json({ success: false, message: "Név és email megadása kötelező!" });

    try {
        const existingUser = await prisma.felhasznalok.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ success: false, message: "Ez az email cím már foglalt!" });

        const rawPassword = `${vezeteknev}${keresztnev}2026`;
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newEmployee = await prisma.felhasznalok.create({
            data: {
                vezeteknev, keresztnev, email,
                telefon: telefonszam || null,
                jelszo: hashedPassword,
                jelszo_modositas_szukseges: true
            }
        });

        const employeeRole = await prisma.szerepkorok.findFirst({ where: { szerepkor_nev: 'Alkalmazott' } });
        await prisma.felhasznalo_szerepkor.create({
            data: { felhasznalo_id: newEmployee.felhasznalo_id, szerepkor_id: employeeRole.szerepkor_id }
        });

        if (szolgaltatas_id_lista && szolgaltatas_id_lista.length > 0) {
            const szolgaltatasokData = szolgaltatas_id_lista.map(sz_id => ({
                alkalmazott_id: newEmployee.felhasznalo_id,
                szolgaltatas_id: parseInt(sz_id)
            }));
            await prisma.alkalmazott_szolgaltatasok.createMany({ data: szolgaltatasokData });
        }

        res.json({ success: true, message: "Alkalmazott sikeresen létrehozva!", defaultPassword: rawPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba történt a mentés során." });
    }
});

// ÚJ: ALKALMAZOTT MÓDOSÍTÁSA
router.put('/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { vezeteknev, keresztnev, email, telefonszam, szolgaltatas_id_lista } = req.body;

    try {
        // Alapadatok frissítése
        await prisma.felhasznalok.update({
            where: { felhasznalo_id: parseInt(id) },
            data: { vezeteknev, keresztnev, email, telefon: telefonszam || null }
        });

        // Szolgáltatások törlése, majd újra felvitele
        await prisma.alkalmazott_szolgaltatasok.deleteMany({
            where: { alkalmazott_id: parseInt(id) }
        });

        if (szolgaltatas_id_lista && szolgaltatas_id_lista.length > 0) {
            const szolgaltatasokData = szolgaltatas_id_lista.map(sz_id => ({
                alkalmazott_id: parseInt(id),
                szolgaltatas_id: parseInt(sz_id)
            }));
            await prisma.alkalmazott_szolgaltatasok.createMany({ data: szolgaltatasokData });
        }
        res.json({ success: true, message: "Alkalmazott sikeresen frissítve!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba módosításkor" });
    }
});

// 4. ALKALMAZOTT TÖRLÉSE (Védett logika)
router.delete('/employees/:id', async (req, res) => {
    const { id } = req.params;
    const empId = parseInt(id);

    try {
        // 1. Ellenőrizzük, tartozik-e hozzá foglalás
        const bookingsCount = await prisma.foglalasok.count({
            where: { alkalmazott_id: empId }
        });

        if (bookingsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Az alkalmazott nem törölhető, mert még ${bookingsCount} darab foglalás kapcsolódik hozzá!`
            });
        }

        // 2. Kapcsolódó relációk törlése az adatbázis kényszerek miatt
        await prisma.alkalmazott_szolgaltatasok.deleteMany({ where: { alkalmazott_id: empId } });
        await prisma.felhasznalo_szerepkor.deleteMany({ where: { felhasznalo_id: empId } });
        await prisma.munkarend.deleteMany({ where: { alkalmazott_id: empId } });
        await prisma.szabadsagok.deleteMany({ where: { alkalmazott_id: empId } });

        // 3. Felhasználó törlése
        await prisma.felhasznalok.delete({
            where: { felhasznalo_id: empId }
        });

        res.json({ success: true, message: "Alkalmazott sikeresen törölve!" });
    } catch (error) {
        console.error("Hiba alkalmazott törlésekor:", error);
        res.status(500).json({ success: false, message: "Hiba történt a törlés során." });
    }
});

module.exports = router;