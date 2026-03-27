const fs = require('fs');
const path = require('path');

const walk = function(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const replaceInFiles = () => {
  const dirs = [
    path.join(__dirname, 'client', 'src'),
    path.join(__dirname, 'admin', 'src')
  ];

  let replacedCount = 0;

  dirs.forEach(dir => {
    const files = walk(dir);
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      
      // Replace single-quoted string: 'http://localhost:5000/api/...' -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/...`
      let newContent = content.replace(/'http:\/\/localhost:5000(\/api[^']*)'/g, '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000\'}$1`');
      
      // Replace double-quoted string: "http://localhost:5000/api/..." -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/...`
      newContent = newContent.replace(/"http:\/\/localhost:5000(\/api[^"]*)"/g, '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000\'}$1`');
      
      // Replace template literal: `http://localhost:5000/api/...` -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/...`
      newContent = newContent.replace(/`http:\/\/localhost:5000(\/api[^`]*)`/g, '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000\'}$1`');

      if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        replacedCount++;
      }
    });
  });

  console.log(`Successfully refactored ${replacedCount} files for production deployment.`);
};

replaceInFiles();
