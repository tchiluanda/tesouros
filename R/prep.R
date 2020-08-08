library(tidyverse)
library(readxl)
#library(skimr)
library(colorspace)

dados_raw <- read_excel("./R/dados/Diálogos estratégicos Final 0806.xlsx", skip = 1)

grid <- read_rds("./R/dados/grid.rds")

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

dados <- dados_raw %>%
  select(
    "idade" = `1. Idade`,
    "genero" = `2. Sexo`,
    "escolaridade" = `3. Escolaridade`,
    "tempo_tesouro" = `6. Tempo total no Tesouro`,
    "unidade" = `9. Qual a sua unidade de lotação atual?`,
    "satisfacao" = `1. Você está satisfeito com a sua situação atual no Tesouro?`
  ) %>% 
  mutate(satisfacao = factor(satisfacao, levels = rev(c("Não", "Possivelmente não", "Sinto-me indiferente", "Basicamente sim", "Sim")), ordered = T)) %>%
  left_join(tab_unidades) %>%
  bind_cols(grid)

ggplot(dados, aes(y = unidade, fill = satisfacao)) + 
  geom_bar(position = position_fill()) +
  scale_fill_discrete_diverging()

ggplot(dados, aes(y = subsec, fill = satisfacao)) + 
  geom_bar(position = position_fill()) +
  scale_fill_discrete_diverging()

ggplot(dados %>% count(subsec), aes(y = reorder(subsec, n), x = n)) + 
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
