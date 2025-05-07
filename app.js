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