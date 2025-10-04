// Function to handle smooth scrolling to an element on the same page
function smoothScroll(targetId) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        // Calculate offset to account for fixed header
        const siteHeader = document.querySelector('.site-header');
        const headerOffset = siteHeader ? siteHeader.offsetHeight : 0; // Account for header if it exists
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

function getFullBaseURL() {
    const { origin, pathname } = window.location;
    const parts = pathname.split('/');
    const projectIndex = parts.indexOf('AMONTON');
    if (projectIndex >= 0) {
        return `${origin}/${parts.slice(1, projectIndex + 1).join('/')}/`;
    } else {
        return `${origin}/`;
    }
}

// Function to initialize header-related JavaScript logic, including navigation
function initializeHeaderLogic() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav_link');
    const siteHeader = document.querySelector('.site-header');

    const baseURL = getFullBaseURL();
    document.querySelectorAll('.nav_link').forEach(link => {
        const hash = link.getAttribute('href').split('#')[1];
        link.setAttribute('href', `${baseURL}index.html#${hash}`);
    });
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.setAttribute('href', `${baseURL}index.html#main-slider`);
    }


    // Hamburger Menu Logic
    if (hamburgerMenu && mobileNavOverlay && mobileNavLinks) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('is-active');
            mobileNavOverlay.classList.toggle('is-open');
            document.body.style.overflow = mobileNavOverlay.classList.contains('is-open') ? 'hidden' : '';
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                // This click listener is already handling closing the menu
                // The main smooth scroll logic will be in the unified listener below
                hamburgerMenu.classList.remove('is-active');
                mobileNavOverlay.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        });

        mobileNavOverlay.addEventListener('click', (event) => {
            if (event.target === mobileNavOverlay) {
                hamburgerMenu.classList.remove('is-active');
                mobileNavOverlay.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    }

    // Header Scroll Logic
    if (siteHeader) {
        function checkHeaderBackground() {
            // Check for sliderElement existence if its position is used for header background change
            const sliderElement = document.querySelector('.slider');
            if (sliderElement) {
                const sliderBottom = sliderElement.getBoundingClientRect().bottom;
                if (window.scrollY > sliderBottom - siteHeader.offsetHeight) {
                    siteHeader.classList.add('scrolled');
                } else {
                    siteHeader.classList.remove('scrolled');
                }
            } else {
                // Fallback: if no slider, make header scrolled after a small scroll threshold
                if (window.scrollY > 50) {
                    siteHeader.classList.add('scrolled');
                } else {
                    siteHeader.classList.remove('scrolled');
                }
            }
        }
        window.addEventListener('scroll', checkHeaderBackground);
        window.addEventListener('load', checkHeaderBackground);
        checkHeaderBackground(); // Call once on load in case page is already scrolled
    }


    // Unified click listener for all .nav_link elements (desktop and mobile)
    document.querySelectorAll('.nav_link').forEach(link => {
        link.addEventListener('click', function(e) {
            const currentPath = window.location.pathname.replace(/^\/|\/$/g, ''); // Get current page path (e.g., "home.html", "about.html")
            const linkHref = this.getAttribute('href'); // Get the full href attribute (e.g., "about.html#section2")
            
            // Parse the href to get page and hash
            const linkUrl = new URL(linkHref, window.location.origin);
            const targetPage = linkUrl.pathname.replace(/^\/|\/$/g, '');
            const targetHash = linkUrl.hash; // e.g., "#section2"

            // Check if the link points to a different page or to an internal anchor on the current page
            if (targetPage === currentPath || targetPage === '' || (targetPage === 'index.html' && currentPath === '')) { // 'index.html' is often the root
                // If it's the same page (or index.html/root), handle smooth scroll
                if (targetHash !== '') {
                    e.preventDefault(); // Prevent default jump
                    smoothScroll(targetHash);
                    // Close mobile menu if open
                    if (hamburgerMenu && mobileNavOverlay && hamburgerMenu.classList.contains('is-active')) {
                        hamburgerMenu.classList.remove('is-active');
                        mobileNavOverlay.classList.remove('is-open');
                        document.body.style.overflow = '';
                    }
                }
                // If it's the same page but no hash (e.g., clicking 'Home' while on home.html),
                // allow default behavior (page reload or stay at top)
            } else {
                // If it's a different page, navigate to that page and then scroll
                e.preventDefault(); // Prevent immediate default navigation  

                // Construct the full URL to navigate to
                const navigateUrl = targetHash ? `${linkUrl.pathname}${targetHash}` : linkUrl.pathname;
                window.location.href = navigateUrl;

                // Important: The smooth scroll will happen ON THE TARGET PAGE
                // after it loads. A common pattern is to store the hash in localStorage
                // and then retrieve it on the target page's DOMContentLoaded.
                if (targetHash) {
                    localStorage.setItem('scrollToHash', targetHash);
                }
            }
        });
    });

    // Check for and apply smooth scroll on page load if a hash was stored
    document.addEventListener('DOMContentLoaded', () => {
        const storedHash = localStorage.getItem('scrollToHash');
        if (storedHash) {
            localStorage.removeItem('scrollToHash'); // Clear the stored hash
            // A small delay often helps ensure the page has fully rendered
            setTimeout(() => {
                smoothScroll(storedHash);
            }, 100); 
        }
    });
}

// Function to load the footer
async function loadFooter() {
    try {
        const response = await fetch('footer.html'); // Fetch the separate footer file
        const footerHtml = await response.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;
    } catch (error) {
        console.error('Failed to load footer:', error);
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = '<p style="text-align: center; color: #888;">Failed to load footer content.</p>';
        }
    }
}

// Function to load the header (assuming it's called somewhere, e.g., in home.html)
async function loadHeader() {
    try {
        const response = await fetch('header.html'); 
        const headerHtml = await response.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;
        
        if (typeof initializeHeaderLogic === 'function') {
            initializeHeaderLogic();
        } else {
            console.error("initializeHeaderLogic not found. Ensure common_functions.js is loaded correctly.");
        }
    } catch (error) {
        console.error('Failed to load header:', error);
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = '<p style="text-align: center; color: #888;">Failed to load header content.</p>';
        }
    }
}
