import { 
    auth, 
    db, 
    signInAnonymously, 
    onAuthStateChanged, 
    collection, 
    addDoc, 
    serverTimestamp 
} from './firebase-config.js';

const feedbackForm = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
let isAuthReady = false;

// 1. Silent Anonymous Authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAuthReady = true;
        console.log("Authenticated silently as anonymous user.");
    } else {
        // Trigger anonymous sign in if no user is present
        signInAnonymously(auth).catch((error) => {
            console.error("Auth error:", error);
            showStatus("Failed to establish secure connection. Please refresh.", "error");
        });
    }
});

// Helper to show status messages in the UI
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `message ${type}`;
    // Clear message after 5 seconds
    setTimeout(() => {
        statusMessage.className = 'message';
    }, 5000);
}

// 2. Form Submission Logic
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload
    
    // Ensure Firebase auth is completed before allowing writes
    if (!isAuthReady) {
        showStatus("Initializing secure connection, please wait a moment...", "error");
        return;
    }

    // Gather form data
    const experience = document.getElementById('experience').value.trim();
    const improvements = document.getElementById('improvements').value.trim();
    
    // Get the checked radio button value for rating
    const ratingElement = document.querySelector('input[name="rating"]:checked');
    
    if (!ratingElement) {
        showStatus("Please select a star rating.", "error");
        return;
    }

    const rating = parseInt(ratingElement.value, 10);

    // Disable button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Feedback...';

    try {
        // Firebase Firestore Query: Add a new document to the 'feedbacks' collection
        await addDoc(collection(db, 'feedbacks'), {
            experience: experience,
            improvements: improvements,
            rating: rating,
            createdAt: serverTimestamp() // Uses secure Firebase server time
        });

        // Show success and clear the form
        showStatus("Thank you for your valuable feedback!", "success");
        feedbackForm.reset();
        
        // Uncheck the star rating visually
        if (ratingElement) ratingElement.checked = false;
        
    } catch (error) {
        console.error("Error writing document: ", error);
        showStatus("An error occurred while submitting. Please try again.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
    }
});
