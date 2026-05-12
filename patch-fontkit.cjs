
const fs = require('fs');
const path = require('path');
function search(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      search(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.cjs') || fullPath.endsWith('.mjs')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('anchor.xCoordinate') || content.includes('anchor\.xCoordinate')) {
        content = content.replace(/let x = anchor\.xCoordinate;/g, 'let x = anchor ? anchor.xCoordinate : 0;');
        content = content.replace(/let y = anchor\.yCoordinate;/g, 'let y = anchor ? anchor.yCoordinate : 0;');
        
        // Also sometimes it might be compiled differently
        content = content.replace(/anchor\.xCoordinate/g, '(anchor?anchor.xCoordinate:0)');
        content = content.replace(/anchor\.yCoordinate/g, '(anchor?anchor.yCoordinate:0)');

        fs.writeFileSync(fullPath, content);
      }
    }
  }
}
search('node_modules/fontkit/dist');
