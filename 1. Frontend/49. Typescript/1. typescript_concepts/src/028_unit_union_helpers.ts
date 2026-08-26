// Filtering types: We have a big set of values → we remove or keep some


// Exclude<U, V> -> remove from U those member assignable to V
// Extract<U, V> -> keep from U those members assignable to V
// Non-nullable


type EventType1 = "click" | "submit" | "hover" | "keydown" | "keyup";
type EventType2 = Exclude<EventType1, "keydown">;

function handleEvent1(e: EventType2) {
  console.log(e);
}

// handleEvent1('keydown')    -> error, not assignable as it is removed from EventType1


type ActionsN1 = "create" | "update" | "delete" | "read";
type ActionsN2 = Extract<ActionsN1, "create" | "update" | "delete">;

function handleEvent2(e: ActionsN2) {
  console.log(e);
}

// handleEvent2('read')     -> error, not assignable as it is not present in ActionsN2


type MayBeNumber = number | null | undefined;
type CleanNumber = NonNullable<MayBeNumber>; // number

function square(num: CleanNumber) {
  return num * 2;
}

square(10);
// square(null)           -> error, since null is not assignable to CleanNumber
// square(undefined)      -> error, since undefined is not assignable to CleanNumber