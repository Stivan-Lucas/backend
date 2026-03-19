import fastifyBasicAuth from '@fastify/basic-auth'
import fastifySwagger from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import fp from 'fastify-plugin'
import packageJson from '../../package.json'
import { env } from '../env/env'
import type { FastifyTypedInstance } from '../types/fastify'

export const docsPlugin = fp(async (app: FastifyTypedInstance) => {
  // Proteção básica para rota de documentação
  await app.register(fastifyBasicAuth, {
    validate: async (user, pass) => {
      if (user !== env.SAGGER_USER || pass !== env.SAGGER_PASS) {
        return new Error('Unauthorized')
      }
    },
    authenticate: { realm: 'docs' },
  })

  // Registro de swagger
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        license: {
          name: packageJson.licenses[0]?.type ?? 'None',
          identifier: packageJson.licenses[0]?.type,
          url: packageJson.licenses[0]?.url,
        },
        contact: {
          email: packageJson.author.email,
          name: packageJson.author.name,
          url: packageJson.author.url,
        },
      },
      tags: [{ name: 'Admin', description: 'Acesso restrito' }],
    },
  })

  // Hook para validação de segurança da rota de documentação
  await app.register(async (protectedScope) => {
    protectedScope.addHook('onRequest', app.basicAuth)

    // Registro do Scalar UI para documentação
    await protectedScope.register(scalarApiReference, {
      routePrefix: '/docs',
      configuration: {
        showDeveloperTools: 'never',
        theme: 'purple',
      },
    })
  })
})
