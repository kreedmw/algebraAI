// Curriculum Problems Database
const PROBLEMS = {
  SUBJECT_OF_FORMULA: {
    instruction: "Rearrange the equation to isolate target variable x:",
    latex: "y = \\sqrt{\\frac{x + a}{b}}",
    initialPrompt: "To rearrange this formula to make x the subject, what operation should we undo first to eliminate the square root?"
  },
  QUADRATICS: {
    instruction: "Expand the algebraic quadratic expression fully:",
    latex: "(2x + 3)^2",
    initialPrompt: "Remember that (2x + 3)^2 means multiplying (2x + 3) by itself. What terms do you get when expanding?"
  },
  EXPONENTIALS: {
    instruction: "Simplify the exponential expression using index laws:",
    latex: "\\frac{x^5 \\cdot x^3}{x^2}",
    initialPrompt: "First, look at the numerator x^5 * x^3. Which index law applies when multiplying powers with the same base?"
  }
};

let currentTopic = 'SUBJECT_OF_FORMULA';

document.addEventListener("DOMContentLoaded", function() {
  loadProblem(currentTopic);
});

// Load and Render Selected Problem
function loadProblem(topicKey) {
  currentTopic = topicKey;
  const problem = PROBLEMS[topicKey];

  // Update instruction
  document.getElementById("problem-instruction").innerText = problem.instruction;

  // Render Math Equation via KaTeX
  const formulaEl = document.getElementById("target-formula");
  katex.render(problem.latex, formulaEl, {
    throwOnError: false,
    displayMode: true
  });

  // Reset Chat Stream
  const chatContainer = document.getElementById("chat-container");
  chatContainer.innerHTML = '';

  appendMessage('tutor', problem.initialPrompt);
}

// Handle Topic Switcher
function handleTopicChange(event) {
  loadProblem(event.target.value);
}

// Virtual Keyboard Symbol Insertion
function insertSymbol(symbol) {
  const input = document.getElementById('student-input');
  input.value += symbol;
  input.focus();
}

// Append Message to UI Stream
function appendMessage(sender, text, misconceptionCode = null) {
  const chatContainer = document.getElementById('chat-container');
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;

  const senderLabel = sender === 'tutor' ? 'AlgebraAI Tutor' : 'You';
  let htmlContent = `<span class="sender-label">${senderLabel}</span>${escapeHTML(text)}`;

  if (misconceptionCode) {
    htmlContent += `<br><span class="error-badge">Diagnostic Flag: ${misconceptionCode}</span>`;
  }

  msg.innerHTML = htmlContent;
  chatContainer.appendChild(msg);

  // Auto-scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Simulated Misconception Engine & Socratic Response Logic
function evaluateStudentStep(input, topic) {
  const clean = input.replace(/\s+/g, '').toLowerCase();

  if (topic === 'SUBJECT_OF_FORMULA') {
    if (clean.includes('y^2') && (clean.includes('+a') || clean.endsWith('+a'))) {
      return {
        isCorrect: false,
        feedback: "You squared both sides and multiplied by b correctly! Now look at +a: What operation undoes addition to isolate x?",
        misconceptionCode: "ERR_INV_OP_SIGN"
      };
    }
    if (clean.includes('x=y^2*b-a') || clean.includes('x=(y^2*b)-a') || clean === 'y^2*b-a') {
      return {
        isCorrect: true,
        feedback: "Spot on! Squaring both sides, multiplying by b, and subtracting a perfectly isolates x.",
        misconceptionCode: null
      };
    }
  } else if (topic === 'QUADRATICS') {
    if (clean === '4x^2+9') {
      return {
        isCorrect: false,
        feedback: "Notice that (a + b)^2 = a^2 + 2ab + b^2. You missed the middle product term! What is 2 * (2x) * 3?",
        misconceptionCode: "ERR_EXPANSION_MIDDLE_TERM"
      };
    }
  }

  return {
    isCorrect: true,
    feedback: "Great work! That step is mathematically sound. What would be your next step?",
    misconceptionCode: null
  };
}

// Handle Form Submission
function handleStepSubmit(event) {
  event.preventDefault();
  const inputEl = document.getElementById('student-input');
  const submitBtn = document.getElementById('submit-btn');
  const text = inputEl.value.trim();

  if (!text) return;

  // Append Student Input
  appendMessage('student', text);
  inputEl.value = '';
  inputEl.disabled = true;
  submitBtn.disabled = true;

  // Simulate Engine Latency
  setTimeout(() => {
    const result = evaluateStudentStep(text, currentTopic);
    appendMessage('tutor', result.feedback, result.misconceptionCode);

    inputEl.disabled = false;
    submitBtn.disabled = false;
    inputEl.focus();
  }, 600);
}

// Basic HTML Escaping
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}