# Satellite imagery comparison

An interactive D3 visualization comparing NASA MODIS imagery across dates for three wildfire and flood events.

[View the visualization](https://haydenkellington.github.io/DSC106-Project3/)

Choose an event, dates, and image type, then drag the divider to compare the images. You can also zoom and pan.

The rendered imagery and D3 library are in `assets/`. Images were obtained from [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/access-basics/); `download_imagery.sh` records the requests. These images are not measurements of damage.

To run locally, open `index.html` in a browser.
