// Configuration
const EPISODES_PER_PAGE = 12; // Number of episodes per "page"
const INITIAL_PAGES = 2; // Load first 2 pages initially

// State management
let allEpisodes = [];
let displayedEpisodes = 0;
let isLoading = false;

// DOM elements
const episodesGrid = document.getElementById('episodes-grid');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const loadMoreElement = document.getElementById('load-more');

// Typewriter effect
const descriptionTexts = [
    "DSO Overflow was born out of a desire, post DevSecOps London Gathering meet-up, to be able to have a relaxed conversation with our speakers about their area of expertise. A behind the scenes post talk interview, to ask all of the questions you didn't think to ask at the meet-up and more.",
    "In this show, you'll meet professionals, practitioners and theorists working in cyber security, software engineering and operations to talk about a number of CyberSecurity topics. We discuss how organisations factor security into their product delivery cycles without compromising the process."
];

async function typeWriter(element, text, speed = 30) {
    const textElement = element.querySelector('.typewriter-text');
    const cursor = element.querySelector('.cursor');
    
    textElement.textContent = '';
    element.style.opacity = '1';
    
    for (let i = 0; i < text.length; i++) {
        textElement.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    // Remove cursor after typing is complete
    if (cursor) {
        cursor.style.opacity = '0';
    }
}

async function startTypewriter() {
    const desc1 = document.getElementById('description1');
    const desc2 = document.getElementById('description2');
    
    if (desc1 && desc2) {
        await typeWriter(desc1, descriptionTexts[0], 20);
        await new Promise(resolve => setTimeout(resolve, 500));
        await typeWriter(desc2, descriptionTexts[1], 20);
    }
}

// Load and display supporters
async function loadSupporters() {
    try {
        const response = await fetch('logo/supporters/supporters.json');
        if (!response.ok) {
            console.warn('Could not load supporters.json');
            return;
        }
        
        const supporters = await response.json();
        const supportersContainer = document.getElementById('supporters-logos');
        
        if (!supportersContainer || supporters.length === 0) {
            return;
        }
        
        supporters.forEach(supporter => {
            const link = document.createElement('a');
            link.href = supporter.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'supporter-logo-link';
            link.title = supporter.name;
            
            const img = document.createElement('img');
            img.src = `logo/supporters/${supporter.logo}`;
            img.alt = `${supporter.name} logo`;
            img.className = 'supporter-logo';
            
            link.appendChild(img);
            supportersContainer.appendChild(link);
        });
    } catch (error) {
        console.error('Error loading supporters:', error);
    }
}

// Initialize the app
async function init() {
    try {
        // Start typewriter effect
        startTypewriter();
        
        // Load supporters
        loadSupporters();
        
        // Check if API key is configured
        if (!window.API_CONFIG || !window.API_CONFIG.API_KEY) {
            throw new Error('API key not configured. Please set BUZZSPROUT_API_KEY in GitHub secrets.');
        }

        // Fetch all episodes
        await fetchEpisodes();
        
        // Load initial episodes (first 2 pages)
        loadInitialEpisodes();
        
        // Set up infinite scroll
        setupInfiniteScroll();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError();
    }
}

// Fetch episodes from Buzzsprout API
async function fetchEpisodes() {
    try {
        showLoading();
        
        const response = await fetch('https://www.buzzsprout.com/api/733070/episodes.json', {
            headers: {
                'Authorization': `Token token=${window.API_CONFIG.API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const episodes = await response.json();
        
        // Sort episodes by published date (newest first)
        allEpisodes = episodes.sort((a, b) => {
            return new Date(b.published_at) - new Date(a.published_at);
        });

        hideLoading();
        
    } catch (error) {
        console.error('Error fetching episodes:', error);
        hideLoading();
        throw error;
    }
}

// Load initial episodes (first 2 pages)
function loadInitialEpisodes() {
    const initialCount = EPISODES_PER_PAGE * INITIAL_PAGES;
    const episodesToShow = allEpisodes.slice(0, initialCount);
    
    episodesToShow.forEach(episode => {
        renderEpisode(episode);
    });
    
    displayedEpisodes = episodesToShow.length;
    
    // Show load more if there are more episodes
    if (displayedEpisodes < allEpisodes.length) {
        loadMoreElement.style.display = 'block';
    }
}

// Load more episodes (for infinite scroll)
function loadMoreEpisodes() {
    if (isLoading || displayedEpisodes >= allEpisodes.length) {
        return;
    }

    isLoading = true;
    loadMoreElement.style.display = 'block';

    // Simulate slight delay for better UX
    setTimeout(() => {
        const remainingEpisodes = allEpisodes.length - displayedEpisodes;
        const episodesToLoad = Math.min(EPISODES_PER_PAGE, remainingEpisodes);
        
        for (let i = 0; i < episodesToLoad; i++) {
            const episode = allEpisodes[displayedEpisodes + i];
            if (episode) {
                renderEpisode(episode);
            }
        }
        
        displayedEpisodes += episodesToLoad;
        isLoading = false;
        
        // Hide load more if all episodes are displayed
        if (displayedEpisodes >= allEpisodes.length) {
            loadMoreElement.style.display = 'none';
        }
    }, 300);
}

// Render a single episode card
function renderEpisode(episode) {
    const card = document.createElement('div');
    card.className = 'episode-card';
    card.onclick = () => {
        // Open episode page on Buzzsprout
        window.open(`https://www.buzzsprout.com/733070/episodes/${episode.id}`, '_blank');
    };

    // Format date
    const publishedDate = new Date(episode.published_at);
    const formattedDate = publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Format duration (seconds to MM:SS)
    const duration = formatDuration(episode.duration);

    // Extract plain text from HTML description
    const descriptionText = extractTextFromHTML(episode.description || '');

    card.innerHTML = `
        <div class="episode-image-container">
            <img 
                src="${episode.artwork_url || 'https://via.placeholder.com/400x225?text=DSO+Overflow'}" 
                alt="${episode.title}"
                class="episode-image"
                loading="lazy"
            >
        </div>
        <div class="episode-content">
            <h3 class="episode-title">${escapeHtml(episode.title)}</h3>
            <div class="episode-meta">
                <span class="meta-item">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    ${formattedDate}
                </span>
                <span class="meta-item">
                    <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    ${duration}
                </span>
            </div>
            ${descriptionText ? `<p class="episode-description">${escapeHtml(descriptionText)}</p>` : ''}
            <div class="episode-stats">
                <div class="play-count">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    ${episode.total_plays || 0} plays
                </div>
                <span class="episode-date">${formattedDate}</span>
            </div>
        </div>
    `;

    episodesGrid.appendChild(card);
}

// Format duration from seconds to MM:SS or HH:MM:SS
function formatDuration(seconds) {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Extract plain text from HTML
function extractTextFromHTML(html) {
    if (!html) return '';
    
    // Create a temporary div element
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Get text content and clean it up
    let text = temp.textContent || temp.innerText || '';
    
    // Remove extra whitespace and limit length
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit to 200 characters for preview
    if (text.length > 200) {
        text = text.substring(0, 200) + '...';
    }
    
    return text;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Set up infinite scroll
function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadMoreEpisodes();
            }
        });
    }, {
        rootMargin: '100px' // Start loading 100px before the element is visible
    });

    observer.observe(loadMoreElement);
}

// Show loading state
function showLoading() {
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    episodesGrid.innerHTML = '';
}

// Hide loading state
function hideLoading() {
    loadingElement.style.display = 'none';
}

// Show error state
function showError() {
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    episodesGrid.innerHTML = '';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

