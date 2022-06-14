import type { NextApiRequest, NextApiResponse } from 'next'
import { JobListing } from "../../types/JobListing"; 
const sgMail = require('@sendgrid/mail')
const { connectToDatabase } = require('../../lib/mongodb');
var crypto = require("crypto");
const mongoDbUri = process.env.MONGODB_URI
const mongoDb = process.env.DB_NAME
const sendgridApi = process.env.SENDGRID_API

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!, {
  apiVersion: '2020-08-27'
});

type Response = {
    message: any,
    success: Boolean,
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
  ) {
    // switch the methods
    switch (req.method) {
        case 'GET': {
            let mongoResponse = await getJobs(req, res)
            return mongoResponse;
        }

        case 'POST': {
            let response = await createListing(req, res)
            return response
        }

        case 'PUT': {
            let response = await editListing(req, res)
            return response
        }

        case 'DELETE': {
            let response = await deleteListing(req, res)
            return response
        }
    }
}

async function getJobs(req: NextApiRequest, res: NextApiResponse<Response>) {
    try {
        let searchString = req.query.searchString ?? ""
        let skip = Number(req.query.skip) > 0 ? Number(req.query.skip) : 0
        let jobNumber = Number(req.query.jobNumber) > 0 ? Number(req.query.jobNumber) : 25
        // connect to the database
        let { db } = await connectToDatabase(mongoDbUri, mongoDb);

        // fetch the posts
        let jobListings = (searchString !== "") ? 
        (await db
            .collection('InternshipListings')
            .find( {$or: [
                {'title': {'$regex': searchString, '$options': 'i'}},
                {'employer.name': {'$regex': searchString, '$options': 'i'}},
            ]})
            .sort({publishedAt: -1})
            .skip(skip)
            .limit(jobNumber)
            .toArray()
        ) :
        (await db
            .collection('InternshipListings')
            .find({})
            .sort({_id: 1})
            .skip(skip)
            .limit(jobNumber)
            .toArray()
        )
    
        // return the posts
        return res.json({
            message: JSON.parse(JSON.stringify(jobListings)),
            success: true,
        });
    } catch (error) {

        // return the error
        return res.json({
            message: (error as Error).message,
            success: false,
        });
    }
}

async function editListing(req: NextApiRequest, res: NextApiResponse<Response>) {
    try {
        const body = req.body
        // create a filter for a movie to update
        const filter = { editId: req.body.editId };
        // this option instructs the method to create a document if no documents match the filter
        const options = { upsert: false };
        // create a document that sets the plot of the movie
        const updateDoc = {
        $set: {
            title: body.title,
            description: body.description,
            jobLocation: { 
                    '@type': body.jobLocation.type,
                    addressCountry: body.jobLocation.addressCountry,
                    addressLocality:  body.jobLocation.addressLocality,
                    latitude: body.jobLocation.latitude,
                    longitude: body.jobLocation.longitude,
            },
            employer: { 
                    customerId: body.employer.customerId,
                    subscriptionId: body.employer.subscriptionId,
                    name: body.employer.name,
                    logoUrl: body.employer.logoUrl,
                    primaryEmail: body.employer.primaryEmail,
            },
            applyUrl: body.applyUrl,
            category: body.primaryCategory
        },
        };


        let { db } = await connectToDatabase(mongoDbUri, mongoDb);
        await db.collection('InternshipListings').updateOne(filter, updateDoc, options)
            .then((res: any) => {
                return JSON.parse(JSON.stringify(res));
            })
            .then(async (json: string) => {
                return res.json({
                    message: json,
                    success: true,
                });
            })
            .catch((err: any) => {
                return res.json({
                    message: err,
                    success: false,
                });
            })

    } catch (error) {
        // return the error
        return res.json({
            message: (error as Error).message,
            success: false,
        });
    }
}

async function deleteListing(req: NextApiRequest, res: NextApiResponse<Response>) {
    try {
        const body = req.body

        // create a filter for a movie to update
        const filter = { editId: body.editId };
      
        let { db } = await connectToDatabase(mongoDbUri, mongoDb);

        const deleted = await stripe.subscriptions.del(
            body.subscriptionId
          );
        if (deleted.status === 'canceled') {
            await db.collection('InternshipListings').deleteOne(filter)
            .then((res: any) => {
                return JSON.parse(JSON.stringify(res));
            })
            .then(async (json: string) => {
                return res.json({
                    message: json,
                    success: true,
                });
            })
            .catch((err: any) => {
                return res.json({
                    message: err,
                    success: false,
                });
            })
        } else {
            return res.json({
                message: "Could not cancel subscription. Please contact customer support!",
                success: false,
            });
        }

    } catch (error) {
        // return the error
        return res.json({
            message: (error as Error).message,
            success: false,
        });
    }
}


async function createListing(req: NextApiRequest, res: NextApiResponse<Response>) {
    try {
        var organisationId = crypto.randomBytes(20).toString('hex');
        var uniqueEditId = crypto.randomBytes(20).toString('hex');

        const body = req.body
        let listing: JobListing = {
            type: body.type,
            title: body.title,
            description: body.description,
            jobLocation: {
                '@type': body.jobLocation.type,
                addressCountry: body.jobLocation.addressCountry,
                addressLocality:  body.jobLocation.addressLocality,
                latitude: body.jobLocation.latitude,
                longitude: body.jobLocation.longitude,
            },
            employer: {
                customerId: body.employer.customerId,
                subscriptionId: body.employer.subscriptionId,
                id: organisationId,
                name: body.employer.name,
                logoUrl: body.employer.logoUrl,
                primaryEmail: body.employer.primaryEmail
            },
            publishedAt: body.publishedAt,
            validThrough: body.validThrough,
            applyUrl: body.applyUrl,
            editId: `${organisationId}-${uniqueEditId}`,
            category: body.primaryCategory
        }

        let { db } = await connectToDatabase(mongoDbUri, mongoDb);

        // Check if already created
        const count = await db.collection('InternshipListings').countDocuments({ $and: [{'employer.customerId': listing.employer.customerId}, {'employer.subscriptionId': listing.employer.subscriptionId}]}, { limit: 1 }) 
        // returns 1 if exists and 0 otherwise
        
        if (count === 0) {
            let createResponse = db.collection('InternshipListings').insertOne(listing)
            createResponse
                .then((res: any) => {
                    return JSON.parse(JSON.stringify(res));
                })
                .then(async (json: string) => {
                    sendConfirmationEmail(listing, res, json)
                    
                })
                .catch((err: any) => {
                    return res.json({
                        message: err,
                        success: false,
                    });
                })
        } else {
            return res.json({
                message: "Already Created",
                success: true,
            });
        }
    
        
    } catch (error) {

        // return the error
        return res.json({
            message: (error as Error).message,
            success: false,
        });
    }
}

async function sendConfirmationEmail(jobListing: JobListing, res: NextApiResponse<Response>, json: string) {
    sgMail.setApiKey(sendgridApi)

    const msg = {
    to: jobListing.employer.primaryEmail, 
    from: {email: 'andrey@zonlo.co.uk', name:'Andrey from Zonlo'},
    subject: 'Zonlo - Purchase Confirmation and Edit Link',
    html: `<strong>Thank you for purchasing a Zonlo listing :)</strong> <br> Here is a link to manage your listing;  please store it somewhere safe as we cannot and will not resent it. Thanks! <br> <a href="https://zonlo.vercel.app/manage/${jobListing.editId}">https://zonlo.vercel.app/manage/${jobListing.editId}</a>`,
    }

    sgMail
    .send(msg)
    .then((response: any) => {
        return res.json({
            message: json,
            success: true,
        });
    })
    .catch((error: any) => {
        console.error(error)
        return false
    })
}