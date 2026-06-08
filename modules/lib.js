export const defaultOptions = Object.freeze({
  blockReels: true,
  blockExplore: true,
  blockStories: false,
  blockPosts: false,
  blockSuggestedFollowers: true,
  blockThreads: true
});


export const labelsArray = Object.keys(defaultOptions);

export const selectors = {
  main: "[role=main]",
  storyFeed: "div[data-pagelet='story_tray']",
  posts: "article",
  postsLoader: "[data-visualcompletion='loading-state']",
  suggestedFollowers: "a[href*='/explore/people/']",
  reelsNavControls: "[aria-label='Reels navigation controls']",
  nav: {
    direct: "a[href*='/direct/inbox/']",
    activity: "a[href*='/accounts/activity']",
    explore: "a[href*='/explore/']",
    reels: "a[href='/reels/']",
    threads: "a[href*='threads']",
  }
};

export const urls = {
  base: "/",
  stories: "/stories",
  reels: "/reels",
  explore: "/explore",
  youtubeHome: "https://www.youtube.com/",
  youtubeSubscriptions: "https://www.youtube.com/feed/subscriptions"
};

export const hide = (elements) => {
  if (!elements) {
    return;
  }
  if (elements instanceof Node) {
    elements.style.display = "none";
  }
  if (elements instanceof NodeList) {
    elements.forEach((element) => {
      element.style.display = "none";
    });
  }
}
 