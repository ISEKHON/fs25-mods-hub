// Test file size conversion function (updated version)
function convertFileSizeToBytes(sizeNumber, unit) {
  const number = parseFloat(sizeNumber)
  if (isNaN(number) || number < 0) return 0
  
  switch (unit.toUpperCase()) {
    case 'KB': return Math.round(number * 1024)
    case 'MB': return Math.round(number * 1024 * 1024)
    case 'GB': return Math.round(number * 1024 * 1024 * 1024)
    default: return Math.round(number)
  }
}

// Test cases with new format
console.log('🧪 Testing New File Size Conversion (Number + Unit):')
console.log('90, "MB" =>', convertFileSizeToBytes('90', 'MB'), 'bytes')
console.log('1.5, "GB" =>', convertFileSizeToBytes('1.5', 'GB'), 'bytes') 
console.log('500, "KB" =>', convertFileSizeToBytes('500', 'KB'), 'bytes')
console.log('95.4, "MB" =>', convertFileSizeToBytes('95.4', 'MB'), 'bytes')

// Test edge cases
console.log('\n🔍 Edge Cases:')
console.log('0, "MB" =>', convertFileSizeToBytes('0', 'MB'), 'bytes')
console.log('invalid, "MB" =>', convertFileSizeToBytes('invalid', 'MB'), 'bytes')
console.log('-5, "MB" =>', convertFileSizeToBytes('-5', 'MB'), 'bytes')

// Compare with the original problem
console.log('\n📊 User Experience Improvement:')
console.log('❌ Before: User enters "100000000" (confusing!)')
console.log('✅ After: User enters "95.4" and selects "MB" from dropdown')
console.log('Result:', convertFileSizeToBytes('95.4', 'MB'), 'bytes')

console.log('\n� Common File Sizes:')
console.log('Small mod (5 MB):', convertFileSizeToBytes('5', 'MB'), 'bytes')
console.log('Medium mod (50 MB):', convertFileSizeToBytes('50', 'MB'), 'bytes')
console.log('Large mod (500 MB):', convertFileSizeToBytes('500', 'MB'), 'bytes')
console.log('Huge mod (2 GB):', convertFileSizeToBytes('2', 'GB'), 'bytes')
