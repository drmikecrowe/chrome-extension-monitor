#!/usr/bin/env bash

rm resized/ extended/ -rf
mkdir -p extended

for f in *.png; do 
  convert $f -extent 1280x640 extended/$f-1280x640.png
done


for g in 1280x640 440x280 920x680 1400x560; do 
  mkdir -p resized/$g
  for f in *.png; do 
    convert $f -resize $g -gravity center -extent $g -gravity North -background YellowGreen -splice 0x18 -annotate +0+2 'Chrome Extension Monitor' resized/$g/$(basename $f)-$g.png
  done  
done
