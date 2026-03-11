# travel-log
#### This Web-Project is designed to document all of your Journeys in one place! 🌍

## Development

### Recommended Extensions (VSCode)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
- [Svelte for VSCode](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Container Tools](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers)
- [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Tailwind Docs](https://marketplace.visualstudio.com/items?itemName=austenc.tailwind-docs)
- [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)

### Enviroment Variables
| Variable | Description | Example (Generation) |
| ----------- | ----------- | ----------- |
| `DATABASE_URL` | Your Database URL | mysql://`username`:`password`@localhost:3306/db |
| `DATABASE_HOST` | Your Database Hostname | `localhost` |
| `MYSQL_DATABASE` | Your Database Name | `my-database` |
| `MYSQL_USER` | Your Database User (for Prisma) | `prisma` |
| `MYSQL_PASSWORD` | Your Database User`s Password |
| `MYSQL_ROOT_PASSWORD` | Your Database`s Root Password |
| `IMAGE_FOLDER_PATH` | The folder that will store your images (absolute path) | `C:/git/travel-log-data/pictures/` |
| `IMGPROXY_URL` | Your ImgProxy Base URL | http://localhost:8080 |
| `IMGPROXY_KEY` | Your ImgProxy Key | `crypto.randomBytes(32).toString('hex')` |
| `IMGPROXY_SALT` | Your ImgProxy Salt | `crypto.randomBytes(16).toString('hex')` |
| `BETTER_AUTH_URL` | Your Servers Base URL | http://localhost:5173 |
| `BETTER_AUTH_SECRET` | Your BetterAuth Secret | `openssl rand -base64 32`

### Run ImgProxy-, MySQL- and PHPMyAdmin-Container locally

Use the provided `docker-compose.yml` file or to setup both the ImgProxy and MySQL Server + phpmyadmin as an Admin Panel  

```cmd
docker compose up -d
```

### Notes
Any Image Path that you try to sign and fetch with the **getImgProxyURL()** function must be relative to **{IMAGE_FOLDER_PATH}**!
```typescript
import { getImgProxyURL } from '$lib/imgproxy';
```