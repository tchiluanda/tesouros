let frases = [
    "A amizade é um amor que nunca morre.",
    "Tão bom morrer de amor! E continuar vivendo...",
    "Há 2 espécies de chatos: os chatos propriamente ditos e os amigos, que são os nossos chatos prediletos.",
    "A saudade é o que faz as coisas pararem no Tempo.",
    "A preguiça é a mãe do progresso. Se o homem não tivesse preguiça de caminhar, não teria inventado a roda."
];

let $cont_svg = d3.select("div.container-svg");
let $svg = d3.select("svg");

let h = $cont_svg.style("height");
h = +h.slice(0, h.length-2);

let w = $cont_svg.style("width");
w = +w.slice(0, w.length-2);

let margin = 20;

console.log(h,w);

let altura_frase, largura_frase;
let duracao = 3000;
let tempo_total = (duracao * (frases.length - 1)) + (duracao * 2);

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

d3.csv("./web/dados/logo.csv").then(function(grid) {
    console.log(grid[0], grid.columns);

    let margin = w < 580 ? 15 : 50;

    let x = d3.scaleLinear()
      .domain(d3.extent(grid, d => +d.x))
      .range([margin, w - margin]);

    let y = d3.scaleLinear()
      .domain(d3.extent(grid, d => +d.y))
      .range([margin, h - margin])

    let cor_inicial = d3.scaleOrdinal()
      .domain(["1", "2", "3"])
      .range(["rgb(255,213,0)", "rgb(0,74,147)", "rgb(50,156,50)"]);

    let pontos = $svg.selectAll("circle.pontos").data(grid);

    let pontos_enter = pontos.enter()
      .append("circle")
      .classed("pontos", true)
      .attr("cx", d => Math.random()*(w-2*margin) + margin)
      .attr("cy", d => Math.random()*(w-2*margin) + margin)
      .attr("r", 3)
      .attr("opacity", 0);

    pontos = pontos.merge(pontos_enter);

    insere_frases();

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
        pontos.transition()
          .duration(d => Math.random() * duracao)
          .attr("opacity", 1);

        pontos.transition()
          .delay(duracao * 1.5)
          .duration(duracao)
          .attr("cx", d => x(d.x))
          .attr("cy", d => y(d.y));
    });
    })


