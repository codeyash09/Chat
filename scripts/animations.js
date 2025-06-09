// Toggle dropdown when clicking profile image
const profileImage = document.getElementById('realProfile');
const dropdownMenu = document.getElementById('menu');
const content = document.getElementById('content');
var showing = false;


profileImage.addEventListener('click', () => {
  dropdownMenu.classList.toggle("show");
  showing = !showing;
});


dropdownMenu.addEventListener('click', () => {
  dropdownMenu.classList.remove("show");
  showing = false;
});

content.addEventListener('click', () => {
  dropdownMenu.classList.remove("show");
  showing = false;
});


document.querySelectorAll('a').forEach(function(anchor) {
  anchor.addEventListener('click', function(event) {
    dropdownMenu.classList.remove("show");
    showing = false;
  });
});


document.querySelector('footer').addEventListener('click', () => {
  dropdownMenu.classList.remove("show");
  showing = false;
});