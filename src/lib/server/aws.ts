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


const client = new S3Client({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY
	}
});

class S3 {
	bucket = env.AWS_BUCKET_NAME;

	/**
	 * Uploads an object to the S3 bucket specified in the env variable AWS_BUCKET_NAME.
	 * @param key - The key (path) for the object in the bucket.
	 * @param body - The body of the object as a Buffer.
	 * @returns A Promise that resolves when the upload is complete.
	 */
	public upload = async ({ key, body }: { key: string; body: Buffer }) => {
		const bucket = this.bucket;

		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body
		});

		try {
			const response = await client.send(command);
			console.log(response);
		} catch (caught) {
			if (caught instanceof S3ServiceException && caught.name === 'EntityTooLarge') {
				console.error(
					`Error from S3 while uploading object to ${bucket}. \
                The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
                or the multipart upload API (5TB max).`
				);
			} else if (caught instanceof S3ServiceException) {
				console.error(
					`Error from S3 while uploading object to ${bucket}.  ${caught.name}: ${caught.message}`
				);
			}
			throw caught;
		}
	};

	/**
	 * Deletes an object from the S3 bucket specified in the env variable AWS_BUCKET_NAME.
	 * @param key - The key (path) of the object to delete.
	 * @returns A Promise that resolves when the deletion is complete.
	 */
	public delete = async ({ key }: { key: string }) => {
		const bucket = this.bucket;

		const command = new DeleteObjectCommand({
			Bucket: bucket,
			Key: key
		});

		try {
			const response = await client.send(command);
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

	/**
	 * Deletes all objects with the given prefix from the S3 bucket.
	 * @param prefix - The prefix of the objects to delete.
	 * @returns A Promise that resolves when all deletions are complete.
	 */
	public deletePrefix = async ({ prefix }: { prefix: string }) => {
		const bucket = this.bucket;

		let continuationToken: string | undefined;

		do {
			const listCommand = new ListObjectsV2Command({
				Bucket: bucket,
				Prefix: prefix,
				ContinuationToken: continuationToken
			});

			const listResponse = await client.send(listCommand);

			if (listResponse.Contents && listResponse.Contents.length > 0) {
				const objects = listResponse.Contents.map((obj) => ({ Key: obj.Key }));

				const deleteCommand = new DeleteObjectsCommand({
					Bucket: bucket,
					Delete: {
						Objects: objects,
						Quiet: true
					}
				});

				const deleteResponse = await client.send(deleteCommand);
				console.log(`Deleted ${objects.length} objects with prefix ${prefix}`);
			}

			continuationToken = listResponse.NextContinuationToken;
		} while (continuationToken);
	};

	public get = async ({ key }: { key: string }) => {
		const bucket = this.bucket;

		const command = new GetObjectCommand({
			Bucket: bucket,
			Key: key
		});

		try {
			const response = await client.send(command);
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

export const s3 = new S3();
