import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { Dispatch, useState } from "react";
import { JobListing } from "../types/JobListing";
import NavBar from "../components/NavBar";
import JobBoard from "../components/JobBoard";
import Footer from "../components/Footer";
import SearchComponent from "../components/SearchComponent";
import * as ga from "../lib/ga";
import mixpanel from "mixpanel-browser";

type HomeProps = {
  jobs: String;
};

const Home: NextPage = (props: any) => {
  const [jobs, setJobs]: [JobListing[], Dispatch<any>] = useState(props.jobs);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearchString, setCurrentSearchString] = useState("");

  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));

  const getJobs = async (isAdditional: boolean = false) => {
    setIsLoading(true);
    let skipValue = isAdditional ? jobs.length : 0;
    let fetchString = `/api/jobs?skip=${skipValue}&jobNumber=25&searchString=${currentSearchString}`;
    let response = await fetch(fetchString);

    if (currentSearchString !== "") {
      ga.event({
        action: "search",
        params: {
          search_term: currentSearchString,
        },
      });
      
      mixpanel.track("search_jobs", {
        search_term: currentSearchString,
      });
    }

    // extract the data
    let data = await response.json();
    let newJobs = data.message;
    let newArray = isAdditional ? await [...jobs, ...newJobs] : await newJobs;
    setJobs(newArray);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Zonlo - Internships Across UK</title>
        <meta
          name="description"
          content="Find thousands of internships available across the United Kingdom. Explore the different types of internships: Summer, Paid, Full-time, Part-time. Search through various industries: Tech, Finance, Marketing, Data Science and etc."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main
        className={`${styles.main} container max-w-6xl mx-auto justify-between flex flex-col flex-grow`}
      >
        <SearchComponent
          searchFunction={getJobs}
          searchString={currentSearchString}
          onSearchChange={setCurrentSearchString}
        />
        <JobBoard next={() => getJobs(true)} jobs={jobs} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;

export async function getServerSideProps(ctx: any) {
  // request posts from api
  let environment = process.env.NODE_ENV;
  let prodDomain = process.env.PROD_DOMAIN;
  let devDomain = process.env.DEV_DOMAIN;
  let urlStart = environment === "production" ? prodDomain : devDomain;
  let response = await fetch(`${urlStart}/api/jobs`);
  // extract the data
  let data = await response.json();
  let jobs = data.message;

  return {
    props: {
      jobs: jobs,
    },
  };
}
