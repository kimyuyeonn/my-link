export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center">
        {/* Profile Avatar Placeholder */}
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl text-white font-bold shadow-lg">
          홍
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            홍길동
          </h1>
          <p className="max-w-md text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
            안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Contact Me
          </button>
          <button className="rounded-full border border-zinc-200 bg-white px-6 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900">
            Projects
          </button>
        </div>
      </main>
    </div>
  );
}
