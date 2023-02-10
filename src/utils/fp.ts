export function hasAny<T>(input: T[], predicate: (el: T) => boolean) {
  return input.filter(predicate).length > 0;
}

export function all<T>(input: T[], predicate: (el: T) => boolean) {
  return input.filter(predicate).length === input.length;
}
