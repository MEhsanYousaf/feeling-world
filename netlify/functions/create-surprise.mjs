import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

export default async (request) => {
  if(request.method !== 'POST') return new Response('Method not allowed', {status:405});
  try{
    const data = await request.json();
    const id = crypto.randomBytes(4).toString('base64url');
    const store = getStore('surprises');
    await store.setJSON(id, data);
    return Response.json({id});
  } catch(error){
    return Response.json({error:'Could not create surprise'}, {status:500});
  }
};
