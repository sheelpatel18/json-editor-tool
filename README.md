## JSON EDITOR TOOL

This tool was initially developed to assist in editing JSON schemas for REST-API development - but it can be used for editting any JSON. 

There are many ways to edit JSON, but this tool is designed to be as simple as possible while also being cloud-based.

Additionally, there is built in "mocking" functionality to assist in REST-API development. More details on that below.

# Database configuration

This tool was initially designed to be used with a local MongoDB database. However, GCP Firestore and AWS DynamoDB are now supported.


**Using a local MongoDB database**
- This tool was intitially designed to be used with a local MongoDB database. It still can work with a local MongoDB database, but it is not recommended.
- To use a local MongoDB database, you must have MongoDB installed on your computer. You can download it here: https://www.mongodb.com/download-center/community
- make sure mongodb has appropiate permissions

GCP:
- This tool is now designed to be used with GCP Firestore. It is recommended to use Firestore over MongoDB.
- User auth via firebase is coming soon!