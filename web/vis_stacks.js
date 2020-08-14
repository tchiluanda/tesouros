d3.csv("./dados/data.csv").then(function(grid) {
    console.log(grid.columns);

    //console.log(unique(grid, "satisfacao"))

    //console.log(group_and_count(grid, "satisfacao"))

    //console.log(group_and_count(grid, "satisfacao", percent = true))

    let categorias_Tempo = generates_stacks_for_variable(grid, "tempo_tesouro");

    console.log(categorias_Tempo);

    draw_bars(categorias_Tempo);


});

let ordem_satisfacao = ["Não", "Possivelmente não", "Sinto-me indiferente", "Basicamente sim", "Sim"];

// gera object
// function stack_na_ordem(obj, col, vetor_ordem) {
//     let count = group_and_count(obj, col, percent = true);
//     let count_obj = {};
    
//     count.forEach(d => {
//         count_obj[d.cat] = d.count 
//     });

//     let stack = {};
//     let start_pos = 0;

//     if (!vetor_ordem) vetor_ordem = unique(obj, col);

//     vetor_ordem.forEach(d => {
//         stack[d] = {
//             'count' : count_obj[d],
//             'start' : start_pos
//         }
//         start_pos += count_obj[d];
//     });

//     return(stack);
// }

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
        start_pos += count_obj[d];
        return {
            'label' : d,
            'count' : count_obj[d],
            'start' : current_start_pos
        }
    });

    return(stack);
}

function generates_stacks_for_variable(obj, variable) {
    let var_categories = unique(obj, variable);

    let stacks = var_categories.map(cat => {
        let mini_dataset = obj.filter(d => d[variable] == cat);
        return(
            {
                'label' : cat,
                'stack' : stack_na_ordem(mini_dataset, 'satisfacao', ordem_satisfacao)
            }
        )
    });

    return stacks;
}

// parametros barras
let bar_height = 15;

// // escalas
// cor
let fill = d3.scaleOrdinal()
  .range(d3.schemeRdGy[5])
  .domain(ordem_satisfacao)

function draw_bars(cat) {
    //let mini_data = stacks[cat];
    let mini_data = cat;

    let bars = d3.select("svg")
      .selectAll("g")
      .data(mini_data, d => d.label)
      .join("g")
      .attr("transform", (d,i) => "translate(0," + i*3*bar_height + ")")
      .selectAll("rect")
      .data(d => d.stack)
      .join("rect")
      .attr("height", bar_height)
      .attr("width", 50)
      .attr("x", (d,i) => i * 55)
      .attr("y", 0)
      .attr("fill", d => fill(d.label))
}