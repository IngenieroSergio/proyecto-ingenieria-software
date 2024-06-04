
function changeImage(imageId, imageUrl) {
    document.getElementById(imageId).src = imageUrl;
}

let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        
        navbar.style.top = '-60px'; 
    } else {
       
        navbar.style.top = '0';
    }
    lastScrollTop = scrollTop;
});

const toggleDescription = document.querySelector(
    '.title-description'
);
const toggleAdditionalInformation = document.querySelector(
    '.title-additional-information'
);
const toggleReviews = document.querySelector('.title-reviews');


const contentDescription = document.querySelector(
    '.text-description'
);
const contentAdditionalInformation = document.querySelector(
    '.text-additional-information'
);
const contentReviews = document.querySelector('.text-reviews');


toggleDescription.addEventListener('click', () => {
    contentDescription.classList.toggle('hidden');
});

toggleAdditionalInformation.addEventListener('click', () => {
    contentAdditionalInformation.classList.toggle('hidden');
});

toggleReviews.addEventListener('click', () => {
    contentReviews.classList.toggle('hidden');
});