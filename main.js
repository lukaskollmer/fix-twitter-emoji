const EMOJI_REGEX = /background-image: url\("https:\/\/abs-0\.twimg\.com\/emoji\/v2\/svg\/([a-f0-9\-]+)\.svg"\);/g

const handleEmojiNode = (node, codepoints) => {
  codepoints = codepoints.split('-').map(c => Number.parseInt(c, 16))
  if (codepoints.length === 1) {
    codepoints.push(0xfe0f)
  }

  const parent = node.parentNode;

  while (parent.lastChild) {
    parent.removeChild(parent.lastChild)
  }

  if (parent.style.width === '1.2em') {
    parent.style.width = null
  }

  parent.appendChild(document.createTextNode(String.fromCodePoint(...codepoints)))
};


const handleNode = node => {
  if ((node instanceof Element) === false) return;

  const style = node.getAttribute('style');
  if (style !== null && style.includes('emoji')) {
    EMOJI_REGEX.lastIndex = 0; // "reset" the regex. this is bad code
    const match = EMOJI_REGEX.exec(style)
    if (match !== null) {
      handleEmojiNode(node, match[1])
      // `handleEmojiNode` removes the node from the DOM, so there's no point in going through its children
      return;
    }
  }

  Array.from(node.children).forEach(handleNode)
};


const observer = new MutationObserver((mutations, observer) => {
  mutations
    .filter(m => m.type === 'childList')
    .forEach(m => Array.from(m.addedNodes).forEach(handleNode))
})

observer.observe(document, {
  subtree: true,
  childList: true
})
