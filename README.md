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
```

## dev workflow
`npm run start:server` then `npm run start:clientl`

## deploy
`scripts/deploy.sh`

## tests
none yet
