// FAQ accordion (homepage + database pages)
var lableBox = document.getElementsByClassName('accordian_box');
for (var i = 0; i < lableBox.length; i++) {
  lableBox[i].addEventListener('click', function () {
    this.classList.toggle('active');
  });
}
