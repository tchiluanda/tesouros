library(tidyverse)
library(readxl)
#library(skimr)
library(colorspace)

dados_raw <- read_excel("./R/dados/Diálogos estratégicos Final 0806.xlsx", skip = 1) %>%
  mutate(id = row_number())

tab_unidades <- data.frame(
  "unidade" = c(
    "ASSEC", "Gabinete",
    "CCONT", "CCONF", "COINC", 
    "CODIN", "COSIS",
    "COFIN", "CGFIS", "COGEF", "CPLAN",
    "CODIP", "CODIV", "COGEP",
    "COPAR", "COPEF", "CESEF",
    "COAFI", "COPEM", "COINT", "COREM",
    "CORIS", "CFORM", 
    "Unidade fora do Tesouro"),
  "subsec" = c(
    rep("Gabinete", 2),
    rep("Sucon",    3),
    rep("Sucop",    2),
    rep("Sugef",    4),
    rep("Sudip",    3),
    rep("Supef",    3),
    rep("Surin",    4),
    rep("Suric",    2),
    "Fora do Tesouro")
)


# tratamento das colunas de satisfação ------------------------------------

colunas_sat <- c(
  "1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Chefia]", 
  "1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Tipo de trabalho]", 
  "1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Salário]", 
  "1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Ambiente]", 
  "1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Colegas]", 
  "1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Outros]")

colunas_insat <- c(
  "1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Chefia]", 
  "1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Tipo de trabalho]", 
  "1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Salário]", 
  "1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Ambiente]", 
  "1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Colegas]", 
  "1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Outros]"
)

processa_sat_insat <- function(colunas) {
  #colunas <- colunas_sat
  
  posicoes_ini <- str_locate(colunas, "\\[")[, "end"]
  posicoes_fin <- str_locate(colunas, "\\]")[, "end"]
  razoes <- str_sub(colunas, posicoes_ini + 1, posicoes_fin - 1)
  tab_aux <- data.frame("pergunta" = colunas, razoes)
  tab_aux_hierarquia <- data.frame(
    ranking_pre = c(
      "Primeira opção;Segunda opção;Terceira opção",
      "Primeira opção;Segunda opção",
      "Primeira opção",
      "Segunda opção;Terceira opção",
      "Segunda opção",
      "Terceira opção"),
    ranking = c(
      "Primeira opção",
      "Primeira opção",
      "Primeira opção",
      "Segunda opção",
      "Segunda opção",
      "Terceira opção") 
  )
  
  dados_sat_insat <- dados_raw %>%
    select(id, all_of(colunas)) %>%
    gather(-id, key = "pergunta", value = "ranking_pre") %>%
    left_join(tab_aux) %>%
    left_join(tab_aux_hierarquia) %>%
    select(-pergunta, -ranking_pre) %>%
    filter(!is.na(ranking)) %>%
    spread(key = ranking, value = razoes) %>%
    select(id, primeira= `Primeira opção`, segunda = `Segunda opção`, terceira = `Terceira opção`) %>%
    filter(!is.na(primeira)) %>%
    mutate_if(is.factor, ~as.character(.))
  
  # t <- data.frame("sat" = c(dados_sat$sat1, dados_sat$sat2),
  #                 "rnk" = c(rep("primeiro", length(dados_sat$sat1)), rep("segundo", length(dados_sat$sat1)))
  #                 ) %>% 
  #   group_by(rnk) %>%
  #   count(sat) %>% arrange(desc(n))
  return(dados_sat_insat)
}

dados_sat <- processa_sat_insat(colunas_sat)
dados_insat <- processa_sat_insat(colunas_insat)

#ggplot(t, aes(x = n, y = sat, fill = rnk)) + geom_col(position = position_dodge())


# prepara tabela principal ------------------------------------------------

grid <- read_rds("./R/dados/grid.rds")

dados <- dados_raw %>%
  select(
    id,
    "idade" = `1. Idade`,
    "genero" = `2. Sexo`,
    "escolaridade" = `3. Escolaridade`,
    "tempo_tesouro" = `6. Tempo total no Tesouro`,
    "unidade" = `9. Qual a sua unidade de lotação atual?`,
    "funcao" = `10. Qual a sua função atual?`,
    "satisfacao" = `1. Você está satisfeito com a sua situação atual no Tesouro?`,
    "ascender" = `2. Você pretende ou espera ascender dentro do Tesouro?`,
    # "razoes_sat_chefia" = `1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Chefia]`, 
    # "razoes_sat_tipo_trabalho" = `1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Tipo de trabalho]`, 
    # "razoes_sat_salario" = `1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Salário]`,
    # "razoes_sat_ambiente" = `1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Ambiente]`, 
    # "razoes_sat_colegas" = `1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Colegas]`, 
    # "razoes_sat_outros" = `1.1 Se você está satisfeito ou indiferente, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Outros]`,
    # "razoes_insat_chefia" = `1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Chefia]`, 
    # "razoes_insat_tipo_trabalho" = `1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Tipo de trabalho]`, 
    # "razoes_insat_salario" = `1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Salário]`, 
    # "razoes_insat_tipo_ambiente" = `1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Ambiente]`, 
    # "razoes_insat_colegas" = `1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Colegas]`, 
    # "razoes_insat_outras" = `1.2 Se você está insatisfeito, qual(is) a(s) principal(is) razão(ões) para essa percepção? Escolha até três opções e priorize. [Outros]`
  ) %>% 
  mutate(
    tempo_tesouro = factor(tempo_tesouro, levels = c("Até 5 anos", "De 6 a 10 anos", "De 11 a 20 anos", "De 21 a 30 anos", 
                           "Mais de 30 anos"), ordered = TRUE),
    satisfacao = factor(satisfacao, levels = rev(c("Não", "Possivelmente não", "Sinto-me indiferente", "Basicamente sim", "Sim")), ordered = T),
    insatisfeita = satisfacao %in% c("Não", "Possivelmente não")) %>%
  left_join(tab_unidades) %>%
  left_join(dados_sat) %>%
  left_join(dados_insat, by = "id", suffix = c(".sat", ".insat")) %>%
  bind_cols(grid)


# explorações -------------------------------------------------------------

dados %>% filter(insatisfeita) %>% group_by(genero) %>% count(primeira.insat)

dados %>% filter(insatisfeita) %>% group_by(funcao) %>% count(primeira.insat)

principal_razao_sat <- function(sat, criterio) {
  
  quo_crit <- sym(criterio) # transforma "criterio", que é string, num símbolo
  
  if (sat) {
    princ <- dados %>% 
      filter(!insatisfeita) %>%
      group_by(!! quo_crit) %>% 
      count(primeira.sat) %>% 
      arrange(desc(n)) %>%
      summarise(primeira = first(primeira.sat))
  } else {
    princ <- dados %>% 
      filter(insatisfeita) %>%
      group_by(!! quo_crit) %>% 
      count(primeira.insat) %>% 
      arrange(desc(n)) %>%
      summarise(primeira = first(primeira.insat))
  }
  
  # princ %>%
  #   mutate(maximo = max(n)) %>%
  #   ungroup() %>%
  #   filter(n == maximo)
  
  return(princ)
}

dados %>% filter(insatisfeita) %>%
  ggplot(aes(x = subsec, fill = primeira.insat)) + geom_bar(position = "dodge")

dados %>% filter(!insatisfeita) %>%
  ggplot(aes(x = subsec, fill = primeira.sat)) + geom_bar(position = "dodge")

principal_razao_sat(sat = TRUE, "subsec")
principal_razao_sat(sat = FALSE, "subsec")
principal_razao_sat(sat = TRUE,  "genero")
principal_razao_sat(sat = FALSE, "genero")



# aqui sim, resultados sumarizados para comparar com vis

sat_otim <- c("Sim", "Basicamente sim", "Sinto-me indiferente")
insat_pessim <- c("Não", "Possivelmente não", "Sinto-me indiferente")

sumario <- function(criterio) {
  quo_crit <- sym(criterio) # transforma "criterio", que é string, num símbolo
  
  df1 <- dados %>% 
    filter(satisfacao %in% sat_otim) %>%
    group_by(!! quo_crit) %>% 
    count(primeira.sat) %>% 
    arrange(desc(n)) %>%
    summarise(otim_sat = first(primeira.sat))
  
  df2<- dados %>% 
    filter(!(satisfacao %in% sat_otim)) %>%
    group_by(!! quo_crit) %>% 
    count(primeira.insat) %>% 
    arrange(desc(n)) %>%
    summarise(otim_insat = first(primeira.insat))
  
  df3 <- dados %>% 
    filter(satisfacao %in% insat_pessim) %>%
    group_by(!! quo_crit) %>% 
    count(primeira.insat) %>% 
    arrange(desc(n)) %>%
    summarise(pess_insat = first(primeira.insat))
  
  df4 <- dados %>% 
    filter(!(satisfacao %in% insat_pessim)) %>%
    group_by(!! quo_crit) %>% 
    count(primeira.sat) %>% 
    arrange(desc(n)) %>%
    summarise(pess_sat = first(primeira.sat))
  
  resumo <- df1 %>%
    left_join(df2) %>%
    left_join(df3) %>%
    left_join(df4)
  
  return(resumo)
}

sumario("tempo_tesouro")
sumario("ascender")
sumario("genero")
sumario("subsec")


dados %>% filter(satisfacao %in% insat_pessim) %>%
  ggplot(aes(x = genero, fill = primeira.insat)) + geom_bar(position = "dodge")

dados %>% filter(satisfacao %in% sat_otim) %>%
  ggplot(aes(x = genero, fill = primeira.sat)) + geom_bar(position = "dodge")

dados %>% filter(!(satisfacao %in% sat_otim)) %>%
  ggplot(aes(x = tempo_tesouro, fill = primeira.insat)) + geom_bar(position = "dodge")

dados %>% filter(satisfacao %in% sat_otim) %>%
  ggplot(aes(x = tempo_tesouro, fill = primeira.sat)) + geom_bar(position = "dodge")


dados %>% filter(!(satisfacao %in% sat_otim)) %>%
  ggplot(aes(x = ascender, fill = primeira.insat)) + geom_bar(position = "dodge")

dados %>% filter(satisfacao %in% sat_otim) %>%
  ggplot(aes(x = ascender, fill = primeira.sat)) + geom_bar(position = "dodge")



insat_tempo <- dados %>% filter(insatisfeita, !is.na(primeira.insat)) %>% group_by(tempo_tesouro) %>% count(primeira.insat)
insat_genero <- dados %>% filter(insatisfeita, !is.na(primeira.insat)) %>% group_by(genero) %>% count(primeira.insat)
insat_subsec <- dados %>% filter(insatisfeita, !is.na(primeira.insat)) %>% group_by(subsec) %>% count(primeira.insat)

ggplot(insat_tempo, aes(x = n, y = primeira.insat)) + geom_col() + facet_wrap(~tempo_tesouro, scales = "free") + labs("title" = "Com o que são insatisfeitos os insatisfeiros?")
ggplot(insat_genero, aes(x = n, y = primeira.insat)) + geom_col() + facet_wrap(~genero, scales = "free") + labs("title" = "Com o que são insatisfeitos os insatisfeiros?")
ggplot(insat_subsec, aes(x = n, y = primeira.insat)) + geom_col() + facet_wrap(~subsec, scales = "free", repeat.tick.labels = TRUE) + labs("title" = "Com o que são insatisfeitos os insatisfeiros?")

ggplot(dados, aes(y = funcao, fill = satisfacao)) + 
  geom_bar(position = position_fill()) +
  scale_fill_discrete_diverging()

ggplot(dados, aes(y = subsec, fill = satisfacao)) + 
  geom_bar(position = position_fill()) +
  scale_fill_discrete_diverging()

ggplot(dados, aes(y = subsec, fill = satisfacao)) + 
  geom_bar() +
  scale_fill_discrete_diverging()

# quantidade respondentes por subsec
ggplot(dados %>% count(subsec), aes(y = reorder(subsec, n), x = n)) + 
  geom_col() +
  geom_text(aes(label = n), nudge_x = 2)

# quantidade respondentes por funcao
ggplot(dados %>% count(funcao), aes(y = reorder(funcao, n), x = n)) + 
  geom_col() +
  geom_text(aes(label = n), nudge_x = 2)

# dados_raw %>% ggplot(aes(`1. Idade`)) + geom_histogram(stat="count")
# dados_raw %>% ggplot(aes(`2. Sexo`)) + geom_histogram(stat="count")
# dados_raw %>% ggplot(aes(`3. Escolaridade`)) + geom_histogram(stat="count")
# dados_raw %>% ggplot(aes(`6. Tempo total no Tesouro`)) + geom_histogram(stat="count")
# dados_raw %>% ggplot(aes(`9. Qual a sua unidade de lotação atual?`)) + geom_histogram(stat="count")
# dados_raw %>% ggplot(aes(`1. Você está satisfeito com a sua situação atual no Tesouro?`)) + geom_histogram(stat="count")
# 
# dados_satisfacao <- dados_raw %>%
#   select(idade = `1. Idade`, 
#          satis = `1. Você está satisfeito com a sua situação atual no Tesouro?`) %>%
#   mutate(satis = factor(satis, levels = rev(c("Não", "Possivelmente não", "Sinto-me indiferente", "Basicamente sim", "Sim")), ordered = T))
# 
# dados_satisfacao_plot <- dados_satisfacao %>%
#   count(idade,  satis)
# 
# ggplot(dados_satisfacao_plot, aes(fill = satis, y = idade, x = n)) +
#   geom_col(position = position_fill()) +
#   scale_fill_discrete_diverging()
# 
# dados <- dados_raw %>% 
#   select(1:12) %>% 
#   bind_cols(grid)



# exporta os dados --------------------------------------------------------

dados %>% write.csv(file = "./web/dados/data.csv", fileEncoding = "UTF-8")


# misc --------------------------------------------------------------------

dput(unique(dados_raw$`1. Idade`))
dput(unique(dados_raw$`3. Escolaridade`))
dput(unique(dados_raw$`1. Você está satisfeito com a sua situação atual no Tesouro?`))
dput(unique(unlist(dados_raw[,10])))

tab_unidades <- data.frame(
  "unidades" = c(
    "ASSEC", "Gabinete",
    "CCONT", "CCONF", "COINC", 
    "CODIN", "COSIS",
    "COFIN", "CGFIS", "COGEF", "CPLAN",
    "CODIP", "CODIV", "COGEP",
    "COPAR", "COPEF", "CESEF",
    "COAFI", "COPEM", "COINT", "COREM",
    "CORIS", "CFORM", 
    "Unidade fora do Tesouro"),
  "subsec" = c(
    rep("Gabinete", 2),
    rep("Sucon",    3),
    rep("Sucop",    2),
    rep("Sugef",    4),
    rep("Sudip",    3),
    rep("Supef",    3),
    rep("Surin",    4),
    rep("Suric",    2),
    "Fora do Tesouro")
  )

#load("./R/dados/data_luke.RData")


dput(rev(colorspace::diverging_hcl(5, palette = "Blue-Red")))
