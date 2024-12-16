function updateActiveSection() {
    const sections = document.querySelectorAll('.section');
    const windowHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    const activeIndex = Math.floor((scrollPosition + windowHeight * 0.5) / windowHeight);

    sections.forEach((section, index) => {
        if (index <= activeIndex) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', updateActiveSection);
window.addEventListener('load', updateActiveSection);
function updatePagination() {
    const dots = document.querySelectorAll('.pagination-dot');
    const activeIndex = Math.floor((window.scrollY + window.innerHeight * 0.5) / window.innerHeight);

    dots.forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', updatePagination);
window.addEventListener('load', updatePagination);

// ページネーションのドットをクリックしたときのスクロール処理
const dots = document.querySelectorAll('.pagination-dot');
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        window.scrollTo({
            top: index * window.innerHeight,
            behavior: 'smooth'
        });
    });
});

