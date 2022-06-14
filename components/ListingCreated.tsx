import React from "react";
import { useRouter } from "next/router";

interface Props {
  email: string;
}

const ListingCreated = (props: Props) => {
  const router = useRouter();

  function handleClick() {
    navigateToExternalUrl("/create");
  }

  const navigateToExternalUrl = (
    url: string,
    shouldOpenNewTab: boolean = false
  ) =>
    shouldOpenNewTab
      ? window.open(url, "_blank")
      : (window.location.href = url);

  return (
    <div className="container max-w-6xl mx-auto flex-grow flex flex-col items-center justify-center">
      <h1 className="text-center font-semibold text-4xl mt-5">Thank you!</h1>
      <h1 className="text-center font-normal text-xl mt-5 text-brand-black-secondary px-3">
        You should recieve an email with edit link on your email:{" "}
        <b>{props.email}</b>
      </h1>
      <button
        onClick={handleClick}
        className="mt-7 flex-initial text-lg transition duration-300 ease-in-out hover:bg-brand-green-2 bg-brand-black-primary text-gray-50 font-medium flex items-center justify-center py-3 px-10 rounded-xl"
      >
        Create one more listing
      </button>
    </div>
  );
};

export default ListingCreated;
