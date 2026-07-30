const questions = [
  {
    key: "closeness",
    title: "How close are we?",
    options: [
      { label: "Basically family", score: 4 },
      { label: "Very close friends", score: 3 },
      { label: "We like each other", score: 2 },
      { label: "You know who I am", score: 1 }
    ]
  },
  {
    key: "annoyance",
    title: "Have you annoyed me this year?",
    options: [
      { label: "Never, I am an angel", score: 4 },
      { label: "Maybe once or twice", score: 3 },
      { label: "A suspicious amount", score: 2 },
      { label: "Constantly and proudly", score: 1 }
    ]
  },
  {
    key: "budget",
    title: "What is your budget?",
    options: [
      { label: "Keeping it cute: Under €25", value: "small" },
      { label: "Mid-range magic: €30 - €55", value: "medium" },
      { label: "Go big: €70 - €80", value: "large" },
      { label: "Money is no object: €80+", value: "luxury" }
    ]
  }
];

function placeholder(label, emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ffeaf3"/><stop offset="1" stop-color="#f8bfd7"/></linearGradient></defs><rect width="800" height="520" rx="44" fill="url(#g)"/><circle cx="400" cy="205" r="100" fill="#fff" fill-opacity=".62"/><text x="400" y="240" text-anchor="middle" font-size="112">${emoji}</text><text x="400" y="390" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#713d58">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const builtInGiftLists = {
  small: [
    { name: "Cute scented candle", image: placeholder("Scented candle", "🕯️") },
    { name: "My favorite snacks", image: placeholder("Favorite snacks", "🍬") },
    { name: "Mini flower bouquet", image: placeholder("Flower bouquet", "💐") },
    { name: "Pretty notebook", image: placeholder("Pretty notebook", "📔") }
  ],
  medium: [
    { name: "Jewelry piece", image: placeholder("Jewelry", "💍") },
    { name: "Beauty gift set", image: placeholder("Beauty set", "💄") },
    { name: "Dinner or brunch date", image: placeholder("Brunch date", "🥐") },
    { name: "Personalized photo gift", image: placeholder("Photo gift", "📸") }
  ],
  large: [
    { name: "Nice perfume", image: placeholder("Perfume", "🌷") },
    { name: "Concert or event ticket", image: placeholder("Event ticket", "🎟️") },
    { name: "Statement handbag", image: placeholder("Handbag", "👜") },
    { name: "Spa or wellness voucher", image: placeholder("Wellness", "🧖‍♀️") }
  ],
  luxury: [
    { name: "Weekend getaway contribution", image: placeholder("Weekend getaway", "✈️") },
    { name: "Designer accessory", image: placeholder("Designer accessory", "🕶️") },
    { name: "Premium headphones", image: placeholder("Headphones", "🎧") },
    { name: "Special experience day", image: placeholder("Experience day", "✨") }
  ]
};

const publishedGiftLists = (window.GIFT_LISTS && typeof window.GIFT_LISTS === "object")
  ? window.GIFT_LISTS
  : builtInGiftLists;

const budgetLabels = {
  small: "Keeping it cute: Under €25",
  medium: "Mid-range magic: €30 - €55",
  large: "Go big: €70 - €80",
  luxury: "Money is no object: €80+"
};

let currentQuestion = 0;
let answers = {};
let giftLists = loadGiftLists();

const questionContainer = document.getElementById("questionContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const quizView = document.getElementById("quizView");
const resultView = document.getElementById("resultView");
const giftGrid = document.getElementById("giftGrid");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const restartButton = document.getElementById("restartButton");
const copyButton = document.getElementById("copyButton");
const editGiftButton = document.getElementById("editGiftButton");
const giftEditor = document.getElementById("giftEditor");
const editorFields = document.getElementById("editorFields");
const giftEditorForm = document.getElementById("giftEditorForm");
const saveGiftsButton = document.getElementById("saveGiftsButton");
const downloadGiftDataButton = document.getElementById("downloadGiftDataButton");

function cloneDefaults() {
  return JSON.parse(JSON.stringify(publishedGiftLists));
}

function loadGiftLists() {
  try {
    const saved = JSON.parse(localStorage.getItem("birthdayGiftLists"));
    if (!saved || !Object.keys(publishedGiftLists).every(key => Array.isArray(saved[key]) && saved[key].length === 4)) {
      return cloneDefaults();
    }
    return Object.fromEntries(Object.entries(saved).map(([key, gifts]) => [
      key,
      gifts.map((gift, index) => typeof gift === "string"
        ? { name: gift, image: publishedGiftLists[key][index].image }
        : { name: gift.name || "Add your gift idea", image: gift.image || publishedGiftLists[key][index].image })
    ]));
  } catch {
    return cloneDefaults();
  }
}

function renderQuestion() {
  const question = questions[currentQuestion];
  progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  questionContainer.innerHTML = `<div class="question-card"><h2>${question.title}</h2><div class="answer-grid">${question.options.map((option, index) => `<button class="answer-button" type="button" data-index="${index}"><span>${option.label}</span></button>`).join("")}</div></div>`;
  questionContainer.querySelectorAll(".answer-button").forEach(button => button.addEventListener("click", () => chooseAnswer(question.options[Number(button.dataset.index)])));
}

function chooseAnswer(option) {
  const question = questions[currentQuestion];
  answers[question.key] = option;
  if (currentQuestion < questions.length - 1) {
    currentQuestion += 1;
    questionContainer.animate([{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: "translateX(-18px)" }], { duration: 180, easing: "ease" }).onfinish = renderQuestion;
  } else {
    showResults();
  }
}

function showResults() {
  const selectedBudget = answers.budget.value;
  const relationshipScore = answers.closeness.score + answers.annoyance.score;
  const tone = relationshipScore >= 7 ? "Excellent choices. You are clearly in my good books." : relationshipScore >= 5 ? "A respectable result. These gifts should keep us on good terms." : "Bold of you to continue, but a great gift may save you.";
  resultTitle.textContent = `${budgetLabels[selectedBudget]} gifts`;
  resultMessage.textContent = tone;
  giftGrid.innerHTML = giftLists[selectedBudget].map((gift, index) => `<article class="gift-card"><div class="gift-image-wrap"><img class="gift-image" src="${escapeAttribute(gift.image)}" alt="Example of ${escapeAttribute(gift.name)}" onerror="this.src='${escapeAttribute(publishedGiftLists[selectedBudget][index].image)}'" /></div><div class="gift-copy"><span>${["🎀", "💝", "🌸", "✨"][index]}</span><h3>${escapeHtml(gift.name)}</h3></div></article>`).join("");
  quizView.classList.remove("is-active");
  resultView.classList.add("is-active");
  progressBar.style.width = "100%";
  progressText.textContent = "Your result is ready";
}

function restartQuiz() {
  currentQuestion = 0;
  answers = {};
  resultView.classList.remove("is-active");
  quizView.classList.add("is-active");
  renderQuestion();
}

async function copyGiftList() {
  const selectedBudget = answers.budget?.value;
  if (!selectedBudget) return;
  const text = `Birthday gift ideas:\n${giftLists[selectedBudget].map(gift => `• ${gift.name}`).join("\n")}`;
  try { await navigator.clipboard.writeText(text); copyButton.textContent = "Copied! ✓"; }
  catch { copyButton.textContent = "Select and copy manually"; }
  setTimeout(() => { copyButton.textContent = "Copy gift list"; }, 1800);
}

function openGiftEditor() {
  editorFields.innerHTML = Object.entries(giftLists).map(([key, gifts]) => `<section class="editor-group"><h3>${budgetLabels[key]}</h3><div class="editor-inputs">${gifts.map((gift, index) => `<div class="gift-edit-row" data-budget="${key}" data-index="${index}"><img class="editor-preview" src="${escapeAttribute(gift.image)}" alt="Gift preview" /><div class="gift-edit-controls"><label>Gift ${index + 1}<input class="gift-name-input" type="text" maxlength="80" value="${escapeAttribute(gift.name)}" /></label><label>Image URL (optional)<input class="gift-image-input" type="url" placeholder="https://example.com/image.jpg" value="${gift.image.startsWith("data:") ? "" : escapeAttribute(gift.image)}" /></label><div class="image-actions"><label class="upload-button">Choose image<input class="gift-file-input" type="file" accept="image/*" /></label><button class="tiny-button reset-image-button" type="button">Reset image</button></div><input class="image-data-input" type="hidden" value="${escapeAttribute(gift.image)}" /></div></div>`).join("")}</div></section>`).join("");

  editorFields.querySelectorAll(".gift-edit-row").forEach(row => {
    const preview = row.querySelector(".editor-preview");
    const urlInput = row.querySelector(".gift-image-input");
    const fileInput = row.querySelector(".gift-file-input");
    const dataInput = row.querySelector(".image-data-input");
    urlInput.addEventListener("input", () => { if (urlInput.value.trim()) { preview.src = urlInput.value.trim(); dataInput.value = urlInput.value.trim(); } });
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { preview.src = reader.result; dataInput.value = reader.result; urlInput.value = ""; };
      reader.readAsDataURL(file);
    });
    row.querySelector(".reset-image-button").addEventListener("click", () => {
      const fallback = publishedGiftLists[row.dataset.budget][Number(row.dataset.index)].image;
      preview.src = fallback; dataInput.value = fallback; urlInput.value = ""; fileInput.value = "";
    });
  });
  giftEditor.showModal();
}

function saveGiftLists(event) {
  if (event.submitter !== saveGiftsButton) return;
  event.preventDefault();
  const updated = cloneDefaults();
  editorFields.querySelectorAll(".gift-edit-row").forEach(row => {
    const budget = row.dataset.budget;
    const index = Number(row.dataset.index);
    updated[budget][index] = {
      name: row.querySelector(".gift-name-input").value.trim() || "Add your gift idea",
      image: row.querySelector(".image-data-input").value || publishedGiftLists[budget][index].image
    };
  });
  giftLists = updated;
  try { localStorage.setItem("birthdayGiftLists", JSON.stringify(giftLists)); }
  catch { alert("That image is too large to save in this browser. Try a smaller image or use an image URL."); return; }
  giftEditor.close();
  if (resultView.classList.contains("is-active")) showResults();
}

function downloadGiftData() {
  const payload = `window.GIFT_LISTS = ${JSON.stringify(giftLists, null, 2)};\n`;
  const blob = new Blob([payload], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gift-data.js";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  downloadGiftDataButton.textContent = "Downloaded ✓";
  setTimeout(() => { downloadGiftDataButton.textContent = "Download gift-data.js"; }, 1800);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}
function escapeAttribute(value) { return escapeHtml(value); }

restartButton.addEventListener("click", restartQuiz);
copyButton.addEventListener("click", copyGiftList);
editGiftButton.addEventListener("click", openGiftEditor);
giftEditorForm.addEventListener("submit", saveGiftLists);
downloadGiftDataButton.addEventListener("click", downloadGiftData);
renderQuestion();
