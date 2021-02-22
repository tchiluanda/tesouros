let frases = [
  {texto: "Tesouro tem dificuldade em reter seus talentos", tipo: "azul"},
  {texto: "Somos ótimos técnicos e o trabalho é motivador", tipo: "laranja"},
  {texto: "Tesouro é mais importante do que pensa ser", tipo: "azul"},
  {texto: "Esperamos clareza nas seleções, capacitações e mobilidade", tipo: "laranja"},
  {texto: "Mobilidade e alocação poderiam melhorar", tipo: "azul"},
  {texto: "Queremos jornada de trabalho flexível", tipo: "laranja"},
  {texto: "Perderemos relevância e valorização no futuro?", tipo: "azul"},
  {texto: "Precisamos de competência gerencial e de comunicação", tipo: "laranja"}
];

const $cont_svg = d3.select("div.container-svg");
const $svg = d3.select("svg.canvas");
const $titulo = d3.select(".titulo > h1");
const $steps = d3.selectAll(".slide");
let flag = false;
//let t; //, $frases;

// para detectar área do título, em que não podem ser inseridas as frases
let h0_titulo = $titulo.node().getBoundingClientRect().top;
let h1_titulo = $titulo.node().getBoundingClientRect().bottom;

//console.log("h0, h1", h0_titulo, h1_titulo);


let h = $cont_svg.style("height");
h = +h.slice(0, h.length-2);

let w = $cont_svg.style("width");
w = +w.slice(0, w.length-2);

let margin = 20;

//console.log(h,w);

let altura_frase, largura_frase;
let duracao = 1000;//3000;
let tempo_total = (duracao * (frases.length - 1)) + (duracao * 2);
//let $frases;

function calcula_modura(w, h, n) {
  r = 3;
  w = w-15-r; // 15 por causa da barra de rolagem, 3 para caber a bolinha
  h = h-15-r;
  let taxa = (2*w + 2*h - 4*r)/n;

  let pos = [];

  for (let x = r; x <= w ; x = x+taxa) {

    pos.push({
      x_mol : x > w ? w : x,
      y_mol : r
    });

    pos.push({
      x_mol : x > w ? w : x,
      y_mol : h
    })
  }

  for (let y = r+taxa; y <= h; y = y+taxa) {

    pos.push({
      x_mol : r,
      y_mol : y > h ? h : y
    });

    pos.push({
      x_mol : w,
      y_mol : y > h ? h : y
    })
  }

  console.log("qde:", pos.length)

  while (pos.length < n) {
    pos.push(pos[pos.length-1]);
    console.log("Acrescentando... qde:", pos.length)
  }

  return pos
}

let pos = calcula_modura(w, h, 383).slice(0,383);
//console.log(pos)

function insere_frases() {

    let $frases = $cont_svg.selectAll("p.frases").data(frases);

    $frases.enter()
        .append("p")
        .classed("frases", true)
        .style("opacity", 0)
        .append("span")
        .style("background-color", frase => "var(--" + frase.tipo + ")")
        .html(frase => '&ldquo;' + frase.texto + '&rdquo;');
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
            if (posicao_top < h - altura_frase - margin - 30) {

                // detecção de colisão com o título    
                if (colisao_com_titulo(posicao_top)) {
                    posicao_top = h0_titulo - altura_frase - 10;
                } else if (colisao_com_titulo(posicao_top + altura_frase)) {
                    posicao_top = h1_titulo + 10;
                } else {
                    posicao_top = posicao_top;
                }
            } else {
                posicao_top = h - altura_frase - margin - 30;
            };

            return posicao_top + "px";
        })
        .style("left", function(d) {
            let posicao_left = Math.random() * h;
            posicao_left = posicao_left > w - largura_frase - margin ? w - largura_frase - margin : posicao_left;
            //console.log(posicao_left, posicao_left + "px");
            return posicao_left + "px";
        });

    //console.log("fui chamada");

    $frases
        .transition()
        .delay((d,i) => i * duracao*3)
        .duration(duracao*3)
        .style("opacity", 1);
    
    $frases
        .transition()
        .delay((d,i) => i * duracao*3 + duracao*3)
        .duration(duracao*3)
        .style("opacity", 0);

    d3.select(".container-geral");
}

function sumariza_dados(dados, criterio, ordena = false, vetor_ordem) {
    // determina valores unicos
    const sumario = [];

    if (vetor_ordem) categorias_unicas = vetor_ordem;
    else {
      categorias_unicas = dados
      .map(d => d[criterio])
      .filter((v, i, a) => a.indexOf(v) === i);
    }

    //console.log(criterio, categorias_unicas)

    for (cat of categorias_unicas) {
        const cont = dados
          .filter(d => d[criterio] === cat)
          .length;

        sumario.push({"categoria" : cat,
                      "contagem"  : cont,
                      "criterio"  : criterio});                 
    }

    if (ordena) sumario.sort((a,b) => b.contagem - a.contagem);

    return sumario;    
}

function prepara_dados(dados, criterio, ordena = false, vetor_ordem, raio, margem) {
    // determina valores únicos
    let dados_sumarizados = sumariza_dados(dados, criterio, ordena, vetor_ordem);

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
              "x_mol" : d["x_mol"],
              "y_mol" : d["y_mol"],
              "x_S3"  : d["x_S3"],
              "y_S3"  : d["y_S3"],
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

    //console.log("Mini dados", mini_dados);

    return(mini_dados);
}

function desenha_dados(dados, criterio, ordena, vetor_ordem, raio, margin, rotulos_a_deslocar, deslocamento, vetor_cor) {

    let mini_dados = prepara_dados(
      dados, 
      criterio,
      ordena, 
      vetor_ordem,
      raio, 
      margin);

    let largura_total = mini_dados.parametros.largura_eixo_principal_total;
    let altura_total = mini_dados.parametros.largura_eixo_secundario_total;

    let m = w <= 1020 ? 3 : 2;

    let margem_inicial_principal, margem_inicial_secundario;

    if (w <= 620) {
      x = "cy";
      y = "cx";
      margem_inicial_principal = (h - largura_total)/1.6;
      margem_inicial_secundario = (w - altura_total)*4/5;

    } else {
      x = "cx";
      y = "cy";
      margem_inicial_principal = (w - largura_total)/m;
      margem_inicial_secundario = (h - altura_total)*3/4;
    }



    let cor = d3.scaleOrdinal()
      .domain(mini_dados.parametros.resumo.map(d => d.categoria))
      .range(vetor_cor ? vetor_cor : d3.schemeCategory10)

    let pontos = d3.selectAll("circle.pontos")
    pontos = pontos
      .data(mini_dados.dados, d => d.nome);



    pontos
      .transition()
      .duration(duracao)
      .ease(d3.easeExp)
      .attr(x, d => d.eixo_principal + margem_inicial_principal + mini_dados.parametros.posicoes_iniciais[d.categoria])
      .attr(y, d => d.eixo_secundario + margem_inicial_secundario)
      .attr("r", raio)
      .attr("fill", d => cor(d.categoria)); 
      
    acrescenta_rotulos(mini_dados, rotulos_a_deslocar, deslocamento);

    let qde_rotulos = d3.selectAll(".rotulos").nodes().length
    d3.selectAll(".rotulos")
      .transition()
      .delay((d,i) => duracao/3 + (duracao/3 * (i/qde_rotulos)))
      .duration(duracao)
      .style("opacity", 1);

}

function acrescenta_rotulos(mini_dados, deslocados, quanto) {

    //remove rótulos pré-existentes.
    d3.select(".container-svg")
      .selectAll("div.rotulos")
      //.transition(duracao/2)
      .style("opacity", 0)
      .remove();

    d3.selectAll("line.rotulos").remove();

    //console.log("mini", mini_dados.parametros.resumo);

    let $rotulos = d3.select(".container-svg")
      .selectAll("div.rotulos")
      .data(mini_dados.parametros.resumo, d => d.criterio + d.categoria)
      .join("div")
      .classed("rotulos", true)
      .style("opacity", 0);

    $rotulos.append("h2");

    $rotulos.append("p");

    //$rotulos = $rotulos.merge($rotulos_enter);

    $rotulos
      .selectAll("h2")
      .text(d => d.categoria);
    
    $rotulos
      .selectAll("p")
      .text(d => d3.format(".000%")(d.contagem / mini_dados.dados.length));

    let largura_total = mini_dados.parametros.largura_eixo_principal_total;
    let altura_total = mini_dados.parametros.largura_eixo_secundario_total;

    let m = w <= 1020 ? 3 : 2;

    if (w <= 620) {
      x = "top";
      y = "left";
      margem_inicial_principal = (h - largura_total)/1.6;
      margem_inicial_secundario = (w - altura_total)*4/5;
      deslocados = false;

    } else {
      x = "left";
      y = "top";
      margem_inicial_principal = (w - largura_total)/m;
      margem_inicial_secundario = (h - altura_total)*3/4;
    }

    $rotulos
      .style(x, function(d) {
        //console.log("To aqui dentro", mini_dados.parametros.posicoes_iniciais[d.categoria]);
        return (
          mini_dados.parametros.posicoes_iniciais[d.categoria] + 
          margem_inicial_principal - 
          mini_dados.parametros.raio * ( w <= 620 ? 2 : 1 ) + 
          "px")
        })
      .style(y,  function(d) {
        if (w <= 620) {
          //let largura_rotulo = +d3.select(this).style("width").slice(0,-2);
          //return ((margem_inicial_secundario - largura_rotulo - margin) + "px");
          return 0
        } else {
          let altura_rotulo = +d3.select(this).style("height").slice(0,-2);
          return ((margem_inicial_secundario - altura_rotulo - margin) + "px");
        }
      });

    if (w <= 620) {
      $rotulos.style("width", (margem_inicial_secundario - margin) + "px");
    }

    // código para deslocar algum rótulo, se for necessário

    if (deslocados) {

        $rotulos.each(function(d,i,nodes) {
            if (deslocados.includes(i)) {
              deslocamento = deslocados.length == 1 ? quanto : quanto[i]
                let top_atual = +d3.select(this).style("top").slice(0,-2);
                let left_atual = +d3.select(this).style("left").slice(0,-2);
                d3.select(this)
                  .style("top", (top_atual - deslocamento) + "px")
                  .style("border-bottom", "1px solid black");

                let altura_rotulo = +d3.select(this).style("height").slice(0,-2);

                $svg
                  .append("line")
                  .classed("rotulos", true)
                  .attr("x1", left_atual)
                  .attr("y1", top_atual + altura_rotulo)
                  .attr("x2", left_atual)
                  .attr("y2", top_atual - deslocamento + altura_rotulo - 1)
                  .attr("stroke", "black")
                  .style("opacity", 0)
            }
        })

    }
}

Promise.all([
  d3.csv("./web/dados/data.csv"),
  d3.csv("./web/dados/contagens.csv")
]).then(function(files) {

    const grid = files[0];
    const contagens = files[1];

    config.dados["grid_data"] = grid; // para os stacks
    console.log(grid.columns);
    //console.table(grid)
    
    init(); // os stacks
    
    let margin = w < 580 ? 15 : 25;

    let menor_dimensao = Math.min(w, h) - 2 * margin;

    let qde_y = d3.max(grid, d => +d.y); 
    let qde_x = d3.max(grid, d => +d.x);
    // isso vai dar a quantidade de bolinhas em cada direção

    let maior_qde = Math.max(qde_x, qde_y);

    let m = (w > 620 & w <= 1020) ? 3 : 2;

    let raio = menor_dimensao / (m * maior_qde);

    // console.log(sumariza_dados(grid, "1. Idade", false, 
    // vetor_ordem = 
    // "De 20 a 29 anos",
    // "De 30 a 39 anos", 
    // "De 40 a 49 anos", 
    // "De 50 a 60 anos",  
    // "+ de 60"));

    let w_necessario = raio * 2 * qde_x;
    let h_necessario = raio * 2 * qde_y;

    let margin_grid = {
        "w" : (w - w_necessario)/2,
        "h" : (h - h_necessario)/2
    };

    grid.forEach((d,i) => {
        grid[i]["x_ini"] = Math.random()*(w-2*margin) + margin;
        grid[i]["y_ini"] = Math.random()*(h-2*margin) + margin;
        grid[i]["x_mol"] = pos[i].x_mol;
        grid[i]["y_mol"] = pos[i].y_mol;
    });

    //console.log(grid);

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

    function aparece_continuar(step, delay = duracao) {
      d3.select("#" + step + " .continuar")
      .transition()
      .delay(delay)
      .duration(duracao/2)
      .style("opacity", 1);
    }

    function desaparece_continuar(step) {
      d3.select("#" + step + " .continuar").style("opacity", 0);
    }

/* controle das funções chamadas em cada step */

    function desenha(step, direcao) {
      console.log(step, direcao)

      let slide = "slide" + ("" + step).padStart(2, "0");

        switch (step) {
            case 1 :
              desenha_abertura(direcao, slide);
              break;
            case 2 :
              console.log("Hi. Step é ", slide);
              desaparece_continuar(slide)
              desenha_introducao(direcao, slide);
              break;
            case 3 :
              desenha_logo(direcao, slide);
              //d3.select("h2.subtitulo").transition().duration(duracao*3).style("opacity", 1);
              break;
            case 4 :
              desenha_idade(direcao);
              break;   
            case 5 :
              desenha_genero(direcao);
              break;  
            case 6 :
              desenha_step5(direcao);
              break; 
            case 7 :
              desenha_step6(direcao);
              break;    
            case 8 :
              desenha_moldura();
              desenha_detalhe_satisfacao();
              break;   
            case 9 :
              desenha_mudar();
              break;    
            case 10 :
              desenha_mudar_para();
              break;     
            case 11 :
              desenha_moldura();
              sumarios(contagens, "desafio", "azul");
              break;    
            case 12 :
              sumarios(contagens, "ponto_forte", "laranja");
              break;   
            case 13 :
              sumarios(contagens, "ameaca", "azul");
              break;    
            case 14 :
              desenha_moldura();
              sumarios(contagens, "limitador", "azul");
              break;  
            case 15 :
              desenha_dez_anos();
              break;    
            case 16 :
              desenha_onde_se_ve();
              break;   
            case 17 :
              desenha_apoio();
              break;  
            case 18 :
              desenha_aposentando();
              break; 
            case 19 :
              desenha_temor();
              break;   
            case 20 :
              desenha_motivacao_lp();
              break;    
            case 21 :
              desenha_diferente_lp();
              break;   
            case 22 :
              desenha_mudancas_lp();
              break;  
            case 23 :
              desenha_moldura();
              aparece_continuar(slide);
              break;               
            case 24 :
              desenha_coracao();
              break;  
        }
    }

/* funções de desenho dos steps */

    function desenha_coracao() {
      pontos.transition()
        .delay(duracao/2)
        .duration(duracao)
        .attr("cx", d => x(d.x_S3))
        .attr("cy", d => y(d.y_S3))
        .attr("r", raio)
        .attr("fill", "tomato");
    }

    function desenha_moldura() {

      d3.selectAll("div.rotulos")
        .transition(duracao/2)
        .style("opacity", 0)
        .remove();

      d3.selectAll("line.rotulos").remove();

      d3.selectAll("circle.pontos")
        .transition()
        .duration(duracao)
        .attr("cx", d => d.x_mol)
        .attr("cy", d => d.y_mol)
        .attr("r", 2)
        .attr("fill", "#c3c3c3");
    }

    function desenha_abertura(direcao, step) {

        anima_frase();
        aparece_continuar(step, delay = duracao * 2 * frases.length)
        /*t = d3.interval(function(elapsed) {
            console.log(elapsed);
            anima_frase();
            if (elapsed > (duracao * (frases.length + 1))) t.stop();
        }, tempo_total, 0)*/

        /*d3.select("#slide1 .continuar")
          .transition()
          .delay(duracao * (frases.length + 1))
          .duration(duracao/2)
          .style("opacity", 1);*/
    
        flag = false;

        d3.select(".titulo-geral")
          .style("opacity", 0)
          .transition()
          .delay(duracao*3)
          .duration(duracao*2)
          .style("opacity", 1);
        
        if (direcao == "voltando") {
          pontos.attr("opacity", 0);
          d3.selectAll("div.rotulos")
            .remove();
          d3.selectAll("line.rotulos").remove();
        }
    }

    function desenha_introducao(direcao, step) {

      if (direcao == "descendo") {

      } 
      else {
          $titulo
            .transition()
            .duration(duracao)
            .style("opacity", 1);

          pontos.transition()
            .duration(duracao/2)
            .attr("cx", d => d.x_ini)
            .attr("cy", d => d.y_ini);

          pontos.transition()
            .delay(duracao/2)
            .duration(duracao)
            .attr("opacity", 0);          
      }

      d3.selectAll("p.frases")
      .transition()
      .duration(duracao)
      .style("opacity", 0);

      d3.selectAll("h1")
        .transition()
        .duration(duracao/2)
        .style("opacity", 0);  

      aparece_continuar(step);
        
    }

    function desenha_logo(direcao, step) {

      pontos.attr("fill", d => cor_inicial(d.value)) //para garantir a cor
      if (direcao == "descendo") {
          if (!flag) {
              //t.stop();
              flag = true;
          }    
  
          pontos.transition()
            .duration(d => Math.random() * duracao/2)
            .attr("opacity", 1);
            
  
          pontos.transition()
            .delay(duracao/2)
            .duration(duracao)
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y));

      } else {


        pontos.transition()
          .duration(duracao/2)
          .attr("cx", d => d.x_ini)
          .attr("cy", d => d.y_ini);

        pontos.transition()
          .delay(duracao/2)
          .duration(duracao/2)
          .attr("opacity", 0);   
          
        pontos
          .transition()
          .duration(duracao)
          .attr("cx", d => x(d.x))
          .attr("cy", d => y(d.y));

          d3.selectAll(".rotulos")
              .transition()
              .duration(duracao)
              .style("opacity", 0)
              .remove();
      }      
      aparece_continuar(step); 

    }

    function desenha_idade(direcao) {

        desenha_dados(
          dados = grid, 
          criterio = "idade", 
          ordena = false, 
          vetor_ordem = ["De 20 a 29 anos", "De 30 a 39 anos", "De 40 a 49 anos", "De 50 a 60 anos", "+ de 60"], 
          raio, 
          margin,
          rotulos_a_deslocar = [0],
          deslocamento = 60);

    }

    function desenha_genero(direcao) {
      desenha_dados(
        dados = grid, 
        criterio = "genero", 
        ordena = false, 
        vetor_ordem = false, 
        raio, 
        margin,
        rotulos_a_deslocar = false,
        deslocamento = 0);
    }

  function desenha_step5(direcao) {
    desenha_dados(
      dados = grid, 
      criterio = "escolaridade", 
      ordena = false, 
      vetor_ordem = ["Nível fundamental ou médio", "Graduação", "Especialização", "Mestrado", 
      "Doutorado"], 
      raio, 
      margin,
      rotulos_a_deslocar = [0],
      deslocamento = 60);
  }

  function desenha_step6(direcao) {
    desenha_dados(
      dados = grid, 
      criterio = "satisfacao", 
      ordena = false, 
      vetor_ordem = ["Não", "Possivelmente não", "Sinto-me indiferente", "Basicamente sim", "Sim"], 
      raio, 
      margin,
      rotulos_a_deslocar = [1,2],
      deslocamento = {1:80, 2:40},
      vetor_cor = ["#b2182b","#ef8a62","silver","#67a9cf","#2166ac"]);
  }

  function desenha_mudar(direcao) {
    desenha_dados(
      dados = grid, 
      criterio = "mudar", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [3,4,5],
      deslocamento = {3:120, 4:80, 5:40})
  }

  function desenha_mudar_para() {
    desenha_dados(
      dados = grid, 
      criterio = "mudar_para", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [1,2,3,4],
      deslocamento = {1:140, 2:105, 3:70, 4:35})
  }

  function desenha_dez_anos() {
    desenha_dados(
      dados = grid, 
      criterio = "dez_anos", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [0,1,2,3],
      deslocamento = {0:120, 1:90, 2:60, 3:30})
  }

  function desenha_onde_se_ve() {
    desenha_dados(
      dados = grid, 
      criterio = "onde_se_ve", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [1,2],
      deslocamento = {1:70, 2:35})
  }

  function desenha_apoio() {
    desenha_dados(
      dados = grid, 
      criterio = "apoio", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [1],
      deslocamento = 35)
  }

  function desenha_aposentando() {
    desenha_dados(
      dados = grid, 
      criterio = "aposentando", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [2],
      deslocamento = 35)
  }

  function desenha_temor() {
    desenha_dados(
      dados = grid, 
      criterio = "temor", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = false,
      deslocamento = 0)
  }

  function desenha_motivacao_lp() {
    desenha_dados(
      dados = grid, 
      criterio = "motivacao_lp", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [3],
      deslocamento = 60)
  }

  function desenha_diferente_lp() {
    desenha_dados(
      dados = grid, 
      criterio = "diferente_lp", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [1,4],
      deslocamento = {1:60, 4:60})
  }

  function desenha_mudancas_lp() {
    desenha_dados(
      dados = grid, 
      criterio = "mudancas_lp", 
      ordena = true, 
      vetor_ordem = false,
      raio, 
      margin,
      rotulos_a_deslocar = [1,2,3,4],
      deslocamento = {1:120, 2:90, 3:60, 4:30})
  }


  function desenha_detalhe_satisfacao() {

    d3.selectAll("div.rotulos")
      //.transition(duracao/2)
      .style("opacity", 0)
      .remove();

    d3.selectAll("line.rotulos").remove();

    /*d3.selectAll("circle.pontos")
      .transition()
      .duration(duracao)
      .attr("cx", d => d.x_mol)
      .attr("cy", d => d.y_mol)
      .attr("fill", "#c3c3c3");*/
  }

/* controle do scroller */

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




