import { Client, Databases } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();

client
  .setEndpoint('https://your-appwrite-server.com/v1') // Replace with your Appwrite endpoint
  .setProject('your-project-id'); // Replace with your project ID

// Initialize the Database service
const database = new Databases(client);

// Function to store data in a collection
async function storeData(collectionId: string, data: { [key: string]: any }) {
  try {
    const response = await database.createDocument('your-database-id', collectionId, 'unique()', data);
    console.log('Document created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating document:', error);
  }
}


storeData('your-collection-id', newPost);
