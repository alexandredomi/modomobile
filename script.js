function showDiv(divId) {
    // Esconder todas as divs de conteúdo
    const divs = document.querySelectorAll('.content');
    divs.forEach(div => {
        div.classList.remove('active');
    });

    // Mostrar apenas a div correspondente
    const divToShow = document.getElementById(divId);
    if (divToShow) {
        divToShow.classList.add('active');
    }
}