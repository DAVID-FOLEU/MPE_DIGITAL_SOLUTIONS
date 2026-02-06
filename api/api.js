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

// --- MIDDLEWARE D'AUTHENTIFICATION ---
// Ce middleware extrait l'ID de l'utilisateur depuis le cookie 'token'
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Lecture du cookie

    if (!token) {
        return res.status(401).json({ error: "Veuillez vous connecter pour envoyer un devis." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Session expirée, reconnectez-vous." });
        req.user = user; // Contient l'ID, le rôle, etc.
        next();
    });
};


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

    connection.query("DROP TABLE IF EXISTS users", (err) => {
        if (err) console.error("❌ Erreur lors de la suppression :", err.message);
        else console.log("🗑️ Table 'users' supprimée avec succès. Elle va être recréée proprement.");
    });

    const sqlTable = `
    CREATE TABLE IF NOT EXISTS devis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference_unique VARCHAR(50) UNIQUE NOT NULL,
        
        -- IDs de liaison
        user_id INT NULL,      -- Le client (provenant de la table users)
        agent_id INT NULL,     -- L'agent (provenant aussi de la table users)
        
        -- Infos Client (pour historique si le profil user change)
        client_nom VARCHAR(100) NOT NULL,
        client_email VARCHAR(100) NOT NULL,
        entreprise VARCHAR(100),
        telephone VARCHAR(25),
        projet_description TEXT NOT NULL,
        date_demarrage DATE,
        duree_estimee VARCHAR(50),
        type_service VARCHAR(50),
        perimetre VARCHAR(50),
        references_exemples TEXT,
        
        -- Options et Fichiers
        mobile_ready BOOLEAN DEFAULT TRUE,
        couleurs_logo BOOLEAN DEFAULT TRUE,
        fichiers_joints JSON, 
    
        -- Suivi
        statut ENUM('en attente', 'payer', 'signé') DEFAULT 'en attente',
        derniere_modif_par VARCHAR(100),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
        -- Déclaration des relations
        CONSTRAINT fk_client FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
    );
`;

    connection.query(sqlTable, (errQuery) => {
        connection.release();
        if (errQuery) console.error("❌ Erreur Table :", errQuery.message);
        else console.log("✅ Table 'users' et 'devis' prêtent.");
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
                { id: user.id,
                 firstname: user.firstname,
                 lastname: user.lastname,
                 role: user.role },
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
                id: user.id,
                role: user.role,
                firstname: user.firstname, 
                lastname: user.lastname 
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

// route pour devis

app.post('/api/devis', async (req, res) => {
    try {
        const data = req.body;
        const userId = data.userId; 

        if (!userId) {
            return res.status(400).json({ success: false, message: "ID utilisateur manquant" });
        }

        const ref = `DEV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const sql = `
            INSERT INTO devis (
                reference_unique, user_id, client_nom, client_email, entreprise, 
                telephone, projet_description, date_demarrage, duree_estimee, 
                type_service, perimetre, references_exemples, mobile_ready, 
                couleurs_logo, statut, derniere_modif_par
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en attente', 'Client')
        `;

        const values = [
            ref, userId, data.nom, data.email, data.entreprise, 
            data.tel, data.description, data.date_debut, data.duree, 
            data.service, data.perimetre, data.liens, 
            data.mobile_ready ? 1 : 0, data.logo_colors ? 1 : 0
        ];

        await db.execute(sql, values);
        res.status(201).json({ success: true, reference: ref });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



app.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Déconnecté" });
});

module.exports = app;