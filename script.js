$(document).ready(function() {
  $('.abstract-toggle').click(function() {
    $(this).siblings('.abstract').toggle();
  });
});

// Get the expand/collapse button
const expandCollapseButton = document.getElementById("expand-collapse");

// Get the list container
const listContainer = document.getElementById("notebook-list-container");
 

// Add event listener to the expand/collapse button
expandCollapseButton.addEventListener("click", () => {
  // Toggle the class for the list container
  listContainer.classList.toggle("collapsed");

  expandCollapseButton.classList.toggle("expanded");
});
