const express = require('express');
const cors = require('cors');
const path = require('path');

const uploadRoute = require('./routes/upload');
const serveRoute = require('./routes/serve');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/upload', uploadRoute);
app.use('/cdn', serveRoute);

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => console.log(`Duan CDN corriendo en el puerto ${PORT}`));
