import { 
    auth, 
    db, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged, 
    collection, 
    addDoc, 
    getDocs, 
    serverTimestamp, 
    query, 
    orderBy 
} from './firebase-config.js';

const mistakeForm = document.getElementById('mistakeForm');
const adminStatus = document.getElementById('adminStatus');
const mistakesList = document.getElementById('mistakesList');
const feedbackList = document.getElementById('feedbackList');
const noteForm = document.getElementById('noteForm');
const notesList = document.getElementById('notesList');

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

let isAuthReady = false;

// 1. Authentication State Listener
onAuthStateChanged(auth, (user) => {
    if (user && !user.isAnonymous) {
        // Logged in as admin
        isAuthReady = true;
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        
        console.log("Admin authenticated.");
        // Fetch data immediately once authenticated
        fetchMistakes();
        fetchFeedbacks();
        fetchNotes();
    } else {
        // Not logged in (or anonymous user)
        isAuthReady = false;
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
});

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showStatus("Logged in successfully.", "success");
        loginForm.reset();
        document.getElementById('adminPassword').type = 'password'; // Reset type on success
    } catch (error) {
        console.error("Login error:", error);
        showStatus("Invalid email or password.", "error");
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Show Password Toggle
const showPasswordToggle = document.getElementById('showPasswordToggle');
if (showPasswordToggle) {
    showPasswordToggle.addEventListener('change', (e) => {
        const adminPassword = document.getElementById('adminPassword');
        adminPassword.type = e.target.checked ? 'text' : 'password';
    });
}

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showStatus("Logged out.", "success");
    } catch (error) {
        console.error("Logout error:", error);
    }
});

function showStatus(message, type) {
    adminStatus.textContent = message;
    adminStatus.className = `message ${type}`;
    setTimeout(() => { adminStatus.className = 'message'; }, 4000);
}

// 2. Handle Mistake Logging
mistakeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAuthReady) return;

    const category = document.getElementById('mistakeCategory').value;
    const notes = document.getElementById('mistakeNotes').value.trim();
    const submitBtn = document.getElementById('mistakeSubmitBtn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging Issue...';

    try {
        // Firebase Firestore Query: Add a document to 'event_mistakes'
        await addDoc(collection(db, 'event_mistakes'), {
            category: category,
            notes: notes,
            createdAt: serverTimestamp()
        });

        showStatus("Internal issue logged successfully.", "success");
        mistakeForm.reset();
        fetchMistakes(); // Refresh the list automatically
    } catch (error) {
        console.error("Error logging mistake: ", error);
        showStatus("Database error logging issue.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Issue to Database';
    }
});

// 3. Fetch and Display Event Mistakes
async function fetchMistakes() {
    try {
        // Firebase Firestore Query: Get all mistakes, ordered by newest first
        const q = query(collection(db, "event_mistakes"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        mistakesList.innerHTML = ''; // Clear loading state
        
        if (querySnapshot.empty) {
            mistakesList.innerHTML = '<p class="subtitle" style="font-size:0.9rem;">No issues logged yet.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Handle cases where serverTimestamp hasn't fully propagated yet
            const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'Just now';
            
            const card = document.createElement('div');
            card.className = 'mistake-card';
            card.innerHTML = `
                <div class="meta">
                    <span class="category-tag">${data.category}</span>
                    <span>${dateStr}</span>
                </div>
                <p style="margin: 0; font-size: 0.95rem; line-height: 1.5;">${data.notes}</p>
            `;
            mistakesList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching mistakes: ", error);
        mistakesList.innerHTML = '<p class="error" style="color:#f87171;">Failed to load issues from database.</p>';
    }
}

// 3.5 Handle Note Logging
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAuthReady) return;

    const content = document.getElementById('noteContent').value.trim();
    const submitBtn = document.getElementById('noteSubmitBtn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting Note...';

    try {
        await addDoc(collection(db, 'admin_notes'), {
            content: content,
            createdAt: serverTimestamp()
        });

        showStatus("Note posted successfully.", "success");
        noteForm.reset();
        fetchNotes(); // Refresh the list automatically
    } catch (error) {
        console.error("Error posting note: ", error);
        showStatus("Database error posting note.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Note to Database';
    }
});

// 3.6 Fetch and Display Admin Notes
async function fetchNotes() {
    try {
        const q = query(collection(db, "admin_notes"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        notesList.innerHTML = ''; 
        
        if (querySnapshot.empty) {
            notesList.innerHTML = '<p class="subtitle" style="font-size:0.9rem;">No notes posted yet.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'Just now';
            
            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <div class="meta">
                    <span style="font-weight: 600; color: #3b82f6;">Admin Note</span>
                    <span>${dateStr}</span>
                </div>
                <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: var(--text-main);">${data.content}</p>
            `;
            notesList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching notes: ", error);
        notesList.innerHTML = '<p class="error" style="color:#f87171;">Failed to load notes.</p>';
    }
}

// 4. Fetch and Display Attendee Feedback
async function fetchFeedbacks() {
    try {
        // Firebase Firestore Query: Get all feedback, ordered by newest first
        const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        feedbackList.innerHTML = ''; // Clear loading state
        
        if (querySnapshot.empty) {
            feedbackList.innerHTML = '<p class="subtitle" style="font-size:0.9rem; grid-column: 1 / -1;">No feedback received yet.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'Just now';
            
            // Safely handle rating in case a document was created manually without it
            const rating = parseInt(data.rating) || 0;
            const validRating = Math.min(Math.max(rating, 0), 5);
            const stars = '★'.repeat(validRating) + '☆'.repeat(5 - validRating);
            
            const experience = data.experience || 'No experience text provided';
            const improvements = data.improvements || 'No improvements text provided';
            
            const card = document.createElement('div');
            card.className = 'feedback-card';
            card.innerHTML = `
                <div class="meta">
                    <span class="rating-display">${stars}</span>
                    <span>${dateStr}</span>
                </div>
                <div style="margin-bottom: 0.8rem;">
                    <strong>Experience:</strong>
                    <p style="margin: 0.3rem 0 0 0; font-size: 0.95rem; color: var(--text-muted); line-height: 1.5;">${experience}</p>
                </div>
                <div>
                    <strong>Suggested Improvements:</strong>
                    <p style="margin: 0.3rem 0 0 0; font-size: 0.95rem; color: var(--text-muted); line-height: 1.5;">${improvements}</p>
                </div>
            `;
            feedbackList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching feedbacks: ", error);
        feedbackList.innerHTML = '<p class="error" style="color:#f87171; grid-column: 1 / -1;">Failed to load feedback from database.</p>';
    }
}

// Event listeners for manual refresh buttons
document.getElementById('refreshMistakesBtn').addEventListener('click', fetchMistakes);
document.getElementById('refreshFeedbackBtn').addEventListener('click', fetchFeedbacks);
document.getElementById('refreshNotesBtn').addEventListener('click', fetchNotes);
