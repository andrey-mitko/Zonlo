import axios from "axios";
import Head from "next/head";
import React from "react";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import { JobListing } from "../../types/JobListing";
import Image from "next/image";
import moment from "moment";

interface Props {
  listing: JobListing;
}

const Listing = (props: Props) => {
  const listing = props.listing;

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

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{listing.title} - Zonlo</title>
        <meta
          name="description"
          content="Find thousands of internships available across the United Kingdom. Explore the different types of internships: Summer, Paid, Full-time, Part-time. Search through various industries: Tech, Finance, Marketing, Data Science and etc."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main
        className={`container max-w-6xl mx-auto justify-between flex flex-col flex-grow`}
      >
        <div className="mb-5 mx-5 ">
          {listing.title !== undefined ? (
            <div className="my-5">
              <div className="py-5 group">
                <div className="lg:flex items-center justify-between">
                  <div className="flex flex-row items-center content-between space-x-4 h-full">
                    {listing.employer.logoUrl !== null &&
                    listing.employer.logoUrl !== "" ? (
                      <img
                        className=" flex-initial rounded-xl bg-gray-50 w-16 h-16 lg:w-20 lg:h-20 lg:rounded-2xl object-cover"
                        src={removeAmp(`${listing.employer.logoUrl}`)}
                      />
                    ) : (
                      <Image
                        src={require("/public/placeholder.png")}
                        width="64px"
                        height="64px"
                        className=" flex-initial rounded-xl bg-gray-50 w-16 h-16 object-cover"
                      />
                    )}
                    <div className="flex-grow flex flex-col space-y-0 lg:space-y-2  justify-start align-top max-w-xl lg:max-w-none">
                      <h1 className="text-lg lg:text-2xl font-semibold ">
                        {removeAmp(listing.title as string)}
                      </h1>
                      <h2 className="text-sm hidden md:block lg:text-lg font-medium mt-2 text-brand-black-secondary">
                        {"💼 " + removeAmp(listing.employer.name as string)} •{" "}
                        {listing.jobLocation["@type"] === "REMOTE"
                          ? "🌏"
                          : "📍"}{" "}
                        {listing.jobLocation.addressLocality},{" "}
                        {listing.jobLocation["@type"] === "REMOTE"
                          ? "Remote"
                          : "UK"}{" "}
                        •
                        {moment().diff(moment(listing.publishedAt), "days") <
                        7 ? (
                          <span className="">
                            {" "}
                            ✨{" "}
                            {capitalizeFirstLetter(
                              moment(listing.publishedAt).fromNow()
                            )}
                          </span>
                        ) : (
                          " 🗓 " +
                          capitalizeFirstLetter(
                            moment(listing.publishedAt).fromNow()
                          )
                        )}
                      </h2>
                      <h2 className="text-md md:hidden lg:text-md font-medium mt-2 text-brand-black-secondary">
                        {removeAmp(listing.employer.name as string)}
                      </h2>
                    </div>
                  </div>
                  <div className="text-sm md:hidden lg:text-md font-medium mt-3 text-brand-black-secondary">
                    <h2>
                      {listing.jobLocation["@type"] === "REMOTE" ? "🌏" : "📍"}{" "}
                      {listing.jobLocation.addressLocality},{" "}
                      {listing.jobLocation["@type"] === "REMOTE"
                        ? "Remote"
                        : "UK"}{" "}
                      •{" "}
                      {moment().diff(moment(listing.publishedAt), "days") <
                      7 ? (
                        <span className="">
                          ✨{" "}
                          {capitalizeFirstLetter(
                            moment(listing.publishedAt).fromNow()
                          )}
                        </span>
                      ) : (
                        " " +
                        capitalizeFirstLetter(
                          moment(listing.publishedAt).fromNow()
                        )
                      )}{" "}
                    </h2>
                  </div>
                  <div className="flex space-x-7 mt-5">
                    {/* <button
                      className="flex-initial lg:opacity-90 lg:group-hover:opacity-100 transition duration-300 ease-in-out hover:bg-brand-green-2 bg-brand-black-primary text-gray-50 lg:text-lg font-semibold flex items-center justify-center h-14 px-10 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToExternalUrl(`${listing.applyUrl}`, true);
                      }}
                    >
                      Apply
                    </button> */}
                  </div>
                </div>
                <hr className="my-5 lg:my-10"></hr>
                <div
                  className="w-full max-w-full lg:text-lg text-brand-black-primary font-medium leading-loose mt-5 lg:mt-10  mb-6 overflow-hidden prose prose-h2:text-xl prose-h1:text-2xl prose-h1:font-semibold prose-h2:font-semibold prose-p:font-normal prose-p:text-brand-black-primary"
                  dangerouslySetInnerHTML={{
                    __html: decodeHTMLEntities(listing.description as string),
                  }}
                ></div>

                <button
                  className="transition duration-300 ease-in-out hover:bg-brand-green-2 bg-brand-black-primary text-gray-50 lg:text-lg font-semibold flex items-center justify-center h-14 w-full rounded-xl lg:mt-10"
                  onClick={() =>
                    navigateToExternalUrl(`${listing.applyUrl}`, true)
                  }
                >
                  Apply for This Internship
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Listing;

export async function getServerSideProps(ctx: any) {
  const { listingId } = ctx.query;

  let environment = process.env.NODE_ENV;
  let urlStart =
    environment === "production"
      ? process.env.PROD_DOMAIN
      : process.env.DEV_DOMAIN;

  try {
    const rawResponse = await axios({
      method: "get",
      url: `${urlStart}/api/job`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        id: listingId,
      },
    });

    const content = rawResponse.data as any;

    return {
      props: {
        listing: content.message,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        listing: null,
      },
    };
  }
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
