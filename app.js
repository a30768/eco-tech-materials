const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');

// Configuração básica do Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const app = express();
app.use(express.json());

// Configuração da conexão
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'eco-techmaterials',
    port: 5432,
});

// Testando a conexão
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err.stack);
    }
    console.log('Conexão bem-sucedida com o banco de dados ECO-TECH');
    release();
});

// Exemplo de query
async function getCustomers() {
    try {
        const res = await pool.query('SELECT * FROM CUSTOMER;');
        console.log('Clientes:', res.rows);
    } catch (err) {
        console.error('Erro ao executar a query:', err.stack);
    }
}

// Chamada de teste
getCustomers();

// Endpoints
app.get('/customers', async (req, res) => {
  const result = await pool.query('SELECT * FROM customer');
  res.json(result.rows);
});

app.get('/employees', async (req, res) => {
  const result = await pool.query('SELECT * FROM employee');
  res.json(result.rows);
});

app.get('/requests', async (req, res) => {
  const result = await pool.query('SELECT * FROM request');
  res.json(result.rows);
});

app.get('/quotes', async (req, res) => {
  const result = await pool.query('SELECT * FROM quote');
  res.json(result.rows);
});

app.get('/orders', async (req, res) => {
  const result = await pool.query('SELECT * FROM sales_order');
  res.json(result.rows);
});


app.post('/newCustomer', async (req, res) => {
  const { customer_id, useruser_id } = req.body;
  const result = await pool.query(
    'INSERT INTO customer (customer_id, useruser_id) VALUES ($1, $2) RETURNING *',
    [customer_id, useruser_id]
  );
  res.json(result.rows[0]);
});

app.post('/newEmployee', async (req, res) => {
  const { employee_id, employee_name, employee_function, employee_department, employee_nif } = req.body;
  const result = await pool.query(
    'INSERT INTO employee (employee_id, employee_name, employee_function, employee_department, employee_nif) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [employee_id, employee_name, employee_function, employee_department, employee_nif]
  );
  res.json(result.rows[0]);
});

app.post('/newRequest', async (req, res) => {
  const { customer_id, description } = req.body;
  const result = await pool.query(
    'INSERT INTO request (customer_id, description) VALUES ($1, $2) RETURNING *',
    [customer_id, description]
  );
  res.json(result.rows[0]);
});

app.post('/quotes', async (req, res) => {
  const { request_id, total_amount } = req.body;
  const result = await pool.query(
    'INSERT INTO quote (request_id, total_amount) VALUES ($1, $2) RETURNING *',
    [request_id, total_amount]
  );
  res.json(result.rows[0]);
});

app.post('/orders', async (req, res) => {
  const { customer_id, order_date, total_amount } = req.body;
  const result = await pool.query(
    'INSERT INTO sales_order (customer_id, order_date, total_amount) VALUES ($1, $2, $3) RETURNING *',
    [customer_id, order_date, total_amount]
  );
  res.json(result.rows[0]);
});


app.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await pool.query(
    'UPDATE sales_order SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  res.json(result.rows[0]);
});


app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM sales_order WHERE id = $1', [id]);
  res.sendStatus(204);
});


// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Expondo métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(3001, () => console.log('Eco-Tech service is running'));
//app.listen(3002, () => console.log('Request for Proposal service is running'));
//app.listen(3003, () => console.log('Sales Orders Management service is running'));

const dotenv = require('dotenv');

// Carregar variáveis do arquivo .env
dotenv.config();

// Exemplo de uso das variáveis de ambiente
const port = process.env.APP_PORT || 3000;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USERNAME;

// Log para verificar se as variáveis foram carregadas
console.log(`Servidor rodando na porta ${port}`);
console.log(`Conectando ao banco de dados ${dbHost} com usuário ${dbUser}`);

app.get('/', (req, res) => {
  res.send('Eco-Tech Application is running!');
});

app.listen(port, () => {
  console.log(`Aplicação rodando em http://localhost:${port}`);
});

//VERSÃO ANTERIOR  de carregamento variáveis ambiente:

//const dotenv = require('dotenv');

// Carrega o arquivo .env
//dotenv.config();

// Acessa as variáveis de ambiente
//const port = process.env.APP_PORT || 3000;
//const dbHost = process.env.DB_HOST;
//const dbUser = process.env.DB_USERNAME;

//console.log(`Iniciando na porta ${port}`);
