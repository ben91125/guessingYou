const STORAGE_KEY = "guessWhoGameState.v3";
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
    tone: "你們自己決定",
    familiarity: "任何關係皆可",
    depth: "彈性深度",
    description: "只從自訂題目抽題，適合活動、家庭、團隊或未來的付費專屬題包。",
  },
];

const fallbackQuestions = [
  {
    id: "fallback-001",
    mode: "friends",
    category: "生活習慣",
    text: "如果今天突然多出兩小時空檔，你覺得我最可能拿來做什麼？",
    hoster: {
      purpose: "用低壓日常題建立聊天節奏。",
      framework: "生活偏好觀察",
      stage: "破冰階段",
      tips: "鼓勵玩家 B 說出猜測理由，不只猜答案。",
      watchOut: "不要急著評判答案是否有生產力。",
    },
  },
];

let questionLibrary = fallbackQuestions;

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
  hitRate: document.querySelector("#hitRate"),
  weakCategory: document.querySelector("#weakCategory"),
  favoriteCount: document.querySelector("#favoriteCount"),
  currentMeta: document.querySelector("#currentMeta"),
  questionText: document.querySelector("#questionText"),
  playCard: document.querySelector("#playCard"),
  faceModeToggle: document.querySelector("#faceModeToggle"),
  faceFlowCard: document.querySelector("#faceFlowCard"),
  hosterToggle: document.querySelector("#hosterToggle"),
  hosterPanel: document.querySelector("#hosterPanel"),
  hosterStage: document.querySelector("#hosterStage"),
  hosterPurpose: document.querySelector("#hosterPurpose"),
  hosterFramework: document.querySelector("#hosterFramework"),
  hosterTips: document.querySelector("#hosterTips"),
  hosterWatchOut: document.querySelector("#hosterWatchOut"),
  favoriteBtn: document.querySelector("#favoriteBtn"),
  questionNumberSelect: document.querySelector("#questionNumberSelect"),
  goQuestionBtn: document.querySelector("#goQuestionBtn"),
  categoryFilter: document.querySelector("#categoryFilter"),
  realAnswer: document.querySelector("#realAnswer"),
  guessAnswer: document.querySelector("#guessAnswer"),
  hideAnswerToggle: document.querySelector("#hideAnswerToggle"),
  revealSection: document.querySelector("#revealSection"),
  revealedReal: document.querySelector("#revealedReal"),
  revealedGuess: document.querySelector("#revealedGuess"),
  revealBtn: document.querySelector("#revealBtn"),
  notes: document.querySelector("#notes"),
  saveStatus: document.querySelector("#saveStatus"),
  completeBtn: document.querySelector("#completeBtn"),
  questionTotal: document.querySelector("#questionTotal"),
  managerFilter: document.querySelector("#managerFilter"),
  questionList: document.querySelector("#questionList"),
  historyList: document.querySelector("#historyList"),
  clearRoundsBtn: document.querySelector("#clearRoundsBtn"),
  assumedProfile: document.querySelector("#assumedProfile"),
  realProfile: document.querySelector("#realProfile"),
  modeCardTemplate: document.querySelector("#modeCardTemplate"),
  questionItemTemplate: document.querySelector("#questionItemTemplate"),
  historyItemTemplate: document.querySelector("#historyItemTemplate"),
};

const defaultState = {
  rounds: [],
  favorites: [],
  currentQuestionId: null,
  draft: {
    realAnswer: "",
    guessAnswer: "",
    notes: "",
    revealed: false,
    rating: "miss",
  },
  settings: {
    activeView: "rules",
    activeMode: "friends",
    theme: "light",
    categoryFilter: ALL_OPTION,
    managerFilter: ALL_OPTION,
    hideAnswer: true,
    hosterMode: false,
    faceToFaceMode: false,
  },
};

let state = loadState();

function allQuestions() {
  return questionLibrary;
}

function playableQuestions() {
  return allQuestions().filter((question) => question.packStatus === "selected-draft");
}

function currentMode() {
  return modes.find((mode) => mode.id === state.settings.activeMode) || modes[0];
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

async function loadQuestionLibrary() {
  if (Array.isArray(window.QUESTION_PACKS)) {
    questionLibrary = normalizePacks(window.QUESTION_PACKS);
    render();
    return;
  }

  try {
    const response = await fetch("questions.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    questionLibrary = normalizePacks(data.packs);
    render();
  } catch (error) {
    console.warn("questions.json 載入失敗，使用最小備援題庫。", error);
    dom.saveStatus.textContent = "題庫載入失敗，已使用備援題目";
    render();
  }
}

function normalizePacks(packs) {
  return packs.flatMap((pack) =>
    pack.questions.map((question) => ({
      ...question,
      packId: pack.id,
      packName: pack.name,
      packStatus: pack.status || "candidate",
      builtIn: true,
    })),
  );
}

function saveState(message = "已自動保存") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  dom.saveStatus.textContent = message;
  window.clearTimeout(saveState.statusTimer);
  saveState.statusTimer = window.setTimeout(() => {
    dom.saveStatus.textContent = "localStorage 自動保存中";
  }, 1600);
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

function getCurrentQuestion() {
  return allQuestions().find((question) => question.id === state.currentQuestionId) || null;
}

function questionsForActiveMode() {
  const selectedCategory = state.settings.categoryFilter;
  return playableQuestions().filter((question) => {
    const matchesMode = question.mode === state.settings.activeMode;
    const matchesCategory = selectedCategory === ALL_OPTION || question.category === selectedCategory;
    return matchesMode && matchesCategory;
  });
}

function drawQuestion(questionId = null) {
  const pool = questionId ? allQuestions().filter((question) => question.id === questionId) : questionsForActiveMode();

  if (!pool.length) {
    alert(state.settings.activeMode === "custom" ? "自訂題庫目前沒有符合條件的題目，先新增一題吧。" : "目前沒有符合條件的題目。");
    return;
  }

  const next = pool[Math.floor(Math.random() * pool.length)];
  state.currentQuestionId = next.id;
  state.settings.activeMode = next.mode;
  state.draft = structuredClone(defaultState.draft);
  saveState("已抽出新題目");
  render();
}

function switchMode(modeId) {
  state.settings.activeMode = modeId;
  state.settings.categoryFilter = ALL_OPTION;
  state.currentQuestionId = null;
  state.draft = structuredClone(defaultState.draft);
  saveState("已切換模式");
  render();
}

function revealAnswers() {
  state.draft.revealed = true;
  saveDraft();
  renderReveal();
}

function completeRound() {
  const question = getCurrentQuestion();
  if (!question) {
    alert("請先抽一題。");
    return;
  }

  if (!state.settings.faceToFaceMode && (!state.draft.realAnswer.trim() || !state.draft.guessAnswer.trim())) {
    alert("請先填寫真實答案與猜測答案。");
    return;
  }

  state.rounds.unshift({
    id: crypto.randomUUID(),
    mode: question.mode,
    questionId: question.id,
    questionText: question.text,
    category: question.category,
    realAnswer: state.settings.faceToFaceMode ? "" : state.draft.realAnswer.trim(),
    guessAnswer: state.settings.faceToFaceMode ? "面對面口頭猜測" : state.draft.guessAnswer.trim(),
    notes: state.draft.notes.trim(),
    rating: state.draft.rating,
    playStyle: state.settings.faceToFaceMode ? "face-to-face" : "single-device",
    createdAt: new Date().toISOString(),
  });

  state.draft = structuredClone(defaultState.draft);
  saveState("本題已完成");
  render();
}

function toggleFavorite() {
  const question = getCurrentQuestion();
  if (!question) return;

  const exists = state.favorites.includes(question.id);
  state.favorites = exists ? state.favorites.filter((id) => id !== question.id) : [...state.favorites, question.id];
  saveState(exists ? "已取消收藏" : "已收藏題目");
  renderStats();
  renderQuestion();
}

function saveDraft() {
  state.draft.realAnswer = dom.realAnswer.value;
  state.draft.guessAnswer = dom.guessAnswer.value;
  state.draft.notes = dom.notes.value;
  state.draft.rating = document.querySelector("input[name='rating']:checked")?.value || "miss";
  state.settings.hideAnswer = dom.hideAnswerToggle.checked;
  saveState();
}

function render() {
  renderTheme();
  renderActiveView();
  renderModes();
  renderSelectors();
  renderQuestionNumberSelect();
  renderQuestion();
  renderHoster();
  renderFaceToFaceMode();
  renderDraft();
  renderReveal();
  renderStats();
  renderQuestionList();
  renderHistory();
  renderBiasPreview();
}

function renderTheme() {
  document.body.classList.toggle("dark", state.settings.theme === "dark");
  dom.themeIcon.textContent = state.settings.theme === "dark" ? "☀" : "◐";
}

function renderActiveView() {
  const activeView = state.settings.activeView;
  dom.rulesPage.hidden = activeView !== "rules";
  dom.gamePage.hidden = activeView !== "game";
  dom.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === activeView);
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

function renderSelectors() {
  const categoryOptions = [ALL_OPTION, ...categories].map((category) => ({ value: category, label: category }));

  populateSelect(dom.categoryFilter, categoryOptions, state.settings.categoryFilter);
  populateSelect(dom.managerFilter, categoryOptions, state.settings.managerFilter);
}

function renderQuestionNumberSelect() {
  const numberedQuestions = playableQuestions().filter((question) => question.packId === "personal-starter");
  const options = numberedQuestions.map((question, index) => ({
    value: question.id,
    label: `${String(index + 1).padStart(2, "0")}｜${question.level || ""}｜${question.text.replace(/\s+/g, " ").slice(0, 28)}`,
  }));

  populateSelect(dom.questionNumberSelect, options, state.currentQuestionId || options[0]?.value || "");
}

function goToSelectedQuestion() {
  const question = playableQuestions().find((item) => item.id === dom.questionNumberSelect.value);
  if (!question) {
    alert("找不到這個題號。");
    return;
  }

  state.currentQuestionId = question.id;
  state.settings.activeMode = question.mode;
  state.draft = structuredClone(defaultState.draft);
  saveState("已切換題號");
  render();
}

function renderQuestion() {
  const question = getCurrentQuestion();
  const mode = question ? modes.find((item) => item.id === question.mode) : currentMode();

  dom.currentMeta.textContent = question ? `${mode.code} ${mode.name} · ${question.category}` : `${mode.code} ${mode.name}`;
  dom.questionText.textContent = question ? question.text : "先選模式，再抽一張題卡。";
  dom.favoriteBtn.classList.toggle("is-active", Boolean(question && state.favorites.includes(question.id)));
  dom.favoriteBtn.textContent = question && state.favorites.includes(question.id) ? "★" : "☆";
}

function renderFaceToFaceMode() {
  const enabled = state.settings.faceToFaceMode;
  dom.playCard.classList.toggle("face-to-face", enabled);
  dom.faceModeToggle.textContent = enabled ? "雙機面對面" : "同機玩法";
  dom.faceModeToggle.classList.toggle("is-active", enabled);
  dom.faceFlowCard.hidden = !enabled;
}

function renderHoster() {
  const question = getCurrentQuestion();
  const hoster = question?.hoster || {};

  dom.hosterToggle.textContent = state.settings.hosterMode ? "HOSTER ON" : "HOSTER OFF";
  dom.hosterToggle.classList.toggle("is-active", state.settings.hosterMode);
  dom.hosterPanel.hidden = !state.settings.hosterMode;
  dom.hosterStage.textContent = hoster.stage || "尚未抽題";
  dom.hosterPurpose.textContent = hoster.purpose || "抽題後會顯示這題適合怎麼帶。";
  dom.hosterFramework.textContent = hoster.framework || "可作為未來付費題包或主持腳本的內容層。";
  dom.hosterTips.textContent = hoster.tips || "先讓玩家 B 說猜測理由，再揭曉玩家 A 的答案。";
  dom.hosterWatchOut.textContent = hoster.watchOut || "保持舒服界線，不把猜錯解讀成不在乎。";
}

function renderDraft() {
  dom.realAnswer.value = state.draft.realAnswer;
  dom.guessAnswer.value = state.draft.guessAnswer;
  dom.notes.value = state.draft.notes;
  dom.hideAnswerToggle.checked = state.settings.hideAnswer;
  dom.realAnswer.classList.toggle("is-hidden", state.settings.hideAnswer && !state.draft.revealed);
  const rating = document.querySelector(`input[name='rating'][value='${state.draft.rating}']`);
  if (rating) rating.checked = true;
}

function renderReveal() {
  dom.revealSection.hidden = !state.draft.revealed;
  dom.revealedReal.textContent = state.draft.realAnswer || "尚未填寫";
  dom.revealedGuess.textContent = state.draft.guessAnswer || "尚未填寫";
  dom.realAnswer.classList.toggle("is-hidden", state.settings.hideAnswer && !state.draft.revealed);
}

function renderStats() {
  const completed = state.rounds.length;
  const hits = state.rounds.filter((round) => round.rating === "hit").length;
  const missesByCategory = state.rounds
    .filter((round) => round.rating === "miss")
    .reduce((counts, round) => {
      counts[round.category] = (counts[round.category] || 0) + 1;
      return counts;
    }, {});
  const weakCategory = Object.entries(missesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "尚無";

  dom.completedCount.textContent = completed;
  dom.hitRate.textContent = completed ? `${Math.round((hits / completed) * 100)}%` : "0%";
  dom.weakCategory.textContent = weakCategory;
  dom.favoriteCount.textContent = state.favorites.length;
  dom.questionTotal.textContent = `${playableQuestions().length} 題`;
}

function renderQuestionList() {
  const filter = state.settings.managerFilter;
  const questions = playableQuestions().filter((question) => {
    const sameMode = question.mode === state.settings.activeMode;
    const sameCategory = filter === ALL_OPTION || question.category === filter;
    return sameMode && sameCategory;
  });

  dom.questionList.innerHTML = "";

  if (!questions.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "這個模式目前沒有符合條件的題目。";
    dom.questionList.append(empty);
    return;
  }

  questions.forEach((question) => {
    const mode = modes.find((item) => item.id === question.mode);
    const node = dom.questionItemTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".category-pill").textContent = `${mode?.code || "Mode"} · ${question.category}`;
    node.querySelector("p").textContent = question.text;
    node.querySelector("button").addEventListener("click", () => drawQuestion(question.id));
    dom.questionList.append(node);
  });
}

function renderHistory() {
  dom.historyList.innerHTML = "";

  if (!state.rounds.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "完成題目後，這裡會留下你們的回合紀錄。也可以匯出 JSON 分享給對方。";
    dom.historyList.append(empty);
    return;
  }

  state.rounds.slice(0, 20).forEach((round) => {
    const mode = modes.find((item) => item.id === round.mode);
    const node = dom.historyItemTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".category-pill").textContent = `${mode?.code || "Mode"} · ${round.category}`;
    node.querySelector("h3").textContent = round.questionText;
    node.querySelector("p").textContent = round.playStyle === "face-to-face" ? round.notes || "面對面口頭作答，僅記錄猜測評分。" : round.notes || "沒有備註";
    const score = node.querySelector("strong");
    score.textContent = round.rating === "hit" ? "猜中" : "未中";
    score.classList.toggle("is-miss", round.rating !== "hit");
    dom.historyList.append(node);
  });
}

function renderBiasPreview() {
  const latest = state.rounds[0];
  dom.assumedProfile.textContent = latest?.guessAnswer || "可延伸為主持腳本、活動題包、專業版題庫";
  dom.realProfile.textContent = latest?.realAnswer || "Google Drive 匯出可等產品方向更明確再做";
}

function exportJson() {
  const payload = JSON.stringify({ version: 3, exportedAt: new Date().toISOString(), state }, null, 2);
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
      const importedState = imported.state || imported;
      state = mergeState(importedState);
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
  if (!confirm("確定要清除所有回合紀錄嗎？題庫與收藏會保留。")) return;
  state.rounds = [];
  saveState("回合紀錄已清除");
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

  dom.faceModeToggle.addEventListener("click", () => {
    state.settings.faceToFaceMode = !state.settings.faceToFaceMode;
    saveState(state.settings.faceToFaceMode ? "已切換為雙機面對面玩法" : "已切換為同機玩法");
    renderFaceToFaceMode();
  });

  dom.goQuestionBtn.addEventListener("click", goToSelectedQuestion);

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

  dom.exportBtn.addEventListener("click", exportJson);
  dom.importFile.addEventListener("change", importJson);
  dom.categoryFilter.addEventListener("change", () => {
    state.settings.categoryFilter = dom.categoryFilter.value;
    saveState("已更新抽題分類");
  });
  dom.managerFilter.addEventListener("change", () => {
    state.settings.managerFilter = dom.managerFilter.value;
    saveState("已更新題庫篩選");
    renderQuestionList();
  });
  dom.favoriteBtn.addEventListener("click", toggleFavorite);
  dom.revealBtn.addEventListener("click", revealAnswers);
  dom.completeBtn.addEventListener("click", completeRound);
  dom.clearRoundsBtn.addEventListener("click", clearRounds);

  [dom.realAnswer, dom.guessAnswer, dom.notes].forEach((field) => {
    field.addEventListener("input", saveDraft);
  });
  dom.hideAnswerToggle.addEventListener("change", saveDraft);
  document.querySelectorAll("input[name='rating']").forEach((input) => {
    input.addEventListener("change", saveDraft);
  });
}

bindEvents();
render();
loadQuestionLibrary();
