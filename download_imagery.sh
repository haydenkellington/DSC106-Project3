#!/bin/sh
# Download the NASA GIBS MODIS images used in the prototypes.
set -eu
cd "$(dirname "$0")"
mkdir -p assets
get_event() {
  event="$1"; bounds="$2"; shift 2
  for date in "$@"; do
    for type in true false; do
      if [ "$type" = true ]; then layer=MODIS_Terra_CorrectedReflectance_TrueColor; else layer=MODIS_Terra_CorrectedReflectance_Bands721; fi
      if [ "$event" = kenya ]; then filename="$date-$type.jpg"; else filename="$event-$date-$type.jpg"; fi
      curl --fail --location --silent --show-error --get 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi' \
        --data-urlencode SERVICE=WMS --data-urlencode VERSION=1.3.0 --data-urlencode REQUEST=GetMap \
        --data-urlencode "LAYERS=$layer" --data-urlencode STYLES= --data-urlencode FORMAT=image/jpeg \
        --data-urlencode CRS=EPSG:4326 --data-urlencode "BBOX=$bounds" \
        --data-urlencode WIDTH=960 --data-urlencode HEIGHT=640 --data-urlencode "TIME=$date" \
        --output "assets/$filename"
    done
  done
}
get_event dixie '39.4,-122.0,40.4,-120.5' 2021-07-10 2021-08-15 2021-09-21 2021-10-10
get_event pakistan '27.7,68.5,29,70.45' 2012-09-01 2012-09-08 2012-09-13 2012-09-20
get_event kenya '-0.45,36.65,0.35,37.85' 2019-02-15 2019-02-20 2019-02-23 2019-02-27 2019-03-15
