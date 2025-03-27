
document.querySelector('.inbox').addEventListener('click', function() {
    window.open('https://docs.google.com/spreadsheets/d/1GAuXwfN3L7Gdbyn7RXP4sWImIwo72T7xgDBN1Uw7vTs/edit?usp=sharing', '_blank');
});

document.querySelector('.home').addEventListener('click', function() {
window.location.href = 'index.html';
});

document.querySelector('.contact').addEventListener('click', function() {
window.location.href = 'stats.html';
});

document.querySelector('.about').addEventListener('click', function() {
window.location.href = 'user-guide.html';
});

document.querySelector('.heart').addEventListener('click', function() {
window.location.href = 'dashboard.html';
});

