// Add a class to the menu when scrolling
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const menu = document.querySelector('.menu');
    const headerHeight = header.offsetHeight;
  
    if (window.scrollY > headerHeight) {
        menu.classList.add('fixed-menu');
    } else {
        menu.classList.remove('fixed-menu');
    }
});


document.addEventListener('DOMContentLoaded', function() {
    var menuToggle = document.querySelector('.menu-toggle');
    var menuItems = document.querySelector('.menu');
    
    menuToggle.addEventListener('click', function() {
      menuItems.classList.toggle('collapsible');
    });
  });
  
  document.addEventListener("DOMContentLoaded", function() {
    const abstractToggleButtons = document.querySelectorAll(".abstract-toggle");
  
    abstractToggleButtons.forEach(function(button) {
      button.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default anchor behavior
  
        const abstract = this.nextElementSibling;
        abstract.classList.toggle("show");
      });
    });
  });
  
  
  
  