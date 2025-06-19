const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do banco de dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Rotas de autenticação
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Verificar se o usuário já existe
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Usuário já existe' });
            }
            
            // Hash da senha
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Inserir usuário
            db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role || 'user'],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Erro ao criar usuário' });
                    }
                    
                    res.status(201).json({ 
                        message: 'Usuário criado com sucesso',
                        userId: result.insertId 
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ error: 'Credenciais inválidas' });
            }
            
            const user = results[0];
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword) {
                return res.status(400).json({ error: 'Credenciais inválidas' });
            }
            
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                message: 'Login realizado com sucesso',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rotas protegidas
app.get('/api/profile', authenticateToken, (req, res) => {
    db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json(results[0]);
    });
});

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API da Adrenaline funcionando!' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;



// Middleware para verificar role do usuário
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        next();
    };
};

// ==================== ROTAS DO ADMINISTRADOR ====================

// Listar todos os usuários
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), (req, res) => {
    db.query('SELECT id, name, email, role FROM users ORDER BY name', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Criar funcionário
app.post('/api/admin/employees', authenticateToken, requireRole(['admin']), (req, res) => {
    const { user_id, function: userFunction } = req.body;
    
    db.query(
        'INSERT INTO employees (user_id, function) VALUES (?, ?)',
        [user_id, userFunction],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao criar funcionário' });
            }
            res.status(201).json({ 
                message: 'Funcionário criado com sucesso',
                employeeId: result.insertId 
            });
        }
    );
});

// Listar funcionários
app.get('/api/admin/employees', authenticateToken, requireRole(['admin']), (req, res) => {
    db.query(`
        SELECT e.id, e.function, u.name, u.email, u.role 
        FROM employees e 
        JOIN users u ON e.user_id = u.id 
        ORDER BY u.name
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Atualizar usuário
app.put('/api/admin/users/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    db.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao atualizar usuário' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json({ message: 'Usuário atualizado com sucesso' });
        }
    );
});

// Deletar usuário
app.delete('/api/admin/users/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário deletado com sucesso' });
    });
});

// ==================== ROTAS DO PERSONAL TRAINER ====================

// Listar clientes do personal trainer
app.get('/api/personal/clients', authenticateToken, requireRole(['personal']), (req, res) => {
    db.query(`
        SELECT DISTINCT u.id, u.name, u.email 
        FROM users u 
        JOIN training_plans tp ON u.id = tp.user_id 
        JOIN employees e ON tp.personal_trainer_id = e.id 
        WHERE e.user_id = ? AND u.role = 'user'
        ORDER BY u.name
    `, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Criar plano de treino
app.post('/api/personal/training-plans', authenticateToken, requireRole(['personal']), (req, res) => {
    const { user_id, plan_details, start_date, end_date } = req.body;
    
    // Primeiro, buscar o ID do funcionário baseado no user_id
    db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id], (err, employeeResults) => {
        if (err || employeeResults.length === 0) {
            return res.status(500).json({ error: 'Erro ao encontrar personal trainer' });
        }
        
        const personalTrainerId = employeeResults[0].id;
        
        db.query(
            'INSERT INTO training_plans (personal_trainer_id, user_id, plan_details, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            [personalTrainerId, user_id, plan_details, start_date, end_date],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro ao criar plano de treino' });
                }
                res.status(201).json({ 
                    message: 'Plano de treino criado com sucesso',
                    planId: result.insertId 
                });
            }
        );
    });
});

// Listar planos de treino do personal trainer
app.get('/api/personal/training-plans', authenticateToken, requireRole(['personal']), (req, res) => {
    db.query(`
        SELECT tp.id, tp.plan_details, tp.start_date, tp.end_date, u.name as user_name, u.email as user_email
        FROM training_plans tp 
        JOIN users u ON tp.user_id = u.id 
        JOIN employees e ON tp.personal_trainer_id = e.id 
        WHERE e.user_id = ?
        ORDER BY tp.start_date DESC
    `, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Registrar progresso do usuário
app.post('/api/personal/progress', authenticateToken, requireRole(['personal']), (req, res) => {
    const { training_plan_id, progress_details } = req.body;
    const date = new Date().toISOString().split('T')[0];
    
    db.query(
        'INSERT INTO user_progress (training_plan_id, date, progress_details) VALUES (?, ?, ?)',
        [training_plan_id, date, progress_details],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao registrar progresso' });
            }
            res.status(201).json({ 
                message: 'Progresso registrado com sucesso',
                progressId: result.insertId 
            });
        }
    );
});

// ==================== ROTAS DO USUÁRIO ====================

// Listar planos de treino do usuário
app.get('/api/user/training-plans', authenticateToken, requireRole(['user']), (req, res) => {
    db.query(`
        SELECT tp.id, tp.plan_details, tp.start_date, tp.end_date, u.name as personal_name
        FROM training_plans tp 
        JOIN employees e ON tp.personal_trainer_id = e.id 
        JOIN users u ON e.user_id = u.id 
        WHERE tp.user_id = ?
        ORDER BY tp.start_date DESC
    `, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Agendar sessão de treino
app.post('/api/user/training-sessions', authenticateToken, requireRole(['user']), (req, res) => {
    const { training_plan_id, date, time } = req.body;
    
    db.query(
        'INSERT INTO training_sessions (training_plan_id, date, time) VALUES (?, ?, ?)',
        [training_plan_id, date, time],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao agendar sessão' });
            }
            res.status(201).json({ 
                message: 'Sessão agendada com sucesso',
                sessionId: result.insertId 
            });
        }
    );
});

// Listar sessões de treino do usuário
app.get('/api/user/training-sessions', authenticateToken, requireRole(['user']), (req, res) => {
    db.query(`
        SELECT ts.id, ts.date, ts.time, ts.status, tp.plan_details, u.name as personal_name
        FROM training_sessions ts 
        JOIN training_plans tp ON ts.training_plan_id = tp.id 
        JOIN employees e ON tp.personal_trainer_id = e.id 
        JOIN users u ON e.user_id = u.id 
        WHERE tp.user_id = ?
        ORDER BY ts.date DESC, ts.time DESC
    `, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Ver progresso do usuário
app.get('/api/user/progress', authenticateToken, requireRole(['user']), (req, res) => {
    db.query(`
        SELECT up.id, up.date, up.progress_details, tp.plan_details, u.name as personal_name
        FROM user_progress up 
        JOIN training_plans tp ON up.training_plan_id = tp.id 
        JOIN employees e ON tp.personal_trainer_id = e.id 
        JOIN users u ON e.user_id = u.id 
        WHERE tp.user_id = ?
        ORDER BY up.date DESC
    `, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Listar todos os usuários (para personal trainers criarem planos)
app.get('/api/users', authenticateToken, requireRole(['personal', 'admin']), (req, res) => {
    const roleFilter = req.user.role === 'personal' ? "WHERE role = 'user'" : '';
    
    db.query(`SELECT id, name, email, role FROM users ${roleFilter} ORDER BY name`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// ==================== ROTAS GERAIS ====================

// Estatísticas gerais (para dashboard)
app.get('/api/stats', authenticateToken, (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total_users FROM users WHERE role = "user"',
        'SELECT COUNT(*) as total_personal FROM users WHERE role = "personal"',
        'SELECT COUNT(*) as total_plans FROM training_plans',
        'SELECT COUNT(*) as total_sessions FROM training_sessions'
    ];
    
    Promise.all(queries.map(query => {
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
    }))
    .then(results => {
        res.json({
            totalUsers: results[0].total_users,
            totalPersonal: results[1].total_personal,
            totalPlans: results[2].total_plans,
            totalSessions: results[3].total_sessions
        });
    })
    .catch(err => {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    });
});
