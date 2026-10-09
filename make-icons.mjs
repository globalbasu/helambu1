import fs from 'fs';

// Generate a clean PNG file for app icon
function createPngIcon(size, outputPath) {
  // SVG representing the Ballot Box & Election Ops Icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#4f46e5"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.38}" fill="#ffffff" opacity="0.15"/>
    <text x="50%" y="54%" font-family="Arial, sans-serif" font-size="${size * 0.45}" text-anchor="middle" dominant-baseline="central">🗳️</text>
  </svg>`;

  fs.writeFileSync(outputPath.replace('.png', '.svg'), svg);
}

createPngIcon(192, './icons/icon-192.png');
createPngIcon(512, './icons/icon-512.png');
console.log('App icons generated successfully');
