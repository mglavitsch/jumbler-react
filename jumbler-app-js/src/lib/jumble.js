export default class Jumbler {
  constructor(text) {
    this.txt = text;
  }

  // getJumbledText() takes the property txt, identifies the words and
  // jumbles the characters of those words.
  getJumbledText(force = false) {
    let text = this.txt;
    let indices = this.getIndices();
    if (indices.length === 0) {
      return text;
    }

    let jumbledWord;
    for (let range of indices) {
      if (range[1] - range[0] > 2) {
        jumbledWord = Jumbler.getJumbledWord(
          text.substring(range[0], range[1] + 1),
          force
        );
        text = text
          .substring(0, range[0])
          .concat(jumbledWord, text.substring(range[1] + 1, text.length));
      }
    }

    return text;
  }

  // getIndices takes the property txt and returns a 2-dimensional int array
  // with the start and end indices of each word.
  getIndices() {
    const text = this.txt;
    let indices = [];
    if (typeof text != "string") {
      return indices;
    }
    if (text.length === 0) {
      return indices;
    }

    let codePoint;
    let character;
    let word = false;
    let start = -1;
    let end = -1;

    for (let i = 0; i < text.length; i++) {
      character = false;
      codePoint = text.codePointAt(i);
      for (let range of Jumbler.getCharCodePointRanges()) {
        if (range[0] <= codePoint && codePoint <= range[1]) {
          character = true;
          break;
        }
      }
      if (!word && character) {
        start = i;
        word = true;
      } else if (word && !character) {
        end = i - 1;
        word = false;
        indices.push([start, end]);
      }
    }
    if (word) {
      indices.push([start, text.length - 1]);
    }

    return indices;
  }

  // canBeJumbled checks whether a word can be jumbled.
  static canBeJumbled(word) {
    if (typeof word != "string") {
      return false;
    }
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

  // getJumbledWord changes the property txt in that it keeps the first and the last
  // character and randomly jumbles the characters of substring (1 : len(txt)-1).
  static getJumbledWord(word, force = false) {
    if (typeof word != "string" || typeof force != "boolean") {
      return word;
    }
    if (word.length < 4) {
      return word;
    }
    if (!Jumbler.canBeJumbled(word)) {
      return word;
    }

    let subStr, newStr, randomIndex
    let attempts = 0;
    do {
      attempts++;
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
    } while (force && attempts < 1000 && newStr === word);

    return newStr;
  }

  static getCharCodePointRanges() {
    return [
      [0x41, 0x5a],
      [0x61, 0x7a],
      [0xc0, 0xd6],
      [0xd8, 0xf6],
      [0xf8, 0xff]
    ];
  }
}
