library(tidyverse)
library(readxl)
library(skimr)

dados_raw <- read_excel("./R/dados/Diálogos estratégicos Final 0806.xlsx", skip = 1)

grid <- read_rds("./R/dados/grid.rds")

dados <- bind_cols(dados_raw, grid)

dados %>% ggplot(aes(`1. Idade`)) + geom_histogram(stat="count")
dados %>% ggplot(aes(`2. Sexo`)) + geom_histogram(stat="count")
dados %>% ggplot(aes(`3. Escolaridade`)) + geom_histogram(stat="count")
dados %>% ggplot(aes(`6. Tempo total no Tesouro`)) + geom_histogram(stat="count")
dados %>% ggplot(aes(`9. Qual a sua unidade de lotação atual?`)) + geom_histogram(stat="count")
dados %>% ggplot(aes(`1. Você está satisfeito com a sua situação atual no Tesouro?`)) + geom_histogram(stat="count")

dados %>% select(1:11) %>% write.csv(file = "./web/dados/data.csv", fileEncoding = "UTF-8")
