var S3 = require('aws-sdk/clients/s3');

const CORS = {
    'Access-Control-Allow-Origin': 'http://localhost:8080',
    'Access-Control-Allow-Headers': 'Content-Type'
}

/**
 * Return an error response code with a message
 */
function invalid (message, statusCode = 422) {
    return {
      isBase64Encoded: false,
      statusCode,
      body: JSON.stringify({ message }),
      headers: {
        "Content-Type": "application/json",
        ...CORS
      }
    }
}

/**
 * Generate a random slug-friendly UUID
 */
function uuid (iterations = 1) {
    let randomStr = Math.random().toString(36).substring(2, 15)
    return iterations <= 0 ? randomStr : randomStr + uuid(iterations - 1)
}

/**
 * Our primary Lambda handler.
 */
exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.requestContext.http.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: CORS
        }
    }
    // Lets make sure this request has a fileName
    const body = JSON.parse(event.body)

    // First, let's do some basic validation to ensure we recieved proper data
    if (!body && typeof body !== 'object' || !body.extension || !body.mime) {
        return invalid('Request must include "extension" and "mime" properties.')
    }

    /**
     * We generate a random filename to store this file at. This generally good
     * practice as it helps prevent unintended naming collisions, and helps
     * reduce the exposure of the files (slightly). If we want to keep the name
     * of the original file, store that server-side with a record of this new
     * name.
     */
    const filePath = `${uuid()}.${body.extension}`

    /**
     * These are the configuration options that we want to apply to the signed
     * 'putObject' URL we are going to generate. In this case, we want to add
     * a file with a public upload. The expiration here ensures this upload URL
     * is only valid for 5 minutes.
     */
    var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filePath,
        Expires: 300,
        ACL: 'public-read'
    };

    /**
     * Now we create a new instance of the AWS SDK for S3. Notice how there are
     * no credentials here. This is because AWS will automatically use the
     * IAM role that has been assigned to this Lambda runtime.
     * 
     * The signature that gets generated uses the permissions assigned to this
     * role, so you must ensure that the Lambda role has permissions to
     * `putObject` on the bucket you specified above. If this is not true, the
     * signature will still get produced (getSignedUrl is just computational, it
     * does not actually check permissions) but when you try to PUT to the S3
     * bucket you will run into an Access Denied error.
     */
    const client = new S3({
        signatureVersion: 'v4',
        region: 'us-east-1',
    })

    try {
        /**
         * Now we create the signed 'putObject' URL that will allow us to upload
         * files directly to our S3 bucket from the client-side.
         */
        const uploadUrl = await new Promise((resolve, reject) => {
            client.getSignedUrl('putObject', params, function (err, url) {
                return (err) ? reject(err) : resolve(url)
            });
        })

        // Finally, we return the uploadUrl in the HTTP response
        return {
            headers: {
                'Content-Type': 'application/json',
                ...CORS
            },
            statusCode: 200,
            body: JSON.stringify({ uploadUrl })
        }
    } catch (error) {
        // If there are any errors in the signature generation process, we
        // let the end user know with a 500.
        return invalid('Unable to create the signed URL.', 500)
    }
}
