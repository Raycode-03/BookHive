export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen">

      {/* CONTENT WRAPPER */}
      <div className="  min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4   ">
          {children}
      </div>
    </div>
  );
}
