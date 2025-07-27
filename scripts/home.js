let home = document.querySelector('.home');
let createChatBtn = document.getElementById('newChatBtn2');
let btn = document.querySelector('.homeBtn');

console.log(createChatBtn.style.display);

document.addEventListener("DOMContentLoaded", ()=>{
    btn.addEventListener('click', ()=>{
        createChatBtn.style.setProperty('display', 'flex', 'important');

        console.log("hi");
        home.classList.remove('hide');
        setTimeout(clear, 0);

    })
    btn.children[0].addEventListener('click', ()=>{
        createChatBtn.style.setProperty('display', 'flex', 'important');


        console.log("hi");
        home.classList.remove('hide');
        setTimeout(clear, 0);

    })
})


function clear(){
    home.style.display="block";
}