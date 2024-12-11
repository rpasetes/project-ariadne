// TODO: fix rendering logic on mouse events when button is clicked
// event listening related to shadow dom? and finding button

// TODO: inject css across multiple text tags, splitting up

// Listen for text selection events on the page
document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection()
  console.log(selection)
  const selectedText = selection.toString();
  if (selectedText && !document.body.querySelector('#tooltip-button')) {
    addTooltip(selection)
  }
})

// document.addEventListener('mousedown', (event) => {
//   // target prints html element
//   console.log(event.target);
//   const shadowRoot = event.target.getRootNode();
//   if (event.target !== shadowRoot('#tooltip-button')) {
//     console.log("This was triggered")
//     removeTooltip()
//   }
// })

document.addEventListener('mousedown', (event) => {
  const shadowRoot = event.target.getRootNode();
  console.log("event path", event.composedPath());
  console.log("event! ", event.target);

  const path = event.composedPath();
  const isTooltipButton = path.some(element => 
    element.id === 'tooltip-button'
  );

  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const node = selection.node

  if (isTooltipButton) {
    console.log("I was clicked");
    applyHighlight(range, node)
  }
  if (event.target !== shadowRoot.querySelector('#tooltip-button')) {
    removeTooltip()
    console.log("This was triggered")
  }
})

function removeTooltip() {
  const tooltipContainer = document.querySelector('tooltip-container');
  if (tooltipContainer !== null) {  
    tooltipContainer.remove() 
  }
}


function getSelectedTextPosition(selectedText) {
  if (!selectedText) return null;

  const range = selectedText.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    left: rect.left + window.scrollX,      // same as x value
    right: rect.right + window.scrollX, 
    top: rect.top + window.scrollY,        // same as y value
    bottom: rect.bottom + window.scrollY 
  }
}

function addTooltip(selectedText) {
  // create tooltip div
  const tooltipContainer = document.createElement('tooltip-container');

  // create shadow dom -- attach the shadow dom to tooltip container
  const shadow = tooltipContainer.attachShadow({ mode: 'open', delegatesFocus: true });

  document.body.appendChild(tooltipContainer);

  shadow.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: flex-start; width: 100%; height: 100%;">
    <button id="tooltip-button">
      Highlight
    </button>
  </div>
`
  // place tooltip div over highlight
  const { left, right, top, bottom } = getSelectedTextPosition(selectedText)
  
  tooltipContainer.style.position = "absolute";
  tooltipContainer.style.left = `${left}px`;
  tooltipContainer.style.top = `${top-25}px`;
  tooltipContainer.style.width = `${right - left}px`;
  tooltipContainer.style.height = `${bottom - top}px`;
  
}

function showHighlightOptions(text) {
  // Create a UI element (e.g. popup, sidebar) to let the user choose highlight color, opacity, etc.
  // Update the highlight styles based on user input
}

function applyHighlight(range, node) {
  // Find all instances of the selected text on the page
  // const textNodes = Array.from(document.body.childNodes)
  //   .filter(node => node.nodeType === Node.TEXT_NODE)
  //   .filter(node => node.textContent.includes(text));

  // Wrap each instance of the text in a <span> with the chosen highlight styles
  console.log(range)
  console.log(node)

  const italicSpan = document.createElement('span');
  italicSpan.style.fontStyle = 'italic';
  range.surroundContents(italicSpan);

  // const highlightedText = node.textContent.replace(
  //   text,
  //   `<span style="color:#ffff00;opacity:0.5;">${text}</span>`
  // );
  // node.parentNode.innerHTML = highlightedText;


  
}

function getHighlightStyles() {
  // Retrieve the user-selected highlight styles (color, opacity, etc.)
  // from the UI element created in showHighlightOptions()
  return {
    color: '#ffff00',
    opacity: 0.5
  };
}

// function saveHighlight(text, styles) {
//   // Store the highlighted text and styles in the browser's local storage
//   localStorage.setItem('highlightedText', text);
//   localStorage.setItem('highlightStyles', JSON.stringify(styles));
// }