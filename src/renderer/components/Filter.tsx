import 'tailwindcss/tailwind.css';

export default function Filter() {
  return (
    <div className="border border-slate-400 text-slate-800 rounded-lg p-1">
      Filter
    </div>
  );
}

// function FilterSpawner({ caller, items }: any) {
//   const [filter, setFilter] = useState('Filter');
//   const [collapsed, setCollapsed] = useState(true);

//   const handleFilterChange = (newFilter: any) => {
//     console.log('handler:', newFilter);
//     caller(newFilter);
//     setFilter(newFilter);
//   };

//   return (
//     <div>
//       <button
//         type="button"
//         className="group border border-slate-400 p-2 rounded-lg focus:border-sky-400 text-slate-800 w-26"
//       >
//         <FilterAltRounded />
//         {filter}
//         <ExpandMoreRounded className="transform group-focus:rotate-180 duration-200" />
//       </button>
//       <ul
//         className={` ${
//           collapsed ? 'flex' : ''
//         } flex-col gap-1 border border-slate-400 translate-y-1 rounded-md p-2 px-6 items-center`}
//       >
//         {items.map((item: any) => (
//           <li key={item.value}>
//             <button
//               type="button"
//               onClick={() => {
//                 handleFilterChange(item.value);
//               }}
//               value={item.value}
//             >
//               {item.label}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
