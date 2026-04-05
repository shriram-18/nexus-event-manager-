// store.js - State management using MongoDB/Express backend
export const Store = {
    state: {
        events: [],
        myTickets: [],
        user: null // Will hold auth data
    },
    
    API_URL: '/api',
    socket: null,

    // Helper for auth headers
    get headers() {
        const token = localStorage.getItem('nexus_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    async init() {
        console.log("Store: Initializing from MongoDB API...");
        
        // Load user from local storage
        const storedUser = localStorage.getItem('nexus_user');
        if (storedUser) {
            this.state.user = JSON.parse(storedUser);
        }

        try {
            // Setup Socket.IO if available
            if (window.io) {
                this.socket = io();
                this.socket.on('eventUpdated', (data) => {
                    const ev = this.getEventById(data.id);
                    if (ev) {
                        ev.ticketsAvailable = data.ticketsAvailable;
                        window.dispatchEvent(new CustomEvent('nexusEventUpdated', { detail: ev }));
                    }
                });
                this.socket.on('notification', data => {
                    alert("🔔 " + data.message);
                });
            }

            const fetchOpts = { headers: this.headers };
            const promises = [fetch(`${this.API_URL}/events`, fetchOpts)];
            
            if(this.state.user) {
                promises.push(fetch(`${this.API_URL}/bookings/user`, fetchOpts));
            }

            const responses = await Promise.all([...promises]);
            const evRes = responses[0];
            const tickRes = responses.length > 1 ? responses[1] : null;
            
            if (evRes.ok) {
                const evJson = await evRes.json();
                this.state.events = evJson.data || evJson;
            }
            
            if (tickRes && tickRes.ok) {
                const tickJson = await tickRes.json();
                this.state.myTickets = tickJson.data || tickJson;
            }
        } catch (error) {
            console.error("API connect failed.", error.message);
        }
    },

    async login(email, password) {
        try {
            const res = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const payload = await res.json();
            if(payload.success) {
                const data = payload.data;
                localStorage.setItem('nexus_token', data.token);
                localStorage.setItem('nexus_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
                this.state.user = data;
                return { success: true };
            }
            return { success: false, message: payload.message || payload.error };
        } catch(e) {
            return { success: false, message: 'Server unreachable' };
        }
    },

    async signup(name, email, password, role = 'user') {
        try {
            const res = await fetch(`${this.API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const payload = await res.json();
            if(payload.success) {
                const data = payload.data;
                localStorage.setItem('nexus_token', data.token);
                localStorage.setItem('nexus_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
                this.state.user = data;
                return { success: true };
            }
            return { success: false, message: payload.message || payload.error };
        } catch (e) {
            return { success: false, message: 'Server unreachable' };
        }
    },

    logout() {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        this.state.user = null;
        window.location.href = 'login.html';
    },

    getEventById(id) {
        return this.state.events.find(e => e.id === id);
    },

    async addEvent(eventData) {
         if (!this.state.user) return { success: false, message: 'Must be logged in' };
         // Generate and preserve the custom id client-side
         const customId = 'NEX-' + Math.random().toString(36).substr(2, 6).toUpperCase();
         eventData.id = customId;
         
         try {
            const res = await fetch(`${this.API_URL}/events`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(eventData)
            });
            const payload = await res.json();
            if (payload.success) {
                // Force custom id on the returned document to avoid Mongoose virtual conflicts
                const eventWithId = { ...payload.data, id: customId };
                this.state.events.unshift(eventWithId);
                return { success: true, event: eventWithId };
            }
            return { success: false, message: payload.error || 'Server error' };
        } catch(e) {
            return { success: false, message: 'API connection failed' };
        }
    },

    async getManagedEvents() {
        if (!this.state.user) return { success: false, message: 'Must be logged in' };
        try {
            const res = await fetch(`${this.API_URL}/events/manage`, {
                method: 'GET',
                headers: this.headers
            });
            const payload = await res.json();
            if (payload.success) {
                return { success: true, events: payload.data };
            }
            return { success: false, message: payload.error || 'Failed to fetch managed events' };
        } catch(e) {
            return { success: false, message: 'API connection failed' };
        }
    },

    async approveEvent(eventId) {
        if (!this.state.user || this.state.user.role !== 'admin') return { success: false, message: 'Unauthorized' };
        try {
            const res = await fetch(`${this.API_URL}/events/${eventId}/approve`, {
                method: 'PATCH',
                headers: this.headers
            });
            const payload = await res.json();
            return payload;
        } catch(e) {
            return { success: false, message: 'Network error' };
        }
    },

    async rejectEvent(eventId) {
        if (!this.state.user || this.state.user.role !== 'admin') return { success: false, message: 'Unauthorized' };
        try {
            const res = await fetch(`${this.API_URL}/events/${eventId}/reject`, {
                method: 'PATCH',
                headers: this.headers
            });
            const payload = await res.json();
            return payload;
        } catch(e) {
            return { success: false, message: 'Network error' };
        }
    },

    async getAnalytics() {
        if (!this.state.user || this.state.user.role !== 'admin') return { success: false };
        try {
            const res = await fetch(`${this.API_URL}/admin/analytics`, {
                method: 'GET',
                headers: this.headers
            });
            return await res.json();
        } catch(e) {
            return { success: false, error: e.message };
        }
    },

    async bookTicket(eventId, quantity = 1) {
        if (!this.state.user) {
            return { success: false, message: 'First register or login, then you can register for this event!'};
        }

        try {
            const targetEvent = this.getEventById(eventId);
            if(!targetEvent) return { success: false, message: 'Event missing' };

            const res = await fetch(`${this.API_URL}/bookings`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ eventId: targetEvent.id, qty: quantity })
            });
            const payload = await res.json();
            if(payload.success) {
                this.state.myTickets.push(payload.data);
                return { success: true };
            }
            return { success: false, message: payload.error || "Booking failed" };
        } catch(e) {
            return { success: false, message: "Network error" };
        }
    },
    
    async generateAiDescription(prompt) {
        const res = await fetch(`${this.API_URL}/ai/generate-description`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ prompt })
        });
        const payload = await res.json();
        if(payload.success) return payload.data;
        throw new Error(payload.error || 'Failed to generate');
    },

    searchEvents(query = "", filterVibe = "") {
        let results = this.state.events;
        if (query) {
            const q = query.toLowerCase();
            results = results.filter(e => 
                (e.title || '').toLowerCase().includes(q) || 
                (e.description || '').toLowerCase().includes(q)
            );
        }
        if (filterVibe && filterVibe !== 'All') {
             results = results.filter(e => 
                (e.vibes || e.tags || []).includes(filterVibe) || e.category === filterVibe
            );
        }
        return results;
    }
};
