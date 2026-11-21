const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const { seedDatabase } = require('./persistence/seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Precarga de datos en memoria al iniciar
seedDatabase();

// Rutas de la API
app.use('/api', apiRoutes);

// Healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'OK', app: 'AI Ticket It API' });
});

// Middleware centralizado de manejo de errores
app.use((err, req, res, next) => {
  const status = err.status || 400;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor AI Ticket It escuchando en http://0.0.0.0:${PORT}`);
});