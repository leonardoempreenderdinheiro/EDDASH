const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'traffic_data.csv');

try {
    const buffer = fs.readFileSync(filePath);
    console.log('First 20 bytes (hex):', buffer.subarray(0, 20).toString('hex'));

    // Check for BOM
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        console.log('UTF-8 BOM detected!');
    } else {
        console.log('No UTF-8 BOM detected.');
    }

    // Read as string and check first column name
    const content = buffer.toString('utf8');
    const firstLine = content.split('\n')[0];
    console.log('First line:', firstLine);
    const firstColumn = firstLine.split(',')[0];
    console.log('First column name:', firstColumn);
    console.log('First column length:', firstColumn.length);
    console.log('First column char codes:', firstColumn.split('').map(c => c.charCodeAt(0)));

} catch (err) {
    console.error('Error reading file:', err);
}
