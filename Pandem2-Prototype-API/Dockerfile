
#   Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
#   EUPL-1.2 or later. This open-source code is licensed following the Attribution
#   4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
#   — CC BY 4.0.

#   Following this, you are accessible to:

#   Share - copy and redistribute the material in any medium or format.
#   Adapt - remix, transform, and build upon the material commercially.

#   Remark: The licensor cannot revoke these freedoms if you follow the license
#   terms.

#   Under the following terms:

#   Attribution - You must give appropriate credit, provide a link to the license,
#   and indicate if changes were made. You may do so reasonably but not in any way
#   that suggests the licensor endorses you or your use.
#   No additional restrictions - You may not apply legal terms or technological
#   measures that legally restrict others from doing anything the license permits.


# Install dependencies and build
FROM node:18.16.0 AS builder

WORKDIR /app
COPY . .
RUN npm ci --ignore-scripts
RUN npm run build

# Runner
FROM node:18.16.0-slim

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN mkdir uploads

# let run process using user "service"
RUN adduser --uid 1001 --disabled-password --gecos "Service User,,," --home /app --shell /bin/bash service
RUN chown -R service /app
USER service

CMD ["npm", "start"]