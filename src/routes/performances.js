const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/performances.json');

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(data) {
  if (data.length === 0) return 1;
  return Math.max(...data.map(item => item.id)) + 1;
}

function registerPerformanceRoutes(app) {
  
  app.get('/performances', (req, res) => {
    const performances = readData();
    res.json(performances);
  });

  app.get('/performances/:id', (req, res) => {
    const performances = readData();
    const id = parseInt(req.params.id);
    const performance = performances.find(p => p.id === id);
    
    if (!performance) {
      return res.status(404).json({ error: 'Performance not found' });
    }
    
    res.json(performance);
  });

  app.post('/performances', (req, res) => {
    const performances = readData();
    
    const newPerformance = {
      id: generateId(performances),
      title: req.body.title || 'Новый спектакль',
      director: req.body.director || 'Неизвестный режиссёр',
      duration: req.body.duration || 120,
      isPremiere: req.body.isPremiere ?? true,
      premiereDate: req.body.premiereDate || new Date().toISOString().split('T')[0],
      genres: req.body.genres || ['драма']
    };
    
    performances.push(newPerformance);
    writeData(performances);
    
    res.status(201).json(newPerformance);
  });

  app.put('/performances/:id', (req, res) => {
    const performances = readData();
    const id = parseInt(req.params.id);
    const index = performances.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Performance not found' });
    }
    
    performances[index] = {
      id: id,
      title: req.body.title || performances[index].title,
      director: req.body.director || performances[index].director,
      duration: req.body.duration || performances[index].duration,
      isPremiere: req.body.isPremiere ?? performances[index].isPremiere,
      premiereDate: req.body.premiereDate || performances[index].premiereDate,
      genres: req.body.genres || performances[index].genres
    };
    
    writeData(performances);
    res.json(performances[index]);
  });

  app.patch('/performances/:id', (req, res) => {
    const performances = readData();
    const id = parseInt(req.params.id);
    const index = performances.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Performance not found' });
    }
    
    if (req.body.title) performances[index].title = req.body.title;
    if (req.body.director) performances[index].director = req.body.director;
    if (req.body.genres) performances[index].genres = req.body.genres;
    
    performances[index].duration += 5;
    
    writeData(performances);
    res.json({
      ...performances[index],
      message: 'Duration increased by 5 minutes (non-idempotent operation)'
    });
  });

  app.delete('/performances/:id', (req, res) => {
    const performances = readData();
    const id = parseInt(req.params.id);
    const index = performances.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Performance not found' });
    }
    
    const deleted = performances.splice(index, 1)[0];
    writeData(performances);
    
    res.json({ message: 'Performance deleted', deleted });
  });
}

module.exports = registerPerformanceRoutes;
