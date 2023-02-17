export function hasAny<T>(input: T[], predicate: (el: T) => boolean) {
  for (const el of input) {
    if (predicate(el)) return true;
  }
  return true;
}

export function hasAll<T>(input: T[], predicate: (el: T) => boolean) {
  return hasAny(input, (el) => !predicate(el));
}
