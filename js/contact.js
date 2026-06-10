 
const formEle = document.getElementById('myform')


function validation(){
    const firstName = document.getElementById('firstname').value
    const lastName = document.getElementById('lastname').value
    const Email = document.getElementById('Email').value
    
    const firstNameError = document.getElementById('fnameError')
    const lastNameError = document.getElementById('lnameError')
    const emailError = document.getElementById('emailError')
    
    const modal = document.querySelector('.modal')
    
    if(firstName == ""){
        firstNameError.innerHTML = "Enter Your FirstName"
        return false
    }
    else{
        firstNameError.innerHTML = ""

    }
    if(lastName == ""){
        lastNameError.innerHTML = "Enter Your LastName"
        return false
    }
    else{
        lastNameError.innerHTML = ""
    }
    
    if(Email == ""){
        emailError.innerHTML = "Enter Your Email"
    return false
}
if(Email.indexOf('@')<=0){
    emailError.innerHTML = "@ Invalid Position"
    return false    
}
else{
    emailError.innerHTML = ""
}

}

// validation()




    // Navbar Responsive Code ===================
    const menuIcon = document.querySelector('.menu')
menuIcon.addEventListener('click',()=>{
    document.querySelector('.side_accordian').classList.add('sidebar_active')

})

const closeIcon = document.querySelector('.close_icon')
closeIcon.addEventListener('click',()=>{
    document.querySelector('.side_accordian').classList.remove('sidebar_active')

})



// now toggle
const listEle = document.querySelectorAll('.link');
console.log(listEle)
listEle.forEach(list => {
        console.log(list)
        list.onclick = function(){
                console.log(listEle)
                this.classList.toggle('active')    
        
            }
        });
        


// Email
// let body  = firstName + "" + lastName + "" + Email + "" ;
//         function sendMail(){
//             Email.send({
//         Host : "smtp.elasticemail.com",
//         Username : "chintumodi24@gmail.com",
//         Password : "448B4A0EEBEF130664F5B6368D17FBE59AC0",
//         To : 'bhupendramodi428@gmail.com',
//         From : "chintumodi24@gmail.com",
//         Subject: Subject,
//         Body : body,
//     }).then(
//       message => alert(message)
//     );
//         }


