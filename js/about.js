
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
        