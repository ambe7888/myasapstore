const fs = require('fs');
const colors = require('tailwindcss/colors');

const palettes = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
}

let css = '';

palettes.forEach(name => {
  const color = colors[name];
  if (!color || typeof color !== 'object') return;
  
  css += `[data-theme="${name}"] {\n`;
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach(shade => {
    if (color[shade]) {
      css += `  --color-store-primary-${shade}: ${hexToRgb(color[shade])};\n`;
    }
  });
  
  css += `  --theme-color: ${color[500]};\n`;
  css += `  --btn-add-to-cart-color: ${color[600]};\n`;
  css += `  --btn-buy-now-color: ${colors.green[600]};\n`;
  css += `  --primary-hover-color: rgb(var(--color-store-primary-600));\n`;
  css += `  --bg-light-color: rgb(var(--color-store-primary-50));\n`;
  css += `  --border-light-color: rgb(var(--color-store-primary-200));\n`;
  
  css += `}\n\n`;
});

fs.writeFileSync('resources/css/themes.css', css);
console.log('themes.css generated');
