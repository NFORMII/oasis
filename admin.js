import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 1. SUPABASE CONNECTION CONFIGURATION
// Replace these with your actual Supabase project URL and anon public key from your Supabase dashboard settings.
const SUPABASE_URL = 'https://wvopfgimxjpidaaigyuv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_EhqGfr6FYv291KDHs64Hzw_3WYyFzOU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cache HTML elements so we can show/hide them depending on login status
const authContainer = document.getElementById('auth-container');
const adminDashboard = document.getElementById('admin-dashboard');

// 2. CHECK EXISTING SESSION ON PAGE LOAD
// This checks if Supabase remembers an active login session in your browser storage.
async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // If logged in, hide the login box and show the book creation form
        authContainer.style.display = 'none';
        adminDashboard.style.display = 'block';
    } else {
        // If not logged in, show the login box and hide the form
        authContainer.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
}
checkUserSession();

// 3. HANDLE ADMIN LOGIN SUBMISSION
// Listens for when you type your email/password and click "Sign In"
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    // Call Supabase built-in sign-in function
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert('Login failed: ' + error.message);
    } else {
        // Successful login! Hide login container and reveal admin form
        authContainer.style.display = 'none';
        adminDashboard.style.display = 'block';
    }
});

// 4. HANDLE PUBLISHING A NEW BOOK
// Listens for when you fill out the book form and click "Publish Book to Oasis Store"
document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Extract values entered into the form fields
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const category = document.getElementById('category').value;
    const price = parseFloat(document.getElementById('price').value);
    const imageUrl = document.getElementById('image-url').value;
    const description = document.getElementById('description').value;

    // Send the data as a new row to your Supabase 'books' table
    const { data, error } = await supabase
        .from('books')
        .insert([{
            title: title,
            author: author,
            category: category,
            price: price,
            image_url: imageUrl,
            description: description
        }]);

    if (error) {
        alert('Error publishing book: ' + error.message);
    } else {
        alert('Book successfully published to Oasis storefront!');
        document.getElementById('add-book-form').reset(); // Clear form fields
    }
});

// 5. HANDLE ADMIN LOGOUT
// Clears your session token when you click the red Logout button
document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Refresh the page back to the login screen
});