document.addEventListener('DOMContentLoaded', () => {
    // Tab Elements
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const tabsContainer = document.querySelector('.tabs');
    const formSlider = document.getElementById('form-slider');
    
    // Form Elements
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');

    // Switch to Sign Up
    tabSignup.addEventListener('click', () => {
        tabsContainer.classList.add('signup-active');
        formSlider.classList.add('show-signup');
        
        tabSignup.classList.add('active');
        tabSignin.classList.remove('active');
    });

    // Switch to Sign In
    tabSignin.addEventListener('click', () => {
        tabsContainer.classList.remove('signup-active');
        formSlider.classList.remove('show-signup');
        
        tabSignin.classList.add('active');
        tabSignup.classList.remove('active');
    });

    // Handle Sign In Submit
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signin-email').value;
        const btn = document.getElementById('signin-btn');
        const originalText = btn.textContent;
        
        btn.textContent = 'Authenticating...';
        btn.style.opacity = '0.8';
        btn.disabled = true;

        setTimeout(() => {
            alert(`Welcome back!\n\nEmail: ${email}\n\nNote: This is a dummy login.`);
            btn.textContent = originalText;
            btn.style.opacity = '1';
            btn.disabled = false;
            signinForm.reset();
        }, 1200);
    });

    // Handle Sign Up Submit
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const btn = document.getElementById('signup-btn');
        const originalText = btn.textContent;
        
        btn.textContent = 'Creating Account...';
        btn.style.opacity = '0.8';
        btn.disabled = true;

        setTimeout(() => {
            alert(`Account created successfully!\n\nName: ${name}\nEmail: ${email}\n\nNote: This is a dummy registration.`);
            btn.textContent = originalText;
            btn.style.opacity = '1';
            btn.disabled = false;
            signupForm.reset();
            
            // Switch back to login
            tabSignin.click();
        }, 1500);
    });
});
