# Unlock-API
A REST API for unlock project.

## Development Configuration
### Prerequisite
* Configured MongoDB Server (can use MongoDB Atlas Cloud)

### Configuration
1. Set `NODE_ENV` to `development` or `production` (default is `production`)
   
	```bash
   export NODE_ENV="production | development"
   ```
1. Set `MONGODB_CONNECTION`
 
   ```bash
   export MONGODB_CONNECTION="<connection_url>"
   ```
   (`<connection_url>` can be grabbed from MongoDB server)

### Run
#### Production Server
```bash
npm start
```
#### Development Server (nodemon configured)
```bash
npm run dev
```

## Import Students
1. Prepare CSV file (as per the format given below)
 
	```csv
	id, school, program, branch, year, semester, name, consent_status
	```

	**NOTE:** `id` column should not contain any duplicates and column name should be exactly same as mentioned.

2. Store the CSV file at `/data/students.csv` (name should be the same)
3. Run the `development` server (Steps are mentioned above)
4. make a API call
	```api
	POST /v1/students/import
	```
	**WARNING**: Data will be overwritten if already exists!

## Generate QRCodes
### For all students
1. Make sure student data is available in database (you can do so by a simple `GET` request)
   
   ```api
	GET /v1/students
	```
2. Make API call
 
   ```api
	POST /v1/generateQRCodes
	```
	This will generate and store all QR codes at `/qrcodes/<school>/<student_id>.png`
	
	e.g. For a student with an ID of `17103487` who is enrolled in `SET` school, the QR code will be stored at `/qrcodes/SET/17103487.png`.

### For single students
1. Make sure student data is available in database (you can do so by a simple `GET` request)
   
   ```api
	GET /v1/students/:id
	```
2. Make API call
 
   ```api
	POST /v1/generateQRCodes/:id
	```
	**WARNING:** This will over-ride the existing QRCodes!


## TODO:
* [ ] Feat: Generate QRCode from CSV file
* [ ] Add authentication to the API calls.
* [ ] Email Integration - QR Code should be sent by email directly (Also give option for HTML template).
* [ ] Make API reference

