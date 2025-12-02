export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center text-center font-sans">
      <div className="flex items-center">
        <h1 className="inline-block border-r border-black/30 dark:border-white/30 pr-[23px] mr-5 text-2xl font-medium leading-[49px]">
          404
        </h1>
        <div className="inline-block">
          <h2 className="text-sm font-normal leading-[49px] m-0">
            This page could not be found.
          </h2>
        </div>
      </div>
    </div>
  );
}
