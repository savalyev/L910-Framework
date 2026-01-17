const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/actors.json');

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

function registerActorRoutes(app) {
  
  app.get('/actors', (req, res) => {
    const actors = readData();
    res.json(actors);
  });

  app.get('/actors/:id', (req, res) => {
    const actors = readData();
    const id = parseInt(req.params.id);
    const actor = actors.find(a => a.id === id);
    
    if (!actor) {
      return res.status(404).json({ error: 'актера такого нет' });
    }
    
    res.json(actor);
  });

  app.post('/actors', (req, res) => {
    const actors = readData();
    
    const newActor = {
      id: generateId(actors),
      name: req.body.name || 'Новый актёр',
      age: req.body.age || 25,
      isLeadActor: req.body.isLeadActor ?? false,
      joinDate: req.body.joinDate || new Date().toISOString().split('T')[0],
      roles: req.body.roles || []
    };
    
    actors.push(newActor);
    writeData(actors);
    
    res.status(201).json(newActor);
  });

  app.put('/actors/:id', (req, res) => {
    const actors = readData();
    const id = parseInt(req.params.id);
    const index = actors.findIndex(a => a.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'актера такого нет' });
    }
    
    actors[index] = {
      id: id,
      name: req.body.name || actors[index].name,
      age: req.body.age || actors[index].age,
      isLeadActor: req.body.isLeadActor ?? actors[index].isLeadActor,
      joinDate: req.body.joinDate || actors[index].joinDate,
      roles: req.body.roles || actors[index].roles
    };
    
    writeData(actors);
    res.json(actors[index]);
  });

  app.patch('/actors/:id', (req, res) => {
    const actors = readData();
    const id = parseInt(req.params.id);
    const index = actors.findIndex(a => a.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'актера такого нет' });
    }
    
    if (req.body.name) actors[index].name = req.body.name;
    if (req.body.isLeadActor !== undefined) actors[index].isLeadActor = req.body.isLeadActor;
    if (req.body.roles) actors[index].roles = req.body.roles;
    
    actors[index].age += 1;
    
    writeData(actors);
    res.json({
      ...actors[index],
      message: 'Age increased by 1 (non-idempotent operation)'
    });
  });

  app.delete('/actors/:id', (req, res) => {
    const actors = readData();
    const id = parseInt(req.params.id);
    const index = actors.findIndex(a => a.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'актера такого нет' });
    }
    
    const deleted = actors.splice(index, 1)[0];
    writeData(actors);
    
    res.json({ message: 'актер удален', deleted });
  });
}

module.exports = registerActorRoutes;
