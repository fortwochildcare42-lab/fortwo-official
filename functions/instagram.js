export async function onRequest(context) {
  const token = context.env.INSTAGRAM_TOKEN;
  const igId = "17841460747122994";
  
  const url = `https://graph.facebook.com/v25.0/${igId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=12&access_token=${token}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
