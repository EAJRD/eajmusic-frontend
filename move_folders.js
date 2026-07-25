const fs = require('fs');
const path = require('path');

const trashDir = path.join(__dirname, 'trash');
if (!fs.existsSync(trashDir)) fs.mkdirSync(trashDir);

const moves = [
  { from: 'src/apps', to: 'trash/src_apps' },
  { from: 'src/components', to: 'trash/src_components' },
  { from: 'src/services', to: 'trash/src_services' },
  { from: 'apps', to: 'src/apps' },
  { from: 'components', to: 'src/components' },
  { from: 'services', to: 'src/services' }
];

moves.forEach(m => {
  const src = path.join(__dirname, m.from);
  const dest = path.join(__dirname, m.to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${m.from} to ${m.to}`);
  } else {
    console.log(`Source ${m.from} not found, skipping.`);
  }
});
