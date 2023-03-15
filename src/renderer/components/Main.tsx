import 'tailwindcss/tailwind.css';

export default function Main({ children, className }: any) {
  return (
    <main className={`bg-transparent w-full p-4 ${className}`}>{children}</main>
  );
}
