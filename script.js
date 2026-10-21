// ----------------------------------------------------------------------
// 1. SUPABASE DATABASE CONFIGURATION & DATA FETCHING
// ----------------------------------------------------------------------
const SUPABASE_URL = "https://wvopfgimxjpidaaigyuv.supabase.co";
const SUPABASE_KEY = "sb_publishable_EhqGfr6FYv291KDHs64Hzw_3WYyFzOU"; // Replace with your Publishable Key

let books = [];
let cart = [];

async function fetchOasisBooks() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Database response:", data);

    books = data.map(book => ({
        id: book.id,
        title: book.title || 'Untitled',
        author: book.author || 'Unknown Author',
        category: book.category ? (book.category.charAt(0).toUpperCase() + book.category.slice(1).toLowerCase()) : 'General', 
        price: Number(book.price) || 0,
        rating: book.rating || 5,
        cover: book.image_url || 'https://via.placeholder.com/300x400?text=No+Cover',
        synopsis: book.description || 'No description available for this book.',
        pages: book.pages || 300
    }));

    renderBooks(books);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

// ----------------------------------------------------------------------
// 2. DOM ELEMENTS
// ----------------------------------------------------------------------
const booksGrid = document.getElementById('books-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');

// Cart Elements
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartBody = document.getElementById('cart-body');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const whatsappBtn = document.getElementById('whatsapp-checkout-btn');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalImg = document.getElementById('modal-img');
const modalCategory = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalAuthor = document.getElementById('modal-author');
const modalPrice = document.getElementById('modal-price');
const modalSynopsis = document.getElementById('modal-synopsis');
const modalPages = document.getElementById('modal-pages');
const modalAddBtn = document.getElementById('modal-add-btn');

// ----------------------------------------------------------------------
// 3. RENDER CATALOG
// ----------------------------------------------------------------------
function renderBooks(booksToRender) {
    booksGrid.innerHTML = '';

    if (booksToRender.length === 0) {
        booksGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fa-solid fa-book-open" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                <p>No books found matching your search.</p>
            </div>
        `;
        return;
    }

    booksToRender.forEach(book => {
        const fullStars = Math.floor(book.rating);
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fa-solid fa-star"></i>';
        if (book.rating % 1 !== 0) starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';

        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-image-wrapper">
                <span class="category-tag">${book.category}</span>
                <img src="${book.cover}" alt="${book.title}" class="book-cover">
                <button class="quick-view-btn" onclick="openQuickView(${book.id})">
                    <i class="fa-solid fa-eye"></i> Quick View
                </button>
            </div>
            <div class="book-info">
                <div class="book-rating">${starsHTML}</div>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-bottom">
                    <span class="book-price">$${book.price.toFixed(2)}</span>
                    <button class="add-cart-btn" onclick="addToCart(${book.id})">
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
        booksGrid.appendChild(card);
    });
}

// ----------------------------------------------------------------------
// 4. FILTER & SEARCH LOGIC
// ----------------------------------------------------------------------
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') {
            renderBooks(books);
        } else {
            const filtered = books.filter(b => b.category === filter);
            renderBooks(filtered);
        }
    });
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = books.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query)
    );
    renderBooks(filtered);
});

// ----------------------------------------------------------------------
// 5. CART MANAGEMENT
// ----------------------------------------------------------------------
function addToCart(bookId) {
    const existingItem = cart.find(item => item.id === bookId);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        const book = books.find(b => b.id === bookId);
        if (book) cart.push({ ...book, qty: 1 });
    }
    updateCartUI();
    openCart();
}

function updateQuantity(bookId, change) {
    const item = cart.find(i => i.id === bookId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== bookId);
        }
    }
    updateCartUI();
}

function removeFromCart(bookId) {
    cart = cart.filter(i => i.id !== bookId);
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;

    cartBody.innerHTML = '';

    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Your shopping cart is empty.</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <img src="${item.cover}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-author">${item.author}</p>
                    <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            cartBody.appendChild(cartItemEl);
        });
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = cart.length > 0 ? 3.50 : 0;
    const total = subtotal + delivery;

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
}

cartToggleBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ----------------------------------------------------------------------
// 6. WHATSAPP CHECKOUT INTEGRATION
// ----------------------------------------------------------------------
whatsappBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Your cart is empty! Please add some books first.");
        return;
    }

    let message = "Hello Oasis Bookstore! 📚\nI would like to place an order for the following books:\n\n";
    cart.forEach(item => {
        message += `• ${item.title} (x${item.qty}) - $${(item.price * item.qty).toFixed(2)}\n`;
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal + 3.50;

    message += `\nDelivery: $3.50`;
    message += `\n*Total Amount: $${total.toFixed(2)}*\n\nPlease let me know how to proceed with payment!`;

    const phoneNumber = "15552345678";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
});

// ----------------------------------------------------------------------
// 7. QUICK VIEW MODAL LOGIC
// ----------------------------------------------------------------------
function openQuickView(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    modalImg.src = book.cover;
    modalCategory.textContent = book.category;
    modalTitle.textContent = book.title;
    modalAuthor.textContent = `by ${book.author}`;
    modalPrice.textContent = `$${book.price.toFixed(2)}`;
    modalSynopsis.textContent = book.synopsis;
    modalPages.textContent = book.pages;

    modalAddBtn.onclick = () => {
        addToCart(book.id);
        closeQuickView();
    };

    modalOverlay.classList.add('open');
}

function closeQuickView() {
    modalOverlay.classList.remove('open');
}

modalCloseBtn.addEventListener('click', closeQuickView);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeQuickView();
});
// Check if the current visitor is logged in as an admin
async function checkAdminStatus() {
    // Ensure supabase is initialized in your script.js
    const { data: { session } } = await supabase.auth.getSession();
    
    // Grab the admin button we created in index.html
    const adminBtn = document.getElementById('nav-admin-btn');
    
    // If a session exists (you are logged in), reveal the button!
    if (session && adminBtn) {
        adminBtn.style.display = 'inline-block';
    }
}

// Run the check as soon as index.html loads
checkAdminStatus();

// ----------------------------------------------------------------------
// 8. INITIALIZATION
// ----------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    fetchOasisBooks();
    updateCartUI();
});