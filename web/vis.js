let frases = [
    "A amizade é um amor que nunca morre.",
    "Tão bom morrer de amor! E continuar vivendo...",
    "Há 2 espécies de chatos: os chatos propriamente ditos e os amigos, que são os nossos chatos prediletos.",
    "A saudade é o que faz as coisas pararem no Tempo.",
    "A preguiça é a mãe do progresso. Se o homem não tivesse preguiça de caminhar, não teria inventado a roda."
];

let $cont_svg = d3.select("div.container-svg");
let $svg = d3.select("svg");
let $titulo = d3.select(".titulo > h1");
const $steps = d3.selectAll(".slide");
let flag = false;
let t; //, $frases;

// para detectar área do título, em que não podem ser inseridas as frases
let h0_titulo = $titulo.node().getBoundingClientRect().top;
let h1_titulo = $titulo.node().getBoundingClientRect().bottom;

console.log("h0, h1", h0_titulo, h1_titulo);


let h = $cont_svg.style("height");
h = +h.slice(0, h.length-2);

let w = $cont_svg.style("width");
w = +w.slice(0, w.length-2);

let margin = 20;

console.log(h,w);

let altura_frase, largura_frase;
let duracao = 3000;
let tempo_total = (duracao * (frases.length - 1)) + (duracao * 2);
//let $frases;

function insere_frases() {

    let $frases = $cont_svg.selectAll("p.frases").data(frases);

    $frases.enter()
        .append("p")
        .classed("frases", true)
        .style("opacity", 0)
        .append("span")
        .text(texto => '"' + texto + '"');
        //.text(texto => "●" + ' "' + texto + '"');

    //$frases = $cont_svg.selectAll("p.frases");
}

function anima_frase() {

    let $frases = $cont_svg.selectAll("p.frases");
    
    $frases
        .style("top", function(d) {
            altura_frase = d3.select(this).style("height");
            altura_frase = +altura_frase.slice(0, -2);

            largura_frase = d3.select(this).style("width");
            largura_frase = +largura_frase.slice(0, -2);

            let posicao_top = Math.random() * h;

            function colisao_com_titulo(posicao) {
                if (posicao > h0_titulo & posicao < h1_titulo) {
                    return true;
                }
                else return false;
            }

            // verifica se cabe no viewport
            if (posicao_top < h - altura_frase - margin) {

                // detecção de colisão com o título    
                if (colisao_com_titulo(posicao_top)) {
                    posicao_top = h0_titulo - altura_frase - 10;
                } else if (colisao_com_titulo(posicao_top + altura_frase)) {
                    posicao_top = h1_titulo + 10;
                } else {
                    posicao_top = posicao_top;
                }
            } else {
                posicao_top = h - altura_frase - margin;
            };

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

function sumariza_dados(dados, criterio, ordena = false) {
    // determina valores unicos
    const sumario = [];

    categorias_unicas = dados
      .map(d => d[criterio])
      .filter((v, i, a) => a.indexOf(v) === i);

    for (cat of categorias_unicas) {
        const cont = dados
          .filter(d => d[criterio] === cat)
          .length;

        sumario.push({"categoria" : cat,
                      "contagem"  : cont});                 
    }

    if (ordena) sumario.sort((a,b) => b.contagem - a.contagem);

    return sumario;    
}

function prepara_dados(dados, criterio, raio, margem) {
    // determina valores únicos
    let dados_sumarizados = sumariza_dados(dados, criterio, true);

    let contagem_maxima = d3.max(dados_sumarizados, d => d.contagem);

    let qde_linhas_grid = Math.ceil(Math.sqrt(contagem_maxima));

    let parametros_colunas_grid = dados_sumarizados.map(d => {
        qde = Math.ceil(d.contagem/qde_linhas_grid);
        return({ 
            "categoria" : d.categoria,
            "largura" : qde * 3 * raio
          }
        )
        });

    let pos_inicial_ac = 0;

    let posicoes_iniciais = {};
    parametros_colunas_grid.forEach((d,i) => {
        let largura_anterior =
          i == 0 ? 0 : parametros_colunas_grid[i-1].largura + margem;

        pos_inicial_ac += largura_anterior;

        d["pos_inicial"] = pos_inicial_ac;

        posicoes_iniciais[d.categoria] = d.pos_inicial;
    });
    console.log({parametros_colunas_grid});
    
    


    let mini_dados = {};
    mini_dados["dados"] = [];
    let categorias = dados_sumarizados.map(d => d.categoria);
    
    for (cat of categorias) {
        dados
          .filter(d => d[criterio] == cat)
          .forEach((d,i) => mini_dados.dados.push({
              "nome" : d.nome,
              "categoria" : d[criterio], // que é próprio cat
              "x_ini" : d["x_ini"],
              "y_ini" : d["y_ini"],
              "x" : d.x,
              "y" : d.y,
              "value" : d.value,
              "index_relativo" : i,
              "eixo_principal" : Math.floor(i / (qde_linhas_grid + 1)) * 3 * raio,
              "eixo_secundario" : (i % (qde_linhas_grid + 1)) * 3 * raio
          }));
    };

    let ultimo_conjunto = parametros_colunas_grid.slice(-1).pop();
    let tamanho_necessario = ultimo_conjunto.pos_inicial + ultimo_conjunto.largura;

    mini_dados["parametros"] = {
        "posicoes_iniciais" : posicoes_iniciais,
        "parametros_coluna" : parametros_colunas_grid,
        "largura_eixo_principal_total" : tamanho_necessario,
        "largura_eixo_secundario_total" : qde_linhas_grid * 3 * raio,
        "resumo" : dados_sumarizados,
        "raio" : raio
    };

    console.log(mini_dados);

    return(mini_dados);
}

function acrescenta_rotulos(mini_dados, deslocado, quanto) {

    let $rotulos = d3.select(".container-svg")
      .selectAll("div.rotulos")
      .data(mini_dados.parametros.resumo);

    let $rotulos_enter = 
      $rotulos
      .enter()
      .append("div")
      .classed("rotulos", true);

    $rotulos_enter.append("h2");

    $rotulos_enter.append("p");

    $rotulos = $rotulos.merge($rotulos_enter);

    $rotulos
      .selectAll("h2")
      .text(d => d.categoria);
    
    $rotulos
      .selectAll("p")
      .text(d => d3.format(".000%")(d.contagem / mini_dados.dados.length));

    let largura_total = mini_dados.parametros.largura_eixo_principal_total;
    let altura_total = mini_dados.parametros.largura_eixo_secundario_total;

    let margem_inicial_secundario = (h - altura_total)/2;
    let margem_inicial_principal = (w - largura_total)/2;

    $rotulos
      .style("left", function(d) {
        console.log("To aqui dentro", mini_dados.parametros.posicoes_iniciais[d.categoria]);
        return (mini_dados.parametros.posicoes_iniciais[d.categoria] + margem_inicial_principal - mini_dados.parametros.raio + "px")}
        )
      .style("top",  function(d) {
        let altura_rotulo = +d3.select(this).style("height").slice(0,-2);
        return ((margem_inicial_secundario - altura_rotulo - margin) + "px");
      });
}

d3.csv("./web/dados/data.csv").then(function(grid) {
    console.log(grid[0], grid.columns);

    let margin = w < 580 ? 15 : 25;

    let menor_dimensao = Math.min(w, h) - 2 * margin;

    let qde_y = d3.max(grid, d => +d.y); 
    let qde_x = d3.max(grid, d => +d.x);
    // isso vai dar a quantidade de bolinhas em cada direção

    let maior_qde = Math.max(qde_x, qde_y);

    let raio = menor_dimensao / (2 * maior_qde);

    console.log(sumariza_dados(grid, "1. Idade", false));
    console.log(prepara_dados(grid, "1. Idade", raio, margin));

    let w_necessario = raio * 2 * qde_x;
    let h_necessario = raio * 2 * qde_y;

    let margin_grid = {
        "w" : (w - w_necessario)/2,
        "h" : (h - h_necessario)/2
    };

    grid.forEach(d => {
        d["x_ini"] = Math.random()*(w-2*margin) + margin;
        d["y_ini"] = Math.random()*(h-2*margin) + margin;
    });

    let cor_texto = d3.select(":root").style("--cor-texto");

    /* debug

    $svg.append("rect")
      .attr("x", margin_grid.w)
      .attr("y", margin_grid.h)
      .attr("width", menor_dimensao)
      .attr("height", menor_dimensao)
      .attr("stroke", "red")
      .attr("fill", "transparent"); */

    let x = d3.scaleLinear()
      .domain(d3.extent(grid, d => +d.x))
      .range([margin_grid.w, w - margin_grid.w]);

    let y = d3.scaleLinear()
      .domain(d3.extent(grid, d => +d.y))
      .range([margin_grid.h, h - margin_grid.h])

    let cor_inicial = d3.scaleOrdinal()
      .domain(["1", "2", "3"])
      .range(["rgb(255,213,0)", "rgb(0,74,147)", "rgb(50,156,50)"]);

    let pontos = $svg.selectAll("circle.pontos").data(grid, d => d.nome);

    let pontos_enter = pontos.enter()
      .append("circle")
      .classed("pontos", true)
      .attr("cx", d => d["x_ini"])
      .attr("cy", d => d["y_ini"])
      .attr("r", raio)
      .attr("fill", d => cor_inicial(d.value))
      .attr("opacity", 0);

    pontos = pontos.merge(pontos_enter);

    //console.log("Pontos antes", pontos)

    insere_frases();

    function desenha(step, direcao) {
        switch (step) {
            case 1 :
                desenha_step1(direcao);
                break;
            case 2 :
                desenha_step2(direcao);
                break;
            case 3 :
                desenha_step3(direcao);
                break;                
        }
    }

    function desenha_step1(direcao) {
        if (direcao == "descendo") {
        } 
        else {
            $titulo
              .transition()
              .duration(duracao)
              .style("opacity", 1);

            pontos.transition()
              .duration(duracao)
              .attr("cx", d => d.x_ini)
              .attr("cy", d => d.y_ini);

            pontos.transition()
              .delay(duracao)
              .duration(duracao)
              .attr("opacity", 0);          
        }

        anima_frase();
        t = d3.interval(function(elapsed) {
            console.log(elapsed);
            anima_frase();
            if (elapsed > 60000) t.stop();
        }, tempo_total, 0)
    
        flag = false;
    }

    function desenha_step2(direcao) {
        if (direcao == "descendo") {
            if (!flag) {
                t.stop();
                flag = true;
            }
    
            d3.selectAll("p.frases")
              .transition()
              .duration(duracao)
              .style("opacity", 0);
    
            d3.selectAll("h1")
              .transition()
              .duration(duracao/2)
              .style("opacity", 0);       
    
            pontos.transition()
              .duration(d => Math.random() * duracao)
              .attr("opacity", 1);
             
    
            pontos.transition()
              .delay(duracao)
              .duration(duracao)
              .attr("cx", d => x(d.x))
              .attr("cy", d => y(d.y));

        } else {
            
            pontos.transition()
                .duration(duracao)
                .attr("fill", d => cor_inicial(d.value))
                .attr("cx", d => x(d.x))
                .attr("cy", d => y(d.y));
        }       

    }

    function desenha_step3(direcao) {

        console.log("ok, tô no step 3");
        let mini_dados = prepara_dados(grid, "1. Idade", raio, margin);

        let largura_total = mini_dados.parametros.largura_eixo_principal_total;
        let altura_total = mini_dados.parametros.largura_eixo_secundario_total;

        let margem_inicial_principal = (w - largura_total)/2;
        let margem_inicial_secundario = (h - altura_total)/2;

        let cor = d3.scaleOrdinal()
          .domain(mini_dados.parametros.resumo.map(d => d.categoria))
          .range(d3.schemeCategory10)

        //let pontos = d3.selectAll("circle.pontos")
        pontos = pontos
          .data(mini_dados.dados, d => d.nome);

        console.log("Pontos", pontos, pontos.enter(), pontos.exit());

        pontos
          .transition()
          .duration(duracao)
          .attr("cx", d => d.eixo_principal + margem_inicial_principal + mini_dados.parametros.posicoes_iniciais[d.categoria])
          .attr("cy", d => d.eixo_secundario + margem_inicial_secundario)
          .attr("fill", d => cor(d.categoria)); 
          
        acrescenta_rotulos(mini_dados);
    }

    // setup
    let steps = [];
    enterView({
        selector: ".slide",
        offset: 0.5,
        enter: function(el) {

            let step = +el.id.slice(-2);
            // aqui não preciso me preocupar com direção, pq ele só "enter" na descida.
            steps.push(step);
            console.log(steps);
            console.log("avançando");

            desenha(step, "descendo");
        },

        exit: function(el) {

            let step = +el.id.slice(-2) - 1;
            // pois aqui tb não preciso me preocupar com direção, pq aparentemente só "exit" na subida 
            steps.push(step);
            console.log(steps);
            console.log("voltando");

            desenha(step, "voltando");
        }
    })

})




