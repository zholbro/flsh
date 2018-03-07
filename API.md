# FLSH API SPEC

## WARNING
All character strings are expected to be basic strings; i.e.,
no unicode.

### Authentication
Front-end sends a GET [HOST-LOCATION]/flsh/auth with only the
hashed password as an argument to variable 'pwhash'
A success returns a JSON object with the authentication ticket
under 'ticket', whereas a failure returns a JSON object with
'msg' set to 'failure'
1. GET localhost:5000/flsh/auth -d "pwhash=notahash"
Response:
<pre>
	{
	'msg': 'failure',
	'ticket': ''
	}
</pre>
2. GET localhost:5000/flsh/auth -d "pwhash=75d6d6902cbe2b15ad8565e7346d3416"
Response: 
<pre>
	{
	'msg': 'success',
	'ticket':'5711ab5b9a6f33b308f0f4752f255179'
	}

### Submit-Bathroom
Generates a new bathroom in the Bathroom database, as well as
a corresponding Bathroom Review. Requires the following items
as parameters that are filled:
#### Building Name (String, 20 char. long) as 'building'
#### Gender (String, 10 char. long) as 'gender'
Genders should be inserted as lowercase. Best-use is 'male',
'female', and 'all-gender'
#### Cleanliness (Float) as 'cleanliness'
Should be 0-5.
#### Quality (Float)

Moreover, the following variables are optional.
#### Floor (Integer) as 'floor'
#### Address (String, 20 char. long) as 'address'

### Append-Review
Adds a new review for a specific bathroom. Requires:
#### Bathroom-ID (Integer)
The front-end should know the ID of the bathroom you are adding a review to.
#### Text (Unicode Text)
A long string of text (unicode acceptable) to hold an individual review in it.
#### Cleanliness (Integer)
#### Quality (Integer)

### Query
Queries are difficult. This is being pushed back to Sprint 2, depending on if
we decide filtering should be done by the front-end or back-end.
If it is to be done by the back-end, have some 'query' = 'param', i.e.,
'query'='latlon' and then extra variables for specific lat & lon (as float)
included

