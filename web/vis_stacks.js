// para parametrizar:

// generates_stacks_for_variable(obj, variable)

// transformar variaveis_interesse em objeto {'satisfacao' : ..., 'ascender': ...}
// mesma coisa para ordem_satisfacao, "estado"

// resize: dimensiona() e desenha_estado();

// usar config como prototype e new config?

// levar escala x para ser um método de config?

// melhorar coerência nomenclaturas "categoria" x "variavel"


let config = {

  parametros : {

    variaveis_interesse : ["idade", "genero", "tempo_tesouro", "ascender"],
    ordem_satisfacao : ["Não", "Possivelmente não", "Sinto-me indiferente", "Basicamente sim", "Sim"],
    categorias_satisfacao : {
      "otimista" : ["Sinto-me indiferente", "Basicamente sim", "Sim"],
      "pessimista" : ["Basicamente sim", "Sim"]
    },
    label_indiferente: "Sinto-me indiferente",
    ordens_variaveis : {
      "idade" : ["De 20 a 29 anos", "De 30 a 39 anos", "De 40 a 49 anos", "De 50 a 60 anos", "+ de 60"],
      "ascender" : ["Sim", "Provavelmente sim", "Não sei", "Provavelmente não", "Não"],
      "tempo_tesouro" : ["Até 5 anos", "De 6 a 10 anos", "De 11 a 20 anos", "De 21 a 30 anos", "Mais de 30 anos"]
    },
    svg : "svg.svg-satisfacao",
    envelope : "div.envelope-svg-satisfacao"

  },

  parametros_visuais : {

    qde_max_categorias : null,
    bar_height : 15,
    colors : ["#b2182b","#ef8a62","#f7f7f7","#67a9cf","#2166ac"],
    color_indif : {
      "desloc_pessimista" : "#fddbc7",
      "desloc_otimista"   : "#d1e5f0",
    },
    margens : {
      top: 20,
      left : 100,
      right : 50,
      bottom: 0
    },
    dimensoes_svg : {
      height : null,
      width : null
    }

  },

  dados : {

    grid_data : null,
    categorias : {},
    max_desloc : null

  },

  escalas : {

    x : {
      range : null,
      domain : null
    },

    width : {
      range: null,
      domain: null
    },

    fill : null

  },

  estado : {

    opcao_visao : "desloc_otimista",
    opcao_variavel : "idade",
    iniciado : false

  }
};
/*
d3.csv("./dados/data.csv").then(function(grid) {
    console.log(grid.columns);
    config.dados["grid_data"] = grid;

    init();

});*/

function init() {

  // gera objetos das categorias (devia ter chamado de variaveis, mas tudo bem), calcula a quantidade máxima de categorias em cada variável, e o máximo deslocamento necessário
  let qde_max_categorias = 0;

  config.parametros.variaveis_interesse
    .forEach(d => {
      config.dados.categorias[d] = generates_stacks_for_variable(config.dados["grid_data"], d)
      if (config.dados.categorias[d].length > qde_max_categorias) {
        qde_max_categorias = config.dados.categorias[d].length;
      }
    });

  
  config.parametros_visuais.qde_max_categorias = qde_max_categorias;
  config.dados.max_desloc = get_overall_max_desloc(...config.parametros.variaveis_interesse);

  // configura dimensões
  dimensiona();

  config.escalas.x.range = [0,config.parametros_visuais.dimensoes_svg.width];
  config.escalas.x.domain = [0,1+config.dados.max_desloc];

  d3.select(config.parametros.svg)
    .style("margin-left", config.parametros_visuais.margens.left + "px")
    .style("margin-top", config.parametros_visuais.margens.top + "px");

  // config escala fill

  config.escalas.fill = d3
    .scaleOrdinal()
    .range(config.parametros_visuais.colors)
    .domain(config.parametros.ordem_satisfacao)

  desenha_estado(
    config.estado.opcao_variavel, 
    config.estado.opcao_visao);

  desenha_linha_referencia();
  desenha_titulo();

  monitora_botoes();
  monitora_opcao_otim_pessi()

}

function dimensiona() {
  const envelope = d3.select(config.parametros.envelope);
  const svg_satisf = d3.select(config.parametros.svg);

  let width = envelope.node().getBoundingClientRect().width;
  let height = envelope.node().getBoundingClientRect().height;

  //console.log(width, height);

  let temp_width =  
    width 
    - config.parametros_visuais.margens.left
    - config.parametros_visuais.margens.right;  
    
  let temp_height = 
    height
    - config.parametros_visuais.margens.bottom
    - config.parametros_visuais.margens.top;

  // põe um máximo na altura e na largura
  config.parametros_visuais.dimensoes_svg.width = 
  temp_width >= 900 ? 900 : temp_width;

  config.parametros_visuais.dimensoes_svg.height = temp_height >= 450 ? 450 : temp_height;

  config.parametros_visuais.bar_height = 
    config.parametros_visuais.dimensoes_svg.height
    / (3*(config.parametros_visuais.qde_max_categorias+1));

  d3.select(config.parametros.svg)
    .attr("width", config.parametros_visuais.dimensoes_svg.width)
    .attr("height", config.parametros_visuais.dimensoes_svg.height);

}

function desenha_estado(variavel, visao) {
  desenha_stack(variavel);
  desloca_barras(visao);
  muda_cor_indiferente(visao);
  desenha_labels(variavel, visao)
}

function monitora_botoes() {

  let botoes = d3.selectAll(".controle-stacked > button");
  
  botoes.on("click", function() {
    let opcao = this.id;
    config.estado.opcao_variavel = opcao;
    botoes.classed("selected", false);
    d3.select(this).classed("selected", true);
    config.estado.iniciado = false;
    desenha_estado(opcao, config.estado.opcao_visao);    
    console.log(opcao);
  })
}

function monitora_opcao_otim_pessi() {
  let dropdown = d3.select("select#controle-otim-pess");
  
  dropdown.on("change", function() {
    config.estado.opcao_visao = dropdown.property("value");
    config.estado.iniciado = true;
    desloca_barras(config.estado.opcao_visao);
    muda_cor_indiferente(config.estado.opcao_visao);
    console.log("Dropdown", config.estado.opcao_variavel, config.estado.opcao_visao);
    desenha_labels(config.estado.opcao_variavel, config.estado.opcao_visao)
  })
}

function desenha_stack(selecao, grid) {
  let categorias = config.dados.categorias[selecao];
  
  //console.log({categorias})

  let max_desloc = get_max_desloc(categorias);

  let deslocs_otimista = generates_deslocs(categorias, "Sinto-me indiferente", config.dados.max_desloc);

  let deslocs_pessimista = generates_deslocs(categorias, "Basicamente sim", config.dados.max_desloc);

  categorias.forEach((d,i) => {
      categorias[i]["desloc_otimista"] = deslocs_otimista[i];
      categorias[i]["desloc_pessimista"] = deslocs_pessimista[i];
  })

  //console.log("MAX", get_max_desloc(categorias));

  //console.log(categorias_Tempo);

  draw_bars(categorias);

}


function stack_na_ordem(obj, col, vetor_ordem) {
    let count = group_and_count(obj, col, percent = true);
    let count_obj = {};
    
    count.forEach(d => {
        count_obj[d.cat] = d.count 
    });

    let start_pos = 0;

    if (!vetor_ordem) vetor_ordem = unique(obj, col);

    let stack = vetor_ordem.map(d => {
        let current_start_pos = start_pos;
        start_pos = count_obj[d] ? start_pos+count_obj[d] : start_pos;
        return {
            'label' : d,
            'count' : count_obj[d],
            'start' : current_start_pos
        }
    });

    return(stack);
}

function computa_principal_sat_insat(dados_filtrados_categoria, satisfacao, visao) {
  let categorias_satisfacao = config.parametros.categorias_satisfacao[visao]; // se visao otimista, inclui indiferentes, caso contrário pega só categorias "Sim" e "Possivelmente Sim" da variável satisfacação

  let dados_desejados = dados_filtrados_categoria.filter(
    d => satisfacao ? 
    categorias_satisfacao.includes(d.satisfacao) :
    !categorias_satisfacao.includes(d.satisfacao));

  if (dados_desejados.length == 0) return {
    'principal_razao' : '',
    'percentual'      : ''
  }

  let coluna = satisfacao ? "primeira.sat" : "primeira.insat"

  let contagem_principal_satisfacao = group_and_count(dados_desejados, coluna, percent = true);

  let contagem_ordenada = contagem_principal_satisfacao.sort((a,b) => b.count - a.count)

  //console.log("Computando principais insat", dados_desejados.map(d => ({"satisfacao" : d.satisfacao, "primeira insat" : d["primeira.insat"], "primeira sat" : d["primeira.sat"]})), contagem_ordenada);

  let principal_razao = contagem_ordenada[0];

  return {
    'principal_razao' : principal_razao.cat,
    'percentual'      : formataPct(principal_razao.count)
  }

}

function calcula_pct_satisfacao(dados_satisfacao_sumarizados, visao) {
  let categorias_satisfacao = config.parametros.categorias_satisfacao[visao]; // se visao otimista, inclui indiferentes, caso contrário pega só categorias "Sim" e "Possivelmente Sim" da variável satisfacação

  // esses dados sumarizados da variavel são os "stack", com os percentuais de respostas para cada categoria da variável satisfacao, no formato { label, count}

  let pct = dados_satisfacao_sumarizados
    .filter(d => categorias_satisfacao.includes(d.label)) // filtra elementos de "stack" que possuam label igual a algum dos elementos presentes na lista config.parametros...
    .map(d => d.count) // pega atributo "count" da array resultante
    .reduce((soma_acum, valor_total) => soma_acum + valor_total); //soma

  return pct;
}

function generates_stacks_for_variable(obj, variable) {
    
  let var_categories = 
    config.parametros.ordens_variaveis[variable] ? 
    config.parametros.ordens_variaveis[variable] : 
    unique(obj, variable);

    // o que ele faz ali acima é verificar se foi definida uma ordem pré-estabelecida lá no config, caso contrário ele gera um array com os valores únicos

  let stacks = var_categories.map(cat => {

      let mini_dataset = obj.filter(d => d[variable] == cat);

      let stack = stack_na_ordem(mini_dataset, 'satisfacao', config.parametros.ordem_satisfacao);

      // calcula percentuais totais de satisfação, na visão otimista e na pessimista
      // criar função para fazer esse cálculo?
      let pct_sat_otimista = calcula_pct_satisfacao(
        dados_satisfacao_sumarizados = stack, 
        visao = "otimista"
      );

      let pct_sat_pessimista = calcula_pct_satisfacao(
        dados_satisfacao_sumarizados = stack, 
        visao = "pessimista"
      );

      let principal_sat_otimista = computa_principal_sat_insat(
        dados_filtrados_categoria = mini_dataset, 
        satisfacao = true, 
        visao = "otimista");

      let principal_sat_pessimista = computa_principal_sat_insat(
        dados_filtrados_categoria = mini_dataset, 
        satisfacao = true, 
        visao = "pessimista");

      let principal_insat_otimista = computa_principal_sat_insat(
        dados_filtrados_categoria = mini_dataset, 
        satisfacao = false, 
        visao = "otimista");

      let principal_insat_pessimista = computa_principal_sat_insat(
        dados_filtrados_categoria = mini_dataset, 
        satisfacao = false, 
        visao = "pessimista");

      return(
          {
              'label' : cat,
              'stack' : stack,
              'pct_sat' : {
                'desloc_otimista'  : pct_sat_otimista,
                'desloc_pessimista' : pct_sat_pessimista
              },
              'principal_sat' : {
                'desloc_otimista'   : principal_sat_otimista,
                'desloc_pessimista' : principal_sat_pessimista
              },
              'principal_insat' : {
                'desloc_otimista'   : principal_insat_otimista,
                'desloc_pessimista' : principal_insat_pessimista
              }
          }
      )
    });

    return stacks;
}

function get_max_desloc(objeto) {

    let max_deslocs = [];

    for (tipo of ["Sinto-me indiferente", "Basicamente sim"]) {
        let starts = objeto
          .map(d => d.stack.filter(d => d.label == tipo))
          .map(d => d[0].start);

        let max_desloc_tipo = starts
          .reduce((max, valor_atual) => Math.max(max, valor_atual));
          //let max_desloc_tipo = Math.max(...starts_otimista);

        max_deslocs.push(max_desloc_tipo);
    }

    return(Math.max(max_deslocs[0], max_deslocs[1]))
}

function get_overall_max_desloc(...categorias) {
  let overall_max = 0;

  //console.log(categorias);

  for (categoria of categorias) {
    //console.log(config.dados.categorias[categoria]);
    let current_max = get_max_desloc(config.dados.categorias[categoria]);
    //console.log("overall", categoria, current_max)
    overall_max = Math.max(current_max, overall_max);
  }

  return overall_max;
}

function generates_deslocs(objeto, tipo, max_desloc) {
  let starts = objeto
    .map(d => d.stack.filter(d => d.label == tipo))
    .map(d => d[0].start);

  //let max_desloc = get_max_desloc(objeto)

  let deslocs = starts.map(d => max_desloc - d);

  return(deslocs);
}


function draw_bars(cat) {
    //let mini_data = stacks[cat];
    let bar_height = config.parametros_visuais.bar_height;


    let mini_data = cat;

    let x = d3.scaleLinear()
      .range(config.escalas.x.range)
      .domain(config.escalas.x.domain);

    let bars = d3.select("svg.svg-satisfacao")
      .selectAll("g")
      .data(mini_data, d => d.label)
      .join("g")
        .classed("stacked-bars", true)
        .attr("transform", (d,i) => "translate(0," + (i+1)*3*bar_height + ")");

    bars
      .selectAll("rect")
      .data(d => d.stack)
      .join("rect")
        .classed("indiferente", d => d.label == "Sinto-me indiferente")
        .attr("height", bar_height)
        // .attr("x", function(d) {
        //   let transform = d3.select(this).node();
        //   console.log(d3.select(this).node(), transform.parentNode);
        //   let ini = transform.indexOf("(");
        //   let fim = transform.indexOf(",")
        //   let translateX = +transform.slice(ini+1, fim);
        //   return (x(config.dados.max_desloc) + translateX)
        // })
        .attr("y", 0)
        .attr("fill", d => config.escalas.fill(d.label))
        .attr("width", 0)
        .attr("x", 0)
        //.attr("width", d => x(d.count))
        .transition()
        .duration(500)
        .attr("x", d => x(d.start))
        .attr("width", d => x(d.count));



    desenha_labels_eixo(mini_data);

    // bars
    //     .selectAll("text")
    //     .data(d => d.stack)
    //     .join("text")
    //         .attr("height", bar_height)
    //         .attr("width", 100)
    //         .attr("x", (d,i) => i * 100)
    //         .attr("y", 25)
    //         .text(d => (d.label))
    //         .attr("font-size", 10)
}

function muda_cor_indiferente(visao) {
    //altera cor para corresponder à seleção
    let rects = d3.selectAll("rect.indiferente");

    //console.log(config.parametros_visuais.color_indif[visao])

    rects
      .transition()
      .delay(500)
      .duration(500)
      .attr("fill", config.parametros_visuais.color_indif[visao]);

}

function desloca_barras(otimista_pessimista) {
    let bars = d3.select("svg.svg-satisfacao").selectAll("g.stacked-bars");

    let x = d3.scaleLinear()
      .range(config.escalas.x.range)
      .domain(config.escalas.x.domain);

    console.log({otimista_pessimista})

    bars.each(function(d,i,nodes) {

        //console.log(d3.select(this))

        let transf = d3.select(this).attr("transform");

        let ini = transf.indexOf(",");
        let fim = transf.indexOf(")")
        let translateY = +transf.slice(ini+1, fim);

        let barras = d3.select(this);
        
        if (config.estado.iniciado) {
          barras = barras
            .transition()
            .duration(500)
        }
        
        barras
          .attr("transform",

          "translate(" + 
            x(d[otimista_pessimista]) + 
            "," + 
            translateY + 
            ")"
          );
    })
}

function desenha_labels_eixo(mini_data) {
  let envelope = d3.select(config.parametros.envelope);

  console.log(mini_data);

  let labels = envelope
    .selectAll("p.labels-eixo-y")
    .data(mini_data, d => d.label)
    .join("p")
    .classed("labels-eixo-y", true)
    .style("top", (d,i) => (i+1)*3*config.parametros_visuais.bar_height + config.parametros_visuais.margens.top + "px")
    .style("width", (config.parametros_visuais.margens.left - 10) + "px")
    .style("left", 0)
    .style("text-align", "right")
    .style("line-height", config.parametros_visuais.bar_height + "px")
    .text(d => d.label);

}

function desenha_linha_referencia() {
  let x = d3.scaleLinear()
    .range(config.escalas.x.range)
    .domain(config.escalas.x.domain);

  d3.select("svg.svg-satisfacao")
    .append("line")
    .attr("y1", 0)
    .attr("y2", config.parametros_visuais.dimensoes_svg.height)
    .attr("x1", x(config.dados.max_desloc))
    .attr("x2", x(config.dados.max_desloc))
    .attr("stroke", "grey")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", 2);
}

function desenha_titulo() {
  let x = d3.scaleLinear()
    .range(config.escalas.x.range)
    .domain(config.escalas.x.domain);

    let envelope = d3.select(config.parametros.envelope);

    let pad = 10;

    let mini_dados = [
      { 
        "class"  : "primeira-linha",
        "label1" : "&#8592; Insatisfeitos",
        "label2" : "Satisfeitos &#8594;",
        "top"   : 0,
        "element" : "strong"
    },

    { 
      "class"  : "segunda-linha",
      "label1" : "(principal razão) % total",
      "label2" : "% total (principal razão)",
      "top"   : "15px",
      "element" : "em"
  }];

  for (entry of mini_dados) {

    //console.log(entry);

    envelope
      .append("p")
      .classed("titulos", true)
      .classed(entry.class, true)
      .classed("esquerda", true)
      .style("top", entry.top)
      .style("text-align", "right")
      .style("color", config.parametros_visuais.colors[0])
      .append(entry.element)
      .html(entry.label1);

    // para posicionar a caixa após já saber o tamanho, usando "left". Por algum motivo não consegui usar "right", pq ele começa a contar lá do raio que o parta, apesar de a largura do envelope ser o svg + margem.
    envelope.select("p.titulos." + entry.class + ".esquerda")
      .style("left", function() {
        let largura = +d3.select(this).style("width").slice(0,-2);
        return (config.parametros_visuais.margens.left + x(config.dados.max_desloc) - largura - pad) + "px"
      });

    envelope
      .append("p")
      .classed("titulos", true)
      .classed(entry.class, true)
      .style("left", config.parametros_visuais.margens.left + x(config.dados.max_desloc) + pad + "px")
      .style("top", entry.top)
      .style("color", config.parametros_visuais.colors[4])
      .append(entry.element)
      .html(entry.label2);

  }
}

function desenha_labels(variavel, visao) {

  // os textos que alimentam o mini_data abaixo e que serão usados como labels foram gerados em generates_stacks_for_variable() e suas funções auxiliares

  let mini_data = config.dados.categorias[variavel];

  //console.log("mini", mini_data)

  let x = d3.scaleLinear()
    .range(config.escalas.x.range)
    .domain(config.escalas.x.domain);

  let envelope = d3.select(config.parametros.envelope);

  let stacked_bars = d3.selectAll("g.stacked-bars");

  let pad = {
    'bottom' : 5,
    'lateral' : 10
  };

  // primeiro remove os labels anteriores
  //envelope.selectAll("p.labels-insat,p.labels-sat").remove();

  // acrescenta labels insat sem posicioná-los ainda : serão posicionados mais abaixo de acordo com a posição das barras

  let labels_insat = envelope
    .selectAll("p.labels-insat")
    .data(mini_data, d => d.label)
    .join("p")
      .classed("labels-insat", true)
      .style("text-align", "right")
      .style("color", config.parametros_visuais.colors[0]);
  
  //console.log("Exit selection ", labels_insat.exit());

  labels_insat
      .join("em")
      .text(d => 
        "(" + 
        (d.principal_insat[visao].principal_razao == "NA" ?
        "Nenhuma" : d.principal_insat[visao].principal_razao) + 
        ") " + 
        formataPct(1 - d.pct_sat[visao]));

  // acrescenta labels sat sem posicioná-los ainda : serão posicionados mais abaixo de acordo com a posição das barras

  let labels_sat = envelope
    .selectAll("p.labels-sat")
    .data(mini_data, d => d.label)
    .join("p")
      .classed("labels-sat", true)
      .style("text-align", "right")
      .style("color", config.parametros_visuais.colors[4]);
  
  labels_sat
      .join("em")
      .text(d => 
        formataPct(d.pct_sat[visao]) + 
        " (" + 
        (d.principal_sat[visao].principal_razao == "NA" ?
        "Nenhuma" : d.principal_sat[visao].principal_razao) + 
        ") ");

  // agora sim, vamos posicioná-los de acordo com as posições da barra

  let posicao_svg = envelope.node().getBoundingClientRect().top;
  
  stacked_bars.each(function(d,i) {
    let barra_atual = d3.select(this).node();

    let posicao_top_barra = barra_atual.getBoundingClientRect().top - posicao_svg;
    //console.log();

    let label_insat_dim = labels_insat.nodes()[i].getBoundingClientRect();
    
    let label_sat_dim   = labels_sat.nodes()[i].getBoundingClientRect();

    //insat

    let label_insat = d3.select(labels_insat.nodes()[i]);
    label_insat
      .style("top", (posicao_top_barra - label_insat_dim.height - pad.bottom) + "px")
      .style("left", (config.parametros_visuais.margens.left + x(config.dados.max_desloc) - label_insat_dim.width - pad.lateral) + "px");

    // sat

    let label_sat = d3.select(labels_sat.nodes()[i]);
    label_sat
      .style("top", (posicao_top_barra - label_sat_dim.height - pad.bottom) + "px")
      .style("left", (config.parametros_visuais.margens.left + x(config.dados.max_desloc) + pad.lateral) + "px");

    //console.log(posicao_top_barra, label_insat_dim, label_sat_dim);
  });
}

/* ideia para filtrar valores de uma lista 

var arr = [{n: 1, p: "n"},{n: 2, p: "s"},{n: 3, p: "n"},{n: 4, p: "s"},{n: 4, p: "s"}],
    brr = [2,4],
    res = arr.filter(f => brr.includes(f.n));
console.log(res);

*/