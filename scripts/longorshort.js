document.addEventListener('DOMContentLoaded', function() {
    setInterval(scrolly, 50);
});
function scrolly(){
    let lister = document.getElementById("pageList");
    if(window.getComputedStyle(lister).width > '70vw'){
        lister.classList.add('long-page-list');
    }
}