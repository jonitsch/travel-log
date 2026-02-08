# travel-log
#### This Web-Project is designed to document all of your Journeys in one place! 🌍

## Development
### Enviroment Variables
| Variable | Description | Example (Generation) |
| ----------- | ----------- | ----------- |
| `DATABASE_URL` | Your Database URL | mysql://`username`:`password`@localhost:3306/db |
| `DATABASE_PASSWORD` | Your Database Password |
| `IMAGE_FOLDER_PATH` | The folder that will store your images | `C:/git/travel-log-data/pictures` |
| `IMGPROXY_URL` | Your ImgProxy Base URL | http://localhost:8080 |
| `IMGPROXY_KEY` | Your ImgProxy Key | `crypto.randomBytes(32).toString('hex')` |
| `IMGPROXY_SALT` | Your ImgProxy Salt | `crypto.randomBytes(16).toString('hex')` |
| `BETTER_AUTH_URL` | Your Servers Base URL | http://localhost:5173 |
| `BETTER_AUTH_SECRET` | Your BetterAuth Secret | `openssl rand -base64 32`

### Run ImgProxy-Container locally
Windows
```docker
docker run ^ 
    -p 8080:8080 ^
    -v {IMAGE_FOLDER_PATH}:/pictures:ro ^
    -e IMGPROXY_LOCAL_FILESYSTEM_ROOT=/pictures ^
    -e IMGPROXY_KEY={YOUR_KEY} -e IMGPROXY_SALT={YOUR_SALT} ^
    -it ghcr.io/imgproxy/imgproxy:latest ^
```
Linux  
```docker
docker run \
    -p 8080:8080 \
    -v {IMAGE_FOLDER_PATH}:/pictures:ro \
    -e IMGPROXY_LOCAL_FILESYSTEM_ROOT=/pictures \
    -e IMGPROXY_KEY={YOUR_KEY} -e IMGPROXY_SALT={YOUR_SALT} \
    -it ghcr.io/imgproxy/imgproxy:latest \
```
Any Image Path that you try to sign and fetch with the **getImgProxyURL()** function must be relative to **{IMAGE_FOLDER_PATH}**!
```typescript
import { getImgProxyURL } from '$src/lib/imgproxy';
```