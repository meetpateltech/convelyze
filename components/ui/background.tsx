export default function Background() {
  return (
    <div className="w-screen min-h-screen fixed z-10 flex justify-center p-[120px_24px_160px_24px] pointer-events-none">
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle,rgba(2,0,36,0)_0,#fafafa_100%)] dark:bg-[radial-gradient(circle,rgba(2,0,36,0)_0,#111827_100%)]" />
      <div 
        className="absolute inset-0 z-10 opacity-40 filter invert dark:invert-0"
        style={{
          backgroundImage: "url(/burst-bg-optimized.svg)"
        }}
      />
      <div 
        className="absolute z-30 w-full max-w-[640px] h-full top-20 opacity-15 dark:opacity-5"
        style={{
          backgroundImage: `radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%), 
                            radial-gradient(at 97% 21%, hsla(0, 100%, 50%, 1) 0px, transparent 50%),
                            radial-gradient(at 52% 99%, hsla(120, 100%, 50%, 1) 0px, transparent 50%),
                            radial-gradient(at 10% 29%, hsla(60, 100%, 50%, 1) 0px, transparent 50%),
                            radial-gradient(at 97% 96%, hsla(180, 100%, 50%, 1) 0px, transparent 50%),
                            radial-gradient(at 33% 50%, hsla(240, 100%, 50%, 1) 0px, transparent 50%),
                            radial-gradient(at 79% 53%, hsla(300, 100%, 50%, 1) 0px, transparent 50%)`,
          filter: "blur(100px) saturate(150%)"
        }}
      />
    </div>
  )
}