let loader = document.getElementById("loader");
let loadImg =  document.getElementById("lil-load");

setTimeout(hide, 5000);
setTimeout(show, 300);

function hide(){
    loader.style.display = "none";
}

function show(){
    loadImg.src = '/images/firstloadicon.gif';
}