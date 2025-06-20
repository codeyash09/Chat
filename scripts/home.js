let home = document.querySelector('.home');
let btn = document.querySelector('.homeBtn');

document.addEventListener("DOMContentLoaded", ()=>{
    btn.addEventListener('click', ()=>{

        console.log("hi");
        home.classList.remove('hide');
    })
    btn.children[0].addEventListener('click', ()=>{

        console.log("hi");
        home.classList.remove('hide');
    })
})


