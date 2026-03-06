const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="brand-shell min-h-screen lg:pl-20">
      <div className="relative max-w-screen-xl lg:mx-auto mx-4">{children}</div>
    </main>
  );
};

export default Layout;
