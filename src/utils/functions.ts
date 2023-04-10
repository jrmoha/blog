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

export const formatTime = (lastseen_time: number): string => {
  let diff = new Date().getTime() - lastseen_time;
  const day = 24 * 60 * 60 * 1000;
  let last_active = '';
  if (diff > day * 356) {
    //more than a year
    last_active += `${Math.floor(diff / (day * 365))} Years`;
    diff /= day * 365;
  } else if (diff > day * 30 && diff < day * 365) {
    //more than a month less than a year
    last_active += `${Math.floor(diff / (day * 30))} Months`;
    diff /= day * 30;
  } else if (diff > day * 7 && diff < day * 30) {
    //more than a week less than a month
    last_active += `${Math.floor(diff / (day * 7))} Week`;
    diff /= day * 7;
  } else if (diff > day && diff < day * 7) {
    //more than a day less than a week
    last_active += `${Math.floor(diff / day)} Day`;
    diff /= day;
  } else if (diff < 60000) {
    last_active = 'Now';
  } else {
    //less than a day
    if (Math.ceil(diff / (60 * 1000)) > 60) {
      last_active += `${Math.floor(diff / (60 * 1000 * 60))} Hours`;
      diff /= 60 * 1000 * 60;
    }
    if (Math.ceil(diff / (60 * 1000)) > 1) {
      last_active += `${Math.ceil(diff / (60 * 1000))} Mintues`;
    }
  }
  return last_active;
};
