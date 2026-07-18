const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources', 'lang', 'fr.json');
const data = fs.readFileSync(filePath, 'utf8');
const json = JSON.parse(data);

if (!json['Default Store']) {
  json['Default Store'] = 'Boutique par défaut';
  
  // Sort keys alphabetically
  const sortedJson = {};
  Object.keys(json).sort().forEach(key => {
    sortedJson[key] = json[key];
  });
  
  fs.writeFileSync(filePath, JSON.stringify(sortedJson, null, 4));
  console.log('Added "Default Store" to fr.json');
} else {
  console.log('"Default Store" already exists in fr.json');
}
