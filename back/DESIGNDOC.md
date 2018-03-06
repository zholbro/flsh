# Bathroom Interactions Requirements
All interactions can just give arguments to request.args
## /flsh
Request to /flsh without arguments returns all possible bathrooms.
### Optional arguments
Arguments should be exclusive; i.e. submitting multiple arguments won't join the query.
1. `rating`: Filling this returns all bathrooms >= value.
2. `gender`: Filters bathrooms by exclusive gender.
## /flsh/new
Creates a new bathroom entry, as well as other bits of data.
1. `name`: Name for Bathroom
2. `building`: Name for building bathroom is in
3. `address`: Address of building. Nominatim should handle.
4. `floor`: Floor building is on. Optional, default is 1.
5. `cleanliness`: Initial rating of bathroom quality.
6. `latitude`
7. `longitude`
8. `text`: The initial review of a bathroom. Optional.
We expect integer values for floor, floating point for cleanliness, latitude & longitude.
## /flsh/add_review
Adds a review to the associated bathroom, and averages reviews.
1. `id`: The ID of the bathroom in the bathroom table. /flsh should give that to you.
2. `cleanliness`: Value of cleanliness for that specific rating.
3. `text`: Review text.
## /flsh/get_reviews
### Gives you all reviews for a specific bathroom.
1. `id`: Above description.
## /flsh/delete
1. `id`: ID of bathroom.
## /flsh/review_delete
1. `id`: ID of review.

# Generic Interactions Requirements