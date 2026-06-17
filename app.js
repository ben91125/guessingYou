const STORAGE_KEY = "guessingYou.tableAid.v1";
const ALL_OPTION = "全部";

const modes = [
  {
    id: "friends",
    name: "朋友模式",
    tone: "輕鬆有趣",
    familiarity: "剛認識到普通朋友",
    depth: "低侵入性",
    art: "https://api.iconify.design/fluent-emoji-flat:people-hugging.svg",
    description: "適合破冰、聚會、朋友局。題目偏日常和好笑，讓彼此不用太有壓力也能聊起來。",
  },
  {
    id: "acquaintance",
    name: "熟人模式",
    tone: "驗證彼此認知",
    familiarity: "已熟但不一定深聊",
    depth: "中度探索",
    art: "https://api.iconify.design/fluent-emoji-flat:memo.svg",
    description: "適合同學、同事、老朋友。重點是驗證你以為的對方，和對方真實認知是否一致。",
  },
  {
    id: "couple",
    name: "情侶模式",
    tone: "偏價值觀",
    familiarity: "伴侶或高度親近",
    depth: "深度對話",
    art: "https://api.iconify.design/fluent-emoji-flat:heart-hands.svg",
    description: "適合情侶、曖昧後期或很親近的人。問題更靠近安全感、期待、承諾與人生選擇。",
  },
  {
    id: "custom",
    name: "自訂題庫",
    tone: "由我們維護",
    familiarity: "任何關係皆可",
    depth: "彈性深度",
    art: "https://api.iconify.design/fluent-emoji-flat:wrapped-gift.svg",
    description: "玩家端不新增題目，題庫由產品方挑選與維護，未來可整理成活動題包或付費題包。",
  },
];

const visualStyles = [
  {
    id: "cozy",
    name: "溫馨桌遊",
    heroArt: "https://api.iconify.design/fluent-emoji-flat:game-die.svg",
    modeArt: {
      friends: "https://api.iconify.design/fluent-emoji-flat:people-hugging.svg",
      acquaintance: "https://api.iconify.design/fluent-emoji-flat:memo.svg",
      couple: "https://api.iconify.design/fluent-emoji-flat:heart-hands.svg",
    },
  },
  {
    id: "party",
    name: "朋友派對",
    heroArt: "https://api.iconify.design/fluent-emoji-flat:party-popper.svg",
    modeArt: {
      friends: "https://api.iconify.design/fluent-emoji-flat:balloon.svg",
      acquaintance: "https://api.iconify.design/fluent-emoji-flat:admission-tickets.svg",
      couple: "https://api.iconify.design/fluent-emoji-flat:sparkles.svg",
    },
  },
  {
    id: "date",
    name: "情侶約會",
    heroArt: "https://api.iconify.design/fluent-emoji-flat:sparkling-heart.svg",
    modeArt: {
      friends: "https://api.iconify.design/fluent-emoji-flat:bouquet.svg",
      acquaintance: "https://api.iconify.design/fluent-emoji-flat:love-letter.svg",
      couple: "https://api.iconify.design/fluent-emoji-flat:heart-hands.svg",
    },
  },
  {
    id: "retro",
    name: "復古題卡",
    heroArt: "https://api.iconify.design/fluent-emoji-flat:artist-palette.svg",
    modeArt: {
      friends: "https://api.iconify.design/fluent-emoji-flat:game-die.svg",
      acquaintance: "https://api.iconify.design/fluent-emoji-flat:memo.svg",
      couple: "https://api.iconify.design/fluent-emoji-flat:wrapped-gift.svg",
    },
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
  styleSelect: document.querySelector("#styleSelect"),
  rulesBtn: document.querySelector("#rulesBtn"),
  rulesPage: document.querySelector("#rulesPage"),
  gamePage: document.querySelector("#gamePage"),
  startGameBtn: document.querySelector("#startGameBtn"),
  modeGrid: document.querySelector("#modeGrid"),
  rulesModeGrid: document.querySelector("#rulesModeGrid"),
  modeHint: document.querySelector("#modeHint"),
  topicSelect: document.querySelector("#topicSelect"),
  topicCount: document.querySelector("#topicCount"),
  heroArt: document.querySelector(".hero-card-art"),
  exportBtn: document.querySelector("#exportBtn"),
  importFile: document.querySelector("#importFile"),
  completedCount: document.querySelector("#completedCount"),
  currentMeta: document.querySelector("#currentMeta"),
  questionText: document.querySelector("#questionText"),
  questionNumberSelect: document.querySelector("#questionNumberSelect"),
  partnerName: document.querySelector("#partnerName"),
  partnerLockBtn: document.querySelector("#partnerLockBtn"),
  guessScore: document.querySelector("#guessScore"),
  guessScoreValue: document.querySelector("#guessScoreValue"),
  notes: document.querySelector("#notes"),
  saveStatus: document.querySelector("#saveStatus"),
  completeBtn: document.querySelector("#completeBtn"),
  historyTitle: document.querySelector("#historyTitle"),
  historyList: document.querySelector("#historyList"),
  toggleHistoryBtn: document.querySelector("#toggleHistoryBtn"),
  clearRoundsBtn: document.querySelector("#clearRoundsBtn"),
  modeCardTemplate: document.querySelector("#modeCardTemplate"),
  historyItemTemplate: document.querySelector("#historyItemTemplate"),
};

const defaultState = {
  rounds: [],
  currentQuestionId: null,
  draft: {
    notes: "",
    score: 50,
  },
  session: {
    partnerName: "",
    partnerLocked: false,
  },
  settings: {
    activeView: "game",
    activeMode: "friends",
    activeTopic: "life_habits",
    visualStyle: "cozy",
    historyCollapsed: false,
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

function normalizeSourceQuestions(source) {
  if (!Array.isArray(source?.questions)) return [];
  return source.questions.map((question, index) => ({
    ...question,
    id: question.id || `source-${index + 1}`,
    number: question.number || index + 1,
    numberLabel: question.sourceId || String(index + 1).padStart(3, "0"),
    level: question.depthName || "候選",
    category: question.topicName || "候選題",
    packId: "source-library",
    packName: "SOURCE 候選題庫",
    packStatus: "selected-draft",
    builtIn: true,
  }));
}

function loadQuestionLibrary() {
  const sourceQuestions = normalizeSourceQuestions(window.SOURCE_QUESTIONS);
  const packs = Array.isArray(window.QUESTION_PACKS) ? window.QUESTION_PACKS : fallbackPacks;
  questionLibrary = sourceQuestions.length ? sourceQuestions : normalizePacks(packs);
  ensureSelection();
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
  const { favorites, ...savedState } = saved || {};
  const { theme, ...savedSettings } = savedState.settings || {};
  const merged = {
    ...structuredClone(defaultState),
    ...savedState,
    draft: { ...defaultState.draft, ...(savedState.draft || {}) },
    session: { ...defaultState.session, ...(savedState.session || {}) },
    settings: { ...defaultState.settings, ...savedSettings },
  };
  if (savedState.rounds?.length && savedState.session?.partnerLocked === undefined) {
    merged.session.partnerLocked = true;
  }
  return merged;
}

function saveState(message = "已自動保存") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  dom.saveStatus.textContent = message;
  window.clearTimeout(saveState.statusTimer);
  saveState.statusTimer = window.setTimeout(() => {
    dom.saveStatus.textContent = "自動保存中";
  }, 1400);
}

function playableQuestions() {
  return questionLibrary.filter((question) => question.packStatus === "selected-draft");
}

function numberedQuestions() {
  return playableQuestions().sort((a, b) => {
    const topicDiff = (a.topicOrder || 999) - (b.topicOrder || 999);
    if (topicDiff) return topicDiff;
    return (a.number || 999) - (b.number || 999);
  });
}

function topicsForMode(modeId = state.settings.activeMode) {
  const topics = new Map();
  numberedQuestions()
    .filter((question) => question.mode === modeId)
    .forEach((question) => {
      if (!topics.has(question.topic)) {
        topics.set(question.topic, {
          id: question.topic,
          name: question.topicName || question.category,
          order: question.topicOrder || 999,
        });
      }
    });
  return [...topics.values()].sort((a, b) => a.order - b.order);
}

function questionsForMode(modeId = state.settings.activeMode, topicId = state.settings.activeTopic) {
  return numberedQuestions().filter((question) => question.mode === modeId && question.topic === topicId);
}

function visibleModes() {
  return modes.filter((mode) => topicsForMode(mode.id).length > 0);
}

function currentQuestion() {
  const activeQuestions = questionsForMode();
  return activeQuestions.find((question) => question.id === state.currentQuestionId) || activeQuestions[0] || null;
}

function currentMode() {
  return modes.find((mode) => mode.id === state.settings.activeMode) || modes[0];
}

function currentTopic() {
  return topicsForMode().find((topic) => topic.id === state.settings.activeTopic) || topicsForMode()[0] || null;
}

function ensureSelection() {
  const availableModes = visibleModes();
  if (!availableModes.some((mode) => mode.id === state.settings.activeMode)) {
    state.settings.activeMode = availableModes[0]?.id || "friends";
  }

  const availableTopics = topicsForMode();
  if (!availableTopics.some((topic) => topic.id === state.settings.activeTopic)) {
    state.settings.activeTopic = availableTopics[0]?.id || "";
  }

  const availableQuestions = questionsForMode();
  if (!availableQuestions.some((question) => question.id === state.currentQuestionId)) {
    state.currentQuestionId = availableQuestions[0]?.id || null;
  }
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
  const question = questionsForMode().find((item) => item.id === questionId);
  if (!question) return;
  state.currentQuestionId = question.id;
  state.settings.activeMode = question.mode;
  state.settings.activeTopic = question.topic;
  state.draft = draftForQuestion(question.id);
  saveState("已切換題目");
  render();
}

function normalizePartnerName(value) {
  return String(value || "").trim();
}

function currentPartnerName() {
  return normalizePartnerName(state.session.partnerName);
}

function isSameRecordedRound(round, questionId, partnerName = currentPartnerName()) {
  return round.questionId === questionId && normalizePartnerName(round.partnerName) === partnerName;
}

function draftForQuestion(questionId) {
  const existing = state.rounds.find((round) => isSameRecordedRound(round, questionId));
  if (!existing) return structuredClone(defaultState.draft);
  return {
    notes: existing.notes || "",
    score: Number(existing.score) || 0,
  };
}

function completeRound() {
  const question = currentQuestion();
  if (!question) {
    alert("請先選一題。");
    return;
  }

  const partnerName = currentPartnerName();
  const nextRound = {
    id: crypto.randomUUID(),
    partnerName,
    mode: question.mode,
    questionId: question.id,
    questionNumber: question.numberLabel || question.number,
    questionText: question.text,
    category: question.category,
    topic: question.topic,
    sourceId: question.sourceId,
    notes: state.draft.notes.trim(),
    score: Number(state.draft.score) || 0,
    playStyle: "table-aid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = state.rounds.findIndex((round) => isSameRecordedRound(round, question.id, partnerName));
  if (existingIndex >= 0) {
    nextRound.id = state.rounds[existingIndex].id;
    nextRound.createdAt = state.rounds[existingIndex].createdAt;
    state.rounds.splice(existingIndex, 1);
  }
  state.rounds.unshift(nextRound);
  state.session.partnerLocked = true;
  state.settings.historyCollapsed = false;

  saveState("已留下評語");
  render();
}

function saveDraft() {
  state.draft.notes = dom.notes.value;
  state.draft.score = Number(dom.guessScore.value);
  state.session.partnerName = dom.partnerName.value;
  saveState();
}

function render() {
  ensureSelection();
  renderVisualStyle();
  renderActiveView();
  renderModes();
  renderTopics();
  renderQuestionNumberSelect();
  renderQuestion();
  renderDraft();
  renderStats();
  renderHistory();
}

function currentVisualStyle() {
  return visualStyles.find((style) => style.id === state.settings.visualStyle) || visualStyles[0];
}

function modeArt(modeId) {
  const style = currentVisualStyle();
  return style.modeArt[modeId] || modes.find((mode) => mode.id === modeId)?.art || style.heroArt;
}

function renderVisualStyle() {
  const style = currentVisualStyle();
  state.settings.visualStyle = style.id;
  document.body.dataset.style = style.id;
  dom.heroArt.src = style.heroArt;
  if (!dom.styleSelect.options.length) {
    populateSelect(
      dom.styleSelect,
      visualStyles.map((item) => ({ value: item.id, label: item.name })),
      style.id,
    );
  }
  dom.styleSelect.value = style.id;
}

function renderActiveView() {
  dom.rulesPage.hidden = state.settings.activeView !== "rules";
  dom.gamePage.hidden = state.settings.activeView !== "game";
  dom.rulesBtn.textContent = state.settings.activeView === "rules" ? "回到遊戲" : "玩法說明";
}

function renderModes() {
  const renderTarget = (target, interactive) => {
    target.innerHTML = "";
    visibleModes().forEach((mode) => {
      const node = interactive ? dom.modeCardTemplate.content.firstElementChild.cloneNode(true) : document.createElement("article");
      if (!interactive) node.className = "mode-card mode-info-card";
      node.classList.toggle("is-active", interactive && mode.id === state.settings.activeMode);
      if (!interactive) {
        const img = document.createElement("img");
        img.alt = "";
        img.className = "mode-card-art";
        node.append(img);
      }
      const art = node.querySelector(".mode-card-art");
      if (art) art.src = modeArt(mode.id);
      if (!interactive) {
        node.insertAdjacentHTML("beforeend", "<strong></strong><small></small><p></p>");
      }
      node.querySelector("strong").textContent = mode.name;
      node.querySelector("small").textContent = `${mode.familiarity} · ${mode.tone} · ${mode.depth}`;
      node.querySelector("p").textContent = mode.description;
      if (interactive) node.addEventListener("click", () => switchMode(mode.id));
      target.append(node);
    });
  };

  renderTarget(dom.modeGrid, true);
  renderTarget(dom.rulesModeGrid, false);
  dom.modeHint.textContent = `${currentMode().name} · ${currentMode().familiarity}`;
}

function renderTopics() {
  const topics = topicsForMode();
  populateSelect(
    dom.topicSelect,
    topics.map((topic) => ({ value: topic.id, label: topic.name })),
    currentTopic()?.id || "",
  );
  dom.topicSelect.disabled = !topics.length;
  dom.topicCount.textContent = `${questionsForMode().length} 題`;
}

function switchMode(modeId) {
  const preferredTopic = state.settings.activeTopic;
  state.settings.activeMode = modeId;
  const availableTopics = topicsForMode(modeId);
  const matchingTopic = availableTopics.find((topic) => topic.id === preferredTopic);
  state.settings.activeTopic = matchingTopic?.id || availableTopics[0]?.id || "";
  const firstQuestion = questionsForMode(modeId, state.settings.activeTopic)[0];
  state.currentQuestionId = firstQuestion?.id || null;
  state.draft = firstQuestion ? draftForQuestion(firstQuestion.id) : structuredClone(defaultState.draft);
  saveState("已切換模式");
  render();
}

function switchTopic(topicId) {
  state.settings.activeTopic = topicId;
  const firstQuestion = questionsForMode()[0];
  state.currentQuestionId = firstQuestion?.id || null;
  state.draft = firstQuestion ? draftForQuestion(firstQuestion.id) : structuredClone(defaultState.draft);
  saveState("已切換題目類型");
  render();
}

function renderQuestionNumberSelect() {
  const questions = questionsForMode();
  if (!questions.length) {
    populateSelect(dom.questionNumberSelect, [{ value: "", label: "這個關係與類型目前沒有題目" }], "");
    dom.questionNumberSelect.disabled = true;
    return;
  }

  dom.questionNumberSelect.disabled = false;
  const options = questions.map((question) => ({
    value: question.id,
    label: `${question.numberLabel || String(question.number).padStart(3, "0")}｜${question.level || ""}｜${question.text.replace(/\s+/g, " ").slice(0, 34)}`,
  }));
  populateSelect(dom.questionNumberSelect, options, currentQuestion()?.id || options[0]?.value || "");
}

function renderQuestion() {
  const question = currentQuestion();
  const mode = question ? modes.find((item) => item.id === question.mode) : currentMode();
  const numberText = question?.numberLabel || (question?.number ? `第 ${question.number} 題` : "題目");

  dom.currentMeta.textContent = question ? `${numberText} · ${mode?.name || "關係"} · ${question.category}` : "準備開始";
  dom.questionText.textContent = question ? question.text : "先選一題，開始面對面猜猜看。";
}

function renderDraft() {
  dom.partnerName.value = state.session.partnerName;
  dom.partnerName.disabled = Boolean(state.session.partnerLocked);
  dom.partnerLockBtn.textContent = dom.partnerName.disabled ? "解鎖" : "鎖定";
  dom.notes.value = state.draft.notes;
  dom.guessScore.value = state.draft.score;
  dom.guessScoreValue.textContent = state.draft.score;
}

function renderStats() {
  const completed = state.rounds.length;
  dom.completedCount.textContent = completed;
}

function renderHistory() {
  dom.historyList.innerHTML = "";
  const count = state.rounds.length;
  const groupedRounds = groupRoundsByPartner(state.rounds);
  const titlePartner = groupedRounds.length > 1 ? `${groupedRounds.length} 位對象` : groupedRounds[0]?.partnerName || "未命名對象";
  dom.historyTitle.textContent = count ? `評語紀錄：${titlePartner}（${count}）` : "評語紀錄（0）";
  dom.toggleHistoryBtn.hidden = !count;
  dom.clearRoundsBtn.hidden = !count;
  dom.historyList.hidden = Boolean(count && state.settings.historyCollapsed);
  dom.toggleHistoryBtn.textContent = state.settings.historyCollapsed ? `展開紀錄（${count}）` : "收合紀錄";
  dom.toggleHistoryBtn.setAttribute("aria-expanded", String(!state.settings.historyCollapsed));

  if (!count) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "留下第一則評語後，這裡會變成你和對方的小小猜測紀錄本。";
    dom.historyList.append(empty);
    return;
  }

  groupedRounds.forEach((group) => {
    const groupNode = document.createElement("section");
    groupNode.className = "history-group";
    const heading = document.createElement("h3");
    heading.textContent = `${group.partnerName}（${group.rounds.length}）`;
    groupNode.append(heading);

    group.rounds.forEach((round) => {
      const node = dom.historyItemTemplate.content.firstElementChild.cloneNode(true);
      node.querySelector(".category-pill").textContent = `${round.questionNumber || "?"} · ${round.category}`;
      node.querySelector("h3").textContent = round.questionText;
      node.querySelector("p").textContent = round.notes || "沒有補充評語。";
      const score = node.querySelector("strong");
      score.textContent = `${round.score ?? 0} 分`;
      score.classList.toggle("is-miss", Number(round.score) < 60);
      groupNode.append(node);
    });

    dom.historyList.append(groupNode);
  });
}

function groupRoundsByPartner(rounds) {
  const groups = new Map();
  rounds.forEach((round) => {
    const partnerName = normalizePartnerName(round.partnerName) || "未命名對象";
    if (!groups.has(partnerName)) groups.set(partnerName, []);
    groups.get(partnerName).push(round);
  });
  return [...groups.entries()].map(([partnerName, rounds]) => ({ partnerName, rounds }));
}

function exportJson() {
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `你猜猜看-遊戲紀錄-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  saveState("已匯出遊戲紀錄");
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
      alert("匯入失敗，請確認這是你猜猜看的遊戲紀錄檔。");
    } finally {
      dom.importFile.value = "";
    }
  });
  reader.readAsText(file);
}

function clearRounds() {
  if (!confirm("確定要清除所有評語紀錄嗎？題庫會保留。")) return;
  state.rounds = [];
  state.session.partnerLocked = false;
  state.settings.historyCollapsed = false;
  saveState("評語紀錄已清除");
  render();
}

function bindEvents() {
  dom.styleSelect.addEventListener("change", () => {
    state.settings.visualStyle = dom.styleSelect.value;
    saveState("已切換風格");
    render();
  });

  dom.topicSelect.addEventListener("change", () => switchTopic(dom.topicSelect.value));

  dom.rulesBtn.addEventListener("click", () => {
    state.settings.activeView = state.settings.activeView === "rules" ? "game" : "rules";
    saveState("已切換頁面");
    renderActiveView();
  });

  dom.questionNumberSelect.addEventListener("change", () => setQuestion(dom.questionNumberSelect.value));
  dom.completeBtn.addEventListener("click", completeRound);
  dom.toggleHistoryBtn.addEventListener("click", () => {
    state.settings.historyCollapsed = !state.settings.historyCollapsed;
    saveState(state.settings.historyCollapsed ? "評語紀錄已收合" : "評語紀錄已展開");
    render();
  });
  dom.clearRoundsBtn.addEventListener("click", clearRounds);
  dom.exportBtn.addEventListener("click", exportJson);
  dom.importFile.addEventListener("change", importJson);
  dom.partnerName.addEventListener("input", saveDraft);
  dom.partnerLockBtn.addEventListener("click", () => {
    if (state.session.partnerLocked) {
      const ok = confirm("解鎖後可以修改這次遊戲對象名稱；已留下的舊紀錄仍會保留原本的對象名稱。確定要解鎖嗎？");
      if (!ok) return;
      state.session.partnerLocked = false;
      saveState("已解鎖對象名稱");
    } else {
      state.session.partnerName = dom.partnerName.value;
      state.session.partnerLocked = true;
      saveState("已鎖定對象名稱");
    }
    render();
  });
  dom.notes.addEventListener("input", saveDraft);
  dom.guessScore.addEventListener("input", () => {
    state.draft.score = Number(dom.guessScore.value);
    dom.guessScoreValue.textContent = state.draft.score;
    saveState();
  });

  dom.startGameBtn.addEventListener("click", () => {
    state.settings.activeView = "game";
    saveState("開始遊戲");
    renderActiveView();
  });
}

bindEvents();
loadQuestionLibrary();
