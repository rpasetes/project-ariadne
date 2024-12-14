// FOCUS: GET HIGHLIGHT RENDERED UPON REFRESH
// start at line 49 when highlight button pressed
// get highlight saving properly before rendering <span> onto page 

// TODO: find event listener to trigger upon refresh
// then call the savedRange key in localStorage to get serialized range
// then call apply highlight to render, passing deserializedRange()
document.addEventListener('keydown', (event) => {
  console.log("localstorage:", localStorage)
  const allItems = Object.values(localStorage);
  allItems.forEach(element => {
    console.log(element);
  });
})

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
  // for multi-element highlights
  // const node = selection.node

  if (isTooltipButton) {
    // separate into two functions:
    // saveHighlight: saves range into localstorage as most recent highlight
    // TODO allow for 
    // applyHighlight: takes range selection and 
    console.log("highlight button clicked!");
    saveHighlight(range)
    applyHighlight(range)
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

  // create shadow dom -- attach thshadow dom to tooltip container
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

function applyHighlight(range) {
  // Find all instances of the selected text on the page
  // const textNodes = Array.from(document.body.childNodes)
  //   .filter(node => node.nodeType === Node.TEXT_NODE)
  //   .filter(node => node.textContent.includes(text));

  console.log("applyHighlight range: ", range)

  // For potential use for multi-element highlights (anchor and focus nodes)
  // console.log("node: ", node)
  
  // Wrap each instance of the text in a <span> with the chosen highlight styles
  const highlightSpan = document.createElement('span');
  highlightSpan.style.fontStyle = 'italic';
  highlightSpan.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
  range.surroundContents(highlightSpan);

  // NOTE: calling range will now reference the span element
  // Context: ran into bug where highlight was saved after
  // we surrounded the contents of the range with the span
  // which passed in the wrong range to save to localStorage
  console.log("highlight applied: ", range)
}

// NOTE: only saves most recent highlight
// MAYBE: save all highlights into array,
// Take most recent highlight and pop into first array
// For hacking sake, can find db solution later
function saveHighlight(range) {
  // Store the highlighted text and styles in the browser's local storage
  try {
    console.log("saveHighlight range: ", range)
    const serializedRange = serializeRange(range);
    console.log('serializedRange: ', serializeRange)
    localStorage.setItem('savedRange', serializedRange);

    console.log("here it is: ", localStorage)
  } catch (err) {
    console.log(err)
  }
}

function serializeRange(range) {
  console.log("serializing range", range)
  console.log("startOffset: ", range.startOffset)
  console.log("endOffset: ", range.endOffset)
  
  return JSON.stringify({
    startContainerXPath: getXPath(range.startContainer),
    startOffset: range.startOffset,
    endContainerXPath: getXPath(range.endContainer),
    endOffset: range.endOffset,
  });
}

function getXPath(node) {
  let path = [];
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = node;
    while ((sibling = sibling.previousElementSibling)) {
      index++;
    }
    path.unshift(`${node.nodeName}[${index + 1}]`);
    node = node.parentNode;
  }
  return path.join('/');
}

function deserializeRange(serializedRange) {
  const data = JSON.parse(serializedRange);

  const startContainer = getNodeByXPath(data.startContainerXPath);
  const endContainer = getNodeByXPath(data.endContainerXPath);

  const range = document.createRange();
  range.setStart(startContainer, data.startOffset);
  range.setEnd(endContainer, data.endOffset);
  return range;
}

// Utility to locate a node by XPath
function getNodeByXPath(xpath) {
  const evaluator = new XPathEvaluator();
  const result = evaluator.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
  );
  return result.singleNodeValue;
}

// FOR REFACTOR:
// BUG: fix rendering logic on mouse events when button is clicked
// event listening related to shadow dom? and finding button
// BUG: inject css across multiple text tags, splitting up