// Export express module
const express = require('express');

// Creating instance of the application
const app = express();
const PORT = process.env.PORT || 3000;

// JSON parsing middleware
app.use(express.json());

// Table with an examples of products
const products = [
  { id: 1, nazwa: 'Laptop', cena: 3500 },
  { id: 2, nazwa: 'Smartfon', cena: 1800 },
  { id: 3, nazwa: 'Słuchawki', cena: 350 }
];

// Main endpoint
app.get('/', (req, res) => {
  res.send('Witaj w moim API!');
});

// Endpoint to download all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Endpoint to download single product
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ wiadomosc: 'Produkt nie znaleziony' });
  }
  
  res.json(product);
});

// Endpoint to add a new product
app.post('/api/products', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    nazwa: req.body.nazwa,
    cena: req.body.cena
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Moje API',
      description: 'Dokumentacja Mojego API',
      version: '1.0.0',
    },
  },
  apis: ['./app.js'],
};

///////////
// Swagger documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Add annotations to endpoints, e.g:
/**
 * @swagger
 * /api/products:
 *   get:
 *     description: Download all products
 *     responses:
 *       200:
 *         description: Sukces
 */


///////////
// Jsonwebtoken

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'twoj_tajny_klucz'; // In production, use environment variables!

// Login endpoint
app.post('/api/login', (req, res) => {
  // In a real application, you would check the data in the database
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ wiadomosc: 'Nieprawidłowe dane logowania' });
  }
});

// Middleware for token verification
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ wiadomosc: 'Brak tokenu uwierzytelniającego' });
  }
  
  try {
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ wiadomosc: 'Nieprawidłowy token' });
  }
}

// Secured endpoint
app.get('/api/products/secure', verifyToken, (req, res) => {
  res.json(products);
});

///////////
// MongoDB

const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/moje-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Połączono z MongoDB'))
.catch(err => console.error('Błąd połączenia z MongoDB:', err));

// Scheme definition
const productSchema = new mongoose.Schema({
  nazwa: { type: String, required: true },
  cena: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema);

// Endpoint to download all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ wiadomosc: err.message });
  }
});

// Endpoint to add product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product({
      nazwa: req.body.nazwa,
      cena: req.body.cena
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ wiadomosc: err.message });
  }
});

///////////
// Adding data validation
const Joi = require('joi');

// Validation scheme
const produktSchema = Joi.object({
  nazwa: Joi.string().min(3).required(),
  cena: Joi.number().min(0).required()
});

// Validation middleware
function validateProduct(req, res, next) {
  const { error } = produktSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ wiadomosc: error.details[0].message });
  }
  
  next();
}

// Using validation middleware
app.post('/api/products', validateProduct, async (req, res) => {
  // product add code
});

///////////
// CORS

const cors = require('cors');

// Application for all routes
app.use(cors());

// Or only for selected routes and domains
const corsOptions = {
  origin: 'https://twoja-strona.pl',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use('/api', cors(corsOptions));

///////////
// API monitor

const morgan = require('morgan');
const winston = require('winston');

// Winston Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Using Morgan for HTTP logs
app.use(morgan('combined'));

// Global error handling
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ wiadomosc: 'Wystąpił błąd serwera' });
});

