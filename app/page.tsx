import PixiCanvas from './components/PixiCanvas';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-900 font-sans">
      <main className="flex flex-1 w-full flex-col items-center justify-center gap-8 py-16 px-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Streamer Empire
        </h1>
        <p className="text-zinc-400 text-lg">
          Build your streaming empire from bedroom to studio
        </p>
        <PixiCanvas width={800} height={500} />
      </main>
    </div>
  );
}
