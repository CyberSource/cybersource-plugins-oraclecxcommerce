const replaceCharacterRegex = '~W!C@O#n';

export const replaceSpecialCharacter = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceSpecialCharacter(obj[key]);
      } else if(typeof obj[key] === "string"){ 
        obj[key] = obj[key].replaceAll("=", replaceCharacterRegex);
      }
    });
  };