const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');
const bcrypt = require('bcrypt'); 


const dotenv = require('dotenv');

// Carregar variáveis do arquivo .env
dotenv.config();

// Exemplo de uso das variáveis de ambiente
const port = process.env.APP_PORT || 3000;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USERNAME;
const dbPass = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;


console.log('env',dbHost)
// Configuração básica do Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const app = express();
app.use(express.json());

// Configuração da conexão
const pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPass,
    port: dbPort
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
// getCustomers();

// Endpoints
app.get('/customers', async (req, res) => {
  const result = await pool.query('SELECT * FROM customer');
  res.json(result.rows);
});

app.get('/employees', async (req, res) => {
  const result = await pool.query('SELECT * FROM employee');
  res.json(result.rows);
});

app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM user');
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
  const { request_id, customercustomer_id } = req.body;
  const result = await pool.query(
    'INSERT INTO request (request_id, customercustomer_id) VALUES ($1, $2) RETURNING *',
    [request_id, customercustomer_id]
  );
  res.json(result.rows[0]);
});

app.post('/newQuote', async (req, res) => {
  const { quote_id, requestrequest_id } = req.body;
  const result = await pool.query(
    'INSERT INTO quote (quote_id, requestrequest_id) VALUES ($1, $2) RETURNING *',
    [quote_id, requestrequest_id]
  );
  res.json(result.rows[0]);
});

app.post('/newOrder', async (req, res) => {
  const { sales_order_id, quotequote_id } = req.body;
  const result = await pool.query(
    'INSERT INTO sales_order (sales_order_id, quotequote_id) VALUES ($1, $2, $3) RETURNING *',
    [sales_order_id, quotequote_id]
  );
  res.json(result.rows[0]);
});

//Put Operations 
//Edit Password


// PUT Atualizar Senha de Users
app.put('/"users-eco-tech"/:user_id/password', async (req, res) => {
  const { user_id } = req.body;
  const { password } = req.body;

  if (!user_id) return res.status(400).send('User ID is required');
  if (!password) return res.status(400).send('Password is required');

  try {
    // Hash a nova senha
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o salt rounds
    const result = await pool.query(
      'UPDATE "users-eco-tech" SET password = $1 WHERE user_id = $2 RETURNING *',
      [hashedPassword, user_id] // Corrigido para passar os parâmetros corretos
    );

    if (result.rows.length === 0) return res.status(404).send('User not found');
    res.status(200).json({ message: 'Password updated successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar a senha do utilizador');
  }
});


//Delete Operations
// Delete customer by customer_id
app.delete('/customer/:customer_id', async (req, res) => {
  const { customer_id } = req.params;

  // Validate if customer_id is provided
  if (!customer_id) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  try {
    console.log(`DELETE request received for customer_id: ${customer_id}`);

    // Query to delete the user by customer_id
    const result = await pool.query(
      'DELETE FROM "customer" WHERE customer_id = $1 RETURNING *',
      [customer_id]
    );

    // Check if a customer was found and deleted
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with success
    res.status(200).json({
      message: 'User deleted successfully',
      deletedCustomer: result.rows[0], // Optional: Return deleted user details
    });
  } catch (err) {
    console.error('Error while deleting customer:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});


// Função PUT para atualizar um cliente pelo customer_id
app.put('/updateCustomer/:customer_id', async (req, res) => {
  const { customer_id } = req.params;
  const { useruser_id } = req.body;

  try {
    // Verifica se o cliente existe antes de tentar atualizar
    const checkCustomer = await pool.query(
      'SELECT * FROM customer WHERE customer_id = $1',
      [customer_id]
    );

    if (checkCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Atualiza o cliente
    const result = await pool.query(
      'UPDATE customer SET useruser_id = $1 WHERE customer_id = $2 RETURNING *',
      [useruser_id, customer_id]
    );

    res.json({ message: 'Cliente atualizado com sucesso', customer: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar o cliente:', err.stack);
    res.status(500).json({ error: 'Erro ao atualizar o cliente' });
  }
});

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Expondo métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Log para verificar se as variáveis foram carregadas
console.log(`Servidor rodando na porta ${port}`);
console.log(`Conectando ao banco de dados ${dbHost} com usuário ${dbUser}`);

app.get('/', (req, res) => {
  res.send('Eco-Tech Application is running!');
});

app.listen(port, () => {
  console.log(`Aplicação rodando em http://localhost:${port}`);
});

