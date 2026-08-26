// Q. WHY NOT A SEPARATE `Conversation` COLLECTION TO TRACK WHO'S TALKING TO
//    WHOM, THE WAY YOU MIGHT EXPECT?
// Ans - For 1:1 direct messages, a conversation is fully and deterministically
// defined by exactly two participant ids - there's nothing else to store
// about "the conversation" itself (no title, no member list that can change
// over time, no settings). So instead of creating a Conversation document up
// front and looking up its id on every message, we just DERIVE a stable id
// from the two user ids: sort them as strings and join with ":". Sorting
// means it doesn't matter who happens to be "sender" and who is "recipient"
// on any given message - both participants always compute the exact same
// conversationId, so every message between them naturally lands in the same
// bucket. A group-chat feature would need a real Conversation collection
// (member lists change, a group needs a name, etc.) but that's out of scope
// here - see this service's README, "Known limitations".
function buildConversationId(userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join(":");
}

module.exports = { buildConversationId };
