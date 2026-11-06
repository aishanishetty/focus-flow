// ============ SETTINGS (Lesson 1: const, numbers) ============
const THRESHOLD_SECONDS = 20;   // testing value. Real use: 600 (10 minutes)
const IDLE_RESET_SECONDS = 8;   // pausing this long resets the streak

// ============ PUZZLES (Lesson 1: array of objects) ============
const puzzles = [
  { q: "What comes next? 2, 6, 12, 20, 30, ?", options: ["38", "40", "42", "36"], answer: 2 },
  { q: "A bat and ball cost ₹110. The bat costs ₹100 more than the ball. Ball price?", options: ["₹10", "₹5", "₹15", "₹1"], answer: 1 },
  { q: "Time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1 },
  { q: "Which data structure is LIFO?", options: ["Queue", "Array", "Stack", "Heap"], answer: 2 },
  { q: "All Bloops are Razzies, all Razzies are Lazzies. Are all Bloops Lazzies?", options: ["Yes", "No", "Can't tell"], answer: 0 }
];

// ============ STATE (Lesson 1: let) ============
let streak = 0;          // seconds of continuous scrolling
let lastScrollTime = 0;  // when the last scroll happened
let paused = false;      // true while the popup is showing

// ============ SCROLL DETECTION (Lesson 6: events and timers, coming next) ============
// "true" at the end makes it catch scrolling inside inner containers too
window.addEventListener("scroll", () => { lastScrollTime = Date.now(); }, true);
window.addEventListener("wheel", () => { lastScrollTime = Date.now(); }, true);

// Runs once every second (Lesson 3: passing a function to someone else)
setInterval(() => {
  if (paused) return;                                      // Lesson 2: early exit

  const idleFor = (Date.now() - lastScrollTime) / 1000;    // seconds since last scroll

  if (idleFor < 2) streak++;                               // scrolling right now
  else if (idleFor > IDLE_RESET_SECONDS) streak = 0;       // took a real break

  if (streak >= THRESHOLD_SECONDS) interrupt();            // time to show the popup
}, 1000);

// ============ LOADING overlay.html (Lesson 7: async/fetch, coming later) ============
let overlayHTML = null;   // we keep a copy so we only load the file once

async function getOverlayHTML() {
  if (!overlayHTML) {
    const res = await fetch(chrome.runtime.getURL("overlay.html"));
    overlayHTML = await res.text();
  }
  return overlayHTML;
}

// ============ SHOW THE POPUP (Lesson 5: DOM) ============
async function interrupt() {
  paused = true;   // stop counting while the popup is open

  const wrapper = document.createElement("div");
  wrapper.innerHTML = await getOverlayHTML();   // fill it with overlay.html
  document.body.appendChild(wrapper);           // put it on the page

  const mins = Math.round(streak / 60);
  const timeText = streak >= 60 ? `${mins} minutes` : `${streak} seconds`;   // ternary

  wrapper.querySelector("#ff-title").textContent = `You've been scrolling for ${timeText}.`;

  // Lesson 3 + 6: give the buttons a function to run when clicked
  wrapper.querySelector("#ff-go").onclick = () => showPuzzle(wrapper);
  wrapper.querySelector("#ff-leave").onclick = () => finish(wrapper);
}

// ============ SHOW A PUZZLE ============
function showPuzzle(wrapper) {
  // random puzzle (the line from Lesson 1, section 9)
  const p = puzzles[Math.floor(Math.random() * puzzles.length)];

  // swap screens by toggling the CSS class (Lesson 5)
  wrapper.querySelector("#ff-intro").classList.add("ff-hidden");
  wrapper.querySelector("#ff-puzzle").classList.remove("ff-hidden");
  wrapper.querySelector("#ff-question").textContent = p.q;

  const msg = wrapper.querySelector("#ff-msg");
  const optionsBox = wrapper.querySelector("#ff-options");
  optionsBox.innerHTML = "";   // clear old buttons

  // Lesson 4: one button per option
  p.options.forEach((text, i) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.className = "ff-btn ff-opt";

    b.onclick = () => {
      if (i === p.answer) {                       // Lesson 2: right or wrong?
        b.classList.add("ff-correct");
        msg.textContent = "Correct. Brain: 1, feed: 0.";
        setTimeout(() => finish(wrapper), 1200);  // close after 1.2 seconds
      } else {
        b.classList.add("ff-wrong");
        msg.textContent = "Not quite. Try again.";
      }
    };

    optionsBox.appendChild(b);
  });
}

// ============ CLOSE THE POPUP ============
function finish(wrapper) {
  wrapper.remove();   // delete the popup from the page
  streak = 0;         // start counting from zero again
  paused = false;     // timer can run again
}