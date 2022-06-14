import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, uploadBytes, uploadString  } from "firebase/storage";
const firebaseApi = process.env.FIREBASE_API

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: firebaseApi,
    authDomain: "zonlo-18ad7.firebaseapp.com",
    projectId: "zonlo-18ad7",
    storageBucket: "zonlo-18ad7.appspot.com",
    messagingSenderId: "747359401648",
    appId: "1:747359401648:web:d83e81f7050dbe58c9ad75"
  };

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
            return
        }

        case 'POST': {
            let response = await generateImage(req, res)
            return response
        }

        case 'PUT': {
            return 
        }

        case 'DELETE': {
            return 
        }
    }
}

async function generateImage(req: NextApiRequest, res: NextApiResponse<Response>) {
    try {
       initializeApp(firebaseConfig);

        // Create a root reference
        const storage = getStorage();

        // Upload file and metadata to the object 'images/mountains.jpg'
        const storageRef = ref(storage, 'listings/' + req.body.name);
        const base64String = req.body.base64Image;///.replace(/^data:image\/png;base64,/, "");

        // Data URL string
        uploadString(storageRef, base64String, 'data_url').then((snapshot) => {
        getDownloadURL(storageRef).then((downloadURL) => {
            return res.json({
                message: `${downloadURL}`,
                success: true,
            });
          });
        });

    } catch (error) {
        return res.json({
            message: `${error}`,
            success: false,
        });
    }
}

export const config = {
    api: {
      bodyParser: {
          sizeLimit: 'none'
      },
    },
  }