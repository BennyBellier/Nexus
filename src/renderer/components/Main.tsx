// import { useState } from 'react';
import 'tailwindcss/tailwind.css';
import { HiPrinter } from 'react-icons/hi';
import { TbSearch } from 'react-icons/tb';
import { ButtonSecondary } from './Button';
import Filter from './Filter';

export default function Main({
  children,
  className,
  title,
  searchbarCaller,
  filterDefinition,
  printActivated,
  infoContent,
}: any) {
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      searchbarCaller(event.target.value);
    }
  };

  // const handleFilterChange = (event: any) => {
  //   console.log('handler:', event.target.value);
  // };

  let searchbar = null;
  if (searchbarCaller != null) {
    searchbar = (
      <div className="border border-slate-400 p-1 rounded-lg w-max grid grid-cols-[1fr] items-center">
        <TbSearch className="absolute text-slate-400 w-4 h-4 z-0" />
        <input
          type="text"
          onKeyDown={handleKeyDown}
          className="bg-transparent pl-5 outline-none"
        />
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
      <ButtonSecondary onClick={handlePrint}>
        <HiPrinter className="w-5 h-5" /> Print
      </ButtonSecondary>
    );
  }

  let titleElement = null;
  if (title != null) {
    titleElement = <h1 className="text-xl font-semibold">{title}</h1>;
  }

  let info = null;
  if (infoContent != null) {
    info = (
      <div className="flex flex-row gap-2 items-center text-slate-800 bg-slate-200 rounded-md border border-slate-800 py-1 px-2">
        {infoContent}
      </div>
    );
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
        <div className="flex flex-row items-center gap-4">
          {titleElement}
          {info}
        </div>
        <div className="w-[50%] flex flex-row items-center justify-end gap-10 pr-5">
          {searchbar}
          {filter}
          {print}
        </div>
      </div>
    );
  }

  return (
    <main
      className={`bg-transparent overflow-hidden w-full p-4 text-slate-800 ${className}`}
    >
      {head}
      {children}
    </main>
  );
}
