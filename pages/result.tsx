import React, { useEffect, useState } from "react";
import axios from "axios";
import ListingCreated from "../components/ListingCreated";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import Head from "next/head";
interface Props {
  data: any;
}

const Result = (props: Props) => {
  let createListingData: any | null = null;

  const [isLoading, setLoading] = useState(false);
  const [isListingCreated, setListingCreated] = useState(false);
  if (props.data !== null) {
    createListingData = props.data.session.metadata;
  }
  const data = props.data;

  useEffect(() => {
    // Update the document title using the browser API
    addListingToDB();
  }, []);

  async function addListingToDB() {
    setLoading(true);
    if (props.data.session.payment_status === "paid") {
      try {
        const rawResponse = await fetch("/api/jobs", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: createListingData.type,
            title: createListingData.title,
            description: createListingData.description,
            jobLocation: {
              type: createListingData.locationType,
              addressCountry: createListingData.locationCountry,
              addressLocality: createListingData.addressLocality,
              latitude: 0,
              longitude: 0,
            },
            employer: {
              customerId: props.data.session.customer,
              subscriptionId: props.data.session.subscription,
              name: createListingData.companyName,
              logoUrl: createListingData.companyLogoUrl,
              primaryEmail: createListingData.companyPrimaryEmail,
            },
            publishedAt: createListingData.publishedAt,
            validThrough: createListingData.validThrough,
            applyUrl: createListingData.applyUrl,
            primaryCategory: createListingData.primaryCategory,
          }),
        });
        const content = await rawResponse.json();
        if (content.success === true) {
          setLoading(false);
          setListingCreated(true);
        } else {
          alert("Something went wrong :( Please try again later!");
          setLoading(false);
        }
        console.log(content);
      } catch (err) {
        alert("Something went wrong :( Please try again later!");
        console.log(err);
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>
          {isListingCreated
            ? "Zonlo - Listing Created"
            : "Zonlo - Creating Listing"}
        </title>
        <meta
          name="description"
          content="Find thousands of internships available across the United Kingdom. Explore the different types of internships: Summer, Paid, Full-time, Part-time. Search through various industries: Tech, Finance, Marketing, Data Science and etc."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />

      {isListingCreated ? (
        <ListingCreated
          email={
            data !== undefined ? props.data.session.customer_details.email : ""
          }
        />
      ) : (
        <h1 className="container max-w-6xl mx-auto flex-grow flex flex-col items-center justify-center text-center font-semibold text-2xl mt-5 text-brand-black-secondary">
          Creating Listing... Please don't close the tab!
        </h1>
      )}

      {/* <div>
        <h1>Payment Result</h1>
        <pre>{JSON.stringify(props.data, null, 2) ?? "Loading..."}</pre>
      </div> */}
      <Footer />
    </div>
  );
};

export default Result;

export async function getServerSideProps(ctx: any) {
  const session_id = ctx.query.session_id;

  let environment = process.env.NODE_ENV;
  let urlStart =
    environment === "production"
      ? process.env.PROD_DOMAIN
      : process.env.DEV_DOMAIN;

  try {
    const rawResponse = await axios({
      method: "get",
      url: `${urlStart}/api/checkout/status`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        id: session_id,
      },
    });

    const content = rawResponse.data as any;

    return {
      props: {
        data: content,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        data: null,
      },
    };
  }
}
