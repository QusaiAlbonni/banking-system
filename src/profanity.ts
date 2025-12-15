import { readFileSync } from 'fs';
import { join } from 'path';
import { Profanity } from '@2toad/profanity';

interface BannedWord {
  word: string;
  regex: string;
}

interface BannedWords {
  en: BannedWord[];
  ar: BannedWord[];
}

const loadBannedWords = (): BannedWords => {
  try {
    const path = join(__dirname, './config/profanity-words.json');
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    return {
      en: data.en,
      ar: data.ar,
    };
  } catch (error) {
    console.error('Failed to load profanity files');
    throw error;
  }
};

const bannedWords = loadBannedWords();

// Combine all regexes
const combinedRegex = new RegExp(
  [...bannedWords.en, ...bannedWords.ar].map((entry) => entry.regex).join('|'),
  'iu',
);

const profanity = new Profanity({
  languages: ['ar', 'en'],
  wholeWord: true,
  grawlix: '*****',
  grawlixChar: '$',
});

profanity.addWords([
  ...bannedWords.en.map((entry) => entry.word),
  ...bannedWords.ar.map((entry) => entry.word),
]);

export const isProfane = (text: string) => {
  combinedRegex.lastIndex = 0;
  return profanity.exists(text) || combinedRegex.test(text);
};
export default profanity;
