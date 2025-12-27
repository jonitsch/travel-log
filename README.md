# travel-log

This Web-Project is designed to document all of your Journeys in one place! 🌍

Generate Key and Salt
>> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
>> node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

USE THIS TO RUN THE DOCKER CONTAINER
docker run -p 8080:8080 -v C:/git/travel-log:/pictures:ro -e IMGPROXY_LOCAL_FILESYSTEM_ROOT=/pictures -e IMGPROXY_KEY=289e3f4cafc82e6ac6ab87c612d810c1bab7d4450842946db23fabf73149d846 -e IMGPROXY_SALT=1718216fa8505a6a5584df97971bec1a -it ghcr.io/imgproxy/imgproxy:latest