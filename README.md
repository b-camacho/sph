# SPH

## data
assets are on-disk on my VPS

DB is there too

## seeding
db needs schemas `psql -h chmod.site -d sph -U sph -f scripts/schema.sql`

## config
only needs a .env file, example:
```
PORT=9090
DB_NAME=sph
DB_USER=sph
DB_PASSWORD=curiouscat
DB_HOST=chmod.site
DB_PORT=5432
VITE_AUTH0_DOMAIN=dev-q6565656565656565.us.auth0.com
VITE_AUTH0_CLIENT_ID=q6565656565656565
VITE_AUTH0_AUDIENCE=https://dev-q6565656565656565.us.auth0.com/api/v2/
VITE_APP_DOMAIN="http://localhost:5173"
```

## dev workflow
`npm run start:server` then `npm run start:clientl`

## deploy
`scripts/deploy.sh`

## tests
none yet


# mysteries
the main FE page hits /api/works twice

# todo
- switch to more conventional .env + .env.local setup
