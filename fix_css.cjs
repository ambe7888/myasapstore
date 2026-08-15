const fs = require('fs');
let content = fs.readFileSync('resources/css/app.css', 'utf8');

content = content.replace(/@\s*i\s*m\s*p\s*o\s*r\s*t\s*'\s*t\s*h\s*e\s*m\s*e\s*s\s*\.\s*c\s*s\s*s\s*'\s*;/g, '');
content = content.replace(/@import 'themes\.css';/g, '');

content = "@import 'themes.css';\n" + content.trim();

fs.writeFileSync('resources/css/app.css', content);
console.log('app.css fixed');
