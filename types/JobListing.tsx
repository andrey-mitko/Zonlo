export type JobListing = {
  _id?: any;
  type: String;
  title: String;
  description: String;
  jobLocation: JobLocation;
  employer: Employer;
  publishedAt: Date;
  validThrough: Date;
  applyUrl: String;
  editId?: String;
  category?: String;
};

export type Employer = {
  customerId?: String;
  subscriptionId?: String;
  id: String;
  name: String;
  logoUrl: String;
  primaryEmail?: String;
};

export type JobLocation = {
  "@type": String;
  addressCountry: String;
  addressLocality: String;
  latitude: number;
  longitude: number;
};
