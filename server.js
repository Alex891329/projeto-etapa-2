const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;
const MONGO_URL = "mongodb+srv://alexaraujosj:eoy1Ia20yZyLmFHR@cluster0.8lsip.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json());

let db;

// Função para conectar ao banco
async function getDb() {
  if (!db) {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db('mydatabase'); // Nome do banco de dados
  }
  return db;
}

// Rota para cadastro de usuário
app.post('/registro', async (req, res) => {
  const { name, email, password } = req.body;
  const db = await getDb();
  const users = db.collection('usuarios');

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword };

    await users.insertOne(newUser);
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Rota para login de usuário
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await getDb();
  const users = db.collection('usuarios');

  try {
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    res.status(200).json({ message: 'Login bem-sucedido' });
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

// Rota para salvar os pontos do mapa
app.post('/save-points', async (req, res) => {
  const points = req.body; // Recebe os pontos do cliente
  const db = await getDb();
  const pointsCollection = db.collection('mapPoints');

  try {
    // Valida se os pontos têm a estrutura correta
    if (!Array.isArray(points) || points.length !== 2) {
      return res.status(400).json({ error: 'É necessário enviar exatamente 2 pontos.' });
    }

    // Apaga os pontos existentes e insere os novos
    await pointsCollection.deleteMany(); // Opcional: Limpar dados antigos
    await pointsCollection.insertMany(points);

    res.status(201).json({ message: 'Pontos salvos com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar pontos:', err);
    res.status(500).json({ error: 'Erro ao salvar pontos.' });
  }
});

// Rota para recuperar os pontos do mapa
app.get('/get-points', async (req, res) => {
  const db = await getDb();
  const pointsCollection = db.collection('mapPoints');

  try {
    const points = await pointsCollection.find().toArray(); // Busca todos os pontos salvos
    res.status(200).json(points);
  } catch (err) {
    console.error('Erro ao recuperar pontos:', err);
    res.status(500).json({ error: 'Erro ao recuperar pontos.' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
