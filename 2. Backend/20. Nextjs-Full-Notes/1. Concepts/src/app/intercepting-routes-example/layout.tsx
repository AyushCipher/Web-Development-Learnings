// This layout combines two concepts already used elsewhere in this project:
// - a parallel route slot (`modal`, same idea as parallel-routes-example/)
// - that slot happens to be filled by an INTERCEPTING route (see
//   @modal/(.)photos/[id]/page.tsx), which is what makes it behave like a modal
// Both `children` and `modal` render at once, in the same DOM - the "modal"
// look is just `modal`'s content being CSS-positioned as an overlay on top
// of whatever `children` is currently showing.
export default function InterceptingRoutesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Intercepting Routes Example</h1>
      {children}
      {modal}
    </div>
  );
}
