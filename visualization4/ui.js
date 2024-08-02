

// UI Initialization
function setupStickyInputContainer() {
  const inputContainer = document.querySelector('.input-container');

  if (inputContainer) {
    const debugOverlay = document.createElement('div');
    debugOverlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      z-index: 9999;
    `;
    document.body.appendChild(debugOverlay);

    function updateDebugOverlay() {
      const rect = inputContainer.getBoundingClientRect();
      debugOverlay.innerHTML = `
        window.scrollY: ${window.scrollY}<br>
        inputContainer.offsetTop: ${inputContainer.offsetTop}<br>
        inputContainer.getBoundingClientRect().top: ${rect.top}<br>
        document.documentElement.scrollTop: ${document.documentElement.scrollTop}<br>
        window.pageYOffset: ${window.pageYOffset}<br>
        inputContainer.offsetHeight: ${inputContainer.offsetHeight}<br>
        window.innerHeight: ${window.innerHeight}<br>
        document.documentElement.clientHeight: ${document.documentElement.clientHeight}
      `;
    }

    function handleScroll() {
      const rect = inputContainer.getBoundingClientRect();
      if (rect.top <= 0) {
        inputContainer.classList.add('sticky');
        document.body.style.paddingTop = `${inputContainer.offsetHeight}px`;
      } else {
        inputContainer.classList.remove('sticky');
        document.body.style.paddingTop = '0px';
      }
      updateDebugOverlay();
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    updateDebugOverlay(); // Initial update

    // Recalculate after a short delay and on load
    setTimeout(handleScroll, 100);
    window.addEventListener('load', handleScroll);
  } else {
    console.log('Input container not found. Sticky functionality not applied.');
  }
}

  
function setupInputContentWrapper() {
  const inputToggle = document.getElementById('input-toggle');
  const inputContentWrapper = document.querySelector('.input-content-wrapper');
  const nav = document.querySelector('nav');

  if (inputToggle && inputContentWrapper) {
    inputToggle.addEventListener('click', function() {
      if (nav.classList.contains('expanded')) {
        nav.classList.remove('expanded');
      }
      inputContentWrapper.classList.toggle('expanded');
    });
  } else {
    console.log('Input toggle or wrapper not found. Expand/collapse functionality not applied.');
  }
}

function setupNavigationMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.querySelector('nav');
  const inputContentWrapper = document.querySelector('.input-content-wrapper');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      if (inputContentWrapper.classList.contains('expanded')) {
        inputContentWrapper.classList.remove('expanded');
      }
      nav.classList.toggle('expanded');
    });
  } else {
    console.log('Menu toggle or nav not found. Expand/collapse functionality not applied.');
  }
}

function createPopup(icon, className) {
  const content = icon.getAttribute(className === 'info-popup' ? 'data-info' : 'data-ref');
  
  // Remove any existing pop-ups
  const existingPopup = document.querySelector('.info-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create and position the pop-up
  const popup = document.createElement('div');
  popup.className = className;
  popup.innerHTML = content;
  document.body.appendChild(popup);
  
  const iconRect = icon.getBoundingClientRect();
  popup.style.left = `${iconRect.left + window.scrollX}px`;
  popup.style.top = `${iconRect.bottom + window.scrollY + 5}px`;
  popup.style.display = 'block';
  
  // Ensure the popup doesn't go off-screen
  const popupRect = popup.getBoundingClientRect();
  if (popupRect.right > window.innerWidth) {
    popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
  }
  
  // Process LaTeX in the popup
  MathJax.typesetPromise([popup]).then(() => {
    // Reposition after typesetting (LaTeX rendering might change size)
    const newPopupRect = popup.getBoundingClientRect();
    if (newPopupRect.right > window.innerWidth) {
      popup.style.left = `${window.innerWidth - newPopupRect.width - 10}px`;
    }
  });
  
  // Close the pop-up when clicking outside
  document.addEventListener('click', function closePopup(event) {
    if (!popup.contains(event.target) && event.target !== icon) {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }
  });
}

// Add event listeners for info and ref icons
function setupInfoIcons() {
  document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      createPopup(this, 'info-popup');
      e.stopPropagation();
    });
  });
    
} 