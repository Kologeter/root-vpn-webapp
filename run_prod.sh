#!/bin/bash

docker compose -f docker-compose.prod.yml --env-file ./frontend/.env.prod up --build