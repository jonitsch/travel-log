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
| `NODE_ENV` | Your Current Enviroment (Dev) | 'development' |
| **Database** | | |
| `DATABASE_URL` | Your Database URL | mysql://`username`:`password`@localhost:3306/db |
| `DATABASE_HOST` | Your Database Hostname | `localhost` |
| `MYSQL_DATABASE` | Your Database Name | `my-database` |
| `MYSQL_USER` | Your Database User (for Prisma) | `prisma` |
| `MYSQL_PASSWORD` | Your Database User`s Password |
| `MYSQL_ROOT_PASSWORD` | Your Database`s Root Password |
| **ImgProxy** | | |
| `IMAGE_FOLDER_PATH` | The folder that will store your images (absolute path) | `C:/git/travel-log-data/pictures/` |
| `IMGPROXY_URL` | Your ImgProxy Base URL | http://localhost:8080 |
| `IMGPROXY_KEY` | Your ImgProxy Key | `crypto.randomBytes(32).toString('hex')` |
| `IMGPROXY_SALT` | Your ImgProxy Salt | `crypto.randomBytes(16).toString('hex')` |
| **Authentication** | | |
| `BETTER_AUTH_URL` | Your Servers Base URL | http://localhost:5173 |
| `BETTER_AUTH_SECRET` | Your BetterAuth Secret | `openssl rand -base64 32`

### Run ImgProxy-, MySQL- and PHPMyAdmin-Container locally

Use the provided `docker-compose.yml` file or to setup both the ImgProxy and MySQL Server + phpmyadmin as an Admin Panel  

```cmd
docker compose up -d
```


## Production

### Environment Variables

| Variable | Description | Example |
| ----------- | ----------- | ----------- |
| `NODE_ENV` | Your Current Enviroment (Prod) | 'production' |
| **Database** | | |
| `DATABASE_URL` | MySQL connection string | `mysql://user:password@host:3306/dbname`
| `DATABASE_HOST` | Database host | `db.example.com`
| `MYSQL_DATABASE` | Database name | `travel-log`
| `MYSQL_USER` | Database user for application | `app-user`
| `MYSQL_PASSWORD` | Database user password |
| **AWS S3** | | |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_BUCKET_NAME` | S3 bucket for image storage | `my-travel-log-bucket`
| `AWS_REGION` | AWS region for S3 | `eu-north-1`
| **ImgProxy** | | |
| `IMGPROXY_URL` | ImgProxy service URL | `https://imgproxy.example.com`
| `IMGPROXY_KEY` | ImgProxy signing key (hex string) | `crypto.randomBytes(32).toString('hex')`
| `IMGPROXY_SALT` | ImgProxy salt (hex string) | `crypto.randomBytes(16).toString('hex')`
| **Authentication** | | |
| `BETTER_AUTH_URL` | Application base URL | `https://travel-log.example.com`
| `BETTER_AUTH_SECRET` | BetterAuth secret | `openssl rand -base64 32`

### Image Storage & Serving

In production, images are stored in S3-Buckets and served through an imgproxy server running at Port 8080 with the following features:

- **Authentication Required**: Only authenticated users can access images.
- **S3 Integration**: Images are fetched directly from S3 based on the stored image path (`${journeyId}/${imageId}`).
- **Resizing via ImgProxy**: The `/api/imgproxy` endpoint handles image resizing and format conversion.

### Database Setup

Use a managed MySQL service (e.g., AWS RDS) or a self-hosted MySQL instance.

### S3 Bucket Configuration

1. Create an S3 bucket for image storage.
2. Configure IAM user/role with permissions:
   - `s3:PutObject` - for uploading images
   - `s3:GetObject` - for serving images
   - `s3:DeleteObject` - for deleting images
3. Store credentials in environment variables.
