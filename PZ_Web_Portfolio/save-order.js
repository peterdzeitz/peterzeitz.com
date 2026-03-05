const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save-order') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { projectId, images } = JSON.parse(body);

        if (!projectId || !Array.isArray(images)) {
          res.writeHead(400);
          res.end('Missing projectId or images array');
          return;
        }

        const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
        const project = data.projects.find(p => p.id === projectId);

        if (!project) {
          res.writeHead(404);
          res.end('Project not found: ' + projectId);
          return;
        }

        project.images = images;
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2) + '\n');

        console.log(`Updated image order for "${projectId}": ${images.length} images`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Server error: ' + err.message);
      }
    });
  } else if (req.method === 'POST' && req.url === '/save-project-order') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { projectOrder } = JSON.parse(body);

        if (!Array.isArray(projectOrder)) {
          res.writeHead(400);
          res.end('Missing projectOrder array');
          return;
        }

        const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
        const projectMap = new Map(data.projects.map(p => [p.id, p]));
        const reordered = [];

        for (const id of projectOrder) {
          const project = projectMap.get(id);
          if (project) {
            reordered.push(project);
            projectMap.delete(id);
          }
        }
        // Append any projects not in the order list
        for (const project of projectMap.values()) {
          reordered.push(project);
        }

        data.projects = reordered;
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2) + '\n');

        console.log(`Updated project order: ${projectOrder.join(', ')}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Server error: ' + err.message);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Save-order server running on http://localhost:${PORT}`);
});
