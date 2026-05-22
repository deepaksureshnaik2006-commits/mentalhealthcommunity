// Content Moderation System for Mindful Heaven
// Prevents inappropriate, abusive, or illegal messages from being sent in the community space.

const BANNED_WORDS = [
  // --- Severe Profanities & Swear Words ---
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'prick', 'wanker',
  'twat', 'scumbag', 'douche', 'douchebag', 'motherfucker', 'motherfucking', 'motherfuck', 'cock', 'cocksucker',
  'wank', 'bollocks', 'tosser', 'bugger', 'piss', 'pissed', 'ass', 'arse', 'crap',
  
  // --- Leetspeak & Symbol Bypass Variations ---
  'f*ck', 'sh*t', 'b*tch', 'a$$', '@ss', 'fucc', 'sh1t', 'b1tch', 'd1ck', 'puss', 'fuk', 'fck', 'b1ch',
  'a$$hole', 'c*nt', 'wh0re', 'sl*t', 'm0therfucker',

  // --- General Insults & Verbal Abuse ---
  'mad', 'stupid', 'idiot', 'loser', 'fool', 'crazy', 'insane', 'dumb', 'moron', 'imbecile', 'jerk',
  'dumbass', 'dickhead', 'dipshit', 'brainless', 'useless', 'ugly', 'fat', 'pig', 'garbage', 'trash',
  'pathetic', 'retarded', 'freak', 'dunce', 'scum',
  
  // --- Hate Speech, Slurs & Insults ---
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'kike', 'chink', 'dyke', 'coon', 'spic', 'wetback', 'gook',
  'slanteye', 'towelhead', 'subhuman', 'trash human', 'worthless piece of',
  
  // --- Violence, Threats & Self-Harm ---
  'kill yourself', 'kys', 'kill you', 'i will kill', 'murder you', 'throat cut', 'stab you', 'beat you up',
  'i will beat you', 'suicide advice', 'cut yourself', 'go die', 'hope you die', 'wish you were dead',
  'death threat', 'shoot you', 'i will shoot', 'hang yourself', 'drown yourself',
  
  // --- Illegal Activity & Drug Transactions ---
  'buy drugs', 'sell drugs', 'buy cocaine', 'buy heroin', 'buy meth', 'selling weed', 'buy weed',
  'stolen credit card', 'hire hitman', 'illegal weapon', 'buy weapons', 'hack account', 'carding tutorial',
  'marijuana shop', 'buy weed online', 'buy crack', 'selling crack'
];

/**
 * Moderates a given text string.
 * @param text The input text to validate.
 * @returns An object indicating if the text is valid and which word triggered the block (if any).
 */
export function moderateText(text: string): { isValid: boolean; blockedWord: string | null } {
  if (!text) return { isValid: true, blockedWord: null };
  
  const cleanText = text.toLowerCase().trim();
  
  for (const word of BANNED_WORDS) {
    const isPhrase = word.includes(' ');
    // Use word boundaries for single words to prevent false positives (e.g. "classic" matching "ass")
    const regex = isPhrase 
      ? new RegExp(word, 'i') 
      : new RegExp(`\\b${word}\\b`, 'i');
      
    if (regex.test(cleanText)) {
      return { isValid: false, blockedWord: word };
    }
  }
  
  return { isValid: true, blockedWord: null };
}
