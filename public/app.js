const donate=document.querySelector(".donate");
const input=document.querySelector(".input");
const crossButtons=document.querySelectorAll(".cross");
const btn2=document.querySelector(".btn2");
signupBtn=document.querySelector(".signup-button");
signPage=document.querySelector(".signup-page");

signupBtn.addEventListener("click",()=>{
    signPage.style.display="";
    signPage.style.overflow="hidden"
})

donate.addEventListener("click",()=>{
    input.style.display="";
});
btn2.addEventListener("click",()=>{
    input.style.display="";
});

crossButtons.forEach(cross => {
    cross.addEventListener("click", () => {
        input.style.display = "none";
        signPage.style.display = "none";
    });
});


document.addEventListener("DOMContentLoaded",function(){
    username=localStorage.getItem("username");
    userLink=document.querySelector(".sign-link");

    if(username){
        signupBtn.textContent=username;
        userLink.href="/profile";
    }
});





