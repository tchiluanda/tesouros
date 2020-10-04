function sumarios(contagens, variavel, cor) {

    const envelope = d3.select("div.envelope-svg-" + variavel);

    console.log("Sumarios envelope", envelope);

    const svg = d3.select("svg.svg-" + variavel);

    function dimensiona_sumario(variavel) {

        let width = envelope.node().getBoundingClientRect().width;
    
        let height = envelope.node().getBoundingClientRect().height;
    
        width  = Math.min(width, 600);
        height = Math.min(height, 500);
    
        svg
          .attr("width", width)
          .attr("height", height);
    
        return([width, height]);
    }
    
    function desenha_sumarios(contagens, variavel, cor) {
    
        // data
        const mini_dados = contagens.filter(d => d.variavel == variavel);
    
        // ordena
        mini_dados.sort((a,b) => b.n - a.n)
        console.log(mini_dados)
    
        // dimensoes
        const dim = dimensiona_sumario(variavel);
    
        const height = dim[1];
        const width  = dim[0];
    
        const margin = 10;
    
        const altura_barra = 20;
        const altura_categoria = 50;
        const qde_categorias = mini_dados.length;
        const altura_necessaria = altura_categoria * (qde_categorias + 2); // +2 para o padding outer 
    
        // escalas
        const size = d3.scaleLinear()
          .domain([0,d3.max(mini_dados, d => +d.n)])
          .range([0, width-margin-margin]);
    
        const y = d3.scaleBand()
          .domain(mini_dados.map(d => d.opcao))
          .rangeRound([margin, margin + altura_necessaria])
          .paddingOuter(1);

        console.log("band_width", y.bandwidth())
        console.log("maximo", size.range(), size.domain())
    
        // faz as barras
    
        let barras = svg
          .selectAll("rect." + variavel)
          .data(mini_dados)
          .join("rect")
          .classed(variavel, true)
          .attr("x", margin)
          .attr("y", d => y(d.opcao))
          .attr("height", altura_barra)
          .attr("width", 0)
          .attr("fill", "var(--" + cor + ")")
          .transition()
          .duration(1000)
          .attr("width", d => size(d.n))

        // faz os rotulos

        let desloc = w < 600 ? 25 : 17;

        let rotulos = envelope
          .selectAll("p.rotulos-" + variavel)
          .data(mini_dados)
          .join("p")
          .classed("rotulos-" + variavel, true)
          .style("left", margin + "px")
          .style("top", d => (y(d.opcao) - desloc) + "px")
          .html(d => d.opcao + " <strong style='color:var(--" + cor + ");'>" + d.n + "<strong>");

    
    }

    desenha_sumarios(contagens, variavel, cor);
}

