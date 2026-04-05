import { Store } from './store.js';

// Global Theme Logic
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.location.reload(); // Reload immediately switches map tile styling!
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Navbar Scroll Effect (Global)
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.style.padding = '10px 0';
                navbar.style.background = 'rgba(11, 15, 25, 0.9)';
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            } else {
                navbar.style.padding = '16px 0';
                navbar.style.background = 'rgba(11, 15, 25, 0.7)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Interactive Hover Effect
    window.handleMouseMove = function(e, element) {
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        element.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    // 2. Initialize App State
    await Store.init();
    
    // Feature 3: Role-Based UI Theming
    if (Store.state.user) {
        document.documentElement.setAttribute('data-theme-role', Store.state.user.role);
    }

    // Expose logout to global scope (needed for inline onclick in injected HTML)
    window.logout = () => Store.logout();

    // 3. Home page featured events
    const listContainer = document.getElementById('featuredEventsList');
    if (listContainer) {
        listContainer.innerHTML = '';
        renderFeaturedEvents(Store.state.events, listContainer);
    }

    // 4. Dynamic Navbar
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        let baseLinks = '';
        const searchForm = `<form action="explore.html" method="GET" style="display:flex; align-items:center; position:relative; margin-right:8px;">
            <input type="text" name="q" placeholder="Search events..." style="padding:8px 16px; padding-right: 36px; border-radius:20px; border:1px solid var(--glass-border); background:rgba(0,0,0,0.2); color:white; width:200px; outline:none; font-family:var(--font-body); font-size: 0.9rem;">
            <button type="submit" style="position:absolute; right:12px; background:none; border:none; color:var(--text-muted); cursor:pointer;"><i class="fa-solid fa-search"></i></button>
        </form>`;

        if (Store.state.user) {
            if (Store.state.user.role === 'admin' || Store.state.user.role === 'organizer') {
                const dashLabel = Store.state.user.role === 'admin' ? 'Admin Dashboard' : 'Organizer Dashboard';
                baseLinks = `
                    ${searchForm}
                    <a href="dashboard.html">${dashLabel}</a>
                    <a href="create.html" class="btn btn-primary" style="padding:8px 16px;font-size:0.9rem;">+ Host Event</a>
                    <a href="#" onclick="logout();return false;" style="color:var(--text-muted);font-size:0.9rem;">Logout</a>
                `;
            } else {
                baseLinks = `
                    ${searchForm}
                    <a href="dashboard.html">My Tickets</a>
                    <a href="#" onclick="logout();return false;" style="color:var(--text-muted);font-size:0.9rem;">Logout</a>
                `;
            }
        } else {
            baseLinks = `
                ${searchForm}
                <a href="login.html" class="btn btn-primary" style="padding:8px 16px;font-size:0.9rem;">Login / Sign Up</a>
            `;
        }
        
        // Append toggle button
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        navLinks.innerHTML = baseLinks + `<button class="btn btn-icon" onclick="toggleTheme()" style="background:transparent; color:var(--text-main); font-size:1.1rem;"><i class="fa-solid fa-${isLight ? 'moon' : 'sun'}"></i></button>`;
    }
});

function renderFeaturedEvents(events, container) {
    if (!events || events.length === 0) {
        container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px;">No events yet. Check back soon!</p>`;
        return;
    }
    const featured = events.slice(0, 3);
    container.innerHTML = featured.map(event => {
        const total = event.totalTickets || 20;
        const available = event.ticketsAvailable !== undefined ? event.ticketsAvailable : total;
        const fillPct = Math.round(((total - available) / total) * 100);
        const hypeClass = fillPct > 85 ? 'hype-fill high' : 'hype-fill';
        const dateStr = new Date(event.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

        return `
        <article class="glass-pane event-card" onmousemove="window.handleMouseMove(event,this)">
            <div class="card-image-wrap">
                <div class="card-badges">
                    <span class="badge" style="border-color:var(--primary);color:white;background:rgba(59,130,246,0.6);">${event.category || 'Event'}</span>
                    <span class="badge">${(event.tags && event.tags[0]) || 'Vibe'}</span>
                </div>
                <img src="${event.image}" alt="${event.title}" class="card-image" loading="lazy">
            </div>
            <div class="card-content">
                <h3 class="card-title">${event.title}</h3>
                <div class="card-meta">
                    <div class="meta-item"><i class="fa-regular fa-calendar meta-icon"></i><span>${dateStr}</span></div>
                    <div class="meta-item"><i class="fa-solid fa-location-dot meta-icon"></i><span>${event.venue || 'TBA'}</span></div>
                </div>
                <div class="hype-meter-container">
                    <div class="hype-label"><span>Hype Meter</span><span>${fillPct}% Booked</span></div>
                    <div class="hype-track"><div class="${hypeClass}" style="width:${fillPct}%"></div></div>
                </div>
                <a href="event-details.html?id=${event.id}" class="btn btn-outline" style="width:100%;justify-content:center;">View Details</a>
            </div>
        </article>`;
    }).join('');
}
