const STORAGE_KEY = "guessingYou.tableAid.v1";
const ALL_OPTION = "全部";

const categories = ["生活習慣", "興趣嗜好", "工作與學習", "消費觀", "人際關係", "愛情觀", "人生觀"];

const modes = [
  {
    id: "friends",
    code: "Mode A",
    name: "朋友模式",
    tone: "輕鬆有趣",
    familiarity: "剛認識到普通朋友",
    depth: "低侵入性",
    description: "適合破冰、聚會、朋友局。題目偏日常和好笑，讓彼此不用太有壓力也能聊起來。",
  },
  {
    id: "acquaintance",
    code: "Mode B",
    name: "熟人模式",
    tone: "驗證彼此認知",
    familiarity: "已熟但不一定深聊",
    depth: "中度探索",
    description: "適合同學、同事、老朋友。重點是驗證你以為的對方，和對方真實認知是否一致。",
  },
  {
    id: "couple",
    code: "Mode C",
    name: "情侶模式",
    tone: "偏價值觀",
    familiarity: "伴侶或高度親近",
    depth: "深度對話",
    description: "適合情侶、曖昧後期或很親近的人。問題更靠近安全感、期待、承諾與人生選擇。",
  },
  {
    id: "custom",
    code: "Mode D",
    name: "自訂題庫",
    tone: "由我們維護",
    familiarity: "任何關係皆可",
    depth: "彈性深度",
    description: "玩家端不新增題目，題庫由產品方挑選與維護，未來可整理成活動題包或付費題包。",
  },
];

const fallbackPacks = [
  {
    id: "fallback",
    name: "備援題包",
    status: "selected-draft",
    questions: [
      {
        id: "fallback-001",
        mode: "friends",
        level: "Lv1",
        category: "人際關係",
        text: "你猜猜看，我最想跟誰吃一頓飯？",
      },
    ],
  },
];

let questionLibrary = [];

const dom = {
  themeToggle: document.querySelector("#themeToggle"),
  themeIcon: document.querySelector("#themeIcon"),
  tabButtons: document.querySelectorAll(".tab-button"),
  rulesPage: document.querySelector("#rulesPage"),
  gamePage: document.querySelector("#gamePage"),
  startGameBtn: document.querySelector("#startGameBtn"),
  modeGrid: document.querySelector("#modeGrid"),
  rulesModeGrid: document.querySelector("#rulesModeGrid"),
  modeHint: document.querySelector("#modeHint"),
  exportBtn: document.querySelector("#exportBtn"),
  importFile: document.querySelector("#importFile"),
  completedCount: document.querySelector("#completedCount"),
  currentMeta: document.querySelector("#currentMeta"),
  questionText: document.querySelector("#questionText"),
  hosterToggle: document.querySelector("#hosterToggle"),
  hosterPanel: document.querySelector("#hosterPanel"),
  hosterStage: document.querySelector("#hosterStage"),
  hosterPurpose: document.querySelector("#hosterPurpose"),
  hosterFramework: document.querySelector("#hosterFramework"),
  hosterTips: document.querySelector("#hosterTips"),
  hosterWatchOut: document.querySelector("#hosterWatchOut"),
  favoriteBtn: document.querySelector("#favoriteBtn"),
  questionNumberSelect: document.querySelector("#questionNumberSelect"),
  notes: document.querySelector("#notes"),
  saveStatus: document.querySelector("#saveStatus"),
  completeBtn: document.querySelector("#completeBtn"),
  historyList: document.querySelector("#historyList"),
  clearRoundsBtn: document.querySelector("#clearRoundsBtn"),
  modeCardTemplate: document.querySelector("#modeCardTemplate"),
  historyItemTemplate: document.querySelector("#historyItemTemplate"),
};

const defaultState = {
  rounds: [],
  favorites: [],
  currentQuestionId: null,
  draft: {
    notes: "",
    rating: "miss",
  },
  settings: {
    activeView: "rules",
    activeMode: "friends",
    theme: "light",
    hosterMode: false,
  },
};

let state = loadState();

function normalizePacks(packs) {
  return packs.flatMap((pack) =>
    pack.questions.map((question, index) => ({
      ...question,
      number: question.id?.startsWith("personal-") ? Number(question.id.split("-")[1]) || index + 1 : null,
      packId: pack.id,
      packName: pack.name,
      packStatus: pack.status || "candidate",
      builtIn: true,
    })),
  );
}

function loadQuestionLibrary() {
  const packs = Array.isArray(window.QUESTION_PACKS) ? window.QUESTION_PACKS : fallbackPacks;
  questionLibrary = normalizePacks(packs);
  if (!state.currentQuestionId) state.currentQuestionId = numberedQuestions()[0]?.id || null;
  render();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? mergeState(saved) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(saved) {
  return {
    ...structuredClone(defaultState),
    ...saved,
    draft: { ...defaultState.draft, ...(saved.draft || {}) },
    settings: { ...defaultState.settings, ...(saved.settings || {}) },
  };
}

function saveState(message = "已自動保存") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  dom.saveStatus.textContent = message;
  window.clearTimeout(saveState.statusTimer);
  saveState.statusTimer = window.setTimeout(() => {
    dom.saveStatus.textContent = "localStorage 自動保存中";
  }, 1400);
}

function playableQuestions() {
  return questionLibrary.filter((question) => question.packStatus === "selected-draft");
}

function numberedQuestions() {
  return playableQuestions()
    .filter((question) => question.packId === "personal-starter")
    .sort((a, b) => (a.number || 999) - (b.number || 999));
}

function currentQuestion() {
  return playableQuestions().find((question) => question.id === state.currentQuestionId) || numberedQuestions()[0] || null;
}

function currentMode() {
  return modes.find((mode) => mode.id === state.settings.activeMode) || modes[0];
}

function populateSelect(select, options, value) {
  select.innerHTML = "";
  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.append(option);
  });
  select.value = value;
}

function setQuestion(questionId) {
  const question = playableQuestions().find((item) => item.id === questionId);
  if (!question) return;
  state.currentQuestionId = question.id;
  state.settings.activeMode = question.mode;
  state.draft = structuredClone(defaultState.draft);
  saveState("已切換題目");
  render();
}

function completeRound() {
  const question = currentQuestion();
  if (!question) {
    alert("請先選一題。");
    return;
  }

  state.rounds.unshift({
    id: crypto.randomUUID(),
    mode: question.mode,
    questionId: question.id,
    questionNumber: question.number,
    questionText: question.text,
    category: question.category,
    notes: state.draft.notes.trim(),
    rating: state.draft.rating,
    playStyle: "table-aid",
    createdAt: new Date().toISOString(),
  });

  state.draft = structuredClone(defaultState.draft);
  saveState("已留下評語");
  render();
}

function toggleFavorite() {
  const question = currentQuestion();
  if (!question) return;

  const exists = state.favorites.includes(question.id);
  state.favorites = exists ? state.favorites.filter((id) => id !== question.id) : [...state.favorites, question.id];
  saveState(exists ? "已取消收藏" : "已收藏題目");
  renderQuestion();
  renderStats();
}

function saveDraft() {
  state.draft.notes = dom.notes.value;
  state.draft.rating = document.querySelector("input[name='rating']:checked")?.value || "miss";
  saveState();
}

function render() {
  renderTheme();
  renderActiveView();
  renderModes();
  renderQuestionNumberSelect();
  renderQuestion();
  renderHoster();
  renderDraft();
  renderStats();
  renderHistory();
}

function renderTheme() {
  document.body.classList.toggle("dark", state.settings.theme === "dark");
  dom.themeIcon.textContent = state.settings.theme === "dark" ? "☀" : "◐";
}

function renderActiveView() {
  dom.rulesPage.hidden = state.settings.activeView !== "rules";
  dom.gamePage.hidden = state.settings.activeView !== "game";
  dom.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === state.settings.activeView);
  });
}

function renderModes() {
  const renderTarget = (target, interactive) => {
    target.innerHTML = "";
    modes.forEach((mode) => {
      const node = dom.modeCardTemplate.content.firstElementChild.cloneNode(true);
      node.classList.toggle("is-active", mode.id === state.settings.activeMode);
      node.querySelector("span").textContent = mode.code;
      node.querySelector("strong").textContent = mode.name;
      node.querySelector("small").textContent = `${mode.familiarity} · ${mode.tone} · ${mode.depth}`;
      node.querySelector("p").textContent = mode.description;
      if (interactive) node.addEventListener("click", () => switchMode(mode.id));
      target.append(node);
    });
  };

  renderTarget(dom.modeGrid, true);
  renderTarget(dom.rulesModeGrid, false);
  dom.modeHint.textContent = `${currentMode().code} ${currentMode().name} · ${currentMode().familiarity}`;
}

function switchMode(modeId) {
  state.settings.activeMode = modeId;
  const firstInMode = numberedQuestions().find((question) => question.mode === modeId);
  state.currentQuestionId = firstInMode?.id || state.currentQuestionId;
  state.draft = structuredClone(defaultState.draft);
  saveState("已切換模式");
  render();
}

function renderQuestionNumberSelect() {
  const options = numberedQuestions().map((question) => ({
    value: question.id,
    label: `${String(question.number).padStart(2, "0")}｜${question.level || ""}｜${question.text.replace(/\s+/g, " ").slice(0, 30)}`,
  }));
  populateSelect(dom.questionNumberSelect, options, currentQuestion()?.id || options[0]?.value || "");
}

function renderQuestion() {
  const question = currentQuestion();
  const mode = question ? modes.find((item) => item.id === question.mode) : currentMode();
  const numberText = question?.number ? `第 ${question.number} 題` : "題目";

  dom.currentMeta.textContent = question ? `${numberText} · ${mode?.name || "模式"} · ${question.category}` : "準備開始";
  dom.questionText.textContent = question ? question.text : "先選一題，開始面對面猜猜看。";
  dom.favoriteBtn.classList.toggle("is-active", Boolean(question && state.favorites.includes(question.id)));
  dom.favoriteBtn.textContent = question && state.favorites.includes(question.id) ? "★" : "☆";
}

function renderHoster() {
  const question = currentQuestion();
  const hoster = question?.hoster || {};

  dom.hosterToggle.textContent = state.settings.hosterMode ? "HOSTER ON" : "HOSTER OFF";
  dom.hosterToggle.classList.toggle("is-active", state.settings.hosterMode);
  dom.hosterPanel.hidden = !state.settings.hosterMode;
  dom.hosterStage.textContent = hoster.stage || "桌遊進行中";
  dom.hosterPurpose.textContent = hoster.purpose || "這題用來幫助玩家校準彼此認知。";
  dom.hosterFramework.textContent = hoster.framework || "題卡引導";
  dom.hosterTips.textContent = hoster.tips || "先讓對方猜，再由本人用口頭揭曉答案。";
  dom.hosterWatchOut.textContent = hoster.watchOut || "維持輕鬆，不把猜錯解讀成不在乎。";
}

function renderDraft() {
  dom.notes.value = state.draft.notes;
  const rating = document.querySelector(`input[name='rating'][value='${state.draft.rating}']`);
  if (rating) rating.checked = true;
}

function renderStats() {
  const completed = state.rounds.length;
  dom.completedCount.textContent = completed;
}

function renderHistory() {
  dom.historyList.innerHTML = "";

  if (!state.rounds.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "留下第一則評語後，這裡會變成你的小小猜測紀錄本。";
    dom.historyList.append(empty);
    return;
  }

  state.rounds.slice(0, 20).forEach((round) => {
    const node = dom.historyItemTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".category-pill").textContent = `第 ${round.questionNumber || "?"} 題 · ${round.category}`;
    node.querySelector("h3").textContent = round.questionText;
    node.querySelector("p").textContent = round.notes || "沒有補充評語。";
    const score = node.querySelector("strong");
    score.textContent = round.rating === "hit" ? "猜中" : "未中";
    score.classList.toggle("is-miss", round.rating !== "hit");
    dom.historyList.append(node);
  });
}

function exportJson() {
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `你猜猜看-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(String(reader.result));
      state = mergeState(imported.state || imported);
      saveState("匯入完成");
      render();
    } catch {
      alert("匯入失敗，請確認 JSON 格式是否正確。");
    } finally {
      dom.importFile.value = "";
    }
  });
  reader.readAsText(file);
}

function clearRounds() {
  if (!confirm("確定要清除所有評語紀錄嗎？題庫與收藏會保留。")) return;
  state.rounds = [];
  saveState("評語紀錄已清除");
  render();
}

function bindEvents() {
  dom.themeToggle.addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    saveState("已切換主題");
    renderTheme();
  });

  dom.hosterToggle.addEventListener("click", () => {
    state.settings.hosterMode = !state.settings.hosterMode;
    saveState(state.settings.hosterMode ? "已開啟 HOSTER 模式" : "已關閉 HOSTER 模式");
    renderHoster();
  });

  dom.questionNumberSelect.addEventListener("change", () => setQuestion(dom.questionNumberSelect.value));
  dom.favoriteBtn.addEventListener("click", toggleFavorite);
  dom.completeBtn.addEventListener("click", completeRound);
  dom.clearRoundsBtn.addEventListener("click", clearRounds);
  dom.exportBtn.addEventListener("click", exportJson);
  dom.importFile.addEventListener("change", importJson);
  dom.notes.addEventListener("input", saveDraft);
  document.querySelectorAll("input[name='rating']").forEach((input) => {
    input.addEventListener("change", saveDraft);
  });

  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.activeView = button.dataset.view;
      saveState("已切換頁面");
      renderActiveView();
    });
  });

  dom.startGameBtn.addEventListener("click", () => {
    state.settings.activeView = "game";
    saveState("開始遊戲");
    renderActiveView();
  });
}

bindEvents();
loadQuestionLibrary();
