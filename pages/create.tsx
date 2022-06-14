import React, { useRef } from "react";
import NavBar from "../components/NavBar";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Tiptap from "../components/Tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { isWebUri } from "valid-url";
import Footer from "../components/Footer";
import Image from "next/image";
import ListingCreated from "../components/ListingCreated";
import axios from "axios";
import crypto from "crypto";
import { loadStripe } from "@stripe/stripe-js";

interface Props {
  data: any;
}

const stripePromise = loadStripe(
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE!
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST!
);

const Create = (props: Props) => {
  let previousListingData: any | null = null;

  if (props.data !== null) {
    previousListingData = props.data.session.metadata;
  }

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "prose prose-h2:text-xl prose-h1:text-2xl prose-h1:font-semibold prose-h2:font-semibold prose-p:font-normal p-3 prose-p:text-brand-black-primary",
      },
    },
    content:
      previousListingData !== null
        ? previousListingData.description
        : `
    <h1>
      About the Role
    </h1>
    <p>
      Here is an example of a paragraph.
    </p>
    <hr>
    <h1>
      Responsibilities
    </h1>
    <ul>
      <li>
        Number One
      </li>
      <li>
        Number Two
      </li>
      <li>
        Number Three
      </li>
    </ul>
  `,
  });

  const fileInput = useRef<any>(null);

  const [positionName, setPositionName] = useState(
    previousListingData?.title ?? ""
  );
  const [isPositionNameError, setPositionNameError] = useState(false);

  const positionType = "INTERNSHIP";

  const [primaryCategory, setPrimaryCategory] = useState(
    previousListingData?.primaryCategory ?? ""
  );
  const [isPrimaryCategoryError, setPrimaryCategoryError] = useState(false);

  const positionDescription = editor?.getHTML();

  const [applyUrl, setApplyUrl] = useState(previousListingData?.applyUrl ?? "");
  const [isApplyUrlError, setApplyUrlError] = useState(false);

  const [locationType, setLocationType] = useState(
    previousListingData?.locationType ?? ""
  );
  const [isLocationTypeError, setLocationTypeError] = useState(false);

  const [locationCity, setLocationCity] = useState(
    previousListingData?.addressLocality ?? ""
  );
  const [isLocationCityError, setLocationCityError] = useState(false);

  const [locationScope, setLocationScope] = useState(
    previousListingData?.addressLocality ?? "Worldwide"
  );
  const [isLocationScopeError, setLocationScopeError] = useState(false);

  const locationCountry = "GB";

  const [companyName, setCompanyName] = useState(
    previousListingData?.companyName ?? ""
  );
  const [isCompanyNameError, setCompanyNameError] = useState(false);

  const [previousLogo, setPreviousLogo] = useState(
    previousListingData?.companyLogoUrl ?? ""
  );

  const [companyLogo, setCompanyLogo] = useState({});
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyEmail, setCompanyEmail] = useState(
    previousListingData?.companyPrimaryEmail ?? ""
  );
  const [isCompanyEmailError, setCompanyEmailError] = useState(false);

  const [companyAddress, setCompanyAddress] = useState(
    previousListingData?.companyAddress ?? ""
  );
  const [isCompanyAddressError, setCompanyAddressError] = useState(false);

  const [agreeWithRules, setAgreeWithRules] = useState(
    previousListingData !== null ? "yes" : ""
  );
  const [isAgreeWithRulesError, setAgreeWithRulesError] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [isListingCreated, setListingCreated] = useState(false);
  const [isFailedToCreateListing, setFailedToCreateListing] = useState(false);

  function validateEmail(email: string): boolean {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  const toBase64 = (file: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const createStripeSession = async (logoUrl: string) => {
    let today = new Date();
    let dayMonthLater = new Date(
      new Date().setMonth(new Date().getMonth() + 1)
    );
    const { sessionId } = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: 1,
        listingData: JSON.stringify({
          type: positionType,
          title: positionName,
          description: positionDescription,
          locationType: locationType,
          addressCountry: locationCountry,
          addressLocality:
            locationType === "REMOTE" ? locationScope : locationCity,
          latitude: 0,
          longitude: 0,
          companyName: companyName,
          companyLogoUrl: logoUrl,
          companyPrimaryEmail: companyEmail,
          companyAddress: companyAddress,
          publishedAt: today,
          validThrough: dayMonthLater,
          applyUrl: applyUrl,
          primaryCategory: primaryCategory,
        }),
      }),
    }).then((res) => res.json());

    const stripe = await stripePromise;
    const error = await stripe?.redirectToCheckout({
      sessionId,
    });
    console.warn(error?.error.message);
  };

  function postInternship() {
    if (!isLoading) {
      setLoading(true);
      let someErrors = false;

      // Position Name check
      if (positionName === "") {
        someErrors = true;
        setPositionNameError(true);
      }

      // Category check
      if (primaryCategory === "") {
        someErrors = true;
        setPrimaryCategoryError(true);
      }

      // Apply URL check
      if (!isWebUri(applyUrl)) {
        someErrors = true;
        setApplyUrlError(true);
      }

      // Location Type check
      if (locationType === "") {
        someErrors = true;
        setLocationTypeError(true);
      }

      if (locationType === "REMOTE") {
        // Location Scope check
        if (locationScope === "") {
          someErrors = true;
          setLocationScopeError(true);
        }
      } else {
        // Location City check
        if (locationCity === "") {
          someErrors = true;
          setLocationCityError(true);
        }
      }

      // Company Name check
      if (companyName === "") {
        someErrors = true;
        setCompanyNameError(true);
      }

      // Company Email check
      if (!validateEmail(companyEmail)) {
        someErrors = true;
        setCompanyEmailError(true);
      }

      // Company Address check
      if (companyAddress === "") {
        someErrors = true;
        setCompanyAddressError(true);
      }

      // Agree With check
      if (agreeWithRules !== "yes") {
        someErrors = true;
        setAgreeWithRulesError(true);
      }

      if (someErrors === false) {
        handleDataFormation();
      } else {
        alert("Make sure that all fields have been filled correctly!");
        setLoading(false);
      }
    }
  }

  async function handleDataFormation() {
    if (companyLogoUrl !== "") {
      try {
        var uniqueImageId = crypto.randomBytes(20).toString("hex");
        const rawResponse = await axios({
          method: "post",
          url: "/api/image",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: {
            name: uniqueImageId,
            base64Image: await toBase64(companyLogo), // This is the body part
          },
        });

        const content = rawResponse as any;
        if (content.data.success === true) {
          // All Good!
          createStripeSession(content.data.message);
        } else {
          console.log(`Something went wrong :( Please try again later!`);
          setLoading(false);
        }
      } catch (err) {
        alert(err);
        setLoading(false);
      }
    } else {
      if (previousLogo) {
        createStripeSession(previousLogo);
      } else {
        createStripeSession("");
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Zonlo - Post Listing</title>
        <meta
          name="description"
          content="Find thousands of internships available across the United Kingdom. Explore the different types of internships: Summer, Paid, Full-time, Part-time. Search through various industries: Tech, Finance, Marketing, Data Science and etc."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />
      {isListingCreated ? (
        <ListingCreated email={companyEmail} />
      ) : (
        <main
          className={
            "container max-w-6xl mx-auto justify-between flex flex-col lg:flex-row flex-grow lg:mb-7"
          }
        >
          {/* POSITION DETAILS */}
          <div className="lg:w-2/3">
            <h1 className="text-center font-semibold text-xl my-5">
              Position Details
            </h1>
            <form className="w-full px-5 flex flex-col space-y-5">
              {/* POSITION NAME */}
              <fieldset>
                <label htmlFor="positionName" className="font-medium text-md">
                  Position Name *
                </label>
                <input
                  defaultValue={positionName}
                  type="text"
                  id="positionName"
                  name="positionName"
                  className={`border-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary focus:outline-none h-full w-full ${
                    isPositionNameError ? "bg-red-100" : "bg-brand-elementBG"
                  }`}
                  placeholder="Marketing Internship…"
                  autoComplete="off"
                  onChange={(e) => {
                    setPositionName(e.target.value);
                    setPositionNameError(false);
                  }}
                  required
                />
                <h4
                  className="font-medium text-brand-black-tertiary mt-2 "
                  style={{ fontSize: "0.65rem" }}
                >
                  Please specify as single job position like “iOS Intern”.
                  Please do not write in full caps. A job post is limited to a
                  single job.
                </h4>
              </fieldset>
              {/* POSITION TYPE */}
              <div className="">
                <div className="flex - flex-row justify-left items-center space-x-1.5">
                  <h4 className="font-medium text-md">Position Type</h4>
                  <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" />
                </div>
                <div className="mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary bg-brand-elementBG focus:outline-none h-full w-full ">
                  Internship
                </div>
              </div>
              {/* POSITION CATEGORY */}
              <fieldset>
                <label
                  htmlFor="positionCategory"
                  className="font-medium text-md"
                >
                  Primary Category *
                </label>
                <div className="relative">
                  <select
                    defaultValue={primaryCategory}
                    className={`border-none block appearance-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                      isPrimaryCategoryError
                        ? "bg-red-100"
                        : "bg-brand-elementBG"
                    } focus:outline-none h-full w-full`}
                    id="positionCategory"
                    onChange={(e) => {
                      setPrimaryCategory(e.target.value);
                      setPrimaryCategoryError(false);
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Software Development">
                      Software Development
                    </option>
                    <option value="Health">Health</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Publishing">Publishing</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </fieldset>
              {/* POSITION DESCRIPTION */}
              <fieldset className="">
                <label
                  htmlFor="positionDescription"
                  className="font-medium text-md"
                >
                  Position Description *
                </label>
                <div className="bg-brand-elementBG mt-2 rounded-xl">
                  <Tiptap editor={editor} />
                </div>
              </fieldset>
              {/* APPLY URL */}
              <fieldset>
                <label htmlFor="applyUrl" className="font-medium text-md">
                  Apply URL *
                </label>
                <input
                  defaultValue={applyUrl}
                  type="text"
                  id="applyUrl"
                  name="applyUrl"
                  className={`border-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                    isApplyUrlError ? "bg-red-100" : "bg-brand-elementBG"
                  } focus:outline-none h-full w-full `}
                  placeholder="https://..."
                  autoComplete="off"
                  onChange={(e) => {
                    setApplyUrl(e.target.value);
                    setApplyUrlError(false);
                  }}
                  required
                />
              </fieldset>

              {/* POSITION CATEGORY */}
              <fieldset>
                <label htmlFor="locationType" className="font-medium text-md">
                  Location Type *
                </label>
                <div className="relative">
                  <select
                    defaultValue={locationType}
                    className={`border-none block appearance-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                      isLocationTypeError ? "bg-red-100" : "bg-brand-elementBG"
                    } focus:outline-none h-full w-full `}
                    id="locationType"
                    required
                    onChange={(e) => {
                      setLocationType(e.target.value);
                      setLocationTypeError(false);
                    }}
                  >
                    <option value="">Select</option>
                    <option value="ONSITE">Onsite</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
              </fieldset>

              {locationType === "REMOTE" ? (
                <>
                  {/* AVAILABILITY */}
                  <fieldset>
                    <label
                      htmlFor="availability"
                      className="font-medium text-md"
                    >
                      Location Availability *
                    </label>
                    <input
                      defaultValue={locationScope}
                      type="text"
                      id="availability"
                      name="availability"
                      className={`border-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                        isLocationScopeError
                          ? "bg-red-100"
                          : "bg-brand-elementBG"
                      } focus:outline-none h-full w-full`}
                      placeholder="Worldwide..."
                      autoComplete="on"
                      onChange={(e) => {
                        setLocationScope(e.target.value);
                        setLocationScopeError(false);
                      }}
                      required
                    />
                    <h4
                      className="font-medium text-brand-black-tertiary mt-2"
                      style={{ fontSize: "0.65rem" }}
                    >
                      If you'd only like to hire people from a specific location
                      or timezone this remote job is restricted to (e.g. Europe,
                      United States or CET Timezone)
                    </h4>
                  </fieldset>
                </>
              ) : (
                <>
                  {/* POSITION CITY */}
                  <fieldset>
                    <label
                      htmlFor="positionCity"
                      className="font-medium text-md"
                    >
                      City *
                    </label>
                    <input
                      defaultValue={locationCity}
                      type="text"
                      id="positionCity"
                      name="positionCity"
                      className={`border-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                        isLocationCityError
                          ? "bg-red-100"
                          : "bg-brand-elementBG"
                      } focus:outline-none h-full w-full `}
                      placeholder="London, Manchester, etc…"
                      autoComplete="on"
                      onChange={(e) => {
                        setLocationCity(e.target.value);
                        setLocationCityError(false);
                      }}
                      required
                    />
                  </fieldset>
                </>
              )}

              {/* COUNTRY */}
              <div className="">
                <div className="flex - flex-row justify-left items-center space-x-1.5">
                  <h4 className="font-medium text-md">Internship Country</h4>
                  <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" />
                </div>
                <div className="mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary bg-brand-elementBG focus:outline-none h-full w-full ">
                  United Kingdom
                </div>
              </div>
            </form>
          </div>
          {/* END POSITION DETAILS */}

          {/* COMPANY DETAILS */}
          <div className="px-5 lg:px-0 mt-7 lg:w-1/3 ">
            <div className="sticky top-7 ">
              <hr className="divide-gray-100 lg:hidden" />
              <div className="lg:border-2 lg:pb-7 lg:px-5 lg:rounded-2xl border-gray-100">
                <h1 className="text-center font-semibold text-xl my-5">
                  Company Details
                </h1>
                <form className="w-full flex flex-col space-y-5">
                  {/* COMPANY NAME */}
                  <fieldset>
                    <label
                      htmlFor="companyName"
                      className="font-medium text-md"
                    >
                      Company Name *
                    </label>
                    <input
                      defaultValue={companyName}
                      type="text"
                      id="companyName"
                      name="companyName"
                      className={`border-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                        isCompanyNameError ? "bg-red-100" : "bg-brand-elementBG"
                      } focus:outline-none h-full w-full `}
                      placeholder="Awesome Company..."
                      autoComplete="off"
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setCompanyNameError(false);
                      }}
                      required
                    />
                    <h4
                      className="font-medium text-brand-black-tertiary mt-2"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Please do not include “Ltd.”, “Inc.”, etc.
                    </h4>
                  </fieldset>

                  {/* COMPANY LOGO */}
                  <fieldset>
                    <label
                      htmlFor="companyLogo"
                      className="font-medium text-md"
                    >
                      Company Logo
                    </label>
                    <div
                      className={`relative w-32 h-32 rounded-xl mt-2 flex flex-col justify-center items-center bg-brand-elementBG cursor-pointer`}
                      onClick={(e) => {
                        (fileInput as any)!.current.click();
                      }}
                    >
                      {companyLogoUrl !== "" ? (
                        <>
                          <img
                            className="rounded-xl absolute top-0 bottom-0 left-0 right-0 z-20 object-cover w-32 h-32"
                            src={URL.createObjectURL(companyLogo as Blob)}
                          />
                          <div className="rounded-xl absolute top-0 bottom-0 left-0 right-0 z-30 bg-black opacity-30" />
                        </>
                      ) : previousLogo ? (
                        <>
                          <img
                            className="rounded-xl absolute top-0 bottom-0 left-0 right-0 z-20 object-cover w-32 h-32"
                            src={previousLogo as string}
                          />
                          <div className="rounded-xl absolute top-0 bottom-0 left-0 right-0 z-30 bg-black opacity-30" />
                        </>
                      ) : (
                        <></>
                      )}{" "}
                      <div
                        className={`flex flex-row items-center space-x-1 z-50 ${
                          companyLogoUrl !== "" || previousLogo
                            ? "text-white"
                            : "text-brand-black-tertiary"
                        } `}
                      >
                        <FontAwesomeIcon
                          className="w-4 h-4"
                          icon={faCloudUploadAlt}
                        />
                        <h3>
                          {companyLogoUrl !== "" || previousLogo
                            ? "Update"
                            : "Upload"}
                        </h3>
                      </div>
                    </div>
                    <input
                      id="image"
                      type="file"
                      onChange={async (e) => {
                        if (
                          e.target.files !== null &&
                          e.target.files[0] !== undefined
                        ) {
                          if (e.target.files[0].size > 9437184) {
                            alert(
                              "File is too big! Please make sure that file is less than 10mb."
                            );
                            e.target.value = "";
                          } else {
                            let file = e.target.files[0];
                            // let base64 = await getBase64(file);
                            setCompanyLogo(file);
                            const logoBase = (await toBase64(file)) as string;
                            setCompanyLogoUrl(logoBase);
                          }
                        } else {
                          setCompanyLogo({});
                          setCompanyLogoUrl("");
                        }
                      }}
                      accept="image/*"
                      className=" hidden"
                      ref={fileInput}
                    />
                    <h4
                      className="font-medium text-brand-black-tertiary mt-2 "
                      style={{ fontSize: "0.65rem" }}
                    >
                      Highly recomended. Supports “.jpg” and “.png”
                    </h4>
                  </fieldset>

                  {/* COMPANY EMAIL */}
                  <fieldset>
                    <label
                      htmlFor="companyEmail"
                      className="font-medium text-md"
                    >
                      Email (Stays Private)
                    </label>
                    <input
                      defaultValue={companyEmail}
                      type="email"
                      id="companyEmail"
                      name="companyEmail"
                      className={`border-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                        isCompanyEmailError
                          ? "bg-red-100"
                          : "bg-brand-elementBG"
                      } focus:outline-none h-full w-full`}
                      placeholder="important@email.com..."
                      autoComplete="off"
                      onChange={(e) => {
                        setCompanyEmail(e.target.value);
                        setCompanyEmailError(false);
                      }}
                      required
                    />
                    <h4
                      className="font-medium text-brand-black-tertiary mt-2"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Make sure this email is accessible by you! This email will
                      be used to send the invoice and edit link. We can not and
                      do not resend it manually!
                    </h4>
                  </fieldset>

                  {/* INVOICE ADDRESS */}
                  <fieldset>
                    <label
                      htmlFor="invoiceAddress"
                      className="font-medium text-md"
                    >
                      Invoice Address
                    </label>
                    <input
                      defaultValue={companyAddress}
                      type="text"
                      id="invoiceAddress"
                      name="invoiceAddress"
                      className={`border-none mt-2 font-medium text-md rounded-xl px-2 py-4 placeholder-brand-black-tertiary text-brand-black-primary ${
                        isCompanyAddressError
                          ? "bg-red-100"
                          : "bg-brand-elementBG"
                      } focus:outline-none h-full w-full`}
                      placeholder="London, United Kingdom..."
                      autoComplete="off"
                      onChange={(e) => {
                        setCompanyAddress(e.target.value);
                        setCompanyAddressError(false);
                      }}
                      required
                    />
                  </fieldset>
                </form>
              </div>

              {/* IMPORTANT DETAILS */}
              <div className="mt-7 lg:border-2 lg:px-5 lg:rounded-2xl border-gray-100">
                <hr className="divide-gray-100 lg:hidden" />
                <h1 className="text-center font-semibold text-xl my-5">
                  Important Details
                </h1>
                <h4 className="font-normal text-sm  leading-loose text-brand-black-primary">
                  Job posts are a) published for 30 days, b) cannot be refunded,
                  and c) renew automatically after 30 days unless you 1) disable
                  auto renew after posting on the edit page, or 2) close your
                  job post on the edit page. We send a reminder 7 days by email
                  before renewing. Renewing is the same price as the original
                  job post for 30 days.
                </h4>
                <div className="flex flex-row justify-start items-center my-5">
                  {agreeWithRules === "yes" ? (
                    <input
                      defaultValue={agreeWithRules}
                      type="checkbox"
                      id="agreeWith"
                      name="agreeWith"
                      // value="yes"
                      className={`rounded-md w-5 h-5 form-checkbox text-brand-green-2 ${
                        isAgreeWithRulesError
                          ? "bg-red-100 border-red-500"
                          : "bg-brand-elementBG border-gray-300"
                      }`}
                      onChange={(e) => {
                        setAgreeWithRules("");
                        setAgreeWithRulesError(false);
                      }}
                      checked
                    />
                  ) : (
                    <input
                      defaultValue={agreeWithRules}
                      type="checkbox"
                      id="agreeWith"
                      name="agreeWith"
                      // value="yes"
                      className={`rounded-md w-5 h-5 form-checkbox text-brand-green-2 ${
                        isAgreeWithRulesError
                          ? "bg-red-100 border-red-500"
                          : "bg-brand-elementBG border-gray-300"
                      }`}
                      onChange={(e) => {
                        setAgreeWithRules("yes");
                        setAgreeWithRulesError(false);
                      }}
                    />
                  )}
                  <label
                    htmlFor="agreeWith"
                    className="ml-2 select-none font-medium text-sm text-brand-black-primary"
                  >
                    I agree with and understand the above rules *
                  </label>
                </div>
              </div>
              {/* PURCHASE BUTTON */}
              <div className="border-t lg:border-0 border-gray-100 pt-5 lg:p-0 text-brand-black-tertiary h-28 mt-5">
                <button
                  onClick={postInternship}
                  className={`transition duration-300 ease-in-out ${
                    isLoading
                      ? "bg-brand-green-3 text-gray-50"
                      : "bg-brand-green-4 hover:text-gray-50 hover:bg-brand-green-3 text-brand-green-2"
                  }    text-md font-semibold flex items-center justify-center h-14 w-full lg:px-10 rounded-xl`}
                >
                  {isLoading ? (
                    <Image
                      src={require("../public/loading.gif")}
                      alt="loading..."
                      width="25px"
                      height="25px"
                    />
                  ) : (
                    <>Post Your Internship — £97 </>
                  )}
                </button>
              </div>
              {/* END PURCHASE BUTTON */}
            </div>
            {/* END IMPORTANT DETAILS */}
          </div>
          {/* END COMPANY DETAILS */}
        </main>
      )}

      <div className={`${isListingCreated ? "block" : "hidden"} lg:block`}>
        <Footer />
      </div>
    </div>
  );
};

export default Create;

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
