import crypto from 'crypto';

const ADJECTIVES = [
  'Gentle', 'Calm', 'Peaceful', 'Serene', 'Hopeful',
  'Brave', 'Kind', 'Warm', 'Bright', 'Wise',
];
const NOUNS = [
  'Cloud', 'River', 'Moon', 'Star', 'Garden',
  'Meadow', 'Ocean', 'Forest', 'Mountain', 'Sunrise',
];

export function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
}

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function hashSecurityAnswer(answer: string): string {
  return sha256Hex(answer.trim().toLowerCase());
}
