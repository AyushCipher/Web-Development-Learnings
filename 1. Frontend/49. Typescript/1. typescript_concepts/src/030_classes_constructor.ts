class UserN15 {
  id: string;
  name: string;
  email?: string;
  createdAt: Date = new Date(); // init at declaration -> OK

  constructor(id: string, name: string, email?: string) {
    // assign all required fields here
    this.id = id;
    this.name = name;
    if (email) this.email = email;
  }
}

const result4 = new UserN15("1", "ayush");
const result5 = new UserN15("2", "anish", "test123@gmail.com");

// class Bad{
//     a: string;
//     constructor(){}
// }

// class AlsoBad{
//     a: string;
//     constructor(){}
// }
