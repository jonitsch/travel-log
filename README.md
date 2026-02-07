# travel-log
#### This Web-Project is designed to document all of your Journeys in one place! 🌍

## Development
### Enviroment Variables
| Variable | Description |
| ----------- | ----------- |
| `DATABASE_URL` | Your Database URL |
| `DATABASE_PASSWORD` | Your Database Password |
| `IMAGE_FOLDER_PATH` | The folder that will store your images |
| `IMGPROXY_KEY` | Your ImgProxy Key (HEX-Format) |
| `IMGPROXY_SALT` | Your ImgProxy Salt (HEX-Format) |
| `IMGPROXY_URL` | Your ImgProxy Base URL |

### Generate Key and Salt
KEY: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`  
SALT: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`

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