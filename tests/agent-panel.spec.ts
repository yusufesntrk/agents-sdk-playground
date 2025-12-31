import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';

test.describe('Agent Control Panel - Agent Tree Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for WebSocket connection
    await page.waitForSelector('#connection-status.connected', { timeout: 5000 }).catch(() => {
      // Connection might not establish in test environment
    });
  });

  test('Agent-Tree Section is visible', async ({ page }) => {
    // Check that the agent section exists in sidebar
    const agentSection = page.locator('.sidebar-section.agent-section');
    await expect(agentSection).toBeVisible();

    // Check the header exists
    const agentHeader = agentSection.locator('.sidebar-header h2');
    await expect(agentHeader).toHaveText('Agents');
  });

  test('Agent tree displays agents or empty state correctly', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check agent tree is visible
    const agentTree = page.locator('#agent-tree');
    await expect(agentTree).toBeVisible();

    // Agent tree should either show agents or empty state
    const emptyState = agentTree.locator('.empty-state');
    const agentNodes = agentTree.locator('.agent-tree-item');

    // Either empty state or agent nodes should be present
    const hasEmptyState = await emptyState.count() > 0;
    const hasAgents = await agentNodes.count() > 0;

    // One of these conditions must be true
    expect(hasEmptyState || hasAgents).toBeTruthy();

    // If empty state is shown, it should have correct text
    if (hasEmptyState && !hasAgents) {
      await expect(emptyState).toHaveText('No agents');
    }
  });

  test('Create Agent Button is visible and clickable', async ({ page }) => {
    const createButton = page.locator('#create-agent-btn');
    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveText('+ Create');
    await expect(createButton).toBeEnabled();

    // Click should open the modal
    await createButton.click();

    // Verify modal opens
    const modal = page.locator('#agent-modal');
    await expect(modal).not.toHaveClass(/hidden/);
  });

  test('Agent stats counters are displayed', async ({ page }) => {
    const totalCount = page.locator('#agent-total-count');
    const runningCount = page.locator('#agent-running-count');

    await expect(totalCount).toBeVisible();
    await expect(runningCount).toBeVisible();

    // Initial state should show 0
    await expect(totalCount).toContainText('Total:');
    await expect(runningCount).toContainText('Running:');
  });
});

test.describe('Agent Control Panel - Create Agent Modal Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Open the modal
    await page.click('#create-agent-btn');
  });

  test('Modal opens when clicking "+ Create" button', async ({ page }) => {
    const modal = page.locator('#agent-modal');
    await expect(modal).toBeVisible();
    await expect(modal).not.toHaveClass(/hidden/);
  });

  test('Modal contains all required form fields', async ({ page }) => {
    // Check Agent Name field
    const nameInput = page.locator('#agent-name');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('placeholder', 'e.g., planner, builder, reviewer');

    // Check Initial Prompt field
    const promptTextarea = page.locator('#agent-prompt');
    await expect(promptTextarea).toBeVisible();
    await expect(promptTextarea).toHaveAttribute('placeholder', 'What should this agent do?');

    // Check System Prompt field
    const systemPromptTextarea = page.locator('#agent-system-prompt');
    await expect(systemPromptTextarea).toBeVisible();
    await expect(systemPromptTextarea).toHaveAttribute('placeholder', 'Custom system prompt...');

    // Check Parent Agent select
    const parentSelect = page.locator('#agent-parent');
    await expect(parentSelect).toBeVisible();

    // Check default option
    const defaultOption = parentSelect.locator('option[value=""]');
    await expect(defaultOption).toHaveText('No parent (root agent)');

    // Check Allowed Tools field
    const toolsInput = page.locator('#agent-tools');
    await expect(toolsInput).toBeVisible();
    await expect(toolsInput).toHaveAttribute('placeholder', 'e.g., Read, Write, Bash (comma separated)');
  });

  test('Modal header shows "Create Agent" title', async ({ page }) => {
    const modalHeader = page.locator('#agent-modal .modal-header h3');
    await expect(modalHeader).toHaveText('Create Agent');
  });

  test('Modal has Cancel and Create Agent buttons', async ({ page }) => {
    const cancelButton = page.locator('#agent-modal-cancel');
    const createButton = page.locator('#agent-modal-create');

    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toHaveText('Cancel');

    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveText('Create Agent');
  });

  test('Modal closes when clicking Cancel button', async ({ page }) => {
    const modal = page.locator('#agent-modal');
    await expect(modal).toBeVisible();

    await page.click('#agent-modal-cancel');

    await expect(modal).toHaveClass(/hidden/);
  });

  test('Modal closes when pressing Escape key', async ({ page }) => {
    const modal = page.locator('#agent-modal');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(modal).toHaveClass(/hidden/);
  });

  test('Modal closes when clicking X button', async ({ page }) => {
    const modal = page.locator('#agent-modal');
    await expect(modal).toBeVisible();

    await page.click('#agent-modal-close');

    await expect(modal).toHaveClass(/hidden/);
  });

  test('Modal closes when clicking overlay backdrop', async ({ page }) => {
    const modal = page.locator('#agent-modal');
    await expect(modal).toBeVisible();

    // Click on the modal backdrop (outside the modal-content)
    await page.locator('#agent-modal').click({ position: { x: 10, y: 10 } });

    await expect(modal).toHaveClass(/hidden/);
  });
});

test.describe('Agent Control Panel - Live Logs Panel Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Logs panel is initially hidden (no visible class)', async ({ page }) => {
    const logsPanel = page.locator('#agent-logs-panel');

    // Panel should NOT have the visible class initially
    await expect(logsPanel).not.toHaveClass(/visible/);

    // The panel exists but is collapsed via CSS (height: 0 in stylesheet)
    // Due to border, it may have 1px height, so we check the class instead
    const hasVisibleClass = await logsPanel.evaluate(el => el.classList.contains('visible'));
    expect(hasVisibleClass).toBe(false);
  });

  test('Logs panel has correct header structure', async ({ page }) => {
    const logsHeader = page.locator('#agent-logs-panel .logs-header');
    await expect(logsHeader).toBeAttached();

    const headerTitle = logsHeader.locator('h2');
    await expect(headerTitle).toHaveText('Agent Logs');

    const closeButton = page.locator('#logs-close');
    await expect(closeButton).toBeAttached();
  });

  test('Logs tabs container exists', async ({ page }) => {
    const logsTabs = page.locator('#logs-tabs');
    await expect(logsTabs).toBeAttached();
  });

  test('Logs content shows empty state initially', async ({ page }) => {
    const logsContent = page.locator('#logs-content');
    await expect(logsContent).toBeAttached();

    const emptyState = logsContent.locator('.empty-state');
    await expect(emptyState).toHaveText('Select an agent to view logs');
  });

  test('Close button element exists in logs panel', async ({ page }) => {
    const closeButton = page.locator('#logs-close');
    await expect(closeButton).toBeAttached();
    await expect(closeButton).toHaveText('\u00d7'); // &times; character
  });
});

test.describe('Agent Control Panel - API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('GET /api/agents returns agent tree data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/agents`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('agents');
    expect(data).toHaveProperty('total_count');
    expect(data).toHaveProperty('running_count');
    expect(Array.isArray(data.agents)).toBeTruthy();
  });

  test('POST /api/agents creates a new agent', async ({ request }) => {
    const newAgent = {
      name: 'test-agent-' + Date.now(),
      prompt: 'Test agent for E2E testing',
      system_prompt: 'You are a test agent.',
      parent_id: null,
      allowed_tools: ['Read', 'Glob']
    };

    const response = await request.post(`${BASE_URL}/api/agents`, {
      data: newAgent
    });

    // Agent creation should succeed
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const agent = await response.json();
    expect(agent).toHaveProperty('id');
    expect(agent.name).toBe(newAgent.name);
    // Note: The API response uses AgentResponse model which doesn't include 'prompt'
    // It includes system_prompt, allowed_tools, status, etc.
    expect(agent).toHaveProperty('status');
    expect(agent).toHaveProperty('created_at');

    // Cleanup: Delete the created agent
    if (agent.id) {
      await request.delete(`${BASE_URL}/api/agents/${agent.id}`);
    }
  });

  test('POST /api/agents with valid minimal data succeeds', async ({ request }) => {
    // The API accepts empty strings but creates an agent
    // This test verifies the API endpoint works with minimal data
    const response = await request.post(`${BASE_URL}/api/agents`, {
      data: {
        name: 'minimal-test-' + Date.now(),
        prompt: 'minimal prompt'
      }
    });

    // API accepts this and creates an agent
    expect(response.ok()).toBeTruthy();

    const agent = await response.json();
    if (agent.id) {
      // Cleanup
      await request.delete(`${BASE_URL}/api/agents/${agent.id}`);
    }
  });

  test('DELETE /api/agents/{id} deletes an agent', async ({ request }) => {
    // First create an agent to delete
    const newAgent = {
      name: 'delete-test-agent-' + Date.now(),
      prompt: 'Agent to be deleted'
    };

    const createResponse = await request.post(`${BASE_URL}/api/agents`, {
      data: newAgent
    });

    expect(createResponse.ok()).toBeTruthy();
    const agent = await createResponse.json();
    const agentId = agent.id;

    // Now delete the agent
    const deleteResponse = await request.delete(`${BASE_URL}/api/agents/${agentId}`);

    expect(deleteResponse.ok()).toBeTruthy();
    expect(deleteResponse.status()).toBe(200);

    // Verify agent is deleted by checking the agents list
    const getResponse = await request.get(`${BASE_URL}/api/agents`);
    const data = await getResponse.json();

    const deletedAgent = data.agents?.find((a: any) => a.id === agentId);
    expect(deletedAgent).toBeUndefined();
  });

  test('DELETE /api/agents/{id} with non-existent ID returns 404', async ({ request }) => {
    const fakeId = 'non-existent-id-12345';
    const response = await request.delete(`${BASE_URL}/api/agents/${fakeId}`);

    expect(response.status()).toBe(404);
  });
});

test.describe('Agent Control Panel - Header and Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Page title is "Agent Control Panel"', async ({ page }) => {
    await expect(page).toHaveTitle('Agent Control Panel');
  });

  test('Header displays correct title', async ({ page }) => {
    const headerTitle = page.locator('header h1');
    await expect(headerTitle).toHaveText('Agent Control Panel');
  });

  test('Stats section displays message and tool counts', async ({ page }) => {
    const messageCount = page.locator('#message-count');
    const toolCount = page.locator('#tool-count');

    await expect(messageCount).toBeVisible();
    await expect(toolCount).toBeVisible();

    await expect(messageCount).toContainText('Messages:');
    await expect(toolCount).toContainText('Tool');
  });

  test('Connection status indicator exists', async ({ page }) => {
    const connectionStatus = page.locator('#connection-status');
    await expect(connectionStatus).toBeVisible();
  });
});

test.describe('Agent Control Panel - Sidebar Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Sidebar is visible with correct sections', async ({ page }) => {
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toBeVisible();

    // Repositories section
    const repoHeader = sidebar.locator('.sidebar-header h2').first();
    await expect(repoHeader).toHaveText('Repositories');

    // Agent section
    const agentHeader = sidebar.locator('.agent-section .sidebar-header h2');
    await expect(agentHeader).toHaveText('Agents');
  });

  test('Connect repo button exists but is disabled without login', async ({ page }) => {
    const connectButton = page.locator('#connect-repo-btn');
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toBeDisabled();
  });

  test('Repo list shows login prompt when not authenticated', async ({ page }) => {
    const repoList = page.locator('#repo-list');
    await expect(repoList).toBeVisible();

    const emptyState = repoList.locator('.empty-state');
    await expect(emptyState).toContainText('Login to connect repos');
  });
});

test.describe('Agent Control Panel - Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Kanban board has all 5 columns', async ({ page }) => {
    const board = page.locator('.board');
    await expect(board).toBeVisible();

    const columns = page.locator('.column');
    await expect(columns).toHaveCount(5);

    // Check column headers
    await expect(page.locator('.column[data-status="todo"] h2')).toHaveText('Todo');
    await expect(page.locator('.column[data-status="planning"] h2')).toHaveText('Planning');
    await expect(page.locator('.column[data-status="building"] h2')).toHaveText('Building');
    await expect(page.locator('.column[data-status="reviewing"] h2')).toHaveText('Reviewing');
    await expect(page.locator('.column[data-status="shipped"] h2')).toHaveText('Shipped');
  });

  test('Task creation form exists with input fields', async ({ page }) => {
    const createSection = page.locator('.create-task');
    await expect(createSection).toBeVisible();

    const titleInput = page.locator('#task-title');
    const descriptionInput = page.locator('#task-description');
    const createButton = page.locator('#create-btn');

    await expect(titleInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();
    await expect(createButton).toBeVisible();

    await expect(titleInput).toHaveAttribute('placeholder', 'Task Title');
    await expect(descriptionInput).toHaveAttribute('placeholder', 'Task Description (what should be done?)');
    await expect(createButton).toHaveText('Create Task');
  });
});

test.describe('Agent Control Panel - Activity Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Activity log section exists', async ({ page }) => {
    const activityLog = page.locator('.activity-log');
    await expect(activityLog).toBeVisible();

    const header = activityLog.locator('h2');
    await expect(header).toHaveText('Agent Activity');
  });

  test('Activity feed container exists', async ({ page }) => {
    const activityFeed = page.locator('#activity-feed');
    await expect(activityFeed).toBeVisible();
  });
});
