export const segmentos = {
  studio: {
    tipo: "brief",
    assunto: "Projeto criativo",
    titulo: "Planeje seu projeto",
    descricao: "Conte o que deseja criar para receber uma orientação inicial.",
    botao: "Solicitar proposta",
    campos: `
      <label class="feature-field">
        Objetivo
        <select data-label="Objetivo" required>
          <option value="">Selecione</option>
          <option>Identidade visual</option>
          <option>Site ou landing page</option>
          <option>Campanha</option>
          <option>Sistema digital</option>
          <option>Outro</option>
        </select>
      </label>
      <label class="feature-field">
        Prazo desejado
        <select data-label="Prazo desejado" required>
          <option value="">Selecione</option>
          <option>Sem prazo definido</option>
          <option>Nas próximas semanas</option>
          <option>Nos próximos meses</option>
        </select>
      </label>
      <label class="feature-field wide">
        Descrição do projeto
        <textarea
          data-label="Descrição do projeto"
          placeholder="Descreva sua ideia (sem dados pessoais)."
          maxlength="200"
        ></textarea>
      </label>
    `,
  },
  forma: {
    tipo: "brief",
    assunto: "Projeto ou imóvel",
    titulo: "Encontre o espaço ideal",
    descricao:
      "Informe o tipo de projeto ou imóvel, a região e a área desejada.",
    botao: "Consultar opções",
    campos: `
      <label class="feature-field">
        Interesse
        <select data-label="Interesse" required>
          <option value="">Selecione</option>
          <option>Projeto arquitetônico</option>
          <option>Interiores</option>
          <option>Comprar imóvel</option>
          <option>Alugar imóvel</option>
        </select>
      </label>
      <label class="feature-field">
        Cidade ou região
        <textarea
          data-label="Cidade ou região"
          placeholder="Ex.: Centro"
          maxlength="200"
        ></textarea>
      </label>
      <label class="feature-field">
        Área aproximada ou faixa de orçamento
        <textarea
          data-label="Área aproximada ou faixa de orçamento"
          placeholder="Opcional"
          maxlength="200"
        ></textarea>
      </label>
      <label class="feature-field">
        Tipo de espaço
        <select data-label="Tipo de espaço" required>
          <option value="">Selecione</option>
          <option>Residencial</option>
          <option>Comercial</option>
          <option>Outro</option>
        </select>
      </label>
    `,
  },
  calma: {
    tipo: "agenda",
    assunto: "Atendimento",
    titulo: "Solicite um atendimento",
    descricao:
      "Selecione a área de atendimento, uma data e um horário de preferência.",
    botao: "Solicitar horário",
    campos: `
      <label class="feature-field">
        Atendimento
        <select data-label="Atendimento" required>
          <option value="">Selecione</option>
          <option>{{servico_1}}</option>
          <option>{{servico_2}}</option>
          <option>{{servico_3}}</option>
        </select>
      </label>
      <label class="feature-field">
        Data desejada
        <input data-label="Data desejada" type="date" required />
      </label>
      <label class="feature-field">
        Horário desejado
        <input data-label="Horário desejado" type="time" required />
      </label>
      <div
        class="feature-wide feature-dates"
        data-time-buttons
        aria-label="Horários informados"
      ></div>
    `,
  },
  mesa: {
    tipo: "catalog",
    assunto: "Cardápio",
    titulo: "Cardápio digital",
    descricao:
      "Explore por categoria e monte um pedido para consultar pelo WhatsApp.",
    botao: "Consultar pedido",
    exemplos:
      "Prato do dia|Pratos||| \nSanduíche|Lanches||| \nCafé|Bebidas||| \nSobremesa|Sobremesas|||",
  },
  atlas: {
    tipo: "brief",
    assunto: "Consultoria",
    titulo: "Qual solução você procura?",
    descricao:
      "Escolha o assunto da consulta e o perfil do negócio. Não envie documentos ou dados financeiros pelo formulário.",
    botao: "Solicitar consulta",
    campos: `
      <label class="feature-field">
        Perfil
        <select data-label="Perfil" required>
          <option value="">Selecione</option>
          <option>Pessoa física</option>
          <option>MEI</option>
          <option>Pequena empresa</option>
          <option>Outra empresa</option>
        </select>
      </label>
      <label class="feature-field">
        Assunto
        <select data-label="Assunto" required>
          <option value="">Selecione</option>
          <option>Abertura de empresa</option>
          <option>Contabilidade</option>
          <option>Regularização</option>
          <option>Orientação geral</option>
        </select>
      </label>
      <label class="feature-field">
        Preferência de atendimento
        <select data-label="Preferência de atendimento" required>
          <option value="">Selecione</option>
          <option>Online</option>
          <option>Presencial</option>
          <option>A combinar</option>
        </select>
      </label>
    `,
  },
  vitrine: {
    tipo: "catalog",
    assunto: "Catálogo",
    titulo: "Explore a coleção",
    descricao:
      "Filtre por categoria e tamanho e consulte as peças de interesse.",
    botao: "Consultar seleção",
    exemplos:
      "Camiseta básica|Camisetas||P,M,G,GG|\nCalça casual|Calças||38,40,42,44|\nAcessório|Acessórios||Único|",
  },
  pulso: {
    tipo: "agenda",
    assunto: "Esporte e uniformes",
    titulo: "Experimente uma nova modalidade",
    descricao:
      "Escolha a atividade e solicite uma visita ou aula experimental; para uniformes, escolha orçamento.",
    botao: "Consultar atendimento",
    campos: `
      <label class="feature-field">
        Interesse
        <select data-label="Interesse" required>
          <option value="">Selecione</option>
          <option>Aula experimental</option>
          <option>Visita à academia</option>
          <option>Consultar planos</option>
          <option>Orçamento de uniformes</option>
        </select>
      </label>
      <label class="feature-field">
        Data desejada
        <input data-label="Data desejada" type="date" required />
      </label>
      <label class="feature-field">
        Horário de preferência
        <input data-label="Horário de preferência" type="time" required />
      </label>
      <div
        class="feature-wide feature-dates"
        data-time-buttons
        aria-label="Horários informados"
      ></div>
    `,
  },
  oficio: {
    tipo: "brief",
    assunto: "Serviço técnico",
    titulo: "Solicite seu orçamento",
    descricao:
      "Informe o tipo de serviço e uma breve descrição para orientar o atendimento.",
    botao: "Consultar orçamento",
    campos: `
      <label class="feature-field">
        Serviço
        <select data-label="Serviço" required>
          <option value="">Selecione</option>
          <option>Manutenção</option>
          <option>Reparo</option>
          <option>Instalação</option>
          <option>Avaliação</option>
          <option>Outro</option>
        </select>
      </label>
      <label class="feature-field">
        Modelo do veículo ou tipo de projeto
        <textarea
          data-label="Modelo do veículo ou tipo de projeto"
          placeholder="Ex.: veículo, ambiente ou equipamento"
          maxlength="200"
        ></textarea>
      </label>
      <label class="feature-field wide">
        Descrição do serviço
        <textarea
          data-label="Descrição do serviço"
          placeholder="Descreva o que precisa, sem dados pessoais."
          maxlength="200"
        ></textarea>
      </label>
    `,
  },
  horizonte: {
    tipo: "range",
    assunto: "Experiência ou hospedagem",
    titulo: "Planeje sua experiência",
    descricao:
      "Escolha datas e quantidade de pessoas para consultar a disponibilidade.",
    botao: "Consultar disponibilidade",
    campos: `
      <label class="feature-field">
        Data de início
        <input data-label="Data de início" type="date" required />
      </label>
      <label class="feature-field">
        Data de término
        <input data-label="Data de término" type="date" required />
      </label>
      <label class="feature-field">
        Número de pessoas
        <input
          data-label="Número de pessoas"
          type="number"
          min="1"
          max="10000"
          step="1"
          value="1"
          required
        />
      </label>
    `,
  },
  essencia: {
    tipo: "brief",
    assunto: "Atendimento local",
    titulo: "Encontre o atendimento certo",
    descricao:
      "Escolha o assunto e o canal de atendimento para fazer uma consulta.",
    botao: "Solicitar informações",
    campos: `
      <label class="feature-field">
        Assunto
        <select data-label="Assunto" required>
          <option value="">Selecione</option>
          <option>{{servico_1}}</option>
          <option>{{servico_2}}</option>
          <option>{{servico_3}}</option>
        </select>
      </label>
      <label class="feature-field">
        Preferência
        <select data-label="Preferência" required>
          <option value="">Selecione</option>
          <option>Atendimento presencial</option>
          <option>Atendimento remoto</option>
          <option>A combinar</option>
        </select>
      </label>
      <label class="feature-field wide">
        Mensagem
        <textarea
          data-label="Mensagem"
          placeholder="Opcional; não informe dados pessoais."
          maxlength="200"
        ></textarea>
      </label>
    `,
  },
  barbearia: {
    tipo: "agenda",
    assunto: "Barbearia",
    titulo: "Agende seu próximo corte",
    descricao:
      "Escolha o serviço, a data e o horário. O estabelecimento confirma sua solicitação.",
    botao: "Solicitar agendamento",
    campos: `
      <label class="feature-field">
        Serviço
        <select data-label="Serviço" required>
          <option value="">Selecione</option>
          <option>{{servico_1}}</option>
          <option>{{servico_2}}</option>
          <option>{{servico_3}}</option>
        </select>
      </label>
      <label class="feature-field">
        Profissional
        <select data-label="Profissional" required>
          <option value="">Selecione</option>
          <option>Sem preferência</option>
          <option>A combinar</option>
        </select>
      </label>
      <label class="feature-field">
        Data desejada
        <input data-label="Data desejada" type="date" required />
      </label>
      <label class="feature-field">
        Horário desejado
        <input data-label="Horário desejado" type="time" required />
      </label>
      <div
        class="feature-wide feature-dates"
        data-time-buttons
        aria-label="Horários informados"
      ></div>
    `,
  },
  chacara: {
    tipo: "range",
    assunto: "Locação da chácara",
    titulo: "Consulte as datas da chácara",
    descricao:
      "Selecione o período e a quantidade de convidados. As datas cadastradas aparecem como referência de disponibilidade.",
    botao: "Consultar reserva",
    campos: `
      <label class="feature-field">
        Data de entrada
        <input data-label="Data de entrada" type="date" required />
      </label>
      <label class="feature-field">
        Data de saída
        <input data-label="Data de saída" type="date" required />
      </label>
      <label class="feature-field">
        Número de convidados
        <input
          data-label="Número de convidados"
          type="number"
          min="1"
          max="10000"
          step="1"
          value="1"
          required
        />
      </label>
      <label class="feature-field">
        Tipo de locação
        <select data-label="Tipo de locação" required>
          <option value="">Selecione</option>
          <option>Day use</option>
          <option>Fim de semana</option>
          <option>Confraternização</option>
          <option>Temporada</option>
        </select>
      </label>
    `,
  },
  mercado: {
    tipo: "offers",
    assunto: "Ofertas do mercado",
    titulo: "Ofertas e lista de compras",
    descricao:
      "Explore os setores e monte sua lista para consultar preços e disponibilidade.",
    botao: "Consultar lista",
    exemplos:
      "Banana prata (kg)|Hortifrúti|||\nTomate (kg)|Hortifrúti|||\nPão francês (kg)|Padaria|||\nArroz (5 kg)|Mercearia|||\nFeijão (1 kg)|Mercearia|||",
  },
  calcados: {
    tipo: "catalog",
    assunto: "Catálogo de calçados",
    titulo: "Encontre seu próximo par",
    descricao:
      "Filtre os modelos por categoria e numeração e consulte a disponibilidade.",
    botao: "Consultar calçados",
    exemplos:
      "Tênis casual|Tênis||35,36,37,38,39,40,41,42|\nSandália|Sandálias||34,35,36,37,38,39|\nSapato social|Sociais||38,39,40,41,42,43|",
  },
};
