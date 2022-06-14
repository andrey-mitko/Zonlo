import { JobListing } from "../types/JobListing";
import { useState, useCallback, useEffect } from "react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/router";

interface Props {
  job: JobListing;
}

const JobListingCard = (props: Props) => {
  const job = props.job;
  const [isMoreInfo, setMoreInfo] = useState(false);

  function truncate(str: string, no_words: number, suffix: string): string {
    if (wordCount(str) > no_words) {
      return `${str.split(" ").splice(0, no_words).join(" ")}${suffix}`;
    } else {
      return str;
    }
  }

  function wordCount(str: string): number {
    const strng = str + "";
    return strng.split(" ").length;
  }

  function decodeHTMLEntities(text: string): string {
    var entities = [
      ["amp", "&"],
      ["apos", "'"],
      ["#x27", "'"],
      ["#x2F", "/"],
      ["#39", "'"],
      ["#47", "/"],
      ["lt", "<"],
      ["gt", ">"],
      ["nbsp", " "],
      ["quot", '"'],
    ];

    for (var i = 0, max = entities.length; i < max; ++i)
      text = text.replace(
        new RegExp("&" + entities[i][0] + ";", "g"),
        entities[i][1]
      );

    return text;
  }

  function removeAmp(text: string): string {
    return text.replace(/amp;/g, "");
  }

  function capitalizeFirstLetter(string: string): string {
    return string.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );
  }

  const navigateToExternalUrl = (
    url: string,
    shouldOpenNewTab: boolean = true
  ) =>
    shouldOpenNewTab
      ? window.open(url, "_blank")
      : (window.location.href = url);

  const useMediaQuery = (width: any) => {
    const [targetReached, setTargetReached] = useState(false);

    const updateTarget = useCallback((e) => {
      if (e.matches) {
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

  const isBreakpoint = useMediaQuery(1024);
  const router = useRouter();
  return (
    <div className="mb-5 mx-5 ">
      {job.title !== undefined ? (
        <div className="">
          <div
            className="py-5 cursor-pointer group"
            onClick={() => {
              setMoreInfo(!isMoreInfo);
              let newWindow = !isMoreInfo ? `/listings/${job._id}` : "/";
              window.history.pushState("", "", newWindow);
            }}
          >
            <div className="lg:flex items-center justify-between">
              <div className="flex flex-row items-center content-between space-x-4 h-full">
                {job.employer.logoUrl !== null &&
                job.employer.logoUrl !== "" ? (
                  <img
                    className=" flex-initial rounded-xl bg-gray-50 w-16 h-16 object-cover"
                    src={removeAmp(`${job.employer.logoUrl}`)}
                  />
                ) : (
                  <Image
                    src={require("../public/placeholder.png")}
                    width="64px"
                    height="64px"
                    className=" flex-initial rounded-xl bg-gray-50 w-16 h-16 object-cover"
                  />
                )}
                <div className="flex-grow flex flex-col space-y-0 justify-start align-top max-w-xl">
                  <h2 className="text-lg lg:text-2xl font-semibold ">
                    {removeAmp(job.title as string)}
                  </h2>
                  <h3 className="text-sm hidden lg:block lg:text-md font-medium mt-2 text-brand-black-secondary">
                    {"💼 " + removeAmp(job.employer.name as string)} •{" "}
                    {job.jobLocation["@type"] === "REMOTE" ? "🌏" : "📍"}{" "}
                    {job.jobLocation.addressLocality},{" "}
                    {job.jobLocation["@type"] === "REMOTE" ? "Remote" : "UK"} •
                    {moment().diff(moment(job.publishedAt), "days") < 7 ? (
                      <span className="">
                        {" "}
                        ✨{" "}
                        {capitalizeFirstLetter(
                          moment(job.publishedAt).fromNow()
                        )}
                      </span>
                    ) : (
                      " 🗓 " +
                      capitalizeFirstLetter(moment(job.publishedAt).fromNow())
                    )}
                  </h3>
                  <h3 className="text-sm lg:hidden lg:text-md font-medium mt-2 text-brand-black-secondary">
                    {removeAmp(job.employer.name as string)}
                  </h3>
                </div>
              </div>
              <div className="text-sm lg:hidden lg:text-md font-medium mt-2 text-brand-black-secondary">
                <h3>
                  {job.jobLocation["@type"] === "REMOTE" ? "🌏" : "📍"}{" "}
                  {job.jobLocation.addressLocality},{" "}
                  {job.jobLocation["@type"] === "REMOTE" ? "Remote" : "UK"} •{" "}
                  {moment().diff(moment(job.publishedAt), "days") < 7 ? (
                    <span className="">
                      ✨{" "}
                      {capitalizeFirstLetter(moment(job.publishedAt).fromNow())}
                    </span>
                  ) : (
                    " " +
                    capitalizeFirstLetter(moment(job.publishedAt).fromNow())
                  )}{" "}
                </h3>
              </div>
              <div className="flex space-x-7 mt-5">
                <button
                  className="lg:opacity-0 lg:group-hover:opacity-100 flex flex-grow transition duration-300 ease-in-out hover:text-brand-black-secondary bg-brand-elementBG text-brand-black-tertiary lg:text-lg font-semibold items-center justify-center h-14 w-full lg:px-10 rounded-xl"
                  onClick={() => setMoreInfo(!isMoreInfo)}
                >
                  {isMoreInfo
                    ? "Hide Details"
                    : isBreakpoint
                    ? "View More Details"
                    : "Show Details"}
                </button>
                <button
                  className="flex-initial lg:opacity-90 lg:group-hover:opacity-100 transition duration-300 ease-in-out hover:bg-brand-green-2 bg-brand-black-primary text-gray-50 lg:text-lg font-semibold flex items-center justify-center h-14 px-10 rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToExternalUrl(`${job.applyUrl}`, true);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

            {isMoreInfo ? (
              <>
                {/* <ReactMarkdown
                                className="text-lg text-brand-black-primary font-medium leading-loose mt-5 mb-6"
                                children={decodeHTMLEntities(job.description as string)}
                                remarkPlugins={[remarkGfm]} 
                            /> */}
                <div
                  className="w-full max-w-full lg:text-lg text-brand-black-primary font-medium leading-loose mt-5 mb-6 overflow-hidden prose prose-h2:text-xl prose-h1:text-2xl prose-h1:font-semibold prose-h2:font-semibold prose-p:font-normal prose-p:text-brand-black-primary"
                  dangerouslySetInnerHTML={{
                    __html: decodeHTMLEntities(job.description as string),
                  }}
                ></div>

                <button
                  className="transition duration-300 ease-in-out hover:bg-brand-green-2 bg-brand-black-primary text-gray-50 lg:text-lg font-semibold flex items-center justify-center h-14 w-full rounded-xl"
                  onClick={() => navigateToExternalUrl(`${job.applyUrl}`, true)}
                >
                  Apply for This Internship
                </button>
              </>
            ) : null}
          </div>
          <hr className="my-6"></hr>
        </div>
      ) : null}
    </div>
  );
};

export default JobListingCard;

// https://media-exp1.licdn.com/dms/image/C4D0BAQFjXFKLkz65KA/company-logo_200_200/0/1613065324525?e=1648080000&v=beta&t=HT-SeMERS5eYF6oS1ludyHpVWtBeyZOKHp5m0xklNaQ
// https://media-exp1.licdn.com/dms/image/C4D0BAQFjXFKLkz65KA/company-logo_200_200/0/1613065324525?e=1648080000&amp;v=beta&amp;t=HT-SeMERS5eYF6oS1ludyHpVWtBeyZOKHp5m0xklNaQ

// https://media-exp1.licdn.com/dms/image/C4D0BAQGFlEgbdMrg1g/company-logo_200_200/0/1526405317129?e=1648080000&amp;v=beta&t=uF7Q5kicW3NkcSkdObIm-6n3r-ZZAw7Hx6YJHCt6Z6Q
