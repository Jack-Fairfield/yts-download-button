console.log('[YTS Extension] Content script loaded!');

function replaceDownloadButton(button: HTMLElement) {
  if (button.dataset.replaced === 'true') return;
  
  const newButton = document.createElement('a');
  newButton.textContent = 'Jackie Download';
  newButton.className = button.className;
  newButton.style.cssText = 'background-color: yellow; color: black; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; cursor: pointer;';
  newButton.href = 'javascript:void(0);';
  newButton.dataset.replaced = 'true';
  
  newButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const magnetLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a.magnet-download'))
      .map(link => link.href)
      .filter(href => href);
    
    try {
      const response = await fetch('http://localhost:3000/magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(magnetLinks),
      });
      
      if (response.ok) {
        console.log('Successfully sent magnet links');
        newButton.textContent = 'Sent!';
      } else {
        console.error('Failed to send magnet links:', response.status);
        newButton.textContent = 'Error';
      }
    } catch (error) {
      console.error('Error sending magnet links:', error);
      newButton.textContent = 'Error';
    }
  }, true);
  
  button.dataset.replaced = 'true';
  button.parentNode?.replaceChild(newButton, button);
}

function processButtons() {
  document.querySelectorAll<HTMLElement>('.torrent-modal-download').forEach(btn => {
    if (btn.dataset.replaced !== 'true') {
      replaceDownloadButton(btn);
    }
  });
}

if (location.hostname.toLowerCase().includes('yts')) {
  processButtons();
  const observer = new MutationObserver(processButtons);
  observer.observe(document.body, { childList: true, subtree: true });
}

