/* Navbar Handling */

document.addEventListener('click', event => {
    const navSections = document.querySelectorAll('.nav-section');
    const clickedInsideNav = event.target.closest('nav');
    
    navSections.forEach(section => {
        const dropdown = section.querySelector('div');
        if (dropdown) {
            if (section.contains(event.target)) {
                const isVisible = dropdown.style.display === 'block';
                dropdown.style.display = isVisible ? 'none' : 'block';
                dropdown.style.opacity = isVisible ? '0' : '1';
                dropdown.style.visibility = isVisible ? 'hidden' : 'visible';
            } else if (!clickedInsideNav) {
                dropdown.style.display = 'none';
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            }
        }
    });
});
