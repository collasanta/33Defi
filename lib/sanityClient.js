import sanityClient from '@sanity/client'

export const client = sanityClient({
   projectId: '1shsc4va',
   dataset: 'production',
   apiVersion: 'v1',
   token:
   'skWExCtdYPiQcyGzj4mL5EiHzdSUYmsYlX3xOdQ2u7s3gCQH6yiaeKDjERLWRHnWYyuqvbjJDJFi8DIWQFgQohsKcQVR4Rbxojqwn8iWwwIdl2w8aJlqdTlWIvSMBm4EJmGt9G46Onyq3TGvXo94XKi3bYnqzbONwHT07aBBDLTcxVAGcTbR',
   useCdn: false,
})