import React from 'react';
import Main from 'renderer/components/Main';

function searchbar(content: any) {
  console.log(content);
}

function filterOnInput(filter: any) {
  console.log(filter);
}

export default function Settings() {
  const filter = {
    caller: filterOnInput,
    options: [
      { value: 'az', label: 'A-Z' },
      { value: 'za', label: 'Z-A' },
    ],
  };

  return (
    <Main
      title="Settings"
      searchbarCaller={searchbar}
      filterDefinition={filter}
      printActivated="true"
    />
  );
}
