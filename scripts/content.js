// content.js
// This script will be injected into web pages.


// --- Tab Bar for ChatGPT Chats ---

// Store chat tabs in sessionStorage
const TAB_BAR_ID = 'gpt-chat-tab-bar';
const CHAT_TABS_KEY = 'gpt_chat_tabs';

function getCurrentChatId() {
	// Extract chatId from URL using the URL object
	try {
		const url = new URL(window.location.href);
		const parts = url.pathname.split('/');
		// Expect ['', 'c', '{{chatId}}']
		if (parts.length >= 3 && parts[1] === 'c' && parts[2]) {
			return parts[2];
		}
		return null;
	} catch {
		return null; // Handle URL parsing errors
	}
}

function getChatTabs() {
	// Get all chatIds for this session
	let sessionChatIds = [];
	try {
		sessionChatIds = JSON.parse(sessionStorage.getItem(CHAT_TABS_KEY)) || [];
	} catch {}

	// Get names from #history if available
	const historyDiv = document.getElementById('history');
	const chatIdToName = {};
	if (historyDiv) {
		const anchors = historyDiv.querySelectorAll('a[href^="/c/"]');
		anchors.forEach(a => {
			const href = a.getAttribute('href');
			const match = href.match(/^\/c\/([\w-]+)/);
			if (match) {
				const chatId = match[1];
				const span = a.querySelector('span');
				const name = span ? span.textContent.trim() : chatId;
				chatIdToName[chatId] = name;
			}
		});
	}

	// Compose tab objects for session chatIds only
	return sessionChatIds.map(chatId => ({
		chatId,
		name: chatIdToName[chatId] || chatId
	}));
}
function addChatTab(chatId) {
	let sessionChatIds = [];
	try {
		sessionChatIds = JSON.parse(sessionStorage.getItem(CHAT_TABS_KEY)) || [];
	} catch {}
	if (!sessionChatIds.includes(chatId)) {
		// Wait for the chat to appear in the #history list with a name
		let attempts = 0;
		const maxAttempts = 20; // 10 seconds max
		const tryAdd = () => {
			const historyDiv = document.getElementById('history');
			let chatName = null;
			if (historyDiv) {
				const anchors = historyDiv.querySelectorAll('a[href^="/c/"]');
				anchors.forEach(a => {
					const href = a.getAttribute('href');
					const match = href.match(/^\/c\/([\w-]+)/);
					if (match && match[1] === chatId) {
						const span = a.querySelector('span');
						chatName = span ? span.textContent.trim() : chatId;
					}
				});
			}
			if (chatName && chatName !== chatId) {
				sessionChatIds.push(chatId);
				sessionStorage.setItem(CHAT_TABS_KEY, JSON.stringify(sessionChatIds));
				// Optionally store name for future use
				let chatNames = {};
				try {
					chatNames = JSON.parse(sessionStorage.getItem('gpt_chat_names')) || {};
				} catch {}
				chatNames[chatId] = chatName;
				sessionStorage.setItem('gpt_chat_names', JSON.stringify(chatNames));
				renderTabBar();
			} else if (attempts < maxAttempts) {
				attempts++;
				setTimeout(tryAdd, 500);
			} else {
				// Fallback: add with id as name
				sessionChatIds.push(chatId);
				sessionStorage.setItem(CHAT_TABS_KEY, JSON.stringify(sessionChatIds));
				renderTabBar();
			}
		};
		tryAdd();
	}
}

function createTabBar() {
	let bar = document.getElementById(TAB_BAR_ID);
	if (bar) return bar;
	bar = document.createElement('div');
	bar.id = TAB_BAR_ID;
	bar.style.position = 'fixed';
	bar.style.top = '0';
	bar.style.left = '0';
	bar.style.right = '0';
	bar.style.height = '38px';
	bar.style.background = '#e3e3e3';
	bar.style.display = 'flex';
	bar.style.alignItems = 'flex-end';
	bar.style.zIndex = '9999';
	bar.style.padding = '0 8px';
	bar.style.overflowX = 'auto';
	bar.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
	document.body.prepend(bar);
	// Push page down so bar doesn't overlap
	document.body.style.paddingTop = '38px';
	return bar;
}

function renderTabBar() {
	// Always render the bar on all relevant pages
	const bar = createTabBar();
	bar.innerHTML = '';
	const tabObjs = getChatTabs();
	const currentChatId = getCurrentChatId();
	// Only render tabs if there are any
	if (tabObjs.length > 0) {
		tabObjs.forEach((tabObj, idx) => {
			const { chatId, name } = tabObj;
			const tab = document.createElement('div');
			tab.style.display = 'flex';
			tab.style.alignItems = 'center';
			tab.style.margin = '0 2px -2px 0';
			tab.style.padding = '0 0 0 0';
			tab.style.height = '32px';
			tab.style.minWidth = '60px';
			tab.style.maxWidth = '180px';
			tab.style.overflow = 'hidden';
			tab.style.textOverflow = 'ellipsis';
			tab.style.whiteSpace = 'nowrap';
			tab.style.fontSize = '15px';
			tab.style.fontWeight = '400';
			tab.style.border = 'none';
			tab.style.borderTopLeftRadius = '8px';
			tab.style.borderTopRightRadius = '8px';
			tab.style.borderBottom = '2.5px solid transparent';
			tab.style.background = chatId === currentChatId ? '#fff' : '#e3e3e3';
			tab.style.color = '#222';
			tab.style.boxShadow = chatId === currentChatId ? '0 2px 8px rgba(60,60,60,0.08)' : 'none';
			tab.style.cursor = 'pointer';
			tab.style.transition = 'background 0.15s, border-bottom 0.15s';
			tab.onmouseenter = () => {
				if (chatId !== currentChatId) tab.style.background = '#f5f5f5';
			};
			tab.onmouseleave = () => {
				if (chatId !== currentChatId) tab.style.background = '#e3e3e3';
			};

			// Tab label
			const labelBtn = document.createElement('button');
			labelBtn.textContent = name;
			labelBtn.title = name;
			labelBtn.style.pointerEvents = 'auto';
			labelBtn.style.flex = '1';
			labelBtn.style.background = 'transparent';
			labelBtn.style.border = 'none';
			labelBtn.style.outline = 'none';
			labelBtn.style.font = 'inherit';
			labelBtn.style.color = 'inherit';
			labelBtn.style.cursor = 'pointer';
			labelBtn.style.textAlign = 'left';
			labelBtn.style.padding = '0 10px 0 18px';
			labelBtn.style.overflow = 'hidden';
			labelBtn.style.textOverflow = 'ellipsis';
			labelBtn.style.whiteSpace = 'nowrap';
			labelBtn.onclick = () => {
				if (chatId !== currentChatId) {
					const newPath = `/c/${chatId}`;
					if (window.location.pathname !== newPath) {
						window.history.pushState({}, '', newPath);
						window.dispatchEvent(new PopStateEvent('popstate'));
					}
				}
			};
			tab.appendChild(labelBtn);

			// Close button
			const closeBtn = document.createElement('button');
			closeBtn.textContent = '×';
			closeBtn.title = 'Close tab';
			closeBtn.style.background = 'transparent';
			closeBtn.style.border = 'none';
			closeBtn.style.color = '#888';
			closeBtn.style.fontSize = '18px';
			closeBtn.style.width = '24px';
			closeBtn.style.height = '24px';
			closeBtn.style.margin = '0 4px 0 0';
			closeBtn.style.borderRadius = '50%';
			closeBtn.style.display = 'flex';
			closeBtn.style.alignItems = 'center';
			closeBtn.style.justifyContent = 'center';
			closeBtn.style.cursor = 'pointer';
			closeBtn.onmouseenter = () => { closeBtn.style.background = '#eee'; };
			closeBtn.onmouseleave = () => { closeBtn.style.background = 'transparent'; };
			closeBtn.onclick = (e) => {
				e.stopPropagation();
				let sessionChatIds = [];
				try {
					sessionChatIds = JSON.parse(sessionStorage.getItem(CHAT_TABS_KEY)) || [];
				} catch {}
				sessionChatIds = sessionChatIds.filter(id => id !== chatId);
				sessionStorage.setItem(CHAT_TABS_KEY, JSON.stringify(sessionChatIds));

				const currentChatId = getCurrentChatId();
				if (chatId === currentChatId) {
					if (sessionChatIds.length > 0) {
						const lastId = sessionChatIds[sessionChatIds.length - 1];
						const newPath = `/c/${lastId}`;
						if (window.location.pathname !== newPath) {
							window.history.pushState({}, '', newPath);
							window.dispatchEvent(new PopStateEvent('popstate'));
						}
					} else {
						const btn = document.querySelector('[data-testid="create-new-chat-button"]');
						if (btn) btn.click();
					}
				}
				renderTabBar();
			};
			tab.appendChild(closeBtn);

			bar.appendChild(tab);
		});
	}
	// Add + icon for new chat (simple, no circle)
	const plusBtn = document.createElement('button');
	plusBtn.textContent = '+';
	plusBtn.title = 'New Chat';
	plusBtn.style.margin = '0 2px -2px 0px';
	plusBtn.style.width = '28px';
	plusBtn.style.height = '32px';
	plusBtn.style.padding = '0';
	plusBtn.style.alignSelf = 'center';
	plusBtn.style.fontSize = '22px';
	plusBtn.style.fontWeight = '400';
	plusBtn.style.lineHeight = '32px';
	plusBtn.style.border = 'none';
	plusBtn.style.background = 'transparent';
	plusBtn.style.color = '#111';
	plusBtn.style.cursor = 'pointer';
	plusBtn.style.display = 'flex';
	plusBtn.style.alignItems = 'center';
	plusBtn.style.justifyContent = 'center';
	plusBtn.style.boxShadow = 'none';
	plusBtn.style.transition = 'background 0.15s';
	plusBtn.onmouseenter = () => {
		plusBtn.style.background = '#f5f5f5';
		plusBtn.style.borderTopLeftRadius = '8px';
		plusBtn.style.borderTopRightRadius = '8px';
		plusBtn.style.boxShadow = '0 2px 8px rgba(60,60,60,0.08)';
	};
	plusBtn.onmouseleave = () => {
		plusBtn.style.background = 'transparent';
		plusBtn.style.borderTopLeftRadius = '';
		plusBtn.style.borderTopRightRadius = '';
		plusBtn.style.borderBottom = 'none';
		plusBtn.style.boxShadow = 'none';
	};
	plusBtn.onclick = () => {
		const btn = document.querySelector('[data-testid="create-new-chat-button"]');
		if (btn) btn.click();
	};
	bar.appendChild(plusBtn);
}

function updateTabsOnNavigation() {
	let lastChatId = null;
	function check() {
		const chatId = getCurrentChatId();
		if (chatId && chatId !== lastChatId) {
			addChatTab(chatId);
			lastChatId = chatId;
		}
		// Always render the tab bar if on a chat page
		if (chatId) {
			renderTabBar();
		}
	}
	// Listen for URL changes (SPA navigation)
	let oldHref = location.href;
	setInterval(() => {
		if (location.href !== oldHref) {
			oldHref = location.href;
			check();
		}
	}, 500);
	// Initial
	check();
}

// Periodically clean up session tabs that are no longer in the history list
function cleanUpClosedTabs() {
	let sessionChatIds = [];
	try {
		sessionChatIds = JSON.parse(sessionStorage.getItem(CHAT_TABS_KEY)) || [];
	} catch {}
	const historyDiv = document.getElementById('history');
	let validChatIds = [];
	if (historyDiv) {
		const anchors = historyDiv.querySelectorAll('a[href^="/c/"]');
		validChatIds = Array.from(anchors).map(a => {
			const href = a.getAttribute('href');
			const match = href.match(/^\/c\/([\w-]+)/);
			return match ? match[1] : null;
		}).filter(Boolean);
	}
	const filtered = sessionChatIds.filter(id => validChatIds.includes(id));
	if (filtered.length !== sessionChatIds.length) {
		sessionStorage.setItem(CHAT_TABS_KEY, JSON.stringify(filtered));
		renderTabBar();
	}
}

// Keyboard shortcuts for tab switching (CMD+ArrowRight/Left)
window.addEventListener('keydown', function(e) {
	
	// CMD+ArrowRight: next tab, CMD+ArrowLeft: previous tab
	if (e.metaKey && !e.altKey && !e.shiftKey && !e.ctrlKey) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			e.stopImmediatePropagation();
			switchTab(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			e.stopImmediatePropagation();
			switchTab(-1);
		}
	}
}, true);

function switchTab(direction) {
	const tabs = getChatTabs();
	const currentChatId = getCurrentChatId();
	const idx = tabs.findIndex(t => t.chatId === currentChatId);
	if (tabs.length === 0) return;
	let newIdx = idx + direction;
	if (newIdx < 0) newIdx = tabs.length - 1;
	if (newIdx >= tabs.length) newIdx = 0;
	if (newIdx !== idx && tabs[newIdx]) {
		const newPath = `/c/${tabs[newIdx].chatId}`;
		if (window.location.pathname !== newPath) {
			window.history.pushState({}, '', newPath);
			window.dispatchEvent(new PopStateEvent('popstate'));
		}
	}
}

function jumpToTab(tabIndex) {
	const tabs = getChatTabs();
	if (tabIndex >= 0 && tabIndex < tabs.length) {
		const newPath = `/c/${tabs[tabIndex].chatId}`;
		if (window.location.pathname !== newPath) {
			window.history.pushState({}, '', newPath);
			window.dispatchEvent(new PopStateEvent('popstate'));
		}
	}
}


// Initialize tab bar logic
updateTabsOnNavigation();
setInterval(cleanUpClosedTabs, 2000);


// Always render the tab bar immediately if on a chat page (even if no tabs yet)
if (getCurrentChatId()) {
	renderTabBar();
}



// --- Robust SPA navigation and DOM observer for chat tab bar ---
function handleNavigationEvent() {
	const chatId = getCurrentChatId();
	if (chatId) {
		addChatTab(chatId);
		renderTabBar();
	}
}

window.addEventListener('popstate', handleNavigationEvent);
['pushState', 'replaceState'].forEach(fn => {
	const orig = history[fn];
	history[fn] = function(...args) {
		const ret = orig.apply(this, args);
		setTimeout(handleNavigationEvent, 0);
		return ret;
	};
});

// MutationObserver to catch sidebar/chat list loading and chat selection
let lastChatId_observer = null;
const observer = new MutationObserver(() => {
	const chatId = getCurrentChatId();
	if (chatId !== lastChatId_observer) {
		lastChatId_observer = chatId;
		handleNavigationEvent();
	}
});
observer.observe(document.body, { childList: true, subtree: true });
