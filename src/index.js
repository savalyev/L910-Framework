const Application = require('./framework/Application');
const bodyParser = require('./framework/bodyParser');
const registerPerformanceRoutes = require('./routes/performances');
const registerActorRoutes = require('./routes/actors');

const app = new Application();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser());

registerPerformanceRoutes(app);
registerActorRoutes(app);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Theatre API server running on http://localhost:${PORT}!!!`);
});
