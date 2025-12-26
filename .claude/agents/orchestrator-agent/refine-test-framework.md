# Refine Test Framework

Automated testing framework for validating refinements using Playwright.

## Overview

The Refine Test Framework creates and runs E2E tests to validate that refinements:
- ✅ Maintain existing functionality
- ✅ Fix identified problems
- ✅ Don't introduce regressions
- ✅ Meet visual and performance requirements

## Test Structure

```typescript
interface RefinementTest {
  // Metadata
  featureName: string;        // e.g., "Document Management"
  refinementType: string;     // "ui" | "functionality" | "performance"
  focusArea: string;          // e.g., "Document Upload Component"

  // Setup
  beforeAll: () => void;      // Login, navigate to page

  // Test Scenarios
  testScenarios: TestScenario[];

  // Cleanup
  afterAll: () => void;       // Logout, cleanup
}

interface TestScenario {
  name: string;               // e.g., "Upload Document"
  steps: PlaywrightStep[];    // Click, type, upload, etc.
  assertions: Assertion[];    // Verify results
  visual: VisualCheck[];      // Screenshot comparisons
  metrics: PerformanceMetric[]; // Load time, renders, etc.
}
```

## Test Categories

### 1. Functional Tests
Verify the feature still works after refinement

```typescript
// Example: Document Upload Refinement Test
test("Document Upload - Refined UI", async ({ page }) => {
  // Navigate
  await page.goto("/candidates/c123");
  await page.click("text=Dokumente");

  // Click upload button (now compact icon instead of button)
  const uploadTab = page.locator("text=Original CV");
  await uploadTab.click();

  // Verify upload area visible
  await expect(page.locator("text=Datei hierher ziehen")).toBeVisible();

  // Upload file
  await page.setInputFiles('input[type="file"]', "test-file.pdf");

  // Wait for upload to complete
  await page.waitForSelector("text=hochgeladen");

  // Verify document appears
  const document = page.locator("text=test-file.pdf");
  await expect(document).toBeVisible();

  // Verify compact buttons are visible
  const previewBtn = page.locator('button[title="Vorschau"]');
  await expect(previewBtn).toBeVisible();
});
```

### 2. Visual Tests
Verify UI changes are applied correctly

```typescript
// Example: Compact Layout Verification
test("Document Components - Compact Layout", async ({ page }) => {
  await page.goto("/candidates/c123");
  await page.click("text=Dokumente");

  // Take screenshot of upload area
  await expect(page).toHaveScreenshot("upload-area-compact.png", {
    maxDiffPixels: 100,  // Allow small differences
  });

  // Upload and verify document row is compact
  await uploadTestFile(page);
  await expect(page).toHaveScreenshot("document-row-compact.png");

  // Verify buttons are icon-only and tight
  const buttons = page.locator("button[title]");
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);

  // Check button size (should be h-8 w-8 = ~32px)
  const bbox = await buttons.first().boundingBox();
  expect(bbox?.width).toBeLessThan(40);
  expect(bbox?.height).toBeLessThan(40);
});
```

### 3. Performance Tests
Verify refinements improve or maintain performance

```typescript
// Example: Upload Performance Refinement
test("Document Upload - Performance Metrics", async ({ page }) => {
  await page.goto("/candidates/c123");
  const startTime = Date.now();

  // Measure render time
  await page.click("text=Dokumente");
  const renderTime = Date.now() - startTime;
  expect(renderTime).toBeLessThan(500); // Should render fast

  // Measure upload time
  const uploadStart = Date.now();
  await uploadTestFile(page);
  const uploadTime = Date.now() - uploadStart;
  expect(uploadTime).toBeLessThan(5000); // 5s max

  // Measure preview open time
  const previewStart = Date.now();
  await page.click('button[title="Vorschau"]');
  await page.waitForSelector("iframe");
  const previewTime = Date.now() - previewStart;
  expect(previewTime).toBeLessThan(1000); // 1s max
});
```

### 4. Regression Tests
Verify nothing broke

```typescript
// Example: No Regressions in Related Features
test("Document Management - No Regressions", async ({ page }) => {
  // Test that candidate profile still loads
  await page.goto("/candidates/c123");
  await expect(page).toContainText("John Doe");

  // Test that other sections still work
  await expect(page.locator("text=Skills")).toBeVisible();
  await expect(page.locator("text=Timeline")).toBeVisible();

  // Test navigation works
  await page.click("text=Skills");
  await expect(page).toContainText("Add Skill");

  // Test other operations
  const editBtn = page.locator("text=Edit");
  await expect(editBtn).toBeVisible();
});
```

## Test Generation Strategy

### For UI Refinements

```typescript
// Generate tests that verify:
// 1. Compact layout applied
// 2. Icons visible and sized correctly
// 3. Spacing is tight
// 4. No layout breaks on different screen sizes
// 5. Functionality still works

async function generateUIRefinementTests(
  featureName: string,
  componentFiles: string[]
): Promise<TestCode> {
  return `
test("${featureName} - Compact Layout", async ({ page }) => {
  // Navigation
  // Verification of compact layout
  // Screenshot comparison
  // Button size verification
});

test("${featureName} - Responsive Design", async ({ page }) => {
  // Test on mobile
  // Test on tablet
  // Test on desktop
});

test("${featureName} - Visual Consistency", async ({ page }) => {
  // Verify spacing tokens used
  // Verify icon sizes consistent
  // Verify color scheme applied
});
`;
}
```

### For Functionality Refinements

```typescript
// Generate tests that verify:
// 1. Original functionality preserved
// 2. Bug fixes applied
// 3. Improved error handling
// 4. Better validation

async function generateFunctionalityRefinementTests(
  featureName: string,
  fixedIssues: Issue[]
): Promise<TestCode> {
  return `
test("${featureName} - Core Functionality", async ({ page }) => {
  // Test happy path
  // Test edge cases
  // Test error scenarios
});

${fixedIssues.map(issue => `
test("${featureName} - Fixed: ${issue.description}", async ({ page }) => {
  // Verify issue is fixed
  // Test doesn't cause regression
});
`).join('\n')}
`;
}
```

### For Performance Refinements

```typescript
// Generate tests that verify:
// 1. Performance metrics improved
// 2. No performance regressions
// 3. Smooth interactions

async function generatePerformanceRefinementTests(
  featureName: string,
  optimizedAreas: string[]
): Promise<TestCode> {
  return `
test("${featureName} - Performance Metrics", async ({ page }) => {
  // Measure load times
  // Measure interaction responsiveness
  // Verify metrics improved
});

${optimizedAreas.map(area => `
test("${featureName} - Performance: ${area}", async ({ page }) => {
  // Specific performance test for area
});
`).join('\n')}
`;
}
```

## Test Execution Flow

```
1. GENERATE TESTS
   ├─ Analyze refinement type
   ├─ Identify test scenarios
   ├─ Generate test code
   └─ Save to tests/refine/

2. SETUP ENVIRONMENT
   ├─ Start dev server (npm run dev)
   ├─ Login (TEST_EMAIL/PASSWORD)
   ├─ Navigate to feature
   └─ Wait for ready

3. RUN TESTS
   ├─ Execute each test scenario
   ├─ Capture results (pass/fail)
   ├─ Take screenshots if visual tests
   ├─ Collect performance metrics
   └─ Log console output

4. ANALYZE RESULTS
   ├─ Count passes/failures
   ├─ Identify failure patterns
   ├─ Compare against baseline
   ├─ Extract performance data
   └─ Generate report

5. REPORT RESULTS
   ├─ Pass/Fail summary
   ├─ Failed test details
   ├─ Screenshots (visual diffs)
   ├─ Performance metrics
   └─ Recommendations
```

## Test Report Format

```json
{
  "refinement": {
    "feature": "Document Management",
    "type": "ui",
    "timestamp": "2025-12-20T10:30:00Z"
  },
  "testSummary": {
    "totalTests": 12,
    "passed": 11,
    "failed": 1,
    "skipped": 0,
    "duration": "45s"
  },
  "results": {
    "functional": {
      "passed": 8,
      "failed": 1,
      "details": [
        {
          "test": "Document Upload - Refined UI",
          "status": "PASS",
          "duration": "3.2s"
        },
        {
          "test": "Delete Confirmation Dialog",
          "status": "FAIL",
          "error": "Dialog not closing after delete",
          "screenshot": "tests/refine/screenshots/delete-dialog-fail.png"
        }
      ]
    },
    "visual": {
      "passed": 2,
      "failed": 0,
      "details": [
        {
          "test": "Document Row - Compact Layout",
          "status": "PASS",
          "screenshot": "upload-area-compact.png"
        }
      ]
    },
    "performance": {
      "passed": 1,
      "failed": 0,
      "metrics": {
        "renderTime": "245ms",
        "uploadTime": "2.1s",
        "previewOpenTime": "450ms"
      }
    }
  },
  "failures": [
    {
      "test": "Delete Confirmation Dialog",
      "error": "Expected dialog to close but still visible",
      "screenshot": "tests/refine/screenshots/delete-dialog-fail.png",
      "console": [
        "error: Dialog close mutation failed",
        "error: 404 Not Found"
      ],
      "recommendation": "Check delete mutation in useDocumentDelete hook"
    }
  ],
  "recommendations": [
    "Fix delete confirmation dialog close handler",
    "Re-run tests after fix"
  ]
}
```

## Test Scenarios by Feature Type

### Document Upload Refinement

```typescript
// Test scenarios for document upload refinement
const scenarios = [
  {
    name: "Upload Document via Drag & Drop",
    steps: [
      "Navigate to Candidate Detail",
      "Scroll to Documents section",
      "Drag PDF onto upload area",
      "Wait for upload",
      "Verify document appears"
    ],
    assertions: [
      "Document visible in list",
      "Metadata correct (size, date, uploader)",
      "No console errors"
    ]
  },
  {
    name: "Upload via File Picker",
    steps: [
      "Click upload area",
      "Select file from picker",
      "Click Upload button",
      "Wait for complete",
      "Verify in list"
    ]
  },
  {
    name: "Preview Uploaded Document",
    steps: [
      "Click preview icon (eye button)",
      "Wait for modal to open",
      "Verify PDF shows",
      "Close modal"
    ]
  },
  {
    name: "Delete Document",
    steps: [
      "Click delete icon (trash button)",
      "Confirm in dialog",
      "Verify document gone"
    ]
  }
];
```

## Success Criteria

A refinement test passes if:

### Functional Tests
- ✅ All user workflows complete successfully
- ✅ Data is persisted correctly
- ✅ No console errors or warnings
- ✅ Error handling works properly

### Visual Tests
- ✅ Layout is compact (spacing reduced)
- ✅ Icons are visible and sized correctly
- ✅ No layout breaks on any screen size
- ✅ Screenshot diff is minimal (< 100 pixels)

### Performance Tests
- ✅ Load time ≤ 500ms
- ✅ Interaction response ≤ 200ms
- ✅ No memory leaks (DevTools verified)
- ✅ No jank (60fps interactions)

### Regression Tests
- ✅ Related features still work
- ✅ No errors in other sections
- ✅ Navigation intact
- ✅ Data integrity preserved

## Debug Information Captured

When tests fail or screenshot differences detected:

```typescript
{
  // Visual
  beforeScreenshot: "path/to/before.png",
  afterScreenshot: "path/to/after.png",
  diffScreenshot: "path/to/diff.png",

  // Console
  consoleLogs: [
    { level: "log", message: "..." },
    { level: "error", message: "..." },
    { level: "warn", message: "..." }
  ],

  // Network
  networkRequests: [
    { method: "GET", url: "...", status: 200 },
    { method: "POST", url: "...", status: 404, error: "..." }
  ],

  // Performance
  performanceMetrics: {
    navigationTiming: { ... },
    paintTiming: { ... },
    resourceTiming: { ... }
  },

  // State
  domState: "... HTML before failure",
  reactState: "... React component state",
}
```

## Integration with Debug Agent

If tests fail, the Debug Agent:

1. **Analyzes** console logs and network errors
2. **Takes** screenshots at each step
3. **Identifies** root cause
4. **Generates** fix recommendations
5. **Suggests** which sub-agent should fix it

```
Failed Test: Delete Confirmation Dialog

Root Cause Analysis:
- Dialog renders correctly
- Delete button is clickable
- Delete mutation is triggered
- BUT: Mutation returns 404 error
- Issue: document_id not found or RLS policy blocking

Recommendation:
→ Check useDocumentDelete hook
→ Verify RLS policies allow delete
→ Check if document exists before delete

Fix Applied By: Backend Agent
```

---

**Status:** 📋 Framework Designed, Ready for Test Generation
**Next:** Implement test generator and executor
