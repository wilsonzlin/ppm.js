import assertState from "@xtjs/lib/js/assertState";

const c = (c: string) => c.charCodeAt(0);

const WHITESPACE = new Set([" ", "\t", "\r", "\n"].map(c));

// Spec: http://netpbm.sourceforge.net/doc/ppm.html.
export const decodePpm = async (raw: Uint8Array) => {
  let i = 0;
  if (raw[i++] != c("P") || raw[i++] != c("6")) {
    throw new Error("Magic number not present");
  }

  const skipWhitespaceExceptAfterNewline = () => {
    while (true) {
      const ch = raw[i];
      if (!WHITESPACE.has(ch)) {
        break;
      }
      i++;
      if (ch === c("\n")) {
        break;
      }
    }
  };
  const parseInteger = () => {
    let val = 0;
    while (!WHITESPACE.has(raw[i])) {
      val = val * 10 + (raw[i++] - c("0"));
    }
    return val;
  };

  // TODO Comments.
  skipWhitespaceExceptAfterNewline();
  const width = parseInteger();
  if (!Number.isSafeInteger(width) || width <= 0) {
    throw new Error(`Invalid width: ${width}`);
  }
  skipWhitespaceExceptAfterNewline();
  const height = parseInteger();
  if (!Number.isSafeInteger(height) || height <= 0) {
    throw new Error(`Invalid height: ${height}`);
  }
  skipWhitespaceExceptAfterNewline();
  const maxval = parseInteger();
  // TODO maxval != 255.
  if (!Number.isSafeInteger(maxval) || maxval <= 0 || maxval >= 256) {
    throw new Error(`Invalid maxval: ${maxval}`);
  }
  // WARNING: Do not skip whitespace past newline, as after that is binary data and we would be inadvertently trimming and corrupting it.
  skipWhitespaceExceptAfterNewline();
  const data = raw.slice(i);
  assertState(
    data.length === height * width * 3,
    `Not enough bytes (height=${height}, width=${width}, bytes=${data.length})`
  );
  // TODO Multiple images.
  return {
    channels: 3,
    data,
    height,
    width,
  };
};
