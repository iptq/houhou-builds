// See https://github.com/Doublevil/Houhou-SRS/blob/master/Kanji.Common/Helpers/KanaHelper.cs

import kanadata from "../data/kanadata.json";

/**
 * Specifically converts a romaji string to kana.
 * The result may be hiragana, katakana or mixed, depending on the case
 * of the input romaji.
 *
 * @param romaji Input romaji string.
 * @param isLive Set to true to specify that the conversion is done in live (while the user is writing). Disables certain functions.
 * @returns Output kana string.
 */
export function romajiToKana(romaji: string, isLive = false): string | null {
  let s = romaji.trim();
  if (s == "") return null;

  // Replace the double vowels for katakana.
  const doubleVowelRegex = /([AEIOU])\1/g;
  s = s.replaceAll(doubleVowelRegex, "$1ー");

  // Replace the double consonants.

  // Then, replace - by ー.
  s = s.replaceAll("-", "ー");
  s = s.replaceAll("_", "ー");

  // Then, replace 4 letter characters:
  for (const [find, repl] of kanadata.romajiToKana["4letter"]) s = s.replaceAll(find, repl);

  // Then, replace 3 letter characters:
  for (const [find, repl] of kanadata.romajiToKana["3letter"]) s = s.replaceAll(find, repl);

  // Then, replace 2 letter characters:
  for (const [find, repl] of kanadata.romajiToKana["2letter"]) s = s.replaceAll(find, repl);

  // Then, replace 1 letter characters:
  for (const [find, repl] of kanadata.romajiToKana["1letter"]) s = s.replaceAll(find, repl);

  if (!isLive)
    for (const [find, repl] of kanadata.romajiToKana["replaceN"]) s = s.replaceAll(find, repl);

  return s;
}
