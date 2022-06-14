import React from "react";
import { useRouter } from "next/router";

interface Props {
  isListingDeleted: boolean;
}

const ListingUpdated = (props: Props) => {
  const router = useRouter();

  function reloadPage() {
    if (props.isListingDeleted) {
      navigateToExternalUrl("/", false);
    } else {
      router.reload();
    }
  }

  const navigateToExternalUrl = (
    url: string,
    shouldOpenNewTab: boolean = true
  ) =>
    shouldOpenNewTab
      ? window.open(url, "_blank")
      : (window.location.href = url);

  return (
    <div className="container max-w-6xl mx-auto flex-grow flex flex-col items-center justify-center">
      <h1 className="text-center font-semibold text-4xl mt-5">
        {props.isListingDeleted ? <>Listing Deleted!</> : <>Listing Updated!</>}
      </h1>
      <h1 className="text-center font-normal text-xl mt-5 text-brand-black-secondary px-3">
        {props.isListingDeleted ? (
          <> Your listing has been deleted successfully.</>
        ) : (
          <> Your listing has been successfully updated.</>
        )}
      </h1>
      <button
        onClick={reloadPage}
        className="mt-7 flex-initial text-lg transition duration-300 ease-in-out hover:bg-brand-green-2 bg-brand-black-primary text-gray-50 font-medium flex items-center justify-center py-3 px-10 rounded-xl"
      >
        {props.isListingDeleted ? (
          <> Go back to explore page</>
        ) : (
          <> Go back to edit page</>
        )}
      </button>
    </div>
  );
};

export default ListingUpdated;
