const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const app = express();
const session = require('express-session');
const path = require('path');
var sqlite3 = require('sqlite3');
var db;
app.use(cookieParser());




const port = 6789;
// directorul 'public' va conține toate resursele accesibile direct de către cliente.g., fișiere css, javascript, imagini)
// app.use(express.static(__dirname + 'public'))
app.use(express.static(path.join(__dirname, 'public')));
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'HelloWorld'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-uluieste views/layout.ejs
app.use(expressLayouts);
// Define a map to store failed request counts for each user/IP


const accessAttempts = new Map();
const maxAccessAttempts = 1;
const durationBlocked = 10 * 1000; // 10 seconds
app.use((req, res, next) => {

  const internetprotol = req.ip;

  if (accessAttempts.has(internetprotol) && accessAttempts.get(internetprotol) >= 5) {
    const timeBlocked = accessAttempts.get(internetprotol + '-blockTime');
    if (timeBlocked && Date.now() < timeBlocked + durationBlocked) {
      return res.status(403).send('Access temporarely blocked.');
    }
    else {
      accessAttempts.delete(internetprotol);
      accessAttempts.delete(internetprotol + '-blockTime');
    }

  }
  next();
});
// Configurare sesiuni
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));
app.get('/creare-bd', (req, res) => {
  db = new sqlite3.Database('cumparaturi.db', (err) => {
    if (err) throw err;

    db.serialize(() => {
      // Create the 'produse' table if it doesn't exist
      db.run(
        'CREATE TABLE IF NOT EXISTS produse (id INTEGER PRIMARY KEY AUTOINCREMENT, nume TEXT UNIQUE, pret REAL)',
        (err) => {
          if (err) throw err;
          console.log('Tabela "produse" a fost creată cu succes sau deja există.');

          // Add some random drink records to the table
          const drinks = [
            { id: 1, nume: 'Cola', pret: 2.5 },
            { id: 2, nume: 'Limonadă', pret: 1.8 },
            { id: 3, nume: 'Suc de Portocale', pret: 3.2 },
            { id: 4, nume: 'Ceai Rece', pret: 2.0 },
            { id: 5, nume: 'Cafea', pret: 2.7 }
          ];

          const insertQuery = 'INSERT OR IGNORE INTO produse (id, nume, pret) VALUES (?, ?, ?)';
          drinks.forEach((drink) => {
            db.run(insertQuery, [drink.id, drink.nume, drink.pret], function (err) {
              if (err) throw err;
              if (this.changes > 0) {
                console.log(`Băutură "${drink.nume}" adăugată cu succes.`);
              } else {
                console.log(`Băutură "${drink.nume}" deja există în tabel.`);
              }
            });
          });

          // Redirect the client to "/"
          res.redirect('/');
        }
      );
    });
  });
});

app.get('/inserare-bd', (req, res) => {
  db.serialize(() => {
    // Connect to the database server and open a connection to the database
    db = new sqlite3.Database('cumparaturi.db', (err) => {
      if (err) throw err;

      console.log('Conexiunea la baza de date a fost realizată cu succes.');

      // Insert multiple cocktails into the 'produse' table
      const cocktails = [
        { id: 6, nume: 'Mojito', pret: 15.0 },
        { id: 7, nume: 'Cosmopolitan', pret: 12.5 },
        { id: 8, nume: 'Piña Colada', pret: 10.99 },
        { id: 9, nume: 'Margarita', pret: 11.75 },
        { id: 10, nume: 'Daiquiri', pret: 13.25 }
      ];

      const insertQuery = 'INSERT INTO produse (id, nume, pret) VALUES (?, ?, ?)';
      cocktails.forEach((cocktail) => {
        db.run(insertQuery, [cocktail.id, cocktail.nume, cocktail.pret], (err) => {
          if (err) throw err;
          console.log(`Cocktail-ul "${cocktail.nume}" a fost inserat cu succes.`);
        });
      });

      // Close the database connection
      db.close((err) => {
        if (err) throw err;
        console.log('Conexiunea cu baza de date a fost închisă.');

        // Redirect the client to "/"
        res.redirect('/');
      });
    });
  });
});


app.use((req, res, next) => {
  res.locals.username = req.cookies.username;
  res.locals.session = req.session;
  res.locals.layout = 'layout'; // Specify the layout file explicitly
  next();
});

app.get('/', (req, res) => {
  const admin = req.cookies.admin === 'true';
  db = new sqlite3.Database('cumparaturi.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err);
      res.render('index', { products: [], authenticated: false, admin: admin });
      return;
    }

    db.serialize(() => {
      const username = req.cookies.username;
      const authenticated = username ? true : false;

      // Check if the 'produse' table exists
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='produse'",
        (err, table) => {
          if (err) throw err;

          if (table) {
            // Fetch all products from the 'produse' table
            db.all('SELECT * FROM produse', (err, rows) => {
              if (err) throw err;
              res.render('index', { products: rows, authenticated: authenticated, admin: admin });
            });
          } else {
            res.render('index', { products: [], authenticated: authenticated, admin: admin });
          }
        }
      );
    });
  });
});

var cart = session.cart || [];

db = new sqlite3.Database('cumparaturi.db', (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Connected to the database.');
});

app.post('/adaugare_cos', (req, res) => {
  const productId = req.body.id;
  // Fetch the product details from the database using the product ID
  db.get('SELECT * FROM produse WHERE id = ?', [productId], (err, product) => {
    if (err) throw err;
    if (product) {
      // Add the product object to the cart array
      cart.push(product);
      res.redirect('/'); // Redirect the user to the main page
    } else {
      res.status(404).send('Product not found.'); // Send a response back to the client if the product doesn't exist
    }
  });
});

app.get('/vizualizare-cos', (req, res) => {
  // Retrieve the cart from the session or initialize an empty array


  // Define the calculateTotal function within the scope of the route handler
  function calculateTotal(cart) {
    let total = 0;
    const quantityMap = {}; // Map to track the quantity of each product ID

    // Calculate the quantity for each product in the cart
    cart.slice(0, cart.length - 1).forEach((product) => {
      const productId = product.id;
      quantityMap[productId] = (quantityMap[productId] || 0) + 1;
    });

    // Iterate over the quantity map to calculate the total
    Object.keys(quantityMap).forEach((productId) => {
      const product = cart.find((item) => item.id === parseInt(productId));
      if (product) {
        const price = parseFloat(product.pret); // Ensure price is a number
        const quantity = quantityMap[productId];
        if (!isNaN(price) && !isNaN(quantity)) {
          total += price * quantity;
        }
      }
    });

    return total;
  }

  const total = calculateTotal(cart);
  res.render('vizualizare-cos', { cart: cart, total: total });
});
app.get('/autentificare', (req, res) => {
  req.session.username = null;
  res.clearCookie('username');
  res.clearCookie('admin');
  res.clearCookie('mesajEroare');
  res.render('autentificare', { req });

});
const fs = require('fs');
const usersData = fs.readFileSync('utilizatori.json');
const users = JSON.parse(usersData);

const failedLoginAttemptsShortInterval = 3;

// Map to store failed login attempts for each user
const failedLoginAttempts = new Map();
app.post('/verificare-autentificare', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.utilizator === username && user.parola === password);

  if (user) {
    console.log("Logat");

    // Reset failed login attempts for the user
    failedLoginAttempts.delete(username);
    failedLoginAttempts.delete(username + '-blockTime');

    // Store user session and set cookies
    req.session.utilizator = user.utilizator;
    req.session.nume = user.nume;
    req.session.prenume = user.prenume;
    res.cookie('username', user.utilizator);

    // Set admin status in session or cookie
    if (user.admin) {
      req.session.admin = true;
      res.cookie('admin', 'true');
    } else {
      req.session.admin = false;
      res.cookie('admin', 'false');
    }

    res.redirect('/');
  } else {
    // Increment failed login attempts for the user
    let attempts = failedLoginAttempts.get(username) || 0;
    attempts++;
    failedLoginAttempts.set(username, attempts);

    // Check if the user exceeds the maximum number of failed login attempts
    if (attempts >= failedLoginAttemptsShortInterval) {
      failedLoginAttempts.set(username + '-blockTime', Date.now());
      req.session.errorMessage = 'Accesul este blocat temporar. Încercați din nou mai târziu.';
      res.cookie('mesajEroare', 'Accesul este blocat temporar. Încercați din nou mai târziu.');
      return res.redirect('/autentificare');
    } else {
      // Check if the user is currently blocked
      const blockTime = failedLoginAttempts.get(username + '-blockTime');
      if (blockTime) {
        const currentTime = Date.now();
        const blockDuration = 10000; // Block duration in milliseconds (e.g., 10 seconds)
        const timeSinceBlock = currentTime - blockTime;
        if (timeSinceBlock < blockDuration) {
          const timeLeft = blockDuration - timeSinceBlock;
          req.session.errorMessage = `Accesul este blocat temporar. Încercați din nou în ${Math.ceil(timeLeft / 1000)} secunde.`;
          res.cookie('mesajEroare', `Accesul este blocat temporar. Încercați din nou în ${Math.ceil(timeLeft / 1000)} secunde.`);
          return res.redirect('/autentificare');
        } else {
          // Reset failed login attempts if the block duration has passed
          failedLoginAttempts.delete(username);
          failedLoginAttempts.delete(username + '-blockTime');
        }
      }
    }

    req.session.errorMessage = 'Nume de utilizator sau parolă greșite.';
    res.cookie('mesajEroare', 'Username sau parola gresita');
    res.redirect('/autentificare');

    console.log("Username sau parola gresita");
  }
});

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcțiaspecificată
app.get('/chestionar', (req, res) => {
  const fs = require('fs');

  // Read the contents of the JSON file
  const intrebariData = fs.readFileSync('intrebari.json');
  const listaIntrebari = JSON.parse(intrebariData);
  // în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' careconține vectorul de întrebări
  res.render('chestionar', { intrebari: listaIntrebari });
});
app.post('/rezultat-chestionar', (req, res) => {
  const intrebariData = fs.readFileSync('intrebari.json');
  const intrebari = JSON.parse(intrebariData);

  const raspunsuri = [];
  for (let i = 0; i < intrebari.length; i++) {
    const answer = req.body[`raspuns${i}`][0];
    raspunsuri.push(answer);
  }

  const variante = intrebari.map(intrebare => intrebare.variante[0]);

  console.log(intrebari, variante, raspunsuri);
  res.render('rezultat-chestionar', { intrebari, variante, req, raspunsuri });
});

app.get('/admin', (req, res) => {
  const admin = req.cookies.admin === 'true';
  db.serialize(() => {
    // Fetch all products from the 'produse' table
    db.all('SELECT * FROM produse', (err, rows) => {
      if (err) throw err;
      res.render('admin', { products: rows, username: req.cookies.username, admin: admin });
    });
  });
});
app.post('/admin/adauga-produs', (req, res) => {
  db = new sqlite3.Database('cumparaturi.db');
  const { nume, pret } = req.body;

  // Inserează produsul în baza de date
  const insertQuery = 'INSERT INTO produse (nume, pret) VALUES (?, ?)';
  db.run(insertQuery, [nume, pret], function (err) {
    if (err) {
      console.error(err);
      res.redirect('/admin'); // Redirecționează înapoi la pagina de admin în caz de eroare
      return;
    }

    console.log(`Produsul "${nume}" a fost adăugat cu succes.`);
    res.redirect('/admin'); // Redirecționează înapoi la pagina de admin după adăugare
  });

});

app.all('*', (req, res) => {

  const internetprotol = req.ip;

  accessAttempts.set(internetprotol, (accessAttempts.get(internetprotol) || 0) + 1);

  accessAttempts.set(internetprotol + '-blockTime', Date.now());
  res.status(404).send("The page wasn't found.");




});
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:6789`))