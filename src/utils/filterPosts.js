export function hexToRgb(hex) {
  if (!hex) return [0, 0, 0];
  let c = hex.replace('#','');
  if (c.length === 3) c = c.split('').map(x=>x+x).join('');
  const num = parseInt(c, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

export function colorDistance(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

export function filterPosts(posts, searchQuery, selectedColor, colorTolerance = 60) {
  const query = searchQuery.trim().toLowerCase();

  return posts.filter(post => {
    // Text search
    const searchable = [
      post.itemName,
      post.description,
      ...(post.colorTags || []),
      ...(post.itemTags || [])
    ]
      .join(" ")
      .toLowerCase();
    const matchesText = !query || searchable.includes(query);

    // Color tolerance search (checks all colorTags)
    let matchesColor = true;
    if (selectedColor) {
      matchesColor = (post.colorTags || []).some(
        tagHex =>
          tagHex && colorDistance(tagHex, selectedColor) < colorTolerance
      );
    }

    return matchesText && matchesColor;
  });
}