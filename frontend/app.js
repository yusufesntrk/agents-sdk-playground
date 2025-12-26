/**
 * SDLC Multi-Agent System Frontend
 *
 * Handles WebSocket connection, task management, and UI updates.
 */

class SDLCApp {
    constructor() {
        this.ws = null;
        this.tasks = new Map();
        this.messageCount = 0;
        this.toolCount = 0;

        this.init();
    }

    init() {
        this.connectWebSocket();
        this.bindEvents();
    }

    // WebSocket Connection
    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.updateConnectionStatus(true);
            console.log('🔌 WebSocket connected');
        };

        this.ws.onclose = () => {
            this.updateConnectionStatus(false);
            console.log('❌ WebSocket disconnected');
            // Reconnect after 3 seconds
            setTimeout(() => this.connectWebSocket(), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
    }

    updateConnectionStatus(connected) {
        const el = document.getElementById('connection-status');
        if (connected) {
            el.textContent = '🟢 Connected';
            el.classList.add('connected');
        } else {
            el.textContent = '⚪ Disconnected';
            el.classList.remove('connected');
        }
    }

    // Message Handling
    handleMessage(message) {
        this.messageCount++;
        this.updateStats();

        switch (message.type) {
            case 'init':
                this.handleInit(message);
                break;
            case 'task_update':
            case 'status':
                this.handleTaskUpdate(message.task);
                break;
            case 'task_deleted':
                this.handleTaskDeleted(message.task_id);
                break;
            case 'agent_message':
                this.handleAgentMessage(message);
                break;
            case 'planner':
            case 'builder':
            case 'reviewer':
                this.handleAgentEvent(message.type, message);
                break;
            case 'complete':
                this.handleComplete(message);
                break;
            case 'error':
                this.handleError(message);
                break;
        }
    }

    handleInit(message) {
        // Load initial tasks
        if (message.tasks) {
            message.tasks.forEach(task => {
                this.tasks.set(task.id, task);
                this.renderTask(task);
            });
        }
        this.logActivity('system', 'Connected', `${message.connection_count} client(s) connected`);
    }

    handleTaskUpdate(task) {
        if (!task) return;

        const oldTask = this.tasks.get(task.id);
        this.tasks.set(task.id, task);

        // Remove from old column if status changed
        if (oldTask && oldTask.status !== task.status) {
            const oldCard = document.querySelector(`.task-card[data-id="${task.id}"]`);
            if (oldCard) oldCard.remove();
        }

        this.renderTask(task);
        this.logActivity('system', 'Task Update', `${task.title} → ${task.status}`);
    }

    handleTaskDeleted(taskId) {
        this.tasks.delete(taskId);
        const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
        if (card) card.remove();
    }

    handleAgentMessage(message) {
        this.logActivity(message.agent, message.event, message.data?.substring?.(0, 100) || '');
    }

    handleAgentEvent(agent, event) {
        if (event.type === 'tool_call') {
            this.toolCount++;
            this.updateStats();
            this.logActivity(agent, 'Tool Call', `${event.tool}(${JSON.stringify(event.input).substring(0, 50)}...)`);
        } else if (event.type === 'text') {
            this.logActivity(agent, 'Response', event.content?.substring?.(0, 100) || '');
        } else if (event.type === 'complete') {
            this.logActivity(agent, 'Complete', `${event.stats?.duration_ms}ms, $${event.stats?.cost_usd?.toFixed(4)}`);
        }
    }

    handleComplete(message) {
        if (message.task) {
            this.handleTaskUpdate(message.task);
        }
        this.logActivity('system', 'Pipeline Complete', '✅');
    }

    handleError(message) {
        console.error('Error:', message);
        this.logActivity('error', 'Error', message.message || 'Unknown error');
    }

    // UI Rendering
    renderTask(task) {
        const container = document.getElementById(`${task.status}-tasks`);
        if (!container) return;

        // Check if card already exists
        let card = document.querySelector(`.task-card[data-id="${task.id}"]`);

        if (!card) {
            card = document.createElement('div');
            card.className = 'task-card';
            card.dataset.id = task.id;
            container.appendChild(card);
        }

        // Processing state
        if (['planning', 'building', 'reviewing'].includes(task.status)) {
            card.classList.add('processing');
        } else {
            card.classList.remove('processing');
        }

        card.innerHTML = `
            <div class="title">${this.escapeHtml(task.title)}</div>
            <div class="description">${this.escapeHtml(task.description)}</div>
            <div class="meta">
                <span>${task.files_modified?.length || 0} modified, ${task.files_created?.length || 0} created</span>
                ${task.review_status ? `<span>${task.review_status}</span>` : ''}
            </div>
            ${task.status === 'todo' ? '<button class="start-btn" onclick="app.startTask(\'' + task.id + '\')">Start Pipeline</button>' : ''}
            ${task.error ? '<div class="error" style="color: var(--accent-red); font-size: 0.7rem; margin-top: 0.5rem;">' + this.escapeHtml(task.error) + '</div>' : ''}
        `;
    }

    updateStats() {
        document.getElementById('message-count').textContent = `Messages: ${this.messageCount}`;
        document.getElementById('tool-count').textContent = `Tool Calls: ${this.toolCount}`;
    }

    logActivity(agent, event, data) {
        const feed = document.getElementById('activity-feed');
        const item = document.createElement('div');
        item.className = `activity-item ${agent === 'error' ? 'error' : ''} ${event === 'Tool Call' ? 'tool-call' : ''}`;

        const time = new Date().toLocaleTimeString();
        item.innerHTML = `
            <span class="agent ${agent}">[${agent}]</span>
            <span class="event">${event}:</span>
            <span class="data">${this.escapeHtml(data || '')}</span>
            <span style="float: right; color: var(--text-secondary)">${time}</span>
        `;

        feed.insertBefore(item, feed.firstChild);

        // Limit to 100 items
        while (feed.children.length > 100) {
            feed.removeChild(feed.lastChild);
        }
    }

    // Event Handlers
    bindEvents() {
        document.getElementById('create-btn').addEventListener('click', () => this.createTask());

        document.getElementById('task-title').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createTask();
        });
    }

    async createTask() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();

        if (!title || !description) {
            alert('Please enter both title and description');
            return;
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                document.getElementById('task-title').value = '';
                document.getElementById('task-description').value = '';
            }
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    }

    async startTask(taskId) {
        try {
            await fetch(`/api/tasks/${taskId}/move`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: 'plan' })
            });
        } catch (error) {
            console.error('Failed to start task:', error);
        }
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize App
const app = new SDLCApp();
