import { getStore } from '@netlify/blobs';

export default async (request) => {
  const id = new URL(request.url).searchParams.get('id');
  if(!id || !/^[A-Za-z0-9_-]{6}$/.test(id)) return Response.json({error:'Invalid link'}, {status:400});
  try{
    const data = await getStore('surprises').get(id, {type:'json'});
    if(!data) return Response.json({error:'Surprise not found'}, {status:404});
    return Response.json(data);
  } catch(error){
    return Response.json({error:'Could not load surprise'}, {status:500});
  }
};
