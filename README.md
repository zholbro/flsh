# FLSH
## what is it?
An API designed to track public utilities you find useful,
such as public bathrooms, power outlets in buildings,
public wifi, water fountains, and so on. It is a project
submitted for CMPS 183 at UC Santa Cruz, by Brooke Dalton,
Tarum Fraz, Zach Holbrook, Beth Oliver, and Devin Siems.
Included is the backend server code, as well as a toy
frontend.

## how does it work?
The server is written mostly in Flask, with Flask
extensions Flask-RESTful and Flask-SQLAlchemy.
The frontend is just going to be Leaflet.js on top of
HTML.

## how do I set it up?
Install Flask, Flask_RESTful, Flask-SQLAlchemy,
and Flask-SSLify through pip. Generate certificates for ssl,
perhaps through
`openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365`
Getting SSL certificates, through, say, certbot would probably be good.
Set up port-forwarding on whatever port you config this on (default is 4200) and 
a little `python app.py` will take the rest.
