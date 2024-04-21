import { DynamoDBStreamEvent, DynamoDBRecord } from "aws-lambda";
import { S3 } from "@aws-sdk/client-s3";
import {unmarshall} from "@aws-sdk/util-dynamodb";

const s3Client = new S3();
const bucketName = process.env.BUCKET_NAME;
const column = process.env.DYNAMODB_COLUMN;

if (!bucketName) {
    throw new Error("BUCKET_NAME is not defined");
}
if (!column) {
    throw new Error("DYNAMODB_COLUMN is not defined");
}

export const handler = async (event: DynamoDBStreamEvent) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        if (record.eventName === "REMOVE") {
            const item = unmarshall(record.dynamodb!.OldImage) as DynamoDBRecord;

            if (item[column] !== undefined) {
                const key = item[column];

                console.log(`Deleting object ${key} from bucket ${bucketName}`);

                await s3Client.deleteObject({
                    Bucket: bucketName,
                    Key: key,
                });
            }
        }
    }
};