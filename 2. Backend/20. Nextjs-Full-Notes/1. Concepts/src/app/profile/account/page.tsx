// Static nested route at /profile/account - shows that route folders can
// nest arbitrarily deep; there's no layout.tsx here so it just inherits
// whatever wraps /profile (in this case, only the root layout).
function Account() {
  return <h1>Account page</h1>;
}

export default Account;
