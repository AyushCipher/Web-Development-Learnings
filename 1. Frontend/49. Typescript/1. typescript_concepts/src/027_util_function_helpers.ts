// ReturnType<F>
// Parameters<F>
// InstanceType<Ctor>
// ConstructorParameters<C>


// If function changes → types update automatically
function ExtractUserInfo(id: string, isExtraInfo = false) {
  return {
    id,
    name: "Ayush",
    log: isExtraInfo ? "details" : (undefined as string | undefined),
  };
}

type GetUserReturnInfo = ReturnType<typeof ExtractUserInfo>;
type GetUserParamsInfo = Parameters<typeof ExtractUserInfo>;

const argsInfo: GetUserParamsInfo = ["u1", true];
const resultInfo: GetUserReturnInfo = ExtractUserInfo(...argsInfo);

console.log("Auto inferred result:", resultInfo);   // Auto inferred result: { id: 'u1', name: 'Sangam', log: 'details' }




class PersonN1 {
  constructor(public name: string, public age: number) {}

  greet() {
    return `Hi I am this -> ${this.name}`;
  }
}

type PersonInstanceN1 = InstanceType<typeof PersonN1>;
type PersonCtorArgsN1 = ConstructorParameters<typeof PersonN1>;

const resultInfo1: PersonCtorArgsN1 = ["Ayush", 21];
const abc: PersonInstanceN1 = new PersonN1(...resultInfo1);

console.log(abc.greet());
