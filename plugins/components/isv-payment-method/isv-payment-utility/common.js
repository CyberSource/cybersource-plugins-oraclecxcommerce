const replaceCharacterRegex = '~W!C@O#n';

export const replaceSpecialCharacter = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceSpecialCharacter(obj[key]);
      } else{
        obj[key] = obj[key].replaceAll("=", replaceCharacterRegex);
      }
    });
  };