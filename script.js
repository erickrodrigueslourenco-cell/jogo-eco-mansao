// 1. Rolagem Suave para os links do menu com ajuste de altura do topo
document.querySelectorAll('nav a, .btn').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerOffset = 80; // Altura do menu fixo
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 2. Animação de Surgimento (Fade-in) ao rolar a página
const linksEfeito = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1 // Ativa a animação quando 10% do card estiver na tela
});

// Seleciona os cards e itens da linha do tempo para animar
const elementosParaAnimar = document.querySelectorAll('.tech-card, .timeline-item');

elementosParaAnimar.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    linksEfeito.observe(el);
});
