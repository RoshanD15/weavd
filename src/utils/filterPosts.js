export function hexToRgb(hex) {
  if (!hex) return [0, 0, 0];
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

// Euclidean distance between two hex colors
export function colorDistance(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Main filter function
export function filterPosts(posts, searchQuery, selectedColor, colorTolerance = 60) {
  const query = (searchQuery || "").trim().toLowerCase();
  const color = (selectedColor || "").trim();

  return posts.filter(post => {
    // Compose searchable text
    const searchable = [
      post.itemName,
      post.description,
      ...(Array.isArray(post.colorTags) ? post.colorTags : []),
      ...(Array.isArray(post.itemTags) ? post.itemTags : [])
    ]
      .join(" ")
      .toLowerCase();

    // Text search
    const matchesText = !query || searchable.includes(query);

    // Color distance filter
    let matchesColor = true;
    if (color) {
      matchesColor = (Array.isArray(post.colorTags) ? post.colorTags : []).some(
        tagHex => tagHex && colorDistance(tagHex, color) < colorTolerance
      );
    }

    return matchesText && matchesColor;
  });
}