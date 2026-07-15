#!/usr/bin/env node

/**
 * Test script for Azure Function thumbhash generation
 * 
 * Usage:
 *   node test-thumbhash.js <azure-function-url> <secret> <media-id> <public-url> <size>
 * 
 * Example:
 *   node test-thumbhash.js https://your-function.azurewebsites.net/api/hive-thumbhash \
 *     your-secret-here \
 *     123e4567-e89b-12d3-a456-426614174000 \
 *     https://your-r2-bucket.com/image.jpg \
 *     500000
 */

const [,, azureFunctionUrl, secret, mediaId, publicUrl, size] = process.argv;

if (!azureFunctionUrl || !secret || !mediaId || !publicUrl || !size) {
  console.error('Usage: node test-thumbhash.js <azure-function-url> <secret> <media-id> <public-url> <size>');
  console.error('');
  console.error('Example:');
  console.error('  node test-thumbhash.js https://your-function.azurewebsites.net/api/hive-thumbhash \\');
  console.error('    your-secret-here \\');
  console.error('    123e4567-e89b-12d3-a456-426614174000 \\');
  console.error('    https://your-r2-bucket.com/image.jpg \\');
  console.error('    500000');
  process.exit(1);
}

const payload = {
  mediaId,
  publicUrl,
  size: parseInt(size, 10),
};

console.log('Testing Azure Function thumbhash generation...');
console.log('');
console.log('Function URL:', azureFunctionUrl);
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('');

fetch(azureFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-azure-function-secret': secret,
  },
  body: JSON.stringify(payload),
})
  .then(async (response) => {
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }

    console.log('Status:', response.status, response.statusText);
    console.log('Response:', JSON.stringify(json, null, 2));
    console.log('');

    if (response.ok) {
      console.log('✅ Function executed successfully!');
      if (json.message && json.message.includes('Skipped')) {
        console.log('ℹ️  File was skipped (likely <100KB)');
      } else if (json.message && json.message.includes('successfully')) {
        console.log('✅ Thumbhash generated and saved!');
      }
    } else {
      console.log('❌ Function returned an error');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error calling function:', error.message);
    process.exit(1);
  });
