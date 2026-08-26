// Lives at app/(marketing)/about/page.tsx but is served at the URL /about -
// the "(marketing)" segment is a route group and never appears in the path.
function MarketingAboutPage() {
  return <div>MarketingAboutPage</div>;
}

export default MarketingAboutPage;
