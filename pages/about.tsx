import Head from "next/head";
import React from "react";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

interface Props {}

const About = (props: Props) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Zonlo - About</title>
        <meta
          name="description"
          content="Find thousands of internships available across the United Kingdom. Explore the different types of internships: Summer, Paid, Full-time, Part-time. Search through various industries: Tech, Finance, Marketing, Data Science and etc."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main
        className={`container max-w-4xl mx-auto justify-between flex flex-col flex-grow`}
      >
        <div className="flex-grow h-full mx-5 lg:mx-0">
          <h1 className="text-3xl lg:text-4xl font-semibold mt-12">About</h1>
          <h4 className="font-normal text-md lg:text-xl text-brand-black-primary mt-3 lg:mt-5 leading-loose lg:leading-10">
            Finding good internships is hard... Often harder than finding an
            actual job itself. Our mission is to simplify and improve finding
            internships for people around the UK. We believe in learning through
            hands-on experience and promoting such a mindset across various
            professional fields.
          </h4>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
