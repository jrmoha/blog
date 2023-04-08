export const getHashtags = (query: string): string[] => {
  const regex = /\B(#[a-zA-Z0-9_]+\b)(?!;)/gm;
  const hashtags = query.match(regex);
  if (hashtags?.length) {
    hashtags.forEach((hashtag, index) => {
      hashtags[index] = hashtag.replace('#', '');
      hashtags[index] = hashtags[index].toLowerCase();
    });
  }
  return [...new Set(hashtags)];
};
