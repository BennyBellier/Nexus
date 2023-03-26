import 'tailwindcss/tailwind.css';

export function ButtonPrimary({ children, className, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-slate-400 p-1 px-2 rounded-lg flex flex-rows gap-2 justify-center items-center text-slate-50 hover:bg-slate-500 hover:scale-95 duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonSecondary({ children, className, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border border-slate-400 p-1 rounded-lg flex flex-rows gap-2 justify-center items-center hover:border-transparent hover:bg-slate-400 hover:scale-95 duration-200 hover:text-slate-50 ${className}`}
    >
      {children}
    </button>
  );
}
