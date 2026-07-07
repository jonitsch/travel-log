import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
	S3ServiceException
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

const isProduction = true;

let client: S3Client | undefined;

if (isProduction) {
    client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY
        }
    });
}

class S3 {
    bucket = env.AWS_BUCKET_NAME;

    private ensureClient() {
        if (!client) throw new Error('S3 client is disabled when NODE_ENV !== "production"');
    }

    public upload = async ({ key, body }: { key: string; body: Buffer }) => {
        this.ensureClient();
        const bucket = this.bucket;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body
        });

        try {
            const response = await client!.send(command);
            console.log(response);
        } catch (caught) {
            if (caught instanceof S3ServiceException && caught.name === 'EntityTooLarge') {
                console.error(
                    `Error from S3 while uploading object to ${bucket}. ` +
                        `The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) ` +
                        `or the multipart upload API (5TB max).`
                );
            } else if (caught instanceof S3ServiceException) {
                console.error(
                    `Error from S3 while uploading object to ${bucket}.  ${caught.name}: ${caught.message}`
                );
            }
            throw caught;
        }
    };

    public delete = async ({ key }: { key: string }) => {
        this.ensureClient();
        const bucket = this.bucket;

        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        });

        try {
            const response = await client!.send(command);
            console.log(response);
        } catch (caught) {
            if (caught instanceof S3ServiceException) {
                console.error(
                    `Error from S3 while deleting object from ${bucket}.  ${caught.name}: ${caught.message}`
                );
            }
            throw caught;
        }
    };

    public deletePrefix = async ({ prefix }: { prefix: string }) => {
        this.ensureClient();
        const bucket = this.bucket;

        let continuationToken: string | undefined;

        do {
            const listCommand = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken
            });

            const listResponse = await client!.send(listCommand);

            if (listResponse.Contents && listResponse.Contents.length > 0) {
                const objects = listResponse.Contents.map((obj) => ({ Key: obj.Key }));

                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: bucket,
                    Delete: {
                        Objects: objects,
                        Quiet: true
                    }
                });

                const deleteResponse = await client!.send(deleteCommand);
                console.log(`Deleted ${objects.length} objects with prefix ${prefix}`);
            }

            continuationToken = listResponse.NextContinuationToken;
        } while (continuationToken);
    };

    public get = async ({ key }: { key: string }) => {
        this.ensureClient();
        const bucket = this.bucket;

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        try {
            const response = await client!.send(command);
            console.log(response);

            return response;
        } catch (caught) {
            if (caught instanceof S3ServiceException) {
                console.error(
                    `Error from S3 while getting object from ${bucket}.  ${caught.name}: ${caught.message}`
                );
            }
            throw caught;
        }
    };
}

const disabledError = new Error('S3 is disabled when NODE_ENV !== "production"');

const stub = {
    upload: async () => Promise.reject(disabledError),
    delete: async () => Promise.reject(disabledError),
    deletePrefix: async () => Promise.reject(disabledError),
    get: async () => Promise.reject(disabledError)
};

export const s3 = isProduction ? new S3() : (stub as unknown as S3);
