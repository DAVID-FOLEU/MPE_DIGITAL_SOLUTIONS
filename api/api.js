require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');

const app = express();

// --- CONFIGURATION ---
// Utilise la clé du .env ou une clé de secours
const JWT_SECRET = process.env.JWT_SECRET || "MPE_DIGITAL_SECRET_KEY_2024";
const googleClient = new OAuth2Client("429279358632-tkk225n2tvr20urefj74htdvjc3jaldn.apps.googleusercontent.com");

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// --- 1. CONFIGURATION DU POOL AIVEN ---
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectTimeout: 60000, // On passe à 60 secondes au lieu de 20
    waitForConnections: true,
    connectionLimit: 5,
    ssl: { rejectUnauthorized: false }
});

// Test et Création de table
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Erreur de connexion Aiven :", err.message);
        return;
    }
    console.log("✅ Connexion Aiven réussie !");

    // connection.query("DROP TABLE IF EXISTS users", (err) => {
    //     if (err) console.error("❌ Erreur lors de la suppression :", err.message);
    //     else console.log("🗑️ Table 'users' supprimée avec succès. Elle va être recréée proprement.");
    // });

    const sqlTable = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        profile_pic TEXT,
        role ENUM('user', 'admin', 'agent') DEFAULT 'user',
        otp_code VARCHAR(6),
        is_verified BOOLEAN DEFAULT false,
        is_online BOOLEAN DEFAULT false
    )`;

    connection.query(sqlTable, (errQuery) => {
        connection.release();
        if (errQuery) console.error("❌ Erreur Table :", errQuery.message);
        else console.log("✅ Table 'users' prête.");
    });
});

// --- 2. CONFIGURATION EMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- 3. ROUTE INSCRIPTION ---
app.post('/api/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Données manquantes" });

    const vCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sqlInsert = "INSERT INTO users (firstname, lastname, email, password, otp_code, role, is_online) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        pool.query(sqlInsert, [firstname, lastname, email, hashedPassword, vCode, 'user', false], (err, result) => {
            if (err) {
                console.error("❌ Erreur SQL Inscription:", err);
                return res.status(500).json({ error: "L'email existe déjà ou erreur serveur." });
            }

            const hour = new Date().getHours();
            const greeting = (hour >= 4 && hour < 13) ? "Bonjour" : "Bonsoir";

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Votre code de vérification',
                text: `${greeting} ${firstname}, voici votre code de verification : ${vCode}`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    return res.json({ message: "Utilisateur créé, mais erreur d'envoi d'email.", email: email });
                }
                res.json({ message: "Utilisateur créé, code envoyé !", email: email });
            });
        });
    } catch (e) {
        res.status(500).send("Erreur interne");
    }
});

// --- 4. ROUTE VÉRIFICATION (Correction 400 Bad Request) ---
app.post('/api/verify', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: "Email et code requis." });
    }

    pool.query("SELECT * FROM users WHERE email = ? AND otp_code = ?", [email, code], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: "Code incorrect ou expiré." });
        }

        const user = results[0];

        try {
            const token = jwt.sign(
                { id: user.id, firstname: user.firstname, lastname: user.lastname, role: user.role },
                JWT_SECRET,
                { algorithm: 'HS256', expiresIn: '24h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // Garder false pour localhost
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            pool.query("UPDATE users SET is_verified = TRUE, otp_code = NULL, is_online = TRUE WHERE id = ?", [user.id]);

            return res.json({ success: true, user: { firstname: user.firstname, role: user.role } });

        } catch (jwtErr) {
            return res.status(500).json({ error: "Erreur technique de session." });
        }
    });
});

// --- 5. AUTH GOOGLE ---
app.post('/api/auth/google', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "idToken manquant" });

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: "429279358632-tkk225n2tvr20urefj74htdvjc3jaldn.apps.googleusercontent.com"
        });
        const { email, given_name, family_name, picture } = ticket.getPayload();

        pool.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
            if (results && results.length > 0) {
                const user = results[0];
                const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
                res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 24 * 3600000 });
                return res.json({ success: true, user });
            } else {
                pool.query(
                    "INSERT INTO users (firstname, lastname, email, is_verified, profile_pic) VALUES (?, ?, ?, TRUE, ?)",
                    [given_name, family_name, email, picture],
                    (err, result) => {
                        const token = jwt.sign({ id: result.insertId, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
                        res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 24 * 3600000 });
                        res.json({ success: true, user: { firstname: given_name, email } });
                    }
                );
            }
        });
    } catch (error) {
        res.status(401).json({ error: "Authentification Google invalide" });
    }
});

// --- ROUTE CONNEXION ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs." });
    }

    // 1. Chercher l'utilisateur
    pool.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur serveur SQL" });

        if (results.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        const user = results[0];

        // 2. Vérifier si le compte est vérifié (OTP)
        if (!user.is_verified) {
            return res.status(403).json({ error: "Veuillez vérifier votre email avant de vous connecter." });
        }

        // 3. Comparer le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        // 4. Créer le Token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, firstname: user.firstname },
            process.env.JWT_SECRET || "MPE_DIGITAL_SECRET_KEY_2024",
            { expiresIn: '24h' }
        );

        // 5. Envoyer le cookie et la réponse
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // false pour localhost (Windows 7)
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Mettre l'utilisateur en ligne
        pool.query("UPDATE users SET is_online = TRUE WHERE id = ?", [user.id]);

        // res.json({ success: true, message: "Connexion réussie !" });
        // ✅ ON RENVOIE LES INFOS NÉCESSAIRES AU FRONTEND
        res.json({ 
            success: true,
            message: "Connexion réussie !", 
            user: { 
                firstname: user.firstname, 
                lastname: user.lastname, 
                // role: user.role 
            } 
        });
   
    });
});

// --- ROUTE MOT DE PASSE OUBLIÉ ---
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Vérifier si l'utilisateur existe
    pool.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err || results.length === 0) {
            // Pour la sécurité, on évite de dire si l'email existe ou pas
            return res.status(200).json({ message: "Si cet email existe, un code a été envoyé." });
        }

        // 2. Stocker le code temporairement dans la base
        pool.query("UPDATE users SET otp_code = ? WHERE email = ?", [resetCode, email], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Erreur serveur" });

            // 3. Envoyer l'email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Réinitialisation de votre mot de passe',
                text: `Votre code de réinitialisation est : ${resetCode}`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) return res.status(500).json({ error: "Erreur d'envoi mail" });
                res.json({ message: "Code envoyé !", email: email });
            });
        });
    });
});

// route pour mettre a jour le mot de passe

app.post('/api/update-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: "Données manquantes." });
    }

    try {
        // 1. Hacher le nouveau mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 2. Mettre à jour dans la base Aiven
        const sql = "UPDATE users SET password = ?, otp_code = NULL WHERE email = ?";
        
        pool.query(sql, [hashedPassword, email], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de la mise à jour." });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }

            res.json({ success: true, message: "Mot de passe actualisé." });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});


//route pour verifié que la personne est connecté

app.get('/api/me', (req, res) => {
    const token = req.cookies.token; // On récupère le badge dans le cookie

    if (!token) {
        return res.status(401).json({ loggedIn: false });
    }

    // On vérifie si le token est valide
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ loggedIn: false });
        }
        // Si tout est bon, on renvoie les infos
        res.json({ loggedIn: true, user: decoded });
    });
});

app.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Déconnecté" });
});

module.exports = app;