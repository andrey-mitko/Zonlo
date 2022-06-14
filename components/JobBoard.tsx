import React, { useEffect, useState } from "react";
import JobListingCard from "../components/JobListingCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { JobListing } from "../types/JobListing";

interface Props {
  jobs: JobListing[];
  next: any;
}

const JobBoard = (props: Props) => {
  const [jobNumberBeforeNext, setJobNumberBeforeNext] = useState(0);

  function callNext() {
    setJobNumberBeforeNext(props.jobs.length);
    props.next();
  }

  useEffect(() => {
    // Update the document title using the browser API
  });

  return (
    <>
      {props.jobs.length > 0 ? (
        <div className="flex-grow">
          <InfiniteScroll
            className="mt-6 flex-grow w-full max-w-full"
            dataLength={props.jobs.length}
            next={callNext}
            hasMore={jobNumberBeforeNext !== props.jobs.length}
            loader={<h5>Loading...</h5>}
            scrollThreshold={0.8}
            endMessage={
              <div className=" flex flex-col justify-center items-center space-y-1 my-14">
                <p className=" flex justify-center items-center text-center text-xl text-brand-black-tertiary font-bold">
                  You have seen it all!
                </p>
                <p className="flex justify-center items-center text-center text-sm text-brand-black-tertiary font-normal opacity-80">
                  No more available listings
                </p>
              </div>
            }
          >
            {props.jobs.map((job) => (
              <JobListingCard key={job._id} job={job} />
            ))}
          </InfiniteScroll>
        </div>
      ) : (
        <div className=" flex flex-col flex-grow items-center justify-center">
          <h3 className="text-3xl font-semibold text-brand-black-primary -mt-20">
            No Jobs 🌵
          </h3>
          <h4 className=" md:text-xl font-medium text-brand-black-secondary mt-3">
            Adjust your query and try searching again!
          </h4>
        </div>
      )}
    </>
  );
};

export default JobBoard;
