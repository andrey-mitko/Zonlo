import React, { useEffect, useState } from "react";

interface Props {
  searchFunction: (isAdditional?: boolean) => Promise<void>;
  onSearchChange: (searchString: string) => void;
  searchString: string;
}

const SearchComponent = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Send Axios request here
      props.searchFunction();
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="lg:flex flex-initial flex-row h-full items-center justify-between mx-5 lg:mt-6">
      <div className="lg:flex flex-row h-full items-center lg:space-x-4 lg:w-full">
        <div className="relative text-brand-black-primary h-14 lg:w-full my-4 lg:my-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-5">
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input
            type="text"
            name="q"
            className="border-none text-lg font-semibold rounded-xl lg:rounded-tr-none lg:rounded-br-none placeholder-brand-black-tertiary text-brand-black-primary bg-brand-elementBG pl-14 focus:outline-none h-full w-full "
            placeholder="Search..."
            autoComplete="off"
            onChange={(e) => {
              setSearchTerm(e.target.value),
                props.onSearchChange(e.target.value);
            }}
          />
        </div>
        {/* <div className="flex flex-row h-14 my-4 space-x-4">
                    <button className="w-1/2 lg:w-max lg:px-10 text-lg font-semibold rounded-xl text-brand-black-tertiary bg-brand-elementBG">💼  Any Category</button>
                    <button className="w-1/2 lg:w-max lg:px-10 text-lg font-semibold rounded-xl text-brand-black-tertiary bg-brand-elementBG">💸  Any Salary</button>
                </div> */}
      </div>
      <button
        className="transition duration-300 ease-in-out hover:bg-brand-green-3 hover:text-gray-50 bg-brand-green-4 text-brand-green-2 text-lg font-bold flex items-center justify-center h-14 w-full lg:w-max lg:px-10 rounded-xl lg:rounded-tl-none lg:rounded-bl-none "
        onClick={() => {
          console.log(props.searchString);
          props.searchFunction();
        }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchComponent;
