import type { NextApiRequest, NextApiResponse } from 'next';
const { connectToDatabase } = require('../../lib/mongodb');
var mongo = require('mongodb');
const mongoDbUri = process.env.MONGODB_URI
const mongoDb = process.env.DB_NAME

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
            let mongoResponse = await getJob(req, res)
            return mongoResponse;
        }

        case 'POST': {
            return
        }

        case 'PUT': {
            return 
        }

        case 'DELETE': {
            return 
        }
    }
}

async function getJob(req: NextApiRequest, res: NextApiResponse<Response>) {
    try {
        let jobEditId: string = req.body.jobEditId
        let searchTerm = {}
        
        if (jobEditId === undefined) {
            var o_id = new mongo.ObjectID(req.body.id);
            searchTerm = {"_id": o_id }
        } else {
            searchTerm = {"editId": jobEditId}
        }

        // connect to the database
        let { db } = await connectToDatabase(mongoDbUri, mongoDb);
        // fetch the post
        let jobListings = await db.collection('InternshipListings').find(searchTerm).sort({_id: 1}).toArray();
        let jobListing = jobListings[0]
        // return the posts
        return res.json({
            message: JSON.parse(JSON.stringify(jobListing)),
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
