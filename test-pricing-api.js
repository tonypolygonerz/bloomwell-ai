#!/usr/bin/env node

/**
 * Automated Pricing Page API Tests
 * Tests what can be verified without browser UI interaction
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`${BASE_URL}${path}`, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () =>
          resolve({ status: res.statusCode, data, headers: res.headers })
        );
      })
      .on('error', reject);
  });
}

async function testPricingPageLoad() {
  log('\n📄 TEST 1: Pricing Page Load', 'bold');
  try {
    const { status, data } = await makeRequest('/pricing');

    if (status === 200) {
      log('✅ PASS: Page loads with status 200', 'green');

      // Check for key components in HTML
      const checks = [
        { name: 'PricingCard component', pattern: /PricingCard|pricing/i },
        { name: 'PricingToggle component', pattern: /Monthly|Annual/i },
        { name: 'Bloomwell AI branding', pattern: /Bloomwell AI/i },
        { name: 'Free trial CTA', pattern: /14-day|free trial/i },
        { name: 'Price display', pattern: /\$\d+\.\d+\/month/i },
      ];

      checks.forEach(check => {
        if (check.pattern.test(data)) {
          log(`  ✅ Found: ${check.name}`, 'green');
        } else {
          log(`  ❌ Missing: ${check.name}`, 'red');
        }
      });

      return true;
    } else {
      log(`❌ FAIL: Status ${status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function testEnvironmentVariables() {
  log('\n🔐 TEST 2: Environment Variables (Client-Side Check)', 'bold');

  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_STRIPE_PRICE_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ANNUAL',
    'NEXT_PUBLIC_APP_URL',
  ];

  log(
    '⚠️  Note: Cannot directly check NEXT_PUBLIC_ vars from Node.js',
    'yellow'
  );
  log('   These are embedded in the client bundle during build', 'yellow');
  log('   Manual browser console check required', 'yellow');

  const envFile = require('fs').readFileSync('.env.local', 'utf8');

  requiredVars.forEach(varName => {
    if (envFile.includes(varName)) {
      log(`  ✅ ${varName} defined in .env.local`, 'green');
    } else {
      log(`  ❌ ${varName} missing from .env.local`, 'red');
    }
  });

  // Check expected price IDs
  const expectedMonthly = 'price_1SAas1GpZiQKTBAtcgtB71u4';
  const expectedAnnual = 'price_1SAatSGpZiQKTBAtmOVcBQZG';

  if (envFile.includes(expectedMonthly)) {
    log(`  ✅ Monthly price ID matches: ${expectedMonthly}`, 'green');
  } else {
    log(`  ❌ Monthly price ID mismatch`, 'red');
  }

  if (envFile.includes(expectedAnnual)) {
    log(`  ✅ Annual price ID matches: ${expectedAnnual}`, 'green');
  } else {
    log(`  ❌ Annual price ID mismatch`, 'red');
  }
}

async function testPricingLogic() {
  log('\n🧮 TEST 3: Pricing Logic Verification', 'bold');

  // Read the PricingCard component
  const fs = require('fs');
  const pricingCardCode = fs.readFileSync(
    'src/components/PricingCard.tsx',
    'utf8'
  );

  // Extract pricing values using regex
  const monthlyMatch = pricingCardCode.match(/const monthlyPrice = ([\d.]+);/);
  const annualMatch = pricingCardCode.match(/const annualPrice = ([\d.]+);/);
  const annualTotalMatch = pricingCardCode.match(
    /const annualTotal = ([\d.]+);/
  );

  if (monthlyMatch && annualMatch && annualTotalMatch) {
    const monthlyPrice = parseFloat(monthlyMatch[1]);
    const annualPrice = parseFloat(annualMatch[1]);
    const annualTotal = parseFloat(annualTotalMatch[1]);

    log(`  Current Values:`, 'blue');
    log(`    Monthly: $${monthlyPrice}/month`);
    log(`    Annual: $${annualPrice}/month (billed at $${annualTotal}/year)`);

    // Calculate savings
    const monthlyYearly = monthlyPrice * 12;
    const savings = monthlyYearly - annualTotal;
    const savingsPercent = (savings / monthlyYearly) * 100;

    log(`\n  Calculations:`, 'blue');
    log(`    Monthly plan × 12 = $${monthlyYearly.toFixed(2)}/year`);
    log(`    Annual savings = $${savings.toFixed(2)}`);
    log(`    Savings percentage = ${savingsPercent.toFixed(1)}%`);

    // Check against expected values
    log(`\n  Expected Values (per business requirements):`, 'blue');
    log(`    Monthly: $29.99/month`);
    log(`    Annual: $17.42/month (billed at $209/year)`);
    log(`    Savings: 42%`);

    if (monthlyPrice === 29.99) {
      log(`  ✅ Monthly price correct`, 'green');
    } else {
      log(
        `  ❌ Monthly price incorrect (is $${monthlyPrice}, should be $29.99)`,
        'red'
      );
    }

    if (annualTotal === 209.0) {
      log(`  ✅ Annual total correct`, 'green');
    } else {
      log(
        `  ❌ Annual total incorrect (is $${annualTotal}, should be $209.00)`,
        'red'
      );
    }

    if (Math.abs(annualPrice - 17.42) < 0.01) {
      log(`  ✅ Annual monthly price correct`, 'green');
    } else {
      log(
        `  ❌ Annual monthly price incorrect (is $${annualPrice}, should be $17.42)`,
        'red'
      );
    }
  } else {
    log(`  ❌ Could not extract pricing values from code`, 'red');
  }
}

async function testSavingsBadge() {
  log('\n🏷️  TEST 4: Savings Badge Logic', 'bold');

  const fs = require('fs');
  const toggleCode = fs.readFileSync(
    'src/components/PricingToggle.tsx',
    'utf8'
  );

  // Check for "Save X%" badge
  const badgeMatch = toggleCode.match(/Save (\d+)%/);

  if (badgeMatch) {
    const badgePercent = parseInt(badgeMatch[1]);
    log(`  Found badge: "Save ${badgePercent}%"`, 'blue');

    // Based on current pricing (24.99/251.88), 16% is correct
    // Based on expected pricing (29.99/209), should be 42%
    log(`\n  Validation:`, 'blue');
    log(`    Current code shows: Save ${badgePercent}%`);
    log(`    For current pricing ($24.99/$251.88): 16% is correct ✅`);
    log(`    For expected pricing ($29.99/$209): Should be 42% ❌`);

    if (badgePercent === 42) {
      log(`  ✅ Badge matches expected pricing`, 'green');
    } else {
      log(`  ⚠️  Badge needs update when pricing is fixed`, 'yellow');
    }
  } else {
    log(`  ❌ Could not find savings badge in code`, 'red');
  }
}

async function testStripeCheckoutAPI() {
  log('\n💳 TEST 5: Stripe Checkout API', 'bold');
  log('  ⚠️  Requires authentication - skipping automated test', 'yellow');
  log('  Manual test required:', 'blue');
  log('    1. Log in to the app');
  log('    2. Navigate to /pricing');
  log('    3. Click "Upgrade to Monthly Plan"');
  log('    4. Verify Stripe checkout opens with correct price');
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'bold');
  log('🧪 BLOOMWELL AI - PRICING PAGE AUTOMATED TESTS', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  log(`Testing against: ${BASE_URL}`, 'blue');
  log(`Time: ${new Date().toLocaleString()}\n`, 'blue');

  try {
    await testPricingPageLoad();
    await testEnvironmentVariables();
    await testPricingLogic();
    await testSavingsBadge();
    await testStripeCheckoutAPI();

    log('\n' + '='.repeat(60), 'bold');
    log('📊 TEST SUMMARY', 'bold');
    log('='.repeat(60), 'bold');

    log('\n✅ Automated Tests Complete', 'green');
    log('\n⚠️  MANUAL TESTING REQUIRED:', 'yellow');
    log('  1. Open http://localhost:3000/pricing in browser', 'blue');
    log('  2. Follow steps in PRICING_TOGGLE_TEST_GUIDE.md', 'blue');
    log('  3. Fill in the test results', 'blue');
    log('  4. Create PRICING_TOGGLE_TEST_REPORT.md with findings', 'blue');

    log('\n🐛 KNOWN ISSUES:', 'yellow');
    log("  - Pricing values don't match business requirements", 'red');
    log('  - Monthly should be $29.99 (currently $24.99)', 'red');
    log('  - Annual should be $209/year (currently $251.88)', 'red');
    log('  - Savings should be 42% (currently 16%)', 'red');

    log('\n' + '='.repeat(60) + '\n', 'bold');
  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };

