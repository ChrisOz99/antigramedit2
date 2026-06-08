// main.js
import { defaultOptions, selectors, urls, hide } from "../modules/lib.js";

// Treat defaults as the only settings
const settings = defaultOptions; // optionally Object.freeze in lib.js

function injectFollowingButton(reelsLink) {
  if (document.querySelector('a[data-following-nav]')) return;

  // Clone the full nav item wrapper (div > span > div > a), not just the <a>
  const navItem = reelsLink.closest('span')?.parentElement;
  if (!navItem) return;

  const clone = navItem.cloneNode(true);
  const cloneLink = clone.querySelector('a');
  if (!cloneLink) return;

  cloneLink.href = '/?variant=following';
  cloneLink.setAttribute('data-following-nav', '1');
  cloneLink.style.display = '';

  const svg = clone.querySelector('svg');
  if (svg) {
    svg.setAttribute('aria-label', 'Following');
    const title = svg.querySelector('title');
    if (title) title.textContent = 'Following';
    const path = svg.querySelector('path');
    if (path) {
      path.setAttribute('d', 'M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm0 4c-2.673 0-8 1.337-8 4v2h16v-2c0-2.663-5.327-4-8-4zm0 2c2.143 0 5.027.732 6.297 2H5.703C6.973 16.732 9.857 16 12 16z');
    }
  }

  const labelSpan = clone.querySelector('span[dir="auto"] span');
  if (labelSpan) labelSpan.textContent = 'Following';

  // Insert before modifying listeners so navItem.parentElement is accessible
  navItem.insertAdjacentElement('beforebegin', clone);

  const labelContainer = clone.querySelector('div[style*="opacity"]');
  if (labelContainer) {
    // Mirror the style of an existing nav label so hover behaviour is identical
    const existingNavLabel = navItem.parentElement?.querySelector('div[style*="opacity"]');
    if (existingNavLabel) {
      new MutationObserver(() => {
        labelContainer.style.cssText = existingNavLabel.style.cssText;
      }).observe(existingNavLabel, { attributes: true, attributeFilter: ['style'] });
    }
  }
}


function hideSuggestedSection(body) {
  const img = body.querySelector('img[src*="illo-confirm"]');
  if (!img) return;

  const loader = body.querySelector('[data-visualcompletion="loading-state"]');
  if (!loader) return;

  const imgAncestors = new Set();
  let node = img;
  while (node) { imgAncestors.add(node); node = node.parentElement; }

  let lca = loader;
  while (lca && !imgAncestors.has(lca)) lca = lca.parentElement;
  if (!lca || lca.children.length < 2) return;

  lca.children[1].style.setProperty('display', 'none', 'important');
}

function blockReelScrolling(e) {
  if (e.type === "keydown" && !["ArrowUp", "ArrowDown"].includes(e.key)) return;
  e.stopPropagation();
  e.preventDefault();
}

function main() {
  const mutationObserver = new MutationObserver(onMutation);
  let reelScrollBlocked = false;

  function onMutation() {
    const path = window.location.pathname;
    const body = document.body;

    if (settings.blockThreads) {
      const threadLinks = body?.querySelectorAll(selectors.nav.threads);
      hide(threadLinks);
    }

    if (settings.blockExplore) {
      const exploreLink = body?.querySelectorAll(selectors.nav.explore);
      hide(exploreLink);
    }

    if (settings.blockReels) {
      const reelsLink = body?.querySelector(selectors.nav.reels);
      if (reelsLink) {
        hide(reelsLink);
        injectFollowingButton(reelsLink);
      }
    }

    if (path === urls.base) {
      if (settings.blockStories) {
        const storyFeed = body?.querySelector(selectors.storyFeed);
        hide(storyFeed);
      }

      if (settings.blockPosts) {
        const posts = body?.querySelector(selectors.posts);
        const postsLoader = body?.querySelector(selectors.postsLoader);
        const postsContainer = posts?.parentElement?.parentElement?.parentElement;
        hide(posts);
        hide(postsLoader);
        hide(postsContainer);
      }

      hideSuggestedSection(body);

      if (settings.blockSuggestedFollowers) {
        const suggestedFollowersLink = body?.querySelector(selectors.suggestedFollowers);
        const suggestedFollowersTitle = suggestedFollowersLink?.closest("div");
        const suggestedFollowers = suggestedFollowersTitle?.nextElementSibling;
        hide(suggestedFollowersLink);
        hide(suggestedFollowersTitle);
        hide(suggestedFollowers);
      }

    }

    const blockStoriesSection = path.includes(urls.stories) && settings.blockStories;
    if (blockStoriesSection) {
      hide(body);
    }

    const blockReelsScreen = (path === urls.reels || path === urls.reels + "/") && settings.blockReels;
    if (blockReelsScreen) {
      window.location.replace(urls.base);
    }

    const onReelPage = /^\/reels\/.+/.test(path);
    if (onReelPage) {
      hide(body?.querySelector(selectors.reelsNavControls));
      if (!reelScrollBlocked) {
        window.addEventListener("wheel", blockReelScrolling, { capture: true, passive: false });
        window.addEventListener("keydown", blockReelScrolling, { capture: true });
        reelScrollBlocked = true;
      }
    } else if (reelScrollBlocked) {
      window.removeEventListener("wheel", blockReelScrolling, { capture: true });
      window.removeEventListener("keydown", blockReelScrolling, { capture: true });
      reelScrollBlocked = false;
    }

    const blockExploreScreen = path.includes(urls.explore) && settings.blockExplore;
    if (blockExploreScreen) {
      const main = body?.querySelector(selectors.main);
      hide(main);
    }
  }

  if (window.location.href === urls.youtubeHome || window.location.href === urls.youtubeHome.slice(0, -1)) {
    window.location.replace(urls.youtubeSubscriptions);
    return;
  }

  mutationObserver.observe(document, { subtree: true, childList: true });
  onMutation();
}

export { main };
