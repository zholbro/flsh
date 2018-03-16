"""
    helper.py: A series of helper functions for serv.py in order
    to maintain some cleaner code (mostly for zach's sake)
"""

from math import pi, sqrt, radians, cos

# little helper function to determine if user has right ticket. this specific
# ticket should be changed based on specific user entries, and is not being
# utilized yet as of sprint 1
def auth_request(ticket):
   return ticket == '5711ab5b9a6f33b308f0f4752f255179'

# making sure that we can submit a database entry without much worry about
# nullable parameters

def verify_bathroom(data):
    return ('name' in data and 'building' in data and 'gender' in data and
        'latitude' in data and 'longitude' in data)

def verify_generic(form):
    return ('category' in form and 'description' in form and 'building' in form and
        'address' in form and 'rating' in form and 'latitude' in form and
        'longitude' in form)

def dist_approx(first_lat, first_lon, sec_lat, sec_lon):
    # implementation used from
    # stackoverflow.com/questions/5206786
    # in comparing distance from my parents' house in sacramento
    # and baskin 1, there's about a 0.1% margin of error

    lat1 = radians(first_lat)
    lon1 = radians(first_lon)
    lat2 = radians(sec_lat)
    lon2 = radians(sec_lon)
    d_lat = lat2 - lat1
    d_lon = lon2 - lon1
    a = sin(d_lat/2)**2 + cos(lat1) * cos(lat2) * sin(d_lon/2)**2
    c = 2 * asin(sqrt(a))
    radius = 3958.7608367
    return c * radius

