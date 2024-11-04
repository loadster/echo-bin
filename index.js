const PORT = 3000;
const MAX_ITEMS = 500; // Maximum number of items allowed
const MAX_SIZE = '1mb'; // Each item's maximum size
const MAX_AGE_MS = 4 * 60 * 60 * 1000; // Maximum age of 4 hours in milliseconds
const REAPER_MS = 60 * 1000; // Run the reaper every minute

const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

const store = {};
const contentTypes = {};
const pathOrder = [];

// Middleware to enforce body size limit of 1mb
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  jsonLimit: MAX_SIZE,
  textLimit: MAX_SIZE,
  formLimit: MAX_SIZE
}));

// Function to enforce maximum items in the store
function enforceMaxItems() {
  while (pathOrder.length > MAX_ITEMS) {
    const oldestPath = pathOrder.shift();

    delete store[oldestPath];
    delete contentTypes[oldestPath];
  }
}

// Function to remove old entries
function reaper() {
  const now = Date.now();
  for (const path of Object.keys(store)) {
    if (now - timestamps[path] > MAX_AGE_MS) {
      delete store[path];
      delete contentTypes[path];
      delete timestamps[path];
      const index = pathOrder.indexOf(path);
      if (index !== -1) pathOrder.splice(index, 1);
    }
  }
}

// POST endpoint to set a value at a dynamic path
router.post('/:path', (ctx) => {
  const { path } = ctx.params;
  const value = ctx.request.body;

  if (!value) {
    ctx.status = 400;
    ctx.body = { error: 'Value is required' };

    return;
  }

  if (!store[path]) {
    pathOrder.push(path);
  }

  store[path] = value;
  contentTypes[path] = ctx.request.type;

  enforceMaxItems();

  ctx.status = 201;
  ctx.body = {};
});

// GET endpoint to retrieve a value from a dynamic path
router.get('/:path', (ctx) => {
  const { path } = ctx.params;

  if (store[path] === undefined) {
    ctx.status = 404;
    ctx.body = { error: 'Value not found' };

    return;
  }

  ctx.type = contentTypes[path] || 'text/plain';
  ctx.body = store[path];
});

setInterval(reaper, REAPER_MS);

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

