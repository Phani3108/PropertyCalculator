import { NextResponse } from 'next/server';

const schema = {
  openapi: '3.0.0',
  info: {
    title: 'Property Calculator API',
    version: '1.0.0',
  },
  paths: {
    '/api/cities': {
      get: {
        summary: 'List cities',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    },
    '/api/flat': {
      post: {
        summary: 'Calculate flat costs',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } },
          '400': { description: 'Bad Request' },
        },
      },
    },
    '/api/house': {
      post: {
        summary: 'Calculate house costs',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } },
          '400': { description: 'Bad Request' },
        },
      },
    },
    '/api/rules': {
      get: {
        summary: 'Rules metadata',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(schema);
}

