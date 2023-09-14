// FAQ 
const lableBox = document.getElementsByClassName('accordian_box')
const img = document.querySelector('.label_box > img')
// console.log(img)

for(i=0; i<lableBox.length; i++){
    lableBox[i].addEventListener('click', function(){
       const result =  this.classList.toggle('active')
    })

}




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
        















// toggle soon

        // const listEle = document.querySelectorAll('.dropdown_bar');
        // console.log(listEle) 
        // listEle.forEach(list =>{
        //     list.addEventListener('click',()=>{
        //         console.log(list)
        // list.classList.toggle('active')
        //   })
        // })


