// backend/routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error("Csak képformátumok (JPG, PNG, WEBP) tölthetők fel!"));
    }
});

// Token ellenőrző middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: "Bejelentkezés szükséges!" });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'titokkulcs', (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Érvénytelen token." });
        req.user = user;
        next();
    });
};

// 1. PUBLIKUS: ÖSSZES KÉP LEKÉRÉSE (Bárki megtekintheti)
router.get('/gallery', async (req, res) => {
    try {
        const kepek = await prisma.galeria.findMany({
            include: {
                alkalmazott: {
                    select: { vezeteknev: true, keresztnev: true }
                }
            },
            orderBy: { kep_id: 'desc' }
        });
        res.json({ success: true, data: kepek });
    } catch (error) {
        console.error("Hiba a galéria betöltésekor:", error);
        res.status(500).json({ success: false, message: "Hiba a galéria lekérésekor." });
    }
});

// 2. ALKALMAZOTTI: KÉPFELTÖLTÉS
router.post('/gallery/upload', verifyToken, upload.single('kep'), async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;

    if (!req.file) {
        return res.status(400).json({ success: false, message: "Kérlek, válassz ki egy képet!" });
    }

    try {
        const kepUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        const ujKep = await prisma.galeria.create({
            data: {
                alkalmazott_id: empId,
                kep_url: kepUrl,
                leiras: req.body.leiras || null
            }
        });

        res.json({ success: true, message: "Kép sikeresen feltöltve a galériába!", data: ujKep });
    } catch (error) {
        console.error("Hiba a kép mentésekor:", error);
        res.status(500).json({ success: false, message: "Hiba történt a feltöltés során." });
    }
});

// 3. ALKALMAZOTTI: KÉP TÖRLÉSE
router.delete('/gallery/:id', verifyToken, async (req, res) => {
    const empId = req.user.id || req.user.felhasznalo_id;
    const kepId = parseInt(req.params.id);

    try {
        const kep = await prisma.galeria.findFirst({
            where: { kep_id: kepId, alkalmazott_id: empId }
        });

        if (!kep) {
            return res.status(404).json({ success: false, message: "A kép nem található vagy nincs jogosultságod törölni." });
        }

        // Törlés az adatbázisból
        await prisma.galeria.delete({ where: { kep_id: kepId } });

        // Fizikai fájl törlése a szerverről
        const fileName = path.basename(kep.kep_url);
        const filePath = path.join(uploadDir, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: "Kép sikeresen törölve a galériából!" });
    } catch (error) {
        console.error("Hiba a törlés során:", error);
        res.status(500).json({ success: false, message: "Hiba történt a törlés során." });
    }
});

module.exports = router;