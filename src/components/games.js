// Game data
const games = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Game ${i + 1}`,
  description: `This is the description for Game ${
    i + 1
  }. It's a fun educational game!`,
  color: `hsl(${i * 25}, 80%, 70%)`, // Generate vibrant colors
}));

export { games };
