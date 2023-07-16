export function isValidImage(mimetype: string) {
  return (
    mimetype.startsWith("image") &&
    mimetype.substring(6).match(/(jpg|jpeg|png|gif)/)
  );
}

export function isValidAudio(mimetype: string) {
  return (
    mimetype.startsWith("audio") &&
    mimetype.substring(6).match(/(wave|wav|mpeg)/)
  );
}
