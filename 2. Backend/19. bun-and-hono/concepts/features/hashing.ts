async function hashingOperations() {
  const password = "123456";
  const hash = await Bun.password.hash(password);
  console.log(hash);

  const isMatch = await Bun.password.verify(password, hash);

  console.log(isMatch);

  const argonHashExample = await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 4,
    timeCost: 3,
  });

  console.log(argonHashExample);

  const bcryptHashExample = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  console.log(bcryptHashExample);
}

hashingOperations();
