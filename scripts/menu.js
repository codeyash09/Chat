let menu = document.getElementById("sirvo");
let cover = document.getElementById("coverscreen121");
let links = document.getElementById("linksmener");
let meny = document.getElementById("meny");

menu.style.display = 'none';
cover.style.display = 'none';

let openBtn = document.getElementById('collapser');

openBtn.addEventListener('click', openMenu);

function openMenu(){
    menu.style.display = 'flex';
    menu.style.animation = 'splash 1.5s cubic-bezier(0.4, 0, 1, 1)';
    menu.style.left = '0';
    cover.style.display = 'flex';
    cover.style.opacity = '1';
    cover.style.animation = 'unblur .5s cubic-bezier(0.4, 0, 1, 1)';
    meny.style.width = '100vw';
    links.style.opacity = '1';
    links.style.animation = 'unblur2 2.5s cubic-bezier(0.4, 0, 1, 1)';
  
}


let closeBtn = document.getElementById('closer');

closeBtn.addEventListener('click', closeMenu);

function closeMenu(){
    menu.style.animation = 'unsplash 1.5s cubic-bezier(0.4, 0, 1, 1)';
    menu.style.left = '-200vw';
    setTimeout(hideMenu, 1500);
    cover.style.opacity = '0';
    cover.style.animation = 'blur4 2s cubic-bezier(0.4, 0, 1, 1)';
    setTimeout(hideCover, 2000);

    links.style.opacity = '0';
    links.style.animation = 'blur4 0.5s cubic-bezier(0.4, 0, 1, 1)';

}

function hideMenu(){
    menu.style.display = 'none';
}

function hideCover(){
    cover.style.display = 'none';
    meny.style.width = '8vh';
    
}