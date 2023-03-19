import { useState } from 'react';
import 'tailwindcss/tailwind.css';
import {
  SearchRounded,
  PrintRounded,
  FilterAltRounded,
  ExpandMoreRounded,
} from '@mui/icons-material';
import Filter from './Filter';

export default function Main({
  children,
  className,
  title,
  searchbarCaller,
  filterDefinition,
  printActivated,
}: any) {
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      searchbarCaller(event.target.value);
    }
  };

  const handleFilterChange = (event: any) => {
    console.log('handler:', event.target.value);
  };

  let searchbar = null;
  if (searchbarCaller != null) {
    searchbar = (
      <div className="border border-slate-400 p-1 rounded-lg w-fit">
        <SearchRounded className="text-slate-400" />
        <input type="text" onKeyDown={handleKeyDown} />
      </div>
    );
  }

  let filter = null;
  if (filterDefinition != null) {
    filter = <Filter />;
  }

  const handlePrint = () => {
    console.log('Print');
  };

  let print = null;
  if (printActivated != null) {
    print = (
      <button
        type="button"
        onClick={handlePrint}
        className="border border-slate-400 p-1 rounded-lg"
      >
        <PrintRounded />
        <span>Print</span>
      </button>
    );
  }

  let titleElement = null;
  if (title != null) {
    titleElement = <h1 className="text-xl font-semibold">{title}</h1>;
  }

  let head = null;
  if (
    titleElement != null ||
    searchbar != null ||
    filter != null ||
    print != null
  ) {
    head = (
      <div className="flex flex-row justify-between items-center max-h-9 h-9">
        {titleElement}
        <div className="w-[50%] flex flex-row items-center justify-end gap-10 pr-5">
          {searchbar}
          {filter}
          {print}
        </div>
      </div>
    );
  }

  return (
    <main className={`bg-transparent w-full p-4 text-slate-800 ${className}`}>
      {head}
      {children}
    </main>
  );
}
