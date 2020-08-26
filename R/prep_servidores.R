library(tidyverse)
library(readxl)

# pega dados planilha escolaridade ---------------------------------------

dados_serv_escolaridade_raw <- read_excel("./R/dados/Servidores_STN.xls", 
                                      sheet = "Escolaridade", skip = 6)

escolaridade_nivel <- data.frame(
  nivel = c("Ensino Superior", 
            "Ensino Médio", 
            "Pós-graduação", 
            "Mestrado", 
            "Doutorado", 
            "Técnico"),
  valor = c(3,
            1,
            4,
            5,
            6,
            2),
  escolaridade = c("Graduação",
                   "Nível fundamental ou médio",
                   "Especialização",
                   "Mestrado", 
                   "Doutorado",
                   "Nível fundamental ou médio")
)

dados_serv_escolaridade <- dados_serv_escolaridade_raw %>%
  left_join(escolaridade_nivel, by = c(`Nível` = "nivel")) %>%
  group_by(Nome) %>%
  mutate(max_estudo = max(valor)) %>%
  filter(max_estudo == valor) %>%
  group_by(Nome) %>%
  summarise(escolaridade = first(escolaridade))
  

# pega demais dados -------------------------------------------------------

dados_serv_raw <- read_excel("./R/dados/Servidores_STN.xls", skip = 9)

dados_serv_incomp <- dados_serv_raw %>%
  select(
    Nome,
    "idade" = `Idade`,
    "genero" = `Sexo`,
    "tempo_tesouro" = `Tempo na STN`,
    "unidade" = `Hierarquia Unidade Organizacional - Exercício`,
    "funcao" = `Cargo`,
  ) %>%
  mutate(
    subsec = str_sub(unidade, 12, 16),
    subsec = ifelse(subsec == "", "GABIN", subsec),
    coord = ifelse(str_sub(unidade, 18, 22) == "", subsec, str_sub(unidade, 18, 22)),
    tempo_tesouro = cut(tempo_tesouro, breaks = c(0, 6, 11, 21, 31, Inf),
                        labels = c("Até 5 anos", "De 6 a 10 anos", 
                                   "De 11 a 20 anos", "De 21 a 30 anos", "Mais de 30 anos"))
  )


# junta dados escolaridade ------------------------------------------------

dados_serv <- dados_serv_incomp %>%
  left_join(dados_serv_escolaridade)


# participação por subsec -------------------------------------------------

por_area_pesquisa <- dados %>% 
  count(subsec) %>%
  ungroup() %>%
  rename(pesquisa = n)

por_area_servidores <- dados_serv %>% count(subsec) %>%
  ungroup() %>%
  mutate(subsec = case_when(
    subsec == "ASSEC" ~ "Gabinete",
    subsec == "GABIN" ~ "Gabinete",
    TRUE ~ str_to_title(subsec))) %>%
  group_by(subsec) %>%
  summarise(servidores = sum(n)) %>%
  ungroup() %>%
  left_join(por_area_pesquisa) %>%
  mutate(participacao = scales::percent(pesquisa / servidores))

# participação por coordenação --------------------------------------------

por_coord_pesquisa <- dados %>% 
  count(unidade) %>%
  ungroup() %>%
  rename(pesquisa = n)

por_coord_servidores <- dados_serv %>% 
  mutate(unidade = case_when(
    coord == "GABIN" ~ "Gabinete",
    subsec == "ASSEC" ~ "ASSEC",
    TRUE ~ coord)) %>%
  group_by(unidade) %>%
  summarise(servidores = n()) %>%
  ungroup() %>%
  left_join(por_coord_pesquisa) %>%
  mutate(participacao = scales::percent(pesquisa / servidores))


# participação por gênero -------------------------------------------------

## aqui caberia uma função para não repetir tanto código, né...
por_genero_pesquisa <- dados %>% 
  count(genero) %>%
  ungroup() %>%
  rename(pesquisa = n)

por_genero_servidores <- dados_serv %>%
  group_by(genero) %>%
  summarise(servidores = n()) %>%
  ungroup() %>%
  left_join(por_genero_pesquisa) %>%
  mutate(participacao = scales::percent(pesquisa / servidores))


# participação por tempo de serviço ---------------------------------------

por_tempo_pesquisa <- dados %>% 
  count(tempo_tesouro) %>%
  ungroup() %>%
  rename(pesquisa = n)

por_tempo_servidores <- dados_serv %>%
  group_by(tempo_tesouro) %>%
  summarise(servidores = n()) %>%
  ungroup() %>%
  left_join(por_tempo_pesquisa) %>%
  mutate(participacao = scales::percent(pesquisa / servidores))

# consultas ad hoc --------------------------------------------------------

dados_serv_escolaridade_raw$Nível %>% unique() %>% dput()
dados_serv %>% count(escolaridade)


