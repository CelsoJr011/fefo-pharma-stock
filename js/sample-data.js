// Fictional data — product names are generic, batches and locations are made up.
// Expiry dates are built relative to today. With fixed dates, the demo would
// slowly turn into a screen full of "expired" batches as time goes by.

function inDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildSampleBatches() {
  return [
    { sku: 'DIP-500', product: 'Dipyrone 500mg — 10 tablets', batch: 'L24A118', expiry: inDays(-5), quantity: 40, location: 'A-01-02', storage: 'ambient', blocked: false },
    { sku: 'DIP-500', product: 'Dipyrone 500mg — 10 tablets', batch: 'L24B207', expiry: inDays(18), quantity: 120, location: 'A-01-03', storage: 'ambient', blocked: false },
    { sku: 'DIP-500', product: 'Dipyrone 500mg — 10 tablets', batch: 'L24C311', expiry: inDays(75), quantity: 300, location: 'A-02-01', storage: 'ambient', blocked: false },
    { sku: 'DIP-500', product: 'Dipyrone 500mg — 10 tablets', batch: 'L25A042', expiry: inDays(240), quantity: 500, location: 'A-02-04', storage: 'ambient', blocked: false },

    { sku: 'AMX-875', product: 'Amoxicillin 875mg — 14 tablets', batch: 'AX9921', expiry: inDays(45), quantity: 60, location: 'B-03-01', storage: 'ambient', blocked: false },
    { sku: 'AMX-875', product: 'Amoxicillin 875mg — 14 tablets', batch: 'AX9988', expiry: inDays(45), quantity: 25, location: 'B-03-02', storage: 'ambient', blocked: false },
    { sku: 'AMX-875', product: 'Amoxicillin 875mg — 14 tablets', batch: 'AX1003', expiry: inDays(190), quantity: 200, location: 'B-04-01', storage: 'ambient', blocked: true },

    { sku: 'INS-NPH', product: 'NPH Insulin 100 IU/ml — vial', batch: 'IN5520', expiry: inDays(12), quantity: 30, location: 'CF-01-01', storage: 'cold', blocked: false },
    { sku: 'INS-NPH', product: 'NPH Insulin 100 IU/ml — vial', batch: 'IN5604', expiry: inDays(130), quantity: 80, location: 'CF-01-02', storage: 'cold', blocked: false },

    { sku: 'VTC-1G', product: 'Vitamin C 1g — 10 effervescent', batch: 'VC7713', expiry: inDays(95), quantity: 150, location: 'C-05-02', storage: 'ambient', blocked: false },
    { sku: 'VTC-1G', product: 'Vitamin C 1g — 10 effervescent', batch: 'VC7790', expiry: inDays(400), quantity: 220, location: 'C-05-03', storage: 'ambient', blocked: false },

    { sku: 'SRO-500', product: 'Saline solution 0.9% — 500ml', batch: 'SF3301', expiry: inDays(28), quantity: 90, location: 'D-01-01', storage: 'ambient', blocked: false },
    { sku: 'SRO-500', product: 'Saline solution 0.9% — 500ml', batch: 'SF3410', expiry: inDays(310), quantity: 140, location: 'D-01-02', storage: 'ambient', blocked: false },
  ];
}
