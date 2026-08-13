Health Cover Sim 

-- AI implementation - Claude, ChatGPT --

The main uses of generative AI throughout this assignment was:

	- Breakdowns of work structure
	- Education on SQLite, Express and JavaScript syntax
	- Searching code blocks for syntax errors
	- Improving UI 
	- Debugging

I started the project specifically avoiding heavy AI use, in order to keep track of the underlying workflow and system layout. 
Many of the routing decisions, inlcuding the stripping of /api for backend access was my own choice.

-- Launch Instructions/Details --

To launch, you must first ensure that all 3 servers are running.

-- Server Side Launch --

In the /server folder, run the following:

npm run dev
To run the SQL server

node server.cjs
To run the express proxy

-- Client Side Launch--

in the /clinet folder, run the following 

npm run dev
to run the vite server

-- Database --

All cover SQL tables (hospital, extra, family) are self populated with their respective tiers and pricing,
whilst the user_selections table is populated through user choices. 

-- URL's --

You may then open the app with the following url for the frontend:

http://localhost:5173/

And the following for the backend:

http://localhost:5000/ -sql table name-

For the backend

-- Calculation Steps --

All of the calculation steps are located inside calculateCostDetails.js

After ensuring variable names between the front and backend are aligned with the toCalculator record,
the calculator first finds the specific tiers of the hospital cover, extra cover, and family covers
to refer to their respective SQL tables and the prices listed inside of them.

It then contains various calculation steps including individual applicant LHC loading, and yearly discounts.
The steps themselves are mainly for the purposes of rendering calculation steps in the frontend,
and the finalTotal step is simply where each step aligns into one call. 

-- Limitations -- 

A key limitation of the system is the need to have 3 seperate servers to be running in order for it
to be functional. 
