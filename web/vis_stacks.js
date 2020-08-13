d3.csv("./dados/data.csv").then(function(grid) {
    console.log(grid.columns);

    //console.log(unique(grid, "satisfacao"))

    //console.log(group_and_count(grid, "satisfacao"))

    //console.log(group_and_count(grid, "satisfacao", percent = true))

    let categorias_Tempo = generates_stacks_for_variable(grid, "tempo_tesouro");

    console.log(stack_na_ordem(grid.filter(d => d.tempo_tesouro)));

    console.log(categorias_Tempo);
});

let ordem_satisfacao = ["Não", "Possivelmente não", "Sinto-me indiferente", "Basicamente sim", "Sim"];

function stack_na_ordem(obj, col, vetor_ordem) {
    let count = group_and_count(obj, col, percent = true);
    let count_obj = {};
    
    count.forEach(d => {
        count_obj[d.cat] = d.count 
    });

    let stack = {};
    let start_pos = 0;

    if (!vetor_ordem) vetor_ordem = unique(obj, col);

    vetor_ordem.forEach(d => {
        stack[d] = {
            'count' : count_obj[d],
            'start' : start_pos
        }
        start_pos += count_obj[d];
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