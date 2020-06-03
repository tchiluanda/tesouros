let frases = [
    "A amizade é um amor que nunca morre.",
    "Tão bom morrer de amor! E continuar vivendo...",
    "Há 2 espécies de chatos: os chatos propriamente ditos e os amigos, que são os nossos chatos prediletos.",
    "A saudade é o que faz as coisas pararem no Tempo.",
    "A preguiça é a mãe do progresso. Se o homem não tivesse preguiça de caminhar, não teria inventado a roda."
];

let $cont_svg = d3.select("div.container-svg");

let h = $cont_svg.style("height");
h = +h.slice(0, h.length-2);

let w = $cont_svg.style("width");
w = +w.slice(0, w.length-2);

let margin = 20;

console.log(h,w);

let altura_frase, largura_frase;

function insere_frases() {

    let $frases = $cont_svg.selectAll("p.frases").data(frases);

    $frases.enter()
    .append("p")
    .classed("frases", true)
    .style("opacity", 0)
    .append("span")
    .text(d => d);
}

function anima_frase() {

    let $frases = $cont_svg.selectAll("p.frases");

    $frases
        .style("top", function(d) {
            altura_frase = d3.select(this).style("height");
            altura_frase = +altura_frase.slice(0, altura_frase.length-2);

            largura_frase = d3.select(this).style("width");
            largura_frase = +largura_frase.slice(0, largura_frase.length-2);

            let posicao_top = Math.random() * h;
            posicao_top = posicao_top > h - altura_frase - margin ? h - altura_frase - margin : posicao_top;

            //console.log(altura_frase, largura_frase);
            //console.log(posicao_top, posicao_top + "px");

            return posicao_top + "px";
        })
        .style("left", function(d) {
            let posicao_left = Math.random() * h;
            posicao_left = posicao_left > w - largura_frase - margin ? w - largura_frase - margin : posicao_left;
            //console.log(posicao_left, posicao_left + "px");
            return posicao_left + "px";
        });

    console.log("fui chamada");

    $frases
        .transition()
        .delay((d,i) => i * duracao)
        .duration(duracao)
        .style("opacity", 1);
    
    $frases
        .transition()
        .delay((d,i) => i * duracao + duracao)
        .duration(duracao)
        .style("opacity", 0);
}

insere_frases();
let duracao = 2000;
let tempo_total = (duracao * (frases.length - 1)) + (duracao * 2);

anima_frase();
let t = d3.interval(function(elapsed) {
    console.log(elapsed);
    anima_frase();
    if (elapsed > 60000) t.stop();
}, tempo_total, 0)

let flag = false;
window.addEventListener('scroll', function() {
    if (!flag) {
        t.stop();
        flag = true;
    }
});



