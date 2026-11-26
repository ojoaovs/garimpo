// Executado no documento isolado de cada prévia.
export const interacoes = String.raw`
(() => {
  const box = document.querySelector("[data-feature]");
  if (!box) return;
  const q = (s) => box.querySelector(s);
  const form = q("form"),
    status = q("[data-status]"),
    output = q("[data-output]"),
    send = q("[data-send]");
  const type = box.dataset.feature;
  let msg = "",
    wa = null;
  try {
    const u = new URL(
      document.querySelector("[data-wa]")?.getAttribute("href") || "",
    );
    if (
      u.protocol === "https:" &&
      u.hostname === "wa.me" &&
      !u.username &&
      !u.password &&
      /^\/[0-9]{10,15}$/.test(u.pathname)
    )
      wa = u;
  } catch {}
  function show(message) {
    msg = message;
    output.textContent = message;
    send.hidden = !message;
    send.textContent = wa ? "Abrir WhatsApp ↗" : "Copiar solicitação";
  }
  send.addEventListener("click", () => {
    if (!msg) return;
    if (wa) {
      const u = new URL(wa.href);
      u.searchParams.set("text", msg);
      location.href = u.href;
    } else {
      const a = document.createElement("textarea");
      a.value = msg;
      a.readOnly = true;
      a.style.position = "fixed";
      a.style.opacity = "0";
      document.body.append(a);
      a.select();
      try {
        if (document.execCommand("copy"))
          status.textContent = "Solicitação copiada. Nenhuma mensagem enviada.";
        else
          status.textContent =
            "Selecione o texto abaixo para copiar manualmente.";
      } catch {
        status.textContent =
          "Selecione o texto abaixo para copiar manualmente.";
      }
      a.remove();
    }
  });
  const today = new Date();
  const localDate = (d) =>
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  const now = localDate(today);
  const fmt = (d) => d.split("-").reverse().join("/");
  const clean = (s) => s.trim().slice(0, 200);
  const dateValid = (s) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !isNaN(Date.parse(s)) &&
    new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s;
  const dateList = (q("[data-dates]")?.textContent || "")
    .split(/[\s,;]+/)
    .filter(dateValid)
    .filter((d) => d >= now)
    .sort();
  const slots = (q("[data-slots]")?.textContent || "")
    .split(/[\n;]+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        /^\d{4}-\d{2}-\d{2}\s(?:[01]\d|2[0-3]):[0-5]\d$/.test(s) &&
        dateValid(s.slice(0, 10)) &&
        s.slice(0, 10) >= now,
    );
  const dateFields = [...box.querySelectorAll("input[type=date]")];
  dateFields.forEach((el) => (el.min = now));
  if (dateFields.length > 1)
    dateFields[0].addEventListener("change", () => {
      dateFields[1].min = dateFields[0].value || now;
      if (dateFields[1].value && dateFields[1].value < dateFields[1].min)
        dateFields[1].value = "";
    });
  const dateBtns = q("[data-date-buttons]");
  if (dateBtns) {
    const options =
      type === "agenda"
        ? [...new Set(slots.map((s) => s.slice(0, 10)))]
        : [...new Set(dateList)];
    options.slice(0, 60).forEach((d) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = fmt(d);
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        dateFields[0].value = d;
        dateFields[0].dispatchEvent(new Event("change", { bubbles: true }));
        dateBtns
          .querySelectorAll("button")
          .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      });
      dateBtns.append(b);
    });
    dateBtns.hidden = !options.length;
  }
  const timeField = q("input[type=time]"),
    times = q("[data-time-buttons]");
  function updateAvailability() {
    if (type === "agenda") {
      const d = dateFields[0]?.value;
      if (times) {
        times.replaceChildren();
        slots
          .filter((s) => s.slice(0, 10) === d)
          .map((s) => s.slice(11))
          .filter((s, i, a) => a.indexOf(s) === i)
          .forEach((s) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = s;
            b.setAttribute("aria-pressed", "false");
            b.addEventListener("click", () => {
              timeField.value = s;
              times
                .querySelectorAll("button")
                .forEach((x) =>
                  x.setAttribute("aria-pressed", String(x === b)),
                );
              show("");
            });
            times.append(b);
          });
        times.hidden = !times.children.length;
      }
      status.textContent = slots.length
        ? d
          ? slots.some((s) => s.slice(0, 10) === d)
            ? "Horários informados pelo estabelecimento para esta data. Confirmação necessária."
            : "Nenhum horário informado para esta data. Consulte a equipe."
          : "Selecione uma data para ver horários informados."
        : "Agenda sem horários cadastrados. Escolha sua preferência para consultar.";
    }
    if (type === "range") {
      const a = dateFields[0]?.value,
        b = dateFields[1]?.value;
      let ok = false;
      if (a && b && b >= a && dateList.length) {
        let d = new Date(a + "T12:00:00Z");
        ok = true;
        let n = 0;
        while (d.toISOString().slice(0, 10) <= b) {
          if (!dateList.includes(d.toISOString().slice(0, 10)) || ++n > 366) {
            ok = false;
            break;
          }
          d.setUTCDate(d.getUTCDate() + 1);
        }
      }
      status.textContent = dateList.length
        ? a && b
          ? ok
            ? "Período consta nas datas informadas. Reserva sujeita a confirmação."
            : "Período não integralmente informado como disponível. Consulte a equipe."
          : "Selecione início e fim. Datas cadastradas são referências, não reservas."
        : "Calendário sem disponibilidade cadastrada. Solicite uma consulta para o período.";
    }
  }
  if (form) {
    form.addEventListener("input", () => {
      show("");
      updateAvailability();
    });
    form.addEventListener("change", () => {
      show("");
      updateAvailability();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const lines = [...form.querySelectorAll("[data-label]")]
        .map((el) => [el.dataset.label, clean(el.value)])
        .filter((x) => x[1]);
      show(
        "Olá! Gostaria de consultar: " +
          box.dataset.subject +
          ".\n" +
          lines
            .map(([k, v]) => k + ": " + (dateValid(v) ? fmt(v) : v))
            .join("\n") +
          "\nAguardo confirmação.",
      );
      if (type === "brief")
        status.textContent =
          "Solicitação preparada. Revise e escolha como encaminhar.";
    });
    updateAvailability();
  }
  if (type === "catalog" || type === "offers") {
    const raw = q("[data-items]").textContent.trim(),
      demo = q("[data-demo-items]").textContent.trim(),
      validUntil = q("[data-validity]").textContent.trim();
    const expired =
      type === "offers" && (!dateValid(validUntil) || validUntil < now);
    const configured = !!raw && !expired;
    const rows = (configured ? raw : demo)
      .split(/\r?\n/)
      .slice(0, 60)
      .map((line) => line.split("|").map(clean))
      .filter((a) => a[0] && a[1])
      .map((a, i) => ({
        id: i,
        name: a[0],
        cat: a[1],
        price: a[2] || "",
        sizes: (a[3] || "").split(",").map(clean).filter(Boolean),
        detail: a[4] || "",
      }));
    const selected = new Map();
    const list = q("[data-list]"),
      category = q("[data-category]"),
      size = q("[data-size]"),
      search = q("[data-search]"),
      count = q("[data-count]");
    const appendOption = (el, v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      el.append(opt);
    };
    [...new Set(rows.map((r) => r.cat))].forEach((v) =>
      appendOption(category, v),
    );
    [...new Set(rows.flatMap((r) => r.sizes))]
      .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
      .forEach((v) => appendOption(size, v));
    size.closest("label").hidden = !rows.some((r) => r.sizes.length);
    status.textContent = configured
      ? type === "offers"
        ? "Ofertas cadastradas · validade até " +
          fmt(validUntil) +
          ". Preço e estoque sujeitos à confirmação."
        : "Catálogo cadastrado. Estoque e condições sujeitos à confirmação."
      : type === "offers" && raw
        ? "Ofertas sem validade vigente. Exibindo exemplos, não preços reais."
        : "Itens ilustrativos. Não representam estoque, cardápio ou preços reais.";
    const money = (s) => {
      const n = Number(s.replace(",", "."));
      return /^\d+(?:[,.]\d{1,2})?$/.test(s) && Number.isFinite(n)
        ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "Preço sob consulta";
    };
    function cart() {
      count.textContent =
        selected.size +
        " " +
        (selected.size === 1 ? "item selecionado" : "itens selecionados");
      show("");
      q("[data-build]").disabled = !selected.size;
    }
    function render() {
      list.replaceChildren();
      const filtered = rows.filter(
        (r) =>
          (!category.value || r.cat === category.value) &&
          (!size.value || r.sizes.includes(size.value)) &&
          (!search.value ||
            [r.name, r.cat, r.detail]
              .join(" ")
              .toLocaleLowerCase("pt-BR")
              .includes(search.value.trim().toLocaleLowerCase("pt-BR"))),
      );
      filtered.forEach((r) => {
        const card = document.createElement("article");
        card.className = "feature-card";
        const el = (tag, cls, txt) => {
          const x = document.createElement(tag);
          x.className = cls;
          x.textContent = txt;
          card.append(x);
          return x;
        };
        el("span", "fc-tag", r.cat);
        el("h3", "", r.name);
        el(
          "span",
          "fc-price",
          configured ? money(r.price) : "Preço sob consulta",
        );
        if (r.sizes.length)
          el(
            "span",
            "fc-size",
            (configured ? "Numeração informada: " : "Numeração de exemplo: ") +
              r.sizes.join(", "),
          );
        if (r.detail) el("span", "fc-size", r.detail);
        const b = el(
          "button",
          "fc-add",
          selected.has(r.id) ? "Remover" : "Adicionar",
        );
        b.type = "button";
        b.setAttribute("aria-pressed", String(selected.has(r.id)));
        b.addEventListener("click", () => {
          if (selected.has(r.id)) selected.delete(r.id);
          else selected.set(r.id, { ...r, chosenSize: size.value || "" });
          b.setAttribute("aria-pressed", String(selected.has(r.id)));
          b.textContent = selected.has(r.id) ? "Remover" : "Adicionar";
          cart();
        });
        list.append(card);
      });
      if (!filtered.length) {
        const p = document.createElement("p");
        p.textContent = "Nenhum item corresponde aos filtros.";
        list.append(p);
      }
    }
    [category, size, search].forEach((x) =>
      x.addEventListener("input", render),
    );
    q("[data-clear]").addEventListener("click", () => {
      selected.clear();
      cart();
      render();
    });
    q("[data-build]").addEventListener("click", () => {
      if (!selected.size) return;
      show(
        "Olá! Gostaria de consultar estes itens:\n" +
          [...selected.values()]
            .map(
              (r) =>
                "- " +
                r.name +
                (r.chosenSize ? " / tamanho " + r.chosenSize : ""),
            )
            .join("\n") +
          "\n" +
          (configured
            ? ""
            : "Seleção feita a partir de exemplos ilustrativos. ") +
          "Podem confirmar disponibilidade e valores?",
      );
    });
    cart();
    render();
  }
})();
`;
