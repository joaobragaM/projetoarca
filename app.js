const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function toast(message) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(window.__arcaToast);
  window.__arcaToast = window.setTimeout(() => el.classList.remove("show"), 2600);
}

function bindChoices() {
  $$(".choice-row, .status-row, .urgency-row").forEach((row) => {
    row.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (!row.dataset.multi) {
        $$("button", row).forEach((item) => item.classList.remove("active"));
      }
      button.classList.toggle("active", true);
      updateDenunciaSummary();
    });
  });
}

function bindFilters() {
  $$(".filter-row").forEach((row) => {
    row.addEventListener("click", (event) => {
      const button = event.target.closest(".pill");
      if (!button) return;
      $$(".pill", row).forEach((item) => item.classList.remove("active", "dark"));
      button.classList.add("active");
      if (button.dataset.filter === "todos" || button.dataset.filter === "all") {
        button.classList.add("dark");
      }

      const target = row.dataset.target;
      if (!target) return;
      const filter = button.dataset.filter;
      $$(target).forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        card.style.display = filter === "all" || filter === "todos" || categories.includes(filter) ? "" : "none";
      });
    });
  });
}

function bindForms() {
  $$(".js-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.dataset.success || "Informações enviadas com sucesso.";
      toast(message);
    });
  });

  const login = $("#loginForm");
  if (login) {
    login.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("#loginUser");
      if (input && input.value.trim()) localStorage.setItem("arcaUser", input.value.trim());
      window.location.href = "home.html";
    });
  }
}

function bindScrollButtons() {
  $$("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = $(button.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindUploadPreviews() {
  $$("input[type='file'][data-preview-target]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const target = $(input.dataset.previewTarget);
        if (!target) return;
        if (target.tagName === "IMG") {
          target.src = reader.result;
        } else {
          target.innerHTML = `<img src="${reader.result}" alt="Foto enviada">`;
        }
        const note = input.closest(".upload-box")?.querySelector(".file-name");
        if (note) note.textContent = file.name;
        updateProgress("photo");
      };
      reader.readAsDataURL(file);
    });
  });
}

function bindPublicationPreview() {
  const form = $("#publicationForm");
  if (!form) return;
  const mapping = [
    ["animalName", "previewName"],
    ["animalAge", "previewAge"],
    ["animalType", "previewType"],
    ["animalDesc", "previewDesc"],
    ["ownerName", "previewOwner"],
    ["ownerPhone", "previewPhone"]
  ];

  mapping.forEach(([sourceId, targetId]) => {
    const source = $("#" + sourceId);
    const target = $("#" + targetId);
    if (!source || !target) return;
    source.addEventListener("input", () => {
      target.textContent = source.value || target.dataset.placeholder || target.textContent;
      if (source.value.trim()) updateProgress(source.dataset.progress);
    });
    source.addEventListener("change", () => {
      target.textContent = source.value || target.dataset.placeholder || target.textContent;
      if (source.value.trim()) updateProgress(source.dataset.progress);
    });
  });
}

function updateProgress(key) {
  if (!key) return;
  const item = $(`[data-progress-item="${key}"] .dot`);
  if (item) item.style.background = "var(--green)";
}

function updateDenunciaSummary() {
  const animal = $(".denuncia-animal .choice.active")?.textContent?.trim();
  const urgency = $(".urgency-row .urgency.active")?.textContent?.trim();
  const place = $("#denunciaLocal")?.value?.trim();
  if ($("#summaryAnimal") && animal) $("#summaryAnimal").textContent = animal;
  if ($("#summaryUrgency") && urgency) $("#summaryUrgency").textContent = urgency;
  if ($("#summaryPlace") && place) $("#summaryPlace").textContent = place;
}

function bindDenunciaFields() {
  ["denunciaLocal", "denunciaDesc"].forEach((id) => {
    const input = $("#" + id);
    if (input) input.addEventListener("input", updateDenunciaSummary);
  });
}

function hydrateUserName() {
  const stored = localStorage.getItem("arcaUser");
  if (!stored) return;
  $$(".js-user-name").forEach((el) => {
    el.textContent = stored.includes("@") ? "Seu Nome" : stored;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindChoices();
  bindFilters();
  bindForms();
  bindScrollButtons();
  bindUploadPreviews();
  bindPublicationPreview();
  bindDenunciaFields();
  hydrateUserName();
});
