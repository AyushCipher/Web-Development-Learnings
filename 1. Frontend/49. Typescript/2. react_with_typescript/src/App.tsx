import { UserCard } from "./components/01_RequiredOptionalProps";
import { GreetA, GreetB } from "./components/02_DefaultProps";
import {
  Panel,
  RequiredChildrenPanel,
} from "./components/03_ChildrenReactNode";
import { Button } from "./components/05_ComponentProps";
import { Counter } from "./components/06_state";

function App() {
  return (
    <>
      {/* <UserCard id={"1"} name="Ayush" subtitle={<p>Nested P</p>} />
      <GreetA />
      <GreetA name="Raj" />
      <GreetB name="Mr. Bean" /> shout=true*/}

      {/* <Panel
        title="Panel"
        children={
          <ul>
            <li>one</li>
          </ul>
        }
      />

      <RequiredChildrenPanel title="hello">
        Some content here
      </RequiredChildrenPanel> */}

      {/* <Button variant="primary" onClick={() => alert("clicked")}>
        Text
      </Button> */}

      {/* <Counter /> */}
    </>
  );
}

export default App;
