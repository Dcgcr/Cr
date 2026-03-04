/* Behavior:
   - show white splash for 2s
   - then reveal bottom "Menu" and auto-open Menu content
   - clicking Menu when menu visible reloads
   - clicking any 8:7 .menu-box opens a scrollable results page with a 9:1 header and four 4:6 cards
*/

const splash = document.getElementById('splash');
const menuBtn = document.getElementById('menuBtn');
const listBtn = document.getElementById('listBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuContent = document.getElementById('menuContent');
const resultsView = document.getElementById('resultsView');
const resultsTitle = document.getElementById('resultsTitle');
const resultsGrid = document.getElementById('resultsGrid');

let menuVisible = false;

// show splash for 2 seconds then remove and auto-open menu
setTimeout(() => {
  splash.classList.add('hidden');

  // auto-open the menu overlay as if Menu was clicked
  menuVisible = true;
  menuOverlay.classList.add('show');
  menuOverlay.removeAttribute('hidden');
  menuBtn.setAttribute('aria-expanded', 'true');
}, 2000);

// Toggle menu overlay when the left segment (Menu) is clicked
// If menu is already visible, refresh the page instead of toggling.
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (menuVisible) {
    location.reload();
    return;
  }
  openMenu();
});

function openMenu(){
  menuVisible = true;
  menuOverlay.classList.add('show');
  menuOverlay.removeAttribute('hidden');
  menuBtn.setAttribute('aria-expanded','true');
  // hide results if visible
  hideResults();
}

// Close the menu if user taps outside the box
menuOverlay.addEventListener('click', (e) => {
  if (!menuContent.contains(e.target)) {
    menuVisible = false;
    menuOverlay.classList.remove('show');
    setTimeout(()=> menuOverlay.setAttribute('hidden',''), 180);
    menuBtn.setAttribute('aria-expanded','false');
  }
});

// Prevent clicks inside from closing
menuContent.addEventListener('click', (e)=> e.stopPropagation());

// If an 8:7 menu-box is clicked, open results view
// Guard against clicks when a box is in the disabled state.
menuContent.querySelectorAll('.menu-box').forEach(box => {
  box.addEventListener('click', (e) => {
    e.stopPropagation();
    if (box.classList.contains('disabled')) return; // ignore clicks when disabled
    const title = box.dataset.title || box.querySelector('.top-title')?.textContent || 'Results';
    showResultsFor(title);
  });
});

function showResultsFor(title){
  // hide menu overlay and show results view
  menuVisible = false;
  menuOverlay.classList.remove('show');
  setTimeout(()=> menuOverlay.setAttribute('hidden',''), 180);
  menuBtn.setAttribute('aria-expanded','false');

  // set results title text and show results container
  resultsTitle.textContent = `Showing results for ${title}`;
  resultsView.removeAttribute('hidden');
  resultsView.classList.add('show-results');

  // disable interaction with the menu boxes while results are visible
  menuContent.querySelectorAll('.menu-box').forEach(b => b.classList.add('disabled'));

  // ensure focus/aria state managed - make app scrollable already handles it
  // populate result cards with VT#.jpg images
  populateVTResults();
}

/**
 * Detect and load VT#.jpg assets and populate the results grid.
 * Behavior:
 *  - Attempts to detect VT1.jpg, VT2.jpg, ... up to a reasonable max (50).
 *  - Builds the grid with as many cards as the highest numbered VT found.
 *  - Places each found VTn.jpg into the nth card. Missing numbers leave an empty card.
 */
async function populateVTResults(){
  const grid = resultsGrid;
  grid.innerHTML = '';

  // helper to test if an image exists by loading it
  function testImage(src){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  // Try sequentially up to maxIndex to discover VT images.
  const maxTry = 50; // safety cap
  const found = {}; // index -> filename
  let highest = 0;
  for (let i = 1; i <= maxTry; i++){
    const name = `/VT${i}.jpg`;
    // attempt to load
    // await to avoid hammering; keep sequential to map indices reliably
    // resolve quickly if file missing
    // skip if not found
    // note: testImage resolves to true/false
    // eslint-disable-next-line no-await-in-loop
    const ok = await testImage(name);
    if (ok){
      found[i] = name;
      highest = i > highest ? i : highest;
    }
  }

  // If no VT images found, fall back to no cards
  if (highest === 0){
    const info = document.createElement('div');
    info.style.padding = '18px';
    info.style.gridColumn = '1 / -1';
    info.textContent = 'No VT images found.';
    grid.appendChild(info);
    return;
  }

  // Create cards up to highest index and place images in matching slots
  for (let i = 1; i <= highest; i++){
    const card = document.createElement('div');
    card.className = 'result-card';
    if (found[i]){
      const img = document.createElement('img');
      img.src = found[i];
      img.alt = `VT${i}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '10px';
      card.appendChild(img);
    } else {
      // empty placeholder (keeps layout consistent)
      const empty = document.createElement('div');
      empty.style.width = '100%';
      empty.style.height = '100%';
      empty.style.display = 'flex';
      empty.style.alignItems = 'center';
      empty.style.justifyContent = 'center';
      empty.style.color = 'rgba(0,0,0,0.25)';
      empty.style.fontSize = '14px';
      empty.textContent = `VT${i} missing`;
      card.appendChild(empty);
    }
    grid.appendChild(card);
  }
}

// Hide results view and reveal menu again
function hideResults(){
  if (!resultsView) return;
  resultsView.classList.remove('show-results');
  // re-enable the menu boxes when results are hidden
  menuContent.querySelectorAll('.menu-box').forEach(b => b.classList.remove('disabled'));
  setTimeout(()=> resultsView.setAttribute('hidden',''), 180);
}