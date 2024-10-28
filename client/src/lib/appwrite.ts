import { Client, Databases } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();

client
  .setEndpoint('https://your-appwrite-server.com/v1') // Replace with your Appwrite endpoint
  .setProject('your-project-id'); // Replace with your project ID

// Initialize the Database service
const database = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export { client, account, storage };


