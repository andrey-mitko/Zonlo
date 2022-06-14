import React, { ReactElement } from "react";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import mixpanel from "mixpanel-browser";
interface Props {}

function NavBar({}: Props): ReactElement {
  const useMediaQuery = (width: any) => {
    const [targetReached, setTargetReached] = useState(false);

    const updateTarget = useCallback((e) => {
      if (e.matches) {
        console.log("");
        setTargetReached(true);
      } else {
        setTargetReached(false);
      }
    }, []);

    useEffect(() => {
      const media = window.matchMedia(`(max-width: ${width}px)`);
      media.addEventListener("change", updateTarget);

      // Check on mount (callback is not called until a change occurs)
      if (media.matches) {
        setTargetReached(true);
      }

      return () => media.removeEventListener("change", updateTarget);
    }, []);

    return targetReached;
  };

  const isBreakpoint = useMediaQuery(1023);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function toggleMobileMenu() {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  const navigateToExternalUrl = (
    url: string,
    shouldOpenNewTab: boolean = true
  ) =>
    shouldOpenNewTab
      ? window.open(url, "_blank")
      : (window.location.href = url);

  function clickedCreate() {
    mixpanel.track("Create Clicked", {
      source: "Zonlo Site",
    });
  }

  return (
    <nav>
      <div className="bg-white flex w-full items-center h-20">
        <h1
          className="flex-grow text-4xl font-bold ml-5 lg:ml-10 cursor-pointer"
          onClick={() => {
            navigateToExternalUrl("/", false);
          }}
        >
          Zonlo
        </h1>
        {!isBreakpoint ? (
          <div className="flex flex-row text-xl font-medium space-x-14 h-full items-center justify-between">
            <h1
              className="flex-grow cursor-pointer"
              onClick={() => {
                navigateToExternalUrl("/", false);
              }}
            >
              Explore
            </h1>

            <h1 className="flex-grow cursor-pointer">
              <Link href="/about">About</Link>
            </h1>
            <a
              className="flex-grow cursor-pointer"
              href="mailto:andrey@zonlo.co.uk"
            >
              Contact
            </a>
            <Link href="/create">
              <h1
                className="flex-grow bg-brand-black-primary text-gray-50 h-full px-9 flex items-center justify-center cursor-pointer hover:bg-brand-black-secondary"
                onClick={clickedCreate}
              >
                Post Listing
              </h1>
            </Link>
          </div>
        ) : (
          <button
            className="lg:hidden flex-initial flex items-center justify-center z-40 w-20 h-20 bg-gray-900 text-gray-50"
            onClick={isMobileMenuOpen ? () => {} : toggleMobileMenu}
          >
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </div>
      <aside
        className={`lg:hidden rounded-xl absolute transform top-4 left-4 shadow-2xl right-4 bg-white h-96 z-50 ease-in-out transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="flex flex-row justify-between mt-2">
          <h3
            className="ml-5 text-sm font-medium mt-4"
            style={{ color: "#8898AA" }}
          >
            MENU
          </h3>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            onClick={toggleMobileMenu}
            className="mr-3"
          >
            <title>Close mobile navigation</title>
            <path
              d="M25.6 14.3a1 1 0 0 1 0 1.4l-4.24 4.25 4.25 4.24a1 1 0 1 1-1.42 1.42l-4.24-4.25-4.24 4.25a1 1 0 0 1-1.42-1.42l4.25-4.24-4.25-4.24a1 1 0 0 1 1.42-1.42l4.24 4.25 4.24-4.25a1 1 0 0 1 1.42 0z"
              fill="#8898AA"
              fillRule="evenodd"
            ></path>
          </svg>
        </div>
        <div className=" mt-6 text-xl w-full flex flex-col pl-5 font-semibold space-y-4">
          <h4
            className="cursor-pointer"
            onClick={() => {
              navigateToExternalUrl("/", false);
            }}
          >
            Explore
          </h4>
          <h4 className="cursor-pointer">
            {" "}
            <Link href="/about">About</Link>
          </h4>
          <a className="cursor-pointer" href="mailto:andrey@zonlo.co.uk">
            Contact
          </a>
        </div>
        <div className="absolute bottom-6 flex flex-col items-center justify-center w-full ">
          <button
            className="flex-initial text-xl transition duration-300 ease-in-out hover:bg-brand-green-2 bg-brand-black-primary text-gray-50 font-semibold flex items-center justify-center h-14 px-10 rounded-xl"
            onClick={clickedCreate}
          >
            <Link href="/create">Post Listing</Link>
          </button>
        </div>
      </aside>

      <div className="h-11 bg-gradient-to-r from-brand-green-gradient-dark to-brand-green-gradient-light flex items-center justify-center">
        <h2 className="font-semibold text-md text-brand-green-1">
          Internships across United Kingdom
        </h2>
      </div>
    </nav>
  );
}

export default NavBar;
