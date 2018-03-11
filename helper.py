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
#
def verify_submsission(args):
	return ('name' in args and 'building' in args and 'gender' in args and
		'cleanliness' in args and 'latitude' in args and 'longitude' in args)

def verify_generic(form):
	return ('name' in form and 'floor' in form and 'building' in form and
		'address' in form and 'rating' in form)

def dist_approx(lat1, lon1, lat2, lon2):
	# implementation used from
	# stackoverflow.com/questions/5206786
	# in comparing distance from my parents' house in sacramento
	# and baskin 1, there's about a 0.1% margin of error
	earth_radius_mi = 3958.7608367
	mi_per_deg_lat = 2 * pi * earth_radius_mi / 360.0
	mi_per_deg_lon = mi_per_deg_lat * cos(radians(lat1))
	return sqrt((mi_per_deg_lat * (lat1 - lat2)) ** 2 +
		(mi_per_deg_lon * (lon1 - lon2)) ** 2)

