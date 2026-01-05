# travel-log

This Web-Project is designed to document all of your Journeys in one place! 🌍

Generate Key and Salt
>> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
>> node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

USE THIS TO RUN THE DOCKER CONTAINER
docker run -p 8080:8080 -v C:/git/travel-log:/pictures:ro -e IMGPROXY_LOCAL_FILESYSTEM_ROOT=/pictures -e IMGPROXY_KEY=YOUR_KEY -e IMGPROXY_SALT=YOUR_SALT -it ghcr.io/imgproxy/imgproxy:latest