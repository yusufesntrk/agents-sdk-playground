/**
 * Agent Control Panel - Chat Interface
 */

class AgentControlPanel {
    constructor() {
        this.ws = null;
        this.user = null;
        this.repos = new Map();
        this.agents = new Map();
        this.activeRepoId = null;
        this.messages = [];
        this.currentResponse = null;
        this.isProcessing = false;
        this.messageCount = 0;
        this.toolCount = 0;
        this.githubRepos = [];

        this.init();
    }

    async init() {
        await this.checkAuth();
        this.connectWebSocket();
        this.bindEvents();
        this.updateSendButton();
    }

    // ==================== Authentication ====================

    async checkAuth() {
        try {
            const response = await fetch('/auth/me');
            const data = await response.json();

            if (data.user) {
                this.user = data.user;
                this.showLoggedIn();
                await this.loadConnectedRepos();
            } else {
                // Auto-login wenn GITHUB_TOKEN gesetzt ist
                // Redirect zu /auth/login triggert auto-login
                console.log('Not logged in, triggering auto-login...');
                window.location.href = '/auth/login';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoggedOut();
        }
    }

    showLoggedIn() {
        document.getElementById('login-btn').classList.add('hidden');
        const userInfo = document.getElementById('user-info');
        userInfo.classList.remove('hidden');

        document.getElementById('user-avatar').src = this.user.avatar_url;
        document.getElementById('user-name').textContent = this.user.name || this.user.login;

        document.getElementById('connect-repo-btn').disabled = false;
    }

    showLoggedOut() {
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('connect-repo-btn').disabled = true;
    }

    // ==================== Repository Management ====================

    async loadConnectedRepos() {
        try {
            const response = await fetch('/api/repos');
            if (response.ok) {
                const repos = await response.json();
                this.repos.clear();
                repos.forEach(repo => this.repos.set(repo.id, repo));
                this.renderRepoSelector();
            }
        } catch (error) {
            console.error('Failed to load repos:', error);
        }
    }

    renderRepoSelector() {
        const select = document.getElementById('active-repo');
        select.innerHTML = '<option value="">Select a repository...</option>';

        this.repos.forEach((repo, id) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = repo.name;
            // 'ready' = cloned, 'linked' = local repo linked
            const isUsable = repo.status === 'ready' || repo.status === 'linked';
            if (!isUsable) {
                option.textContent += ` (${repo.status})`;
                option.disabled = true;
            }
            select.appendChild(option);
        });

        // Restore active repo if set
        if (this.activeRepoId && this.repos.has(this.activeRepoId)) {
            select.value = this.activeRepoId;
            this.updateRepoStatus();
        }
    }

    selectRepo(repoId) {
        this.activeRepoId = repoId || null;
        this.updateRepoStatus();
        this.updateSendButton();
    }

    updateRepoStatus() {
        const statusEl = document.getElementById('repo-status');
        if (!this.activeRepoId) {
            statusEl.textContent = '';
            statusEl.className = 'repo-status';
            return;
        }

        const repo = this.repos.get(this.activeRepoId);
        if (repo) {
            if (repo.status === 'ready' || repo.status === 'linked') {
                const icon = repo.is_linked ? '🔗' : '✓';
                statusEl.textContent = `${icon} ${repo.status} - ${repo.local_path}`;
                statusEl.className = 'repo-status ready';
            } else {
                statusEl.textContent = `${repo.status}...`;
                statusEl.className = 'repo-status';
            }
        }
    }

    async loadGitHubRepos() {
        const container = document.getElementById('github-repos');
        container.innerHTML = '<p class="loading">Loading repositories...</p>';

        try {
            // Load GitHub repos AND detect local repos in parallel
            const [reposResponse, localResponse] = await Promise.all([
                fetch('/api/repos/github'),
                fetch('/api/repos/detect-local')
            ]);

            if (reposResponse.ok) {
                this.githubRepos = await reposResponse.json();

                // Build local repos map for quick lookup
                this.localRepos = new Map();
                if (localResponse.ok) {
                    const localData = await localResponse.json();
                    localData.detected.forEach(repo => {
                        this.localRepos.set(repo.github_id, repo.local_path);
                    });
                }

                this.renderGitHubRepos();
            } else if (reposResponse.status === 401) {
                container.innerHTML = '<p class="empty-state">Please login first</p>';
            } else {
                container.innerHTML = '<p class="empty-state">Failed to load repositories</p>';
            }
        } catch (error) {
            console.error('Failed to load GitHub repos:', error);
            container.innerHTML = '<p class="empty-state">Failed to load repositories</p>';
        }
    }

    renderGitHubRepos(filter = '') {
        const container = document.getElementById('github-repos');
        const filtered = this.githubRepos.filter(repo =>
            repo.full_name.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">No matching repositories</p>';
            return;
        }

        container.innerHTML = '';

        // Sort: local repos first, then by name
        filtered.sort((a, b) => {
            const aLocal = this.localRepos?.has(a.id) ? 0 : 1;
            const bLocal = this.localRepos?.has(b.id) ? 0 : 1;
            if (aLocal !== bLocal) return aLocal - bLocal;
            return a.full_name.localeCompare(b.full_name);
        });

        filtered.slice(0, 50).forEach(repo => {
            const isConnected = Array.from(this.repos.values()).some(r => r.github_id === repo.id);
            const localPath = this.localRepos?.get(repo.id);
            const item = document.createElement('div');
            item.className = `github-repo-item ${isConnected ? 'connected' : ''} ${localPath ? 'has-local' : ''}`;

            const badge = localPath ? '<span class="local-badge">📁 Local</span>' : '';
            const action = isConnected ? '<span class="connected-badge">✓ Connected</span>'
                : localPath ? '<button class="btn-link">Link Local</button>'
                : '<button class="btn-clone">Clone</button>';

            item.innerHTML = `
                <div class="repo-info">
                    <div class="repo-name">${badge} ${this.escapeHtml(repo.full_name)}</div>
                    <div class="repo-description">${this.escapeHtml(repo.description || '')}</div>
                </div>
                <div class="repo-action">${action}</div>
            `;

            if (!isConnected) {
                item.onclick = () => this.connectRepo(repo.full_name, repo.id, localPath);
            }
            container.appendChild(item);
        });
    }

    async connectRepo(fullName, githubId, localPath = null) {
        try {
            const payload = { full_name: fullName, github_id: githubId };
            if (localPath) {
                payload.local_path = localPath;
            }

            const response = await fetch('/api/repos/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const repo = await response.json();
                this.repos.set(repo.id, repo);
                this.renderRepoSelector();
                this.closeModal();

                // Auto-select the new repo
                this.activeRepoId = repo.id;
                document.getElementById('active-repo').value = repo.id;
                this.updateRepoStatus();
                this.updateSendButton();
            } else {
                const error = await response.json();
                alert(`Failed to connect: ${error.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to connect repo:', error);
            alert('Failed to connect repository');
        }
    }

    // ==================== Modal ====================

    openModal() {
        document.getElementById('repo-modal').classList.remove('hidden');
        document.getElementById('repo-search').value = '';
        this.loadGitHubRepos();
    }

    closeModal() {
        document.getElementById('repo-modal').classList.add('hidden');
    }

    // ==================== WebSocket ====================

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.updateConnectionStatus(true);
        };

        this.ws.onclose = () => {
            this.updateConnectionStatus(false);
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
            el.textContent = 'Connected';
            el.className = 'status-badge connected';
        } else {
            el.textContent = 'Disconnected';
            el.className = 'status-badge';
        }
    }

    // ==================== Message Handling ====================

    handleMessage(message) {
        switch (message.type) {
            case 'init':
                this.handleInit(message);
                break;
            case 'chat_response':
                this.handleChatResponse(message);
                break;
            case 'chat_complete':
                this.handleChatComplete(message);
                break;
            case 'agent_spawned':
                this.handleAgentSpawned(message);
                break;
            case 'agent_output':
                this.handleAgentOutput(message);
                break;
            case 'agent_complete':
                this.handleAgentComplete(message);
                break;
            case 'repo_update':
                this.handleRepoUpdate(message);
                break;
            case 'error':
                this.handleError(message);
                break;
        }
    }

    handleInit(message) {
        if (message.agents) {
            message.agents.forEach(agent => {
                this.agents.set(agent.id, agent);
            });
            this.renderAgentTree();
        }
    }

    handleChatResponse(message) {
        this.messageCount++;
        this.updateStats();

        if (message.content) {
            this.appendToCurrentResponse(message.content);
        }
    }

    handleChatComplete(message) {
        this.isProcessing = false;
        this.updateSendButton();

        if (this.currentResponse) {
            this.currentResponse.classList.remove('streaming');
            this.currentResponse = null;
        }

        // Show activity indicator
        document.getElementById('activity-indicator').classList.remove('active');
    }

    handleAgentSpawned(message) {
        const agent = message.agent;
        if (agent) {
            this.agents.set(agent.id, agent);
            this.renderAgentTree();
            this.addActivityItem(`Spawned agent: ${agent.name}`, 'system');
        }
    }

    handleAgentOutput(message) {
        const { agent_id, event, data } = message;

        if (event === 'tool_use' || event === 'tool_call') {
            this.toolCount++;
            this.updateStats();
        }

        // Stream text output to chat
        if (event === 'text' && data?.text && this.currentResponse) {
            this.appendToCurrentResponse(data.text);
            this.messageCount++;
            this.updateStats();
        }

        // Handle MCP loaded event
        if (event === 'mcp_loaded' && data?.servers) {
            this.addActivityItem(`MCP servers loaded: ${data.servers.join(', ')}`, 'system');
        }

        const agent = this.agents.get(agent_id);
        const agentName = agent?.name || agent_id.slice(0, 8);

        // Add to activity feed
        let displayData = data;
        if (typeof data === 'object') {
            displayData = data.text || data.tool || JSON.stringify(data).slice(0, 100);
        }
        this.addActivityItem(`[${agentName}] ${event}: ${String(displayData).slice(0, 100)}`,
            event === 'tool_call' ? 'tool-call' : '');
    }

    handleAgentComplete(message) {
        const { agent_id, success, error } = message;
        const agent = this.agents.get(agent_id);

        if (agent) {
            agent.status = success ? 'completed' : 'error';
            agent.error = error;
            this.agents.set(agent_id, agent);
            this.renderAgentTree();
        }

        const agentName = agent?.name || agent_id.slice(0, 8);
        this.addActivityItem(
            `[${agentName}] ${success ? 'Completed' : 'Failed: ' + error}`,
            success ? '' : 'error'
        );
    }

    handleRepoUpdate(message) {
        if (message.repo) {
            this.repos.set(message.repo.id, message.repo);
            this.renderRepoSelector();
            this.updateRepoStatus();
        }
    }

    handleError(message) {
        console.error('Error:', message);
        this.addActivityItem(`Error: ${message.message}`, 'error');

        if (this.isProcessing) {
            this.isProcessing = false;
            this.updateSendButton();

            if (this.currentResponse) {
                this.currentResponse.classList.remove('streaming');
                const content = this.currentResponse.querySelector('.message-content');
                content.textContent += `\n\nError: ${message.message}`;
                this.currentResponse = null;
            }
        }
    }

    // ==================== Chat ====================

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();

        if (!text || this.isProcessing) return;

        // Check if repo is selected
        if (!this.activeRepoId) {
            alert('Please select a repository first');
            return;
        }

        // Clear input
        input.value = '';
        this.autoResizeInput();

        // Remove welcome message if present
        const welcome = document.querySelector('.welcome-message');
        if (welcome) welcome.remove();

        // Add user message
        this.addMessage(text, 'user');

        // Start processing
        this.isProcessing = true;
        this.updateSendButton();
        document.getElementById('activity-indicator').classList.add('active');

        // Create assistant message placeholder
        this.currentResponse = this.addMessage('', 'assistant', true);

        // Send to backend
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    repo_id: this.activeRepoId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to send message');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.handleError({ message: error.message });
        }
    }

    addMessage(content, role, streaming = false) {
        const container = document.getElementById('chat-messages');
        const message = document.createElement('div');
        message.className = `message ${role}${streaming ? ' streaming' : ''}`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        message.innerHTML = `
            <div class="message-content">${this.escapeHtml(content)}</div>
            <div class="message-meta">${time}</div>
        `;

        container.appendChild(message);
        container.scrollTop = container.scrollHeight;

        return message;
    }

    appendToCurrentResponse(content) {
        if (!this.currentResponse) return;

        const contentEl = this.currentResponse.querySelector('.message-content');
        contentEl.textContent += content;

        const container = document.getElementById('chat-messages');
        container.scrollTop = container.scrollHeight;
    }

    // ==================== Activity Panel ====================

    toggleActivityPanel() {
        const panel = document.getElementById('activity-panel');
        panel.classList.toggle('collapsed');
    }

    addActivityItem(text, className = '') {
        const feed = document.getElementById('activity-feed');
        const item = document.createElement('div');
        item.className = `activity-item ${className}`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        item.innerHTML = `<span style="opacity: 0.5">${time}</span> ${this.escapeHtml(text)}`;

        feed.appendChild(item);
        feed.scrollTop = feed.scrollHeight;

        // Limit items
        while (feed.children.length > 200) {
            feed.removeChild(feed.firstChild);
        }
    }

    // ==================== Agent Tree ====================

    renderAgentTree() {
        const container = document.getElementById('agent-tree');
        const count = document.getElementById('agent-count');

        if (this.agents.size === 0) {
            container.innerHTML = '<p class="empty-state">No active agents</p>';
            count.textContent = '0';
            return;
        }

        count.textContent = this.agents.size.toString();
        container.innerHTML = '';

        // Build tree from agents
        const rootAgents = Array.from(this.agents.values()).filter(a => !a.parent_id);

        rootAgents.forEach(agent => {
            container.appendChild(this.renderAgentNode(agent, 0));
        });
    }

    renderAgentNode(agent, depth) {
        const item = document.createElement('div');
        item.className = 'agent-tree-item';

        const status = agent.status || 'idle';
        const isRunning = status === 'running';
        const isError = status === 'error';

        item.innerHTML = `
            <div class="agent-node" style="padding-left: ${depth * 12}px">
                <span class="agent-status-dot ${status}"></span>
                <span class="agent-name">${this.escapeHtml(agent.name)}</span>
                ${agent.type ? `<span class="agent-type">${agent.type}</span>` : ''}
            </div>
        `;

        // Render children
        const children = Array.from(this.agents.values()).filter(a => a.parent_id === agent.id);
        if (children.length > 0) {
            const childContainer = document.createElement('div');
            childContainer.className = 'agent-children';
            children.forEach(child => {
                childContainer.appendChild(this.renderAgentNode(child, depth + 1));
            });
            item.appendChild(childContainer);
        }

        return item;
    }

    // ==================== UI Updates ====================

    updateStats() {
        document.getElementById('message-count').textContent = `${this.messageCount} messages`;
        document.getElementById('tool-count').textContent = `${this.toolCount} tool calls`;
    }

    updateSendButton() {
        const btn = document.getElementById('send-btn');
        const input = document.getElementById('chat-input');

        btn.disabled = this.isProcessing || !this.activeRepoId || !input.value.trim();
    }

    autoResizeInput() {
        const input = document.getElementById('chat-input');
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
    }

    // ==================== Event Handlers ====================

    bindEvents() {
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        chatInput.addEventListener('input', () => {
            this.autoResizeInput();
            this.updateSendButton();
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());

        // Repo selector
        document.getElementById('active-repo').addEventListener('change', (e) => {
            this.selectRepo(e.target.value);
        });

        // Connect repo
        document.getElementById('connect-repo-btn').addEventListener('click', () => this.openModal());

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('repo-modal').addEventListener('click', (e) => {
            if (e.target.id === 'repo-modal') this.closeModal();
        });

        // Repo search
        document.getElementById('repo-search').addEventListener('input', (e) => {
            this.renderGitHubRepos(e.target.value);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ==================== Utility ====================

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize App
const app = new AgentControlPanel();
