type UserN10 = {
  id: string;
  name: string;
  email?: string;
};

function getUserN10<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const userExample: UserN10 = { id: "1", name: "Ayush" };

const extractId = getUserN10(userExample, "id");  // "1" 
const extractName = getUserN10(userExample, "name");  // "Ayush" 


// If wanted to change the name field value
function setUserPropN7<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}

setUserPropN7(userExample, "name", "Anish") // userExample.name is now "Anish"