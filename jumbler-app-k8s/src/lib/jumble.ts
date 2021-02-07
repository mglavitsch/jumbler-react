interface CodePointRange {
  start: number;
  end: number;
}

interface Word {
  start: number;
  chars: string;
}

type Words = Array<Word>;

export default class Jumbler {
  constructor(private text: string) {
    if (this.text.length === 0) {
      throw new Error(
        "Jumbler.constructor: string length must be greater than 0."
      );
    }
  }

  get Text(): string {
    return this.text;
  }

  set Text(value: string) {
    if (this.text.length === 0) {
      throw new Error("Jumbler.setText: string length must be greater than 0.");
    }
    this.text = value;
  }

  // getJumbledText() takes the property text, identifies the words and
  // jumbles the characters of those words.
  getJumbledText(force = false): string {
    const words = this.getWords();
    let result = this.text;

    let jumbledWord: string;
    for (let w of words) {
      if (w.chars.length > 3) {
        jumbledWord = Jumbler.getJumbledWord(
          this.text.substring(w.start, w.start + w.chars.length),
          force
        );
        result = result
          .substring(0, w.start)
          .concat(
            jumbledWord,
            result.substring(w.start + w.chars.length, result.length)
          );
      }
    }

    return result;
  }

  // getIndices takes the property txt and returns an array of Ranges.
  // A Range represents the start and end index of a word.
  getWords(): Words {
    let words: Words = [];
    let codePoint: number | undefined;
    let hitChar: boolean;
    let hitWord = false;
    let start = -1;

    for (let i = 0; i < this.text.length; i++) {
      hitChar = false;
      codePoint = this.text.codePointAt(i);
      if (codePoint === undefined) {
        return words;
      }
      for (let r of Jumbler.getCharCodePointRanges()) {
        if (r.start <= codePoint && codePoint <= r.end) {
          hitChar = true;
          break;
        }
      }
      if (!hitWord && hitChar) {
        start = i;
        hitWord = true;
      } else if (hitWord && !hitChar) {
        hitWord = false;
        words.push({ start: start, chars: this.text.substring(start, i) });
      }
    }
    if (hitWord) {
      words.push({ start: start, chars: this.text.substring(start) });
    }

    return words;
  }

  // isJumbable checks whether a word can be jumbled.
  static isJumbable(word: string): boolean {
    if (word.length < 4) {
      return false;
    }

    let equal = true;
    for (let i = 1; i < word.length - 2; i++) {
      equal = equal && word.charAt(i) === word.charAt(i + 1);
      if (!equal) {
        return true;
      }
    }

    return false;
  }

  // getJumbledWord changes the property text in that it keeps the first and the last
  // character and randomly jumbles the characters of substring (1 : len(txt)-1).
  static getJumbledWord(word: string, force = false): string {
    if (word.length < 4 || !Jumbler.isJumbable(word)) {
      return word;
    }

    let subStr: string;
    let newStr: string;
    let randomIndex: number;
    do {
      subStr = word.substring(1, word.length - 1);
      newStr = word.substring(0, 1);
      while (subStr.length > 0) {
        randomIndex = Math.floor(subStr.length * Math.random());
        newStr = newStr + subStr[randomIndex];
        subStr =
          subStr.slice(0, randomIndex) +
          subStr.slice(randomIndex + 1, subStr.length);
      }
      newStr = newStr + word.substring(word.length - 1, word.length);
    } while (force && newStr === word);

    return newStr;
  }

  static getCharCodePointRanges(): Array<CodePointRange> {
    return [
      { start: 0x41, end: 0x5a },
      { start: 0x61, end: 0x7a },
      { start: 0xc0, end: 0xd6 },
      { start: 0xd8, end: 0xf6 },
      { start: 0xf8, end: 0xff }
    ];
  }
}
