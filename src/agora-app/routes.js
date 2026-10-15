// Hash routes that open the agora pages instead of the story.
export const isAgoraRoute = (r) =>
  ['#map', '#passport', '#scales', '#athena', '#post-work', '#profiles'].includes(r) ||
  ['#naka/', '#book-work/', '#passport/', '#scales/', '#athena/'].some((p) => r.startsWith(p))
